import * as core from "@actions/core"
import * as github from "@actions/github"

export function getGithubClient() {
  return github.getOctokit(core.getInput("github-token"))
}

export async function getMergedPullRequest(owner: string, repo: string, sha: string) {
  const resp = await getGithubClient().rest.pulls.list({
    owner,
    repo,
    sort: "updated",
    direction: "desc",
    state: "closed",
    per_page: 100
  })

  const pull = resp.data.find((p) => p.merge_commit_sha === sha)
  if (!pull) {
    return null
  }

  return {
    title: pull.title,
    body: pull.body,
    number: pull.number,
  }
}

export function extractJiraKey(text: string) {
  if (!text) return ""
  const match = text.match(/([A-Z]+-[0-9]+)/)
  if (match) {
    return match[0]
  }
  return ""
}

export function extractJiraKeysFromPull(pull: any) {
  // Try pulling from pull request title
  let result = extractJiraKey(pull.title)
  if (!result) {
    result = extractJiraKey(pull.body)
  }
  return result
}
