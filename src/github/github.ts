import * as core from "@actions/core"
import * as github from "@actions/github"

export function getGithubClient() {
  return github.getOctokit(core.getInput("github-token"))
}

export async function getMergedPullRequest(
  owner: string,
  repo: string,
  sha: string
) {
  const { data } = await getGithubClient().rest.pulls.list({
    owner,
    repo,
    sort: "updated",
    direction: "desc",
    state: "closed",
    per_page: 100
  })

  const pull = data.find((p) => p.merge_commit_sha === sha)
  if (!pull) {
    return null
  }

  return {
    title: pull.title,
    body: pull.body,
    number: pull.number
  }
}

export async function getPullRequest(
  owner: string,
  repo: string,
  pull_number: number
) {
  const { data: pullRequest } = await getGithubClient().rest.pulls.get({
    owner,
    repo,
    pull_number
  })

  if (!pullRequest) {
    core.info(`\tNo Pull Request for ${owner}, ${repo}, ${pull_number}`)
    return null
  }

  return {
    title: pullRequest.title,
    body: pullRequest.body,
    number: pullRequest.number
  }
}

export async function getPullRequestCommits(
  owner: string,
  repo: string,
  pull_number: number
) {
  const { data } = await getGithubClient().rest.pulls.listCommits({
    owner,
    repo,
    pull_number
  })

  return data
}

export async function getCommitPullRequests(
  owner: string,
  repo: string,
  commit_sha: string
) {
  const { data } =
    await getGithubClient().rest.repos.listPullRequestsAssociatedWithCommit({
      owner,
      repo,
      commit_sha
    })

  return data
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
