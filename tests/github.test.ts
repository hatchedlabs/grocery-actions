import { describe, expect, it } from "@jest/globals"
import { extractJiraKey, extractJiraKeysFromPull } from "../src/github/github"

describe("Github", function () {
  describe("extractJiraKey", function () {
    it("should extract the Jira Id from the text", function () {
      const title = "TEST-123 This is a PR Title"
      const result = extractJiraKey(title)
      expect(result).toBe("TEST-123")
    })

    it("should return nothing if Jira ID is not in text", function () {
      const title = "This is a PR Title"
      const result = extractJiraKey(title)
      expect(result).toBe("")
    })

    it("should extract the Jira Id from the text from middle", function () {
      const title = "This is a TEST-123 PR Title"
      const result = extractJiraKey(title)
      expect(result).toBe("TEST-123")
    })

    it("should extract Jira Id from multiline string", function () {
      const title = "Jira Link\nFrom something\nhttps://www.google.com/TEST-123"
      const result = extractJiraKey(title)
      expect(result).toBe("TEST-123")
    })
  })

  describe("extractJiraKeysFromPull", function () {
    it("Should extract Jira ID from PR title first", function () {
      const pullRequest = {
        title: "TEST-456 This is a PR Title",
        body: "Jira Link\nhttps://company.atlassian.net/browse/TEST-789"
      }
      const result = extractJiraKeysFromPull(pullRequest)
      expect(result).toBe("TEST-456")
    })

    it("Should extract Jira ID from PR Body if Title does not have it", function () {
      const pullRequest = {
        title: "No Jira ID Title",
        body: "Jira Link\nhttps://company.atlassian.net/browse/TEST-789"
      }
      const result = extractJiraKeysFromPull(pullRequest)
      expect(result).toBe("TEST-789")
    })

    it("Should return nothing if title and body do not have Jira ID", function () {
      const pullRequest = {
        title: "No Jira ID Title",
        body: "Jira Link\nNo Jira Link"
      }
      const result = extractJiraKeysFromPull(pullRequest)
      expect(result).toBe("")
    })
  })
})
