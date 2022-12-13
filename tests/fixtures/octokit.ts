import * as github from "@actions/github"
import { jest } from "@jest/globals"

export function mockOctokit({
  pullRequestTitle = "BLAH-1",
  sha = "sha"
}: {
  pullRequestTitle?: string
  sha?: string
}) {
  // Hack to force typescript ot accept this
  ;(github as unknown as any).getOctokit = jest.fn().mockReturnValue({
    rest: {
      pulls: {
        list: jest.fn().mockReturnValue({
          data: [
            {
              merge_commit_sha: sha,
              title: pullRequestTitle,
              body: `${pullRequestTitle} body`,
              number: 1,
              labels: [],
              assignees: []
            }
          ]
        })
      }
    }
  })
}

export function mockGithubContext({
  pullRequestTitle = "BLAH-1",
  withPullRequest = true,
  sha = "sha"
}: {
  pullRequestTitle?: string
  withPullRequest?: boolean
  sha?: string
}) {
  github.context.payload = {
    repository: {
      name: "repo",
      owner: {
        login: "owner"
      }
    }
  }
  if (withPullRequest) {
    github.context.payload.pull_request = {
      body: `https://gianteagle.atlassian.net/browse/${pullRequestTitle}`,
      head: {
        ref: "develop"
      },
      title: `${pullRequestTitle} Test Title`,
      number: 1
    }
  }
  github.context.sha = sha
}
