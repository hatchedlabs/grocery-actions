/* eslint-disable require-await */

const github = require("@actions/github");

(async () => {
  const context = github.context;
  if (context.payload.pull_request) {
    const jiraLinkRegex = /https\:\/\/gianteagle\.atlassian\.net\/browse\/[a-zA-Z]+-[0-9]+/
    const jiraLinkBoardRegex = /https\:\/\/gianteagle\.atlassian\.net\/jira\/software\/projects\/[a-zA-Z0-9]+\/boards\/[a-zA-Z0-9]+\?selectedIssue=[a-zA-Z]+-[0-9]+/
    const autodeployerRegex = /autodeployer\/release\/.+/
    
    if (jiraLinkRegex.test(context.payload.pull_request.body) {
      console.log("Jira Task Found")
      process.exit(0)
    } else if (jiraLinkBoardRegex.test(context.payload.pull_request.body) {
      console.log("Jira Task Found")
      process.exit(0)
    } else if (autodeployerRegex.test(context.payload.pull_request.head.ref)) {
      console.log("Jira Task not needed for Autodeployer Branches")
      process.exit(0)
    } else {
      console.error("No Jira Task found in Body")
    }
  }
})
