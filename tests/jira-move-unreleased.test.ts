import * as github from "@actions/github"
import * as core from "@actions/core"
import { beforeAll, describe, it, jest } from "@jest/globals"
import JiraApi from "jira-client"
import { run, getJiraKeyFromPullRequest } from "../src/helpers/jira-move-unreleased-helper"
import { mockOctokit, mockGithubContext } from "./fixtures/octokit"
import { mockJira } from "./fixtures/jira"

describe("jira-move-unreleased", function () {
  beforeAll(function () {
    process.env.INPUT_PLATFORM = "Android"
    process.env.INPUT_SERVICE = "Grocery"
    mockJira()
  })

  describe("getJiraKeyFromPullRequest", function() {
    it("can pull the Jira Key from the PR Title", async function() {
      mockOctokit({pullRequestTitle: "TEST-123"})
      mockGithubContext({})
      const result = await getJiraKeyFromPullRequest()
      expect(result).toBe("TEST-123")
    })

    it("short circuits if no pull request is provided", async function() {
      mockGithubContext({})
      const result = await getJiraKeyFromPullRequest()
      expect(result).toBeNull
    })
  })

  describe("run", function () {
    it("should not fail", function () {
      mockOctokit({})
      mockGithubContext({})
      github.context.sha = "sha"
      run()
    })
  })
})
