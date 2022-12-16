import * as github from "@actions/github"
import { beforeAll, describe, it } from "@jest/globals"
import {
  getJiraKeyFromPullRequest,
  run
} from "../src/helpers/jira-move-unreleased-helper"
import { mockJira } from "./fixtures/jira"
import { mockGithubContext, mockOctokit } from "./fixtures/octokit"

describe("jira-move-unreleased", function () {
  beforeAll(function () {
    process.env.INPUT_PLATFORM = "Android"
    process.env.INPUT_SERVICE = "Grocery"
    mockGithubContext({})
    mockJira()
  })

  describe("getJiraKeyFromPullRequest", function () {
    it("can pull the Jira Key from the PR Title", async function () {
      mockOctokit({ pullRequestTitle: "TEST-123" })
      const result = await getJiraKeyFromPullRequest()
      expect(result).toBe("TEST-123")
    })

    it("short circuits if no pull request is provided", async function () {
      const result = await getJiraKeyFromPullRequest()
      expect(result).toBeNull
    })
  })

  describe("run", function () {
    it("should not fail", function () {
      mockOctokit({pullRequestTitle: "TEST-123"})
      github.context.sha = "sha"
      run()
    })
  })
})
