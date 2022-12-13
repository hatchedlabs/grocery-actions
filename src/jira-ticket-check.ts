import * as core from "@actions/core"
import {
  checkPrBodyForJiraLink,
  checkPrTitleForJiraLink
} from "./helpers/jira-ticket-check-helper"

const autodeployerRegex = /autodeployer\/release\/.+/

;(async () => {
  try {
    checkPrTitleForJiraLink()
    checkPrBodyForJiraLink()
  } catch (e) {
    if (e instanceof Error) {
      core.error(e as Error)
      core.setFailed(e.message)
    } else {
      core.error("Unexpected Error Occurred")
    }
  }
})()
