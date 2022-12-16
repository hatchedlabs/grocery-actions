import * as core from "@actions/core"
import * as github from "@actions/github"
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

    const jira = new JiraApiHelper()
    const issue = await jira.client.findIssue(jiraKey)
    const projectKey = issue.fields.project.key
    core.info(`Jira Issue Key: ${issue.key}`)
    core.info(`Jira Title: ${issue.fields.summary}`)

    // Create Unreleased Version if not Exist
    const version = await jira.createVersion(projectKey, unreleasedVersionName)

    // Update Fix Version of Jira Issue to Unreleased Version Name
    await jira.updateIssueVersion(issue.key, version.name)

  } catch (e) {
    if (e instanceof Error) {
      core.error(e as Error)
      core.setFailed(e.message)
    } else {
      core.error("Unexpected Error Occurred")
    }
  }
}
