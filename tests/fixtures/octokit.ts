import * as github from "@actions/github"
import { jest } from "@jest/globals"

export function mockOctokit({
  pullRequestTitle = "BLAH-1",
  sha = "sha"
}: {
  pullRequestTitle?: string
  sha?: string
}) {
  jest.spyOn(github, "getOctokit").mockImplementation((): any => {
    return {
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
    }
  })
}

export function mockGithubContext({ sha = "sha" }: { sha?: string }) {
  github.context.payload = {
    repository: {
      name: "repo",
      owner: {
        login: "owner"
      }
    }
  }
  github.context.sha = sha
}
