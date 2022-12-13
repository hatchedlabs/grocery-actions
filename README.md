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


## Jira Move Unreleased

This action
- Checks the latest commit to see if it contains a Pull Request
- Checks the Pull Request for a Jira Key in the title or body
- Creates a Version `[Unreleased] SERVICE PLATFORM` in Jira based on what Project the key is from
  - Will ignore creation if version already exists
- Moves the Jira Issue to that created Version

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

> Note: The Jira API Token needs to access to all Jira Projects that this action is added to.
  Github Token needs access to the github repos this action is added to.
# How to Create a new Action

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
