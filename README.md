# Hacker News QA Suite by Kaileb O
## Project Timeline
### Planning
 - Come up with tests and project scope
 - create file stucture
### Documenting Work
 Plans for documenting progress:
 - Log hours with toggl tracker, be sure to name current project step
 - use git hub to save changes and create record of progress
 - Create Posts on Hacker News at project milestones sharing and disscussing your project 
     - Eventually use the create post test to post some of these updates
     - also set the search test to pull up your Hacker News posts
### POM Development
### Test Development
### Fine tuning and Result reporting

## File Outline
### index.js
 - executes all tests
 - Comments explaining tests as nessesary
### folder: tests
 - contains all tests executed by index.js
 - Shooting for 10 tests
### folder: test-data
 - current ad slot: This will have info on what current ad should be
 - Search test: this will be used by the search test to determine what to search
 - Existing User login info
 - Create post Content
 - blacklist: keywords, urls
### test results
 - screen shots
 - saved error instances
 - search results 
### folder: POM
#### TopNavBar
     - home, new, past, comments, ask, show, jobs, submit, login
#### ItemTable
     - Get X Items by ____: Id, user, rank
     - Item details
          - rank, title, user, timestamp, score, url, type
#### FooterBar
     - Get Ad details: msg, url, dates
     - click ad
     - click nav links: guidelines, FAQ, Lists, API, Security, Legal, Apply to YC Contact
     - Search ____
#### SearchPage
     - Search ____
     - Filters
     - get items
#### ProfileAndLogin
     - Create New Account
     - Login to existing account

## Test Ideas
 1. Top 100 articles of Newest are sorted chronologically
 2. All top bar navigation button are working
 3. Search box yields results with matching keywords
 4. New User setup is working
 5. Users can log into their existing accounts
 6. Users can create and delete new posts (This one might not work)
 7. Liking or submiting directs non-users to login or signup
 8. Comment count matches number of comments for top 100 articles
 9. Ad slot up to date and link is working
 10. Site margins are removed for smaller viewing windows
 11. parent link on comment pages links to item comment is attached to
 12. No blacklisted content in the lastes 100 articles, comments, jobs, ask, show, jobs
