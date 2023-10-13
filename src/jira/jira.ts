import * as core from "@actions/core"
import JiraApi from "jira-client"

interface JiraApiParams {
  host: string
  username: string
  password: string
}

export default class JiraApiHelper {
  client: JiraApi

  constructor(obj?: JiraApiParams) {
    this.client = new JiraApi({
      protocol: "https",
      host: obj?.host ?? core.getInput("jira-server-url"),
      username: obj?.username ?? core.getInput("jira-user-email"),
      password: obj?.password ?? core.getInput("jira-api-token"),
      apiVersion: "3",
      strictSSL: true
    })
  }

  async getProjectVersionByName(
    project: string,
    name: string
  ): Promise<JiraApi.JsonResponse | undefined> {
    const versions = await this.client.getVersions(project)
    return versions.find((v: JiraApi.JsonResponse) => v.name === name)
  }

  async createVersion(project: string, name: string, releaseDate: string = "") {
    const version = await this.getProjectVersionByName(project, name)
    if (!version) {
      const createdVersion = await this.client.createVersion({ project, name })
      core.info(`\tCreated Version '${name}' in '${project}'`)
      return createdVersion
    }
    core.info(`\tVersion '${name}' Already Exists in '${project}'`)
    return version
  }

  async updateIssueVersion(
    issueKey: string,
    versionName: string,
    replace: boolean = false
  ) {
    let issueVersions: any[] = []

    if (replace) {
      // Replace fixVersion instead of appending to the fixVersion field
      issueVersions = [{ name: versionName }]
    } else {
      const issue = await this.client.findIssue(issueKey)
      issueVersions = issue.fields.fixVersions.map((v: any) => {
        return { name: v.name }
      })
      if (issueVersions.some((v: any) => v.name === versionName)) {
        core.info(`\tFix Version '${versionName}' exists in '${issueKey}'`)
        return
      }
      issueVersions.push({ name: versionName })
    }

    await this.client.updateIssue(issueKey, {
      fields: { fixVersions: issueVersions }
    })
    core.info(
      `\tUpdated '${issueKey}' with fixVersions: ${JSON.stringify(
        issueVersions
      )}`
    )
    return issueVersions
  }

  async transitionIssue(
    issue: any,
    status: string,
    resolution: string | undefined = undefined
  ) {
    if (issue.fields.status.name.toLowerCase() === status.toLowerCase()) {
      core.info(`\tIssue Status is already ${status}`)
    }
    const { transitions } = await this.client.listTransitions(issue.key)
    const transition = transitions.find(
      (t: any) => t.to.name.toLowerCase() === status.toLowerCase()
    )
    if (transition) {
      const body: { [key: string]: any } = {
        transition: { id: transition.id }
      }
      if (resolution && transition.hasScreen) {
        body.fields = { resolution: { name: resolution } }
      }
      core.info(
        `\tTransitioning ${issue.key} from '${
          issue.fields.status.name
        }' to '${status}' with body ${JSON.stringify(body)}`
      )
      await this.client.transitionIssue(issue.key, body)
    } else {
      core.info(`\tNo Valid Transition to ${status}`)
    }
  }

  // Aggregates the Jira Coment Object into Plain Text
  contentAsText(json: any) {
    let text = ""

    // Keep track of the previous node type
    let previousNodeType: any = null

    // Iterate through all content
    json.content.forEach((content: any) => {
      // If the content has "text" property, append it to the string with or without a newline character
      if (content.hasOwnProperty("text")) {
        // Check if the current node type is the same as the previous node type
        if (content.type === previousNodeType) {
          text += content.text
        } else {
          text += "\n" + content.text
        }

        // Update the previous node type
        previousNodeType = content.type
      }
      // If the content has "content" property, recurse through it
      if (content.hasOwnProperty("content")) {
        text += this.contentAsText(content)
      }
    })

    return text
  }
}
