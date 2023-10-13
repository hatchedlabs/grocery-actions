# Grocery Actions

This is the repository for Grocery App

# Actions

## jira-ticket-check

This action checks 
- if the PR Title includes the Jira Key (Ex: JIRA-123)
- if the PR Body includes the Jira Link. Ex:
  - https://COMPANY.atlassian.net/jira/software/c/projects/JIRA/boards/60?modal=detail&selectedIssue=JIRA-123
  - https://COMPANY.atlassian.net/browse/JIRA-123

### Example Usage

```yaml
- uses: hatchedlabs/grocery-actions/jira-ticket-check@main
```

## Jira Status Check

This action checks 
- Jira Ticket Status (Ex: In Progress)
- if the Jira Ticket status matches the status you define in your own repo (Ex: Devops Repo check for In Progress)

### Example Usage

```yaml
- uses: hatchedlabs/grocery-actions/jira-status-check@main
```

## Jira Release Version

This action 
- Checks the Github Release's Body for Jira Issues
  - This will Check in the commit message and the associated PR Body
  - Make sure the body has generated a changelog
- Sets the Jira Issues' Fix Version to the Release name
- Closes the Jira Issue. 

### Example Usage

```yaml
name: Update Jira Tickets from Release

on:
  release:
    types: [edited, released]

jobs: 
  release:
    name: "Release"
    if: |
      contains(fromJson('["master", "main"]'), github.event.release.target_commitish) &&
      github.event.release.prerelease == false
    runs-on: ubuntu-latest
    steps:
      - name: Run Jira Unreleased
        uses: hatchedlabs/grocery-actions/jira-release-version@mobile-jira-v2
        with:
          jira-server-url: company.atlassian.net
          jira-user-email: user@jira.com
          jira-api-token: ${{ secrets.JIRA_API_TOKEN }}
          github-token: ${{ secrets.GH_API_TOKEN }}
          platform: PLATFORM
          service: TEST
```

## Jira Move Unreleased

This action
- Checks the latest commit to see if it contains a Pull Request
- Checks the Pull Request for a Jira Key in the title or body
- Creates a Version `[Unreleased] SERVICE PLATFORM` in Jira based on what Project the key is from
  - Will ignore creation if version already exists
- Moves the Jira Issue to that created Version

If `service` is not set, then it will look for a config file.

The config file is in the format of:
```json
{
  "serviceFolderMap": {
    "rootLevelFolder": "Service"
  }
}
```

This allows the action to work with monorepos with multiple services. This can be paired with the `tj-actions/changed-files@v35` action, which
finds changed files in the most recent commit. Then from there, it can create multiple releases and append them onto the related Jira issue. 

### Example Usage

```yaml
- uses: hatchedlabs/grocery-actions/jira-move-unreleased@main
  with:
    jira-server-url: company.atlassian.net
    jira-user-email: user@jira.com
    jira-api-token: ${{ secrets.JIRA_API_TOKEN }}
    github-token: ${{ secrets.REPO_TOKEN }}
    platform: PLATFORM
    service: SERVICE 
```

#### Monorepo Example
```json
{
  "serviceFolderMap": {
    "rootLevelFolder": "Service"
  }
}
```
```yaml
- uses: actions/checkout@v3
  with:
    fetch-depth: 0
- name: Get changed files
  id: changed-files
  uses: tj-actions/changed-files@v35
  
- name: Run Jira Unreleased
  uses: hatchedlabs/grocery-actions/jira-move-unreleased@main
  with:
    jira-server-url: gianteagle.atlassian.net
    jira-user-email: auto-infrastructure@hatchedlabs.com
    jira-api-token: ${{ secrets.JIRA_API_TOKEN }}
    github-token: ${{ secrets.REPO_TOKEN }}
    platform: Android
    config-file-path: ./.github/workflows/jira-action-config.json
    changed-files: ${{ steps.changed-files.outputs.all_changed_files }}
```

> Note: The Jira API Token needs to access to all Jira Projects that this action is added to.
  Github Token needs access to the github repos this action is added to.
# How to Create a new Action

Make sure to install `ncc` to build and minify the javascript

- Create a new folder within this repo
- Create an actions.yml inside the created folder
- If you are writing in typescript, make sure to add the entry-points for the actions in the 
root of the `./src` folder. 
- Run `yarn package` to get the compiled js in the `./dist` folder. 
  - Make sure to add the dist version as the `main` in your `action.yml`
  - Commit the dist 
- Update this README to show how to use the action

Resources
- https://docs.github.com/en/actions/creating-actions
- https://docs.github.com/en/actions/creating-actions/creating-a-javascript-action
- https://docs.github.com/en/actions/creating-actions/creating-a-composite-action
