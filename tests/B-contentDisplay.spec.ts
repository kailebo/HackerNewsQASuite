//Import Playwright testing tools
import { chromium } from 'playwright';
import { test,expect } from '@playwright/test';
//Import POMs used in these tests
import { TestSetup } from '../POM/TestSetup.ts';
import { TopNavBar } from '../POM/TopNavBar.ts';
import { ItemTable } from '../POM/ItemTable.ts';
//Import test data used by these tests
// B.1
import { sortedChronologically } from '../test-data/b-1-sortedChronologically.json'
// B.2
import { showBlacklist } from '../test-data/b-3-show-blacklist.json'
import { FooterNavBar } from '../POM/FooterNavBar.ts';


test.describe('A. Hacker News content is displaying correctly', () => {
    //Set up Hacker News page for each test
    test.beforeEach(async ({ page }) => {
        //Create POM class    
        const PomTestSetup = new TestSetup(page);
        //Open Hacker News
        await PomTestSetup.gotoHackerNews(); 
    })
    test.afterEach(async ({ page }) => {
        await page.close();
    })
    
    test(`B.1 top ${sortedChronologically.numItemsToTest} items on new page are sorted Chronologically`, async ({ page }) => {
        //Create POM classes
        const PomTopNavBar = new TopNavBar(page);
        const PomItemTable = new ItemTable(page);

        //import test parameteres
        const numItemsToTest = sortedChronologically.numItemsToTest
        let items: { id: (string | undefined), rank: (string | undefined), time: (string | undefined ) }[] = [];
        
        let sortingErrors: string[] = [];

        //Navigate to Newest to page
        await PomTopNavBar.navNew()

        //While we have less than requested number of items
        while (items.length < numItemsToTest) {
            //Get item id, rank and timestamp data
            const itemsOnPage = await PomItemTable.itemTopRow.evaluateAll(articles =>
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
            items.length >= numItemsToTest ? items.slice(0,numItemsToTest) : await PomItemTable.showMoreItems()            
        }

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
    
    test('B.2 top show articles do not contain fundraisers', async ({ page }) => {
        //Create POM classes 
        const PomTopNavBar = new TopNavBar(page);
        const PomItemTable = new ItemTable(page);

        //Test Parameters
        let improperUrls:string[] = []
        const numPagesToTest = 2;

        //Navigate to Hacker New Show page
        await PomTopNavBar.navShow();
        
        for(let pageNum = 1; pageNum < numPagesToTest; pageNum++) {
                //For each blacklisted url
                await Promise.all(showBlacklist.urls.map(async blacklistUrl => {
                //Check page for hrefs that match blacklistUrl
                const blacklistLocs = await page.locator(`[href*="${blacklistUrl}"]`).all()
                //Get all the links that match the blacklist url if any
                if (blacklistLocs.length > 0 ) {
                    const urlsOnPage:string[] = await Promise.all(blacklistLocs.map(async (blacklistLoc,i) => {
                        await blacklistLoc.screenshot({ path:`../test-results/a-2-screenshots/blackList-${i}.png`})
                        let result = await blacklistLoc.getAttribute('href')
                        return result != null ? result : 'none'
                    }).filter(Boolean))
                    improperUrls.push(...urlsOnPage)
                }
            }))
            //Go to next page of items
            PomItemTable.showMoreItems()
        }
        //Expect that no blacklisted urls are found
        expect(improperUrls,'should have no blacklisted urls').toHaveLength(0);
    })

    test('B.3 Comment counts match number of comments on articles for top 100 articles on Hacker News', async ({ page, context }) => {
        //Create POM classes for this test
        const PomTopNavBar = new TopNavBar(page);
        const PomItemTable = new ItemTable(page);

        //Test Parameters
        const numArticlesToTest = 40;
        let articles:{ commentCount: string, url: string }[] = [];

        //Navigate to Hacker News acticles page and wait for line of table to load
        await PomTopNavBar.navHackerNews();
        await PomItemTable.waitForTableToLoad();

        //Fetch array of comment counters values and the links to the pages with those comments
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
            articles.length >= numArticlesToTest ? articles=articles.slice(0,numArticlesToTest) : await PomItemTable.showMoreItems()
        }
        console.log(articles[0])
        console.log(articles.length)
        //Go through array of comment data:
        // - follow each comment url
        // - count comments on page
        // - comparte to comment counter value from article list page
        let commentCountErrors: string[] = []; // this stores any mismatches between comment counter and acutal number of comments
        await Promise.all(articles.map(async article => {
            //Create new Page
            const newPage = await context.newPage()
            //Navigate to comment page
            await newPage.goto(article.url)
            await newPage.waitForLoadState('domcontentloaded')
            //Count number of comments on page
            const numCommentsOnPage = await newPage.locator('.comtr:not(.noshow)').count()
            console.log(`Article: ${article.url} display: ${article.commentCount} Display: ${numCommentsOnPage}`)
            //Check if number of comments counted matched the displayed comment count
            if (numCommentsOnPage != parseInt(article.commentCount)) {
                commentCountErrors.push(`Article ${article.url} displayed comment count ${article.commentCount} but the actual number of comments was ${numCommentsOnPage}`)
            }
            //Close page
            await newPage.close()
        }))

        //Expect to have found zero comment count errors
        await expect(commentCountErrors).toHaveLength(0);
    })
   
})