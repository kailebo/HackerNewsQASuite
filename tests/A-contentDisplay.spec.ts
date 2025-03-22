//Import Playwright testing tools
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
        await page.waitForSelector('.athing')

        //Fetch array of comment counters values and the links to the pages with those comments
        while (articles.length < numArticlesToTest ) {
            // const articlesOnPagex = await page.locator('.athing').evaluateAll(articlesx =>
            //     //Since the Rank and timestamp values in Hacker News do not share the same parent I am using the post id number to verify
            //     // that I am indeeded pairing the timestamp and rank from the same article
            //     articlesx.map(article => ({
            //           //id and rank share the same parent which we targeted with locatro('.athing')
            //           id: article.getAttribute('id'),
            //           rank: article.querySelector('.rank')?.textContent?.trim(),
            //           //
            //           time: document.querySelector(`.age:has([href="item?id=${article.getAttribute('id')}"])`)?.getAttribute('title'),
            //       }))
            //     );
            
            //Get all comment lines and their href
            const articlesOnPage = await page.locator('.subline a[href^="item?id="]:not(.age *)').evaluateAll(items => 
                items.map(item => ({
                    commentCount: item?.textContent?.trim(),
                    url: item.getAttribute('href')
                }))
            );
            //Push articles from this page to the articles array
            articles.push(...articlesOnPage);

            //If enough articles have been collected trim array to exactly number of articles requested
            // else: click More to show more articles
            articles.length > numArticlesToTest ? articles.slice(0,numArticlesToTest) : PomItemTable.showMoreItems()
            break
        }

        //Go through array of comment data:
        // - follow each comment url
        // - count comments on page
        // - comparte to comment counter value from article list page
        await Promise.all()
        


        const testItem = await PomItemTable.getItemDetailsById('43415820')
        console.log(testItem)

    })
})