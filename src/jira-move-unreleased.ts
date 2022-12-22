import * as core from "@actions/core"
import { run } from "./helpers/jira-move-unreleased-helper"

try {
  run()
} catch (e: any) {
  core.setFailed(e.message)
}
