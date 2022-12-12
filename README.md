# Grocery Actions

This is the repository for Grocery App

# Actions

## jira-ticket-check

This action checks 
- if the PR Title includes the Jira Key (Ex: JIRA-123)
- if the PR Body includes the Jira Link. Ex:
  - https://gianteagle.atlassian.net/jira/software/c/projects/JIRA/boards/60?modal=detail&selectedIssue=JIRA-123
  - https://gianteagle.atlassian.net/browse/JIRA-123

### Example Usage

```yaml
- uses: hatchedlabs/grocery-actions/jira-ticket-check@main
```

# How to Create a new Action

- Create a new folder within this repo
- Create an actions.yml inside the created folder
- If you're writing a Javascript action, add the JS to the `lib` folder
  - Add Tests in the `tests` folder
- If you are adding more libraries to the `package.json`, you will need to push the new node_modules up
- Update this README to show how to use the action

Resources
- https://docs.github.com/en/actions/creating-actions
- https://docs.github.com/en/actions/creating-actions/creating-a-javascript-action
- https://docs.github.com/en/actions/creating-actions/creating-a-composite-action
