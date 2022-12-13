import { jest } from "@jest/globals"
import JiraApi from "jira-client"

export function mockJira() {
  jest.spyOn(JiraApi.prototype, "findIssue").mockImplementation((jiraKey) =>
    Promise.resolve({
      key: jiraKey,
      fields: {
        summary: "SOMETHING",
        project: {
          key: "TEST"
        }
      }
    })
  )

  jest.spyOn(JiraApi.prototype, "getVersions").mockImplementation(() =>
    Promise.resolve([
      {
        id: "1",
        name: "Version Name",
        archived: false,
        released: false,
        projectId: 1
      }
    ])
  )

  jest.spyOn(JiraApi.prototype, "createVersion").mockImplementation(() =>
    Promise.resolve({
      id: "1",
      name: "Created Version Name",
      archived: false,
      released: false,
      projectId: 1
    })
  )

  jest
    .spyOn(JiraApi.prototype, "updateIssue")
    .mockImplementation((issueKey, option) =>
      Promise.resolve({
        key: issueKey,
        fields: {
          summary: "SOMETHING",
          project: {
            key: "TEST"
          }
        },
        fixVersions: [{ name: option.fields.fixVersions[0].name }]
      })
    )
}
