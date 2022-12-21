import * as core from "@actions/core"
import { run } from "./helpers/jira-move-unreleased-helper"

try {
  run()
} catch (e) {
  if (e instanceof Error) {
    core.error(e as Error)
    core.setFailed(e.message)
  } else {
    core.error("Unexpected Error Occurred")
  }
}
