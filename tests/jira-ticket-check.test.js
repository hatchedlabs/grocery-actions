import {
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  test
} from "@jest/globals"
import {
  checkPrBodyForJiraLink,
  checkPrTitleForJiraLink
} from "../lib/jira-ticket-check"
import core from "@actions/core"
import github from "@actions/github"

describe("Test jira-ticket-check", function () {
  beforeEach(function () {
    github.context.payload = {
      pull_request: {
        body: "https://gianteagle.atlassian.net/browse/BLAHHH-1",
        head: {
          ref: "develop"
        },
        title: "BLAHHH-1 Test Title"
      }
    }
  })

  describe("Check PR Body", function () {
    it("Passes if Jira Link is in PR Body", function () {
      checkPrBodyForJiraLink()
    })

    it("Passes if the Jira Link with Board Id is in the PR Body", function () {
      github.context.payload.pull_request.body =
        "https://gianteagle.atlassian.net/jira/software/c/projects/BLAHHH/boards/60?modal=detail&selectedIssue=BLAHHH-209"
      checkPrBodyForJiraLink()
    })

    it("Fails if Jira Link is not in PR Body", function () {
      github.context.payload.pull_request.body = "Nothing"
      expect(checkPrBodyForJiraLink).toThrow(
        "Jira Link is not found in PR Body"
      )
    })

    it("Passes if the branch name contains autodeployer/release and body does not have Jira Link", function () {
      github.context.payload.pull_request.head.ref = "autodeployer/release/2022-01-01"
      github.context.payload.pull_request.body = "Nothing"
      checkPrBodyForJiraLink()
    })
  })

  describe("Check PR Title", function () {
    it("Passes if the Jira Issue is in the PR Title", function () {
      checkPrTitleForJiraLink()
    })

    it("Fails if the Jira Issue is not in the PR Title", function () {
      github.context.payload.pull_request.title = "Test Title"
      expect(checkPrTitleForJiraLink).toThrow(
        "PullRequest title does not start with a Jira Issue key."
      )
    })

    it("Passes if the branch name contains autodeployer/release and PR Title does not have Jira Key", function () {
      github.context.payload.pull_request.head.ref = "autodeployer/release/2022-01-01"
      github.context.payload.pull_request.title = "Nothing"
      checkPrTitleForJiraLink()
    })
  })
})
