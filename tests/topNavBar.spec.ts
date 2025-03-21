//Import Playwright testing tools
import { test,expect } from '@playwright/test'
//Import POMs used in these tests
import { TestSetup } from '../POM/TestSetup.ts'
import { TopNavBar } from '../POM/TopNavBar.ts';
//Import test data used by these tests
import { topNavBarExpected } from '../test-data/topNavBarExpect.json'

test.describe('Site navigation with working properly', () => {
    test.beforeEach(async ({ page }) => {
        //Create POM classes
        const PomHackerNewsPage = new TestSetup(page);
        await PomHackerNewsPage.gotoHackerNews(); 
    })
    test.afterEach(async ({ page }) => {
        await page.close()
    })
    test('Top Navigation bar is visible and links to correct pages', async ({ page }) => {
        //Create POM classes for navigating top bar
        const PomTopNavBar = new TopNavBar(page);
        
        //For each of the Top bar Navigation button:
        // - expect it to be visible
        // - click it to navigate to page
        // - expect url to match correct url from test-data/topNavBarExpected        
        for await(const navButton of topNavBarExpected) {
            await page.waitForLoadState('domcontentloaded')
            expect(PomTopNavBar[navButton.name]).toBeVisible()            
            await PomTopNavBar[navButton.name].click()
            await page.waitForLoadState('domcontentloaded')
            expect(page.url()).toBe(navButton.url)
        }
    })
})