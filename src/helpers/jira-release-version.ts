import * as github from "@actions/github"
import * as core from "@actions/core"
import {
  extractJiraKey,
  extractJiraKeysFromPull,
  getCommitPullRequests,
  getPullRequest
} from "../github/github"

export async function parseGithubReleaseBody(
  releaseBody: string,
  jiraIssues: Set<string>
) {
  const lines = releaseBody.split("\n").filter((l) => l.startsWith("*"))
  for (const line of lines) {
    let jiraKey = extractJiraKey(line)
    if (!jiraKey) {
      const match = line.match(/github.com.*pull\/(\w+)/)
      core.info("Matching PR: " + JSON.stringify(match))
      if (match && match[1]) {
        let pull = await getPullRequest(
          github.context.repo.owner,
          github.context.repo.repo,
          parseInt(match[1])
        )
        jiraKey = extractJiraKeysFromPull(pull)
      }
    }

    if (jiraKey) {
      jiraIssues.add(jiraKey)
    }
  }
}

export async function parsePullRequestCommits(
  commits: any[],
  jiraIssues: Set<string>
) {
  for (const commit of commits) {
    let pulls = await getCommitPullRequests(
      github.context.repo.owner,
      github.context.repo.repo,
      commit.sha
    )

    for (const pull of pulls) {
      const jiraKey = extractJiraKeysFromPull(pull)
      if (jiraKey) {
        jiraIssues.add(jiraKey)
      }
    }
  }
}

export function jiraReleaseComment(versionName: string, releaseUrl: string) {
  return {
    body: {
      version: 1,
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "This Jira Issue is currently in the Production Release Pipeline for "
            },
            {
              type: "text",
              text: versionName,
              marks: [
                {
                  type: "strong"
                }
              ]
            }
          ]
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Github Release: "
            },
            {
              type: "text",
              text: releaseUrl,
              marks: [
                {
                  type: "link",
                  attrs: {
                    href: releaseUrl
                  }
                }
              ]
            }
          ]
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Note: ",
              marks: [
                {
                  type: "strong"
                }
              ]
            },
            {
              type: "text",
              text: "If this was not intended to be released, please contact your PM."
            }
          ]
        }
      ]
    }
  }
}
