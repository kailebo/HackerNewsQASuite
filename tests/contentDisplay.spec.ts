//Import Playwright testing tools
import { test,expect } from '@playwright/test';
//Import POMs used in these tests
import { TestSetup } from '../POM/TestSetup.ts';
import { TopNavBar } from '../POM/TopNavBar';
//Import test data used by these tests


test.describe('Hacker News content is displaying correctly', () => {
    //Set up Hacker News page for each test
    test.beforeEach(async ({ page }) => {
            const PomHackerNewsPage = new TestSetup(page);
            await PomHackerNewsPage.gotoHackerNews(); 
        })
    test.afterEach(async ({ page }) => {
            await page.close();
    })
    test('Comment counts match number of comments on articles for top 100 articles on Hacker News', async ({ page }) => {
        //Create POM classes for this test
        const PomTopNavBar = new TopNavBar(page);

        //Navigate to Hacker News acticles page
        await PomTopNavBar.navHackerNews();

        //Process:
        // Get printed number of comments
        // Click on comments
        // Counts comments on page and compare

    })
})