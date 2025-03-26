//Import Playwright testing tools
import { test,expect } from '@playwright/test';
//Import POMs used in these tests
import { TestSetup } from '../POM/TestSetup.ts';
import { TopNavBar } from '../POM/TopNavBar.ts';
import { FooterNavBar } from '../POM/FooterNavBar.ts';
//Import test data used by tests
// B.1
import { topNavBarExpected } from '../test-data/topNavBarExpect.json'
// B.2
import { searchTests } from '../test-data/b-2-searchTest.json'


test.describe('B. Site navigation with working properly', () => {
    //Open Hacker News page for each test
    test.beforeEach(async ({ page }) => {
        //Create POM classes
        const PomHackerNewsPage = new TestSetup(page);
        await PomHackerNewsPage.gotoHackerNews(); 
    })
    //Close Page after each test
    test.afterEach(async ({ page }) => {
        await page.close()
    })
    test('B.1 Top Navigation bar is visible and links to correct pages', async ({ page }) => {
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
    test('B.2 Search bar yields results with mathcing keywords', async ({ page }) => {
        //Set up POM classes
        const PomFooterNavBar = new FooterNavBar(page);

        //Search all string from test-data
        await Promise.all(searchTests.map(async testSearch => {
            //Search test input
            await PomFooterNavBar.searchStr(testSearch)
            await page.waitForLoadState('domcontentloaded')
                                    
            //Check for results that match the testSearch
            let numValidResults = await PomFooterNavBar.searchResult.getByText(testSearch).count();
            
            //Fail test if no matching results appear
            expect(numValidResults > 0).toBeTruthy()
            console.log(numValidResults)
        }))
    })
})