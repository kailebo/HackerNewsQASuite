//Import Playwright testing tools
import { chromium } from 'playwright';
import { test,expect } from '@playwright/test';
//Import POMs used in these tests
import { TestSetup } from '../POM/TestSetup.ts';
import { TopNavBar } from '../POM/TopNavBar.ts';
import { ItemTable } from '../POM/ItemTable.ts';
//Import test data used by these tests


test.describe('A. Hacker News content is displaying correctly', () => {
    //Set up Hacker News page for each test
    test.beforeEach(async ({ page }) => {
            const PomHackerNewsPage = new TestSetup(page);
            await PomHackerNewsPage.gotoHackerNews(); 
    })
    test.afterEach(async ({ page }) => {
            await page.close();
    })
    
    test('A.1 Comment counts match number of comments on articles for top 100 articles on Hacker News', async ({ page }) => {
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
})