//Import Playwright testing tools
import { test,expect } from '@playwright/test';
//Import POMs used in these tests
import { TestSetup } from '../POM/TestSetup.ts';
import { TopNavBar } from '../POM/TopNavBar.ts';
import { FooterNavBar } from '../POM/FooterNavBar.ts';
//Import test data used by tests
// A.1
import { topNavBarExpected } from '../test-data/a-1-topNavBarExpect.json'
// A.2
import { searchTests } from '../test-data/a-2-searchTest.json'
// A.3
import { footerNavBarExpected } from '../test-data/a-3-footerNavBarExpected.json'


test.describe('A. Site navigation with working properly', () => {
    //Open Hacker News page for each test
    test.beforeEach(async ({ page }) => {
        //Create POM classes
        const PomTestSetup = new TestSetup(page);
        //Go to Hacker News
        await PomTestSetup.gotoHackerNews(); 
    })
    //Close Page after each test
    test.afterEach(async ({ page }) => {
        await page.close()
    })
    test('A.1 Top Navigation bar is visible and links to correct pages', async ({ page }) => {
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
    test('A.2 Search bar yields results with matching keywords', async ({ page }) => {
        //Set up POM classes
        const PomFooterNavBar = new FooterNavBar(page);

        //Search all string from test-data
        await Promise.all(searchTests.map(async testSearch => {
            //Search test input
            await PomFooterNavBar.searchStr(testSearch)
            
            
                                    
            //Check that search results match the testSearch
            let numValidResults = await PomFooterNavBar.searchResult.getByText(testSearch).count();
            
            //Fail test if no matching results appear
            expect(numValidResults > 0).toBeTruthy()
            console.log(numValidResults)
        }))
    })
    test('A.3 Footer bar links navigate to correct pages', async ({ page, context }) => {
        //Create POM classes
        const PomFooterNavBar = new FooterNavBar(page);
        
        //Test each link from test-data
        for await (const linkObj of footerNavBarExpected)  {
            //Await promised New page
            const [newPage] = await Promise.all([
                context.waitForEvent('page'),
                //Click footer link with open in new tab set to true
                PomFooterNavBar.navFootBarByName(linkObj.name,true)
            ])
            //wait for page to load
            await newPage.waitForLoadState('domcontentloaded');
            //Expect url of newPage to match test-data
            await expect(newPage.url()).toBe(linkObj.url)
            
            //close newPage
            await newPage.close()
        }
    })
})