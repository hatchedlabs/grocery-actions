import * as core from "@actions/core"
import * as github from "@actions/github"
import { readFileSync } from "fs"
import {
  extractJiraKeysFromPull,
  getMergedPullRequest
} from "../github/github.js"
import JiraApiHelper from "../jira/jira.js"

export async function getJiraKeyFromPullRequest(): Promise<string | null> {
  // Grab the Merged Pull Request if Exists
  const pull = await getMergedPullRequest(
    github.context.repo.owner,
    github.context.repo.repo,
    github.context.sha
  )

  if (!pull) {
    core.info("Pull Request Not Found with Most Recent Push")
    return null
  }

  core.info(`Commit Pull Request Found: ${JSON.stringify(pull, null, 2)}`)
  return extractJiraKeysFromPull(pull)
}

/**
 * This function gets the services that are affected by the files changed. If the service is provided via
 * github action input 'service', then that will take precedence. Otherwise utilize the config
 * @param config JiraActionConfig json. This config can be undefined
 * @param serviceInput Provided service string. Can be an empty string
 * @returns String array of affected services
 */
export function getServices(
  config: JiraActionConfig | undefined,
  serviceInput: string
): string[] {
  let servicesAffected: string[] = []
  if (serviceInput) {
    servicesAffected = [serviceInput]
  } else if (config) {
    const serviceFolderMap = config.serviceFolderMap
    const changedFiles = core.getInput("changed-files")
    if (changedFiles) {
      for (let file of changedFiles.split(" ")) {
        let service = serviceFolderMap[file.split("/")[0]]
        if (service) {
          core.info(`The changes involve the '${service}' service`)
          servicesAffected.push(service)
        } else {
          core.info(`No Mapping for ${file.split("/")[0]} found for ${file}`)
        }
      }
    }
  }
  return [...new Set(servicesAffected)]
}

export function getConfig(): JiraActionConfig | undefined {
  try {
    const configPath = core.getInput("config-file-path")
    if (!configPath) return undefined
    let content = readFileSync(configPath, "utf8")
    return JSON.parse(content)
  } catch {
    return undefined
  }
}

export async function run() {
  const platform = core.getInput("platform")
  const service = core.getInput("service")
  const config = getConfig()

  if (!service && !config) {
    core.setFailed("'config' and 'service' github action input are not set")
    return
  }

  const services: string[] = getServices(config, service)
  if (services.length === 0) {
    core.info(
      "No service related to the files changed. Did you need to update \
    the config.json folder to service map or add a 'service' input to the action?"
    )
    return
  }

  const jiraKey = await getJiraKeyFromPullRequest()
  if (!jiraKey) {
    core.setFailed("No Jira Key or Pull Request Associated with Commit")
    return
  }

  const jira = new JiraApiHelper()
  const issue = await jira.client.findIssue(jiraKey)
  const projectKey = issue.fields.project.key
  core.info(`Jira Issue Key: ${issue.key}`)
  core.info(`Jira Title: ${issue.fields.summary}`)

  if (services) {
    for (let _service of services) {
      core.info(`Service: ${_service}`)
      const unreleasedVersionName = `[Unreleased] ${_service} ${platform}`

      // Create Unreleased Version if not Exist
      const version = await jira.createVersion(
        projectKey,
        unreleasedVersionName
      )

      // Update Fix Version of Jira Issue to Unreleased Version Name
      await jira.updateIssueVersion(issue.key, version.name)
    }
  }
}
