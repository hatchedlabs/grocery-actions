import * as core from "@actions/core"
import * as github from "@actions/github"
import {
  extractJiraKeysFromPull,
  getMergedPullRequest
} from "../github/github.js"
import JiraApiHelper from "../jira/jira.js"

export async function getJiraKeyFromPullRequest() {
  // Grab the Merged Pull Request if Exists
  const pull = await getMergedPullRequest(
    github.context.repo.owner,
    github.context.repo.repo,
    github.context.sha
  )

  if (!pull) {
    core.info("Pull Request Not Found with most recent push")
    return null
  }

  core.info(`Pull: ${JSON.stringify(pull, null, 2)}`)
  return extractJiraKeysFromPull(pull)
}

export async function run() {
  const platform = core.getInput("platform")
  const service = core.getInput("service")
  const unreleasedVersionName = `[Unreleased] ${service} ${platform}`

  try {
    const jiraKey = await getJiraKeyFromPullRequest()
    if (!jiraKey) {
      core.info("No Jira Key or Pull Request Associated with Commit")
      return
    }

    try {
      const jira = new JiraApiHelper()
      const issue = await jira.client.findIssue(jiraKey)
      const projectKey = issue.fields.project.key
      core.info(`Title: ${issue.fields.summary}`)
      core.info(`Project: ${projectKey}`)

      // Create Unreleased Version if not Exist
      const version = await jira.createVersion(
        projectKey,
        unreleasedVersionName
      )

      await jira.updateIssueVersion(issue.key, version.name)
      
    } catch (e) {
      if (e instanceof Error) {
        core.error(e as Error)
        core.setFailed(e.message)
      } else {
        core.error("Unexpected Jira Error Occurred")
      }
    }
  } catch (e) {
    if (e instanceof Error) {
      core.error(e as Error)
      core.setFailed(e.message)
    } else {
      core.error("Unexpected Error Occurred")
    }
  }
}
