import * as core from "@actions/core"
import * as github from "@actions/github"
import {
  parseGithubReleaseBody,
  jiraReleaseComment
} from "./helpers/jira-release-version"
import JiraApiHelper from "./jira/jira"

try {
  ;(async function () {
    const currentJiraUserEmail = core.getInput("jira-user-email")
    const jiraIssues = new Set<string>()
    let versionName = ""
    let releaseUrl = ""
    if (github.context.payload.release) {
      versionName = github.context.payload.release.name
      releaseUrl = github.context.payload.release.html_url
      const platform = core.getInput("platform")
      const service = core.getInput("service")

      if (!!service) versionName = `${service} ${versionName}`
      if (!!platform) versionName = `${platform} ${versionName}`

      const releaseBody = github.context.payload.release.body
      // Assumes we're using Github's auto-generate changelog
      // Parse the release body for Pull Requests
      await parseGithubReleaseBody(releaseBody, jiraIssues)
    } else {
      core.setFailed(
        "Github Context is not triggered from a release. Please check the Github Action Triggers"
      )
      return
    }

    const jira = new JiraApiHelper()
    for (const jiraKey of jiraIssues) {
      const issue = await jira.client.findIssue(jiraKey)
      const projectKey = issue.fields.project.key
      core.info(`Jira Issue: ${issue.key} - ${issue.fields.summary}`)

      const version = await jira.createVersion(projectKey, versionName)
      // Update Fix Version of Jira Issue to Version Name
      await jira.updateIssueVersion(issue.key, version.name)
      await jira.transitionIssue(issue, "CLOSED", "Done")

      const hasReleaseComment = issue.fields.comment.comments.some(
        (c: any) =>
          c.author.emailAddress == currentJiraUserEmail &&
          jira.contentAsText(c.body).includes(versionName)
      )
      if (!hasReleaseComment) {
        const jiraComment = jiraReleaseComment(versionName, releaseUrl)
        await jira.client.addCommentAdvanced(issue.key, jiraComment)
      } else {
        core.info(`\tJira Comment with Version ${versionName} already exists`)
      }
    }
  })()
} catch (e: any) {
  core.setFailed(e.message)
}
