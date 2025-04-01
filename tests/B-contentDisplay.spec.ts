//Import Playwright testing tools
import { expect } from '@playwright/test';
//Import playwright test and custom POM fixtures
import { test } from '../POM/pomFixtureExtend.ts'
//Import test data used by these tests
import { b1TestData } from '../test-data/b-1-sortedChronologically.json'
import { b2TestData } from '../test-data/b-2-show-blacklist.json'
import { b3TestData } from '../test-data/b-3-commentCount.json'

test.describe('B. Hacker News content is displaying correctly', () => {
    test.afterEach(async ({ page }) => {
        // # Test Teardown
        await page.close();
    })
    
    test(`B.1 top ${b1TestData.numItemsToTest} items on new page are sorted chronologically`, async ({ topNavBar,itemTable }) => {
        // # Setup
        //import test parameteres
        const numItemsToTest = b1TestData.numItemsToTest
        let items: { id: (string | undefined), rank: (string | undefined), time: (string | undefined ) }[] = [];
        let sortingErrors: string[] = [];
        //Navigate to Newest to page
        await topNavBar.navNew()

        // # Fetch Data
        //While we have less than requested number of items
        while (items.length < numItemsToTest) {
            //Get item id, rank and timestamp data
            const itemsOnPage = await itemTable.itemTopRow.evaluateAll(articles =>
            //Since the Rank and timestamp values in Hacker News do not share the same parent I am using the post id number to verify
            // that I am indeeded pairing the timestamp and rank from the same article
            articles.map(article => ({
                    //id and rank share the same parent which we targeted with locatro('.athing')
                    id: article?.getAttribute('id') ?? undefined,
                    rank: article.querySelector('.rank')?.textContent?.trim(),
                    time: document.querySelector(`.age:has([href="item?id=${article.getAttribute('id')}"])`)?.getAttribute('title') ?? undefined,
                }))
            );
            //Push articles from this page to articles array
            items.push(...itemsOnPage);
            //If the test has collected enough or more than enough items slice items down to requested number to test
            // else click 'More' button to show a new page of items
            items.length >= numItemsToTest ? items.slice(0,numItemsToTest) : await itemTable.showMoreItems()            
        }

        // # Data Testing
        //Create correctly sorted array to validate actually item array order
        const correctlySortedItems = [...items].sort((a,b) => {
            //.split(' ')[1] accesses the unix time at the end of the timestamp
            // If time is undefined it will set to 0 which will sort it to the bottom of the array as oldest
            let aTime = a.time?.split(' ')[1] ? parseInt(a.time?.split(' ')[1]) : 0
            let bTime = b.time?.split(' ')[1] ? parseInt(b.time?.split(' ')[1]) : 0
            
            //b - a sorts in descending or newest to oldest
            return bTime - aTime            
        })
        //Validate items are sorted Chronologically
        await Promise.all(items.map(async (item,index) => {
            //If item is not chronologically ranked, push item id, current rank and correct rank to sortingErrors array
            if (item.id !== correctlySortedItems[index].id) {
                //Find correct rank, add 1 to adjust for 0 start index
                const correctRank = correctlySortedItems.findIndex(obj => obj.id == item.id) + 1
                sortingErrors.push(`Item id: ${item.id} is rank ${item.rank} when it should be ranked ${correctRank}`)
            }
        }))
    })
    
    test('B.2 top articles in show do not contain fundraiser links', async ({ page,topNavBar,itemTable }) => {
        //Test Parameters
        let improperUrls:string[] = []
        const numPagesToTest = b2TestData.numPagesToTest;

        //Navigate to Hacker New Show page
        await topNavBar.navShow();
        
        for(let pageNum = 1; pageNum < numPagesToTest; pageNum++) {
                //For each blacklisted url
                await Promise.all(b2TestData.blacklistUrls.map(async blacklistUrl => {
                //Check page for hrefs that match blacklistUrl
                const blacklistLocs = await page.locator(`[href*="${blacklistUrl}"]`).all()
                //Get all the links that match the blacklist url if any
                if (blacklistLocs.length > 0 ) {
                    const urlsOnPage:string[] = await Promise.all(blacklistLocs.map(async (blacklistLoc,i) => {
                        await blacklistLoc.screenshot({ path:`../test-results/b-2-screenshots/blackList-${i}.png`})
                        let result = await blacklistLoc.getAttribute('href')
                        return result != null ? result : 'none'
                    }).filter(Boolean))
                    improperUrls.push(...urlsOnPage)
                }
            }))
            //Go to next page of items
            await itemTable.showMoreItems()
        }
        //Expect that no blacklisted urls are found
        expect(improperUrls,'should have no blacklisted urls').toHaveLength(0);
    })

    test('B.3 comment counts match number of comments on articles for top 100 articles on Hacker News', async ({ page, context, topNavBar, itemTable }) => {
        // # Setup        
        //Test Parameters
        const numArticlesToTest = b3TestData.numArticlesToTest;
        let articles:{ commentCount: string, url: string }[] = [];
        //Navigate to Hacker News acticles page and wait for line of table to load
        await topNavBar.navHackerNews();
        await itemTable.waitForTableToLoad();

        // # Fetch Data
        while (articles.length < numArticlesToTest ) {
            //Get all comment lines and their href
            let articlesOnPage: { commentCount: string, url: string }[] = []
            articlesOnPage = await page.locator('.subline a[href^="item?id="]:not(.age *)').evaluateAll(items => 
                items.map(item => {
                    //Get numerical data from comment text, if there are 0 comments the line will text say 'discuss' and have no numerical data, hense ?? 0
                    let rawCommentCount = item?.textContent?.trim();
                    let rawHref = item.getAttribute('href') ?? 'none';
                    return {
                        commentCount: rawCommentCount?.replace(/\D/g,"") ?? '0', 
                        url: `https://news.ycombinator.com/${rawHref}`
                    }
                })
            );
            //Push articles from this page to the articles array
            articles.push(...articlesOnPage);

            //If enough articles have been collected trim array to exactly number of articles requested
            // else: click More to show more articles
            articles.length >= numArticlesToTest ? articles=articles.slice(0,numArticlesToTest) : await itemTable.showMoreItems()
        }

        // # Data Testing: Comparing Comment Counts
        // Process: 1. Navigate to each articles page 2. count comments on page 3. compare that count with saved display count
        // if comment count failure: Recount comments failed pages up to number of retries
        //Start by comparing all collected data
        let articlesToCount = articles;
        //Array to store articles that fail count comparision
        let commentCountFails: { commentCount: string, url: string }[] = [];
        //Maximum number of retries on failed counts
        const maxNumRetries = b3TestData.maxNumOfRetries;
        let tryCount = 1;
        //Array to save results
        let reportArr: { numPassed: number, flakyArticles: string[], failedArticles: string[] } = {numPassed:0, flakyArticles:[], failedArticles:[]}
        
        while (articlesToCount.length != 0 && tryCount <= maxNumRetries) {
            await Promise.all(articlesToCount.map(async article => {
                //Setup
                const newPage = await context.newPage()
                //  Navigate to comment page
                await newPage.goto(article.url)
                await newPage.waitForLoadState('domcontentloaded')
                
                //Execute
                //  Count number of comments on page
                const numCommentsOnPage = await newPage.locator('.comtr:not(.noshow)').count()
                //  Check if number of comments counted matched the displayed comment count
                if (numCommentsOnPage == parseInt(article.commentCount) && tryCount == 1) {
                    //Count Passing tests
                    reportArr.numPassed++
                } else if (numCommentsOnPage == parseInt(article.commentCount)) {
                    //Saved flaky test report
                    reportArr.flakyArticles.push(`Article: ${article.url} failed ${tryCount-1} out of ${tryCount} times`)
                } else if (numCommentsOnPage != parseInt(article.commentCount) && tryCount == maxNumRetries) {
                    //Save failed test report
                    reportArr.failedArticles.push(`Article: ${article.url} failed ${tryCount} out of ${tryCount} times`)
                } else if (numCommentsOnPage != parseInt(article.commentCount)) {
                    //Push failed tests to be retried
                    commentCountFails.push(article)                    
                }

                //Teardown
                await newPage.close()
            }))
            //Setup for retry
            tryCount++
            if (tryCount <= maxNumRetries) {
                articlesToCount = commentCountFails;
                commentCountFails = [];
            }            
        }
        //Log error report
        console.log('Comment Count Test Report:')
        console.log(`${reportArr.numPassed} of ${numArticlesToTest} articles passed`)
        console.log(`${reportArr.flakyArticles.length} articles were flaky`)
        reportArr.flakyArticles.forEach( msg => console.log(msg))
        console.log(`${reportArr.failedArticles.length} articles failed`)
        reportArr.failedArticles.forEach( msg => console.log(msg))
        //Expect to have found zero comment count errors
        await expect(commentCountFails).toHaveLength(0);
    })
   
})