# Jira Status Check
The Jira Status action is used to check if a Jira Ticket status matches a particular keyword you identify.
The action.yml extract the issue name from the jira status, outputs the status it fetched, and determines an appropriate response based on whether of not the status exists or not.
This action.yml is just the backend of the action. On the repo you would like to run this action on, you will need to create
a .yml that references the main branch of this repo in order to properly run the action.

