import { beforeAll, describe, it } from "@jest/globals"
import {
  parseGithubReleaseBody,
  parsePullRequestCommits
} from "../src/helpers/jira-release-version"
import { mockGithubContext, mockOctokit } from "./fixtures/octokit"

describe("jira-release-version", function () {
  const OLD_ENV = process.env

  beforeAll(function () {
    mockGithubContext({})
  })

  beforeEach(function () {
    jest.resetModules()
    process.env = { ...OLD_ENV } // Reset Test ENV variables
  })

  describe("parseGithubReleaseBody", function () {
    it("Should grab the Jira Issue if it's in the Change Log Body", async function () {
      const jiraIssues = new Set<string>()
      await parseGithubReleaseBody("* TEST-123\n*BLAH-123", jiraIssues)
      expect(jiraIssues).toEqual(new Set(["BLAH-123", "TEST-123"]))
    })

    it("Shouldn't grab the Jira Issue if it doesn't exist", async function () {
      const jiraIssues = new Set<string>()
      await parseGithubReleaseBody(
        "* This is a changelog\n* Testing if this exists",
        jiraIssues
      )
      expect(jiraIssues.size).toBe(0)
    })

    it("Should grab the Jira Issue from PR URL if the change log body contains a PR URL", async function () {
      mockOctokit({ pullRequestTitle: "TEST-123" })
      const jiraIssues = new Set<string>()
      await parseGithubReleaseBody(
        "* this is a commit http://github.com/org/repo/pull/2",
        jiraIssues
      )
      expect(jiraIssues).toEqual(new Set(["TEST-123"]))
    })
  })

  describe("parsePullRequestCommits", function () {
    it("Should grab Jira Issues from the PR commits", async function () {
      mockOctokit({ pullRequestTitle: "TEST-123" })
      const jiraIssues = new Set<string>()
      await parsePullRequestCommits(["sha1", "sha2"], jiraIssues)
      expect(jiraIssues).toEqual(new Set(["TEST-123"]))
    })
  })
})
