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
      core.info(`Created Version ${name} in ${project}`)
      return createdVersion
    }
    core.info(`Version ${name} Already Exists in ${project}`)
    return version
  }

  // Future Update: Could update to merge versions instead of overwriting the version
  // Ex: Grab existing fix versions and append the new versionName
  async updateIssueVersion(issueKey: string, versionName: string) {
    await this.client.updateIssue(issueKey, {
      fields: { fixVersions: [{ name: versionName }] }
    })
    core.info(`Updated ${issueKey} to Fix Version ${versionName}`)
  }
}
