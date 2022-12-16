import { jest } from "@jest/globals"
import JiraApi from "jira-client"

const issueJson = {
  key: "TEST-123",
  fields: {
    summary: "This Is A Test",
    project: {
      key: "TEST"
    }
  }
}

const versionJson = {
  id: "1",
  name: "Version Name",
  archived: false,
  released: false,
  projectId: 1
}

export function mockJira() {
  jest.spyOn(JiraApi.prototype, "findIssue").mockImplementation((jiraKey) =>
    Promise.resolve({
      ...issueJson,
      key: jiraKey
    })
  )

  jest
    .spyOn(JiraApi.prototype, "getVersions")
    .mockImplementation(() => Promise.resolve([versionJson]))

  jest
    .spyOn(JiraApi.prototype, "createVersion")
    .mockImplementation(() => Promise.resolve(versionJson))

  jest
    .spyOn(JiraApi.prototype, "updateIssue")
    .mockImplementation((issueKey, option) =>
      Promise.resolve({
        ...issueJson,
        fixVersions: [{ name: option.fields.fixVersions[0].name }]
      })
    )
}
