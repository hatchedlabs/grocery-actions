import { beforeAll, describe, expect, it } from "@jest/globals"
import JiraApi from "jira-client"
import JiraApiHelper from "../src/jira/jira.js"

describe("JiraApiHelper", function () {
  let jira: JiraApiHelper

  beforeAll(function () {
    jira = new JiraApiHelper({
      host: "test.jira.com",
      username: "username",
      password: "password"
    })

    jest
      .spyOn(JiraApi.prototype, "updateIssue")
      .mockImplementation(() => Promise.resolve(jest.fn()))
  })

  describe("updateIssueVersion", function () {
    it("can add a version if the issue does not have a fixVersion", async function () {
      jest.spyOn(JiraApi.prototype, "findIssue").mockImplementation((jiraKey) =>
        Promise.resolve({
          key: jiraKey,
          fields: { fixVersions: [] }
        })
      )
      const result = await jira.updateIssueVersion("TEST-123", "Version 1")
      expect(result).toEqual([{ name: "Version 1" }])
    })

    it("can append a version to the issue's fixVersion", async function () {
      jest.spyOn(JiraApi.prototype, "findIssue").mockImplementation((jiraKey) =>
        Promise.resolve({
          key: jiraKey,
          fields: { fixVersions: [{ name: "Version 1" }] }
        })
      )
      const result = await jira.updateIssueVersion("TEST-123", "Version 2")
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: "Version 2" }),
          expect.objectContaining({ name: "Version 1" })
        ])
      )
    })

    it("can replace an issues fixVersion", async function () {
      jest.spyOn(JiraApi.prototype, "findIssue").mockImplementation((jiraKey) =>
        Promise.resolve({
          key: jiraKey,
          fields: { fixVersions: [{ name: "Version 1" }] }
        })
      )
      const result = await jira.updateIssueVersion(
        "TEST-123",
        "Version 2",
        true
      )
      expect(result).toEqual(
        expect.arrayContaining([expect.objectContaining({ name: "Version 2" })])
      )
      expect(result).not.toEqual(
        expect.arrayContaining([expect.objectContaining({ name: "Version 1" })])
      )
    })
  })
})
