//Import Playwright testing tools
import { chromium } from 'playwright';
import { test,expect } from '@playwright/test';
//Import POMs used in these tests
import { TestSetup } from '../POM/TestSetup.ts';
import { TopNavBar } from '../POM/TopNavBar.ts';
import { ItemTable } from '../POM/ItemTable.ts';
//Import test data used by these tests
// A.2
import { showBlacklist } from '../test-data/b-2-show-blacklist.json'


test.describe('A. Hacker News content is displaying correctly', () => {
    //Set up Hacker News page for each test
    test.beforeEach(async ({ page }) => {
            const PomHackerNewsPage = new TestSetup(page);
            await PomHackerNewsPage.gotoHackerNews(); 
    })
    test.afterEach(async ({ page }) => {
            await page.close();
    })
    
    test('B.1 Comment counts match number of comments on articles for top 100 articles on Hacker News', async ({ page }) => {
        //Create POM classes for this test
        const PomTopNavBar = new TopNavBar(page);
        const PomItemTable = new ItemTable(page);

        //Test Parameters
        const numArticlesToTest = 30;
        let articles = []

        //Navigate to Hacker News acticles page and wait for line of table to load
        await PomTopNavBar.navHackerNews();
        await PomItemTable.waitForTableToLoad();

        //Fetch array of comment counters values and the links to the pages with those comments
        while (articles.length < numArticlesToTest ) {
            //Get all comment lines and their href
            let articlesOnPage = await page.locator('.subline a[href^="item?id="]:not(.age *)').evaluateAll(items => 
                items.map(item => ({
                    commentCount: item?.textContent?.trim(),
                    url: item.getAttribute('href')
                    // id: url.match('/(?<=item?id=)/')[0]
                }))
            );
            //Push articles from this page to the articles array
            articles.push(...articlesOnPage);

            //If enough articles have been collected trim array to exactly number of articles requested
            // else: click More to show more articles
            articles.length >= numArticlesToTest ? articles.slice(0,numArticlesToTest) : await PomItemTable.showMoreItems()
        }
        console.log(articles[0])
        //Go through array of comment data:
        // - follow each comment url
        // - count comments on page
        // - comparte to comment counter value from article list page
        let commentCountErrors = []; // this stores any mismatches between comment counter and acutal number of comments
        // const browser = await chromium.launch()
        // const context = await browser.newContext()
        // await Promise.all(articles.map(async article => {
            
        //     //goto href
        //     const commentPage = await context.newPage()
        //     await commentPage.goto(article.url)
        //     await commentPage.waitForLoadState('domcontentloaded')
        //     let numCommentsOnPage = await commentPage.locator('.comtr:not(.noshow)').count()
            
        //     //count comments on that page
        //     if (numCommentsOnPage != article.commentCount) {
        //         commentCountErrors.push(`Item ___ has mismatch betwen comment counter: ${article.commentCount} and number of comments displayed ${numCommentsOnPage}`)
        //     }
        //     //compare comment count values
        // }))
    })
    test('B.2 top show articles do not contain fundraisers', async ({ page }) => {
        //Create POM classes 
        const PomTopNavBar = new TopNavBar(page);
        const PomItemTable = new ItemTable(page);

        //Test Parameters
        let improperUrls = []
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
                    const urlsOnPage = await Promise.all(blacklistLocs.map(async (blacklistLoc,i) => {
                        await blacklistLoc.screenshot({ path:`../test-results/a-2-screenshots/blackList-${i}.png`})
                        let result = await blacklistLoc.getAttribute('href')
                        return result != null ? result : 'none'
                    }).filter(Boolean))
                    improperUrls.push(urlsOnPage)
                }
            }))
            //Go to next page of items
            PomItemTable.showMoreItems()
        }
        //Expect that no blacklisted urls are found
        expect(improperUrls,'should have no blacklisted urls').toHaveLength(0);
    })
})