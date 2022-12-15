import * as core from "@actions/core"
import { context } from "@actions/github"

const autodeployerRegex = /autodeployer\/release\/.+/

export function checkPrBodyForJiraLink() {
  if (context.payload.pull_request) {
    const jiraLinkRegex =
      /https\:\/\/gianteagle\.atlassian\.net\/browse\/[a-zA-Z]+-[0-9]+/
    const jiraLinkBoardRegex =
      /https\:\/\/gianteagle\.atlassian\.net\/jira\/software(?:\/\w+)?\/projects\/\w+\/boards\/\w+\?(?:modal=detail&)?selectedIssue=[a-zA-Z]+-\d+/

    if (jiraLinkRegex.test(context.payload.pull_request.body!)) {
      core.info("Jira Link Found")
    } else if (jiraLinkBoardRegex.test(context.payload.pull_request.body!)) {
      core.info("Jira Link Found")
    } else if (autodeployerRegex.test(context.payload.pull_request.head.ref)) {
      core.info("Jira Link not needed for Autodeployer Branches")
    } else {
      throw new Error("Jira Link is not found in PR Body")
    }
  }
}

export function checkPrTitleForJiraLink() {
  const title = context.payload.pull_request!.title
  const regex =
    /(?<=^|[a-z]\-|[\s\p{Punct}&&[^\-]])([A-Z][A-Z0-9_]*-\d+)(?![^\W_])(\s)+(.)+/

  core.info(`Title: ${title}`)

  if (regex.test(title)) {
    core.info("Jira Issue key found in Title")
  } else if (autodeployerRegex.test(context.payload.pull_request!.head.ref)) {
    core.info("Jira Issue Key in Title is not needed for Autodeployer Branches")
  } else {
    throw new Error("PullRequest title does not start with a Jira Issue key.")
  }

  core.info("Title Passed")
}
