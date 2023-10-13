import * as github from "@actions/github"
import { beforeAll, describe, it } from "@jest/globals"
import {
  getConfig,
  getJiraKeyFromPullRequest,
  getServices,
  run
} from "../src/helpers/jira-move-unreleased-helper"
import { mockJira } from "./fixtures/jira"
import { mockGithubContext, mockOctokit } from "./fixtures/octokit"
import testConfig from "./fixtures/test-jira-config.json"

describe("jira-move-unreleased", function () {
  const OLD_ENV = process.env

  beforeAll(function () {
    mockGithubContext({})
    mockJira()
  })

  beforeEach(function () {
    jest.resetModules()
    process.env = { ...OLD_ENV } // Reset Test ENV variables
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

  describe("getConfig", function () {
    it("should return a config if an input is provided", function () {
      process.env["INPUT_CONFIG-FILE-PATH"] =
        "./tests/fixtures/test-jira-config.json"
      const result = getConfig()
      expect(result).toHaveProperty("serviceFolderMap")
    })

    it("should return undefined if an invalid input is provided", function () {
      process.env["INPUT_CONFIG-FILE-PATH"] = "invalidpath"
      const result = getConfig()
      expect(result).toBe(undefined)
    })

    it("should return undefined if an input is not provided", function () {
      const result = getConfig()
      expect(result).toBe(undefined)
    })
  })

  describe("getServices", function () {
    it("returns the 'service' input if provided", function () {
      process.env["INPUT_CHANGED-FILES"] = "testFolder/test.txt"
      const result = getServices(testConfig, "testService")
      expect(result).toContain("testService")
    })

    it("can return the services affected by changed files", function () {
      process.env["INPUT_CHANGED-FILES"] = "testFolder/test.txt"
      const result = getServices(testConfig, "")
      expect(result).toContain("test")
    })

    it("can return multiple services affected by changed files", function () {
      process.env["INPUT_CHANGED-FILES"] =
        "testFolder/test.txt jiraFolder/test.txt testFolder/test2.txt"
      const result = getServices(testConfig, "")
      expect(result.sort()).toEqual(["test", "jira"].sort())
    })

    it("should not return a service if it is not defined in the config", function () {
      process.env["INPUT_CHANGED-FILES"] = ".github/workflow/test.txt"
      let result = getServices(testConfig, "")
      expect(result).toEqual([])

      process.env["INPUT_CHANGED-FILES"] =
        ".github/workflow/test.txt testFolder/test.txt"
      result = getServices(testConfig, "")
      expect(result).toEqual(["test"])
    })

    it("should return an empty list if input changed files is empty", function () {
      process.env["INPUT_CHANGED-FILES"] = ""
      const result = getServices(testConfig, "")
      expect(result).toEqual([])
    })
  })

  describe("run", function () {
    it("should not fail", function () {
      process.env.INPUT_PLATFORM = "Android"
      process.env.INPUT_SERVICE = "Grocery"
      mockOctokit({ pullRequestTitle: "TEST-123" })
      github.context.sha = "sha"
      run()
    })
  })
})
