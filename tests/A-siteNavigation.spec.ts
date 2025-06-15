//Import Playwright testing tools
import { expect } from '@playwright/test';
//Import playwright test with custom POM Fixtures
import { test } from '../POM/pomFixtureExtend.ts'
//Import test data used by tests
import { a1TestData } from '../test-data/a-1-topNavBarExpect.json'
import { a2TestData } from '../test-data/a-2-searchTest.json'
import { a3TestData } from '../test-data/a-3-footerNavBarExpected.json'
//Import TopNavBar to be used on multipage test
import { TopNavBar } from '../POM/TopNavBar.ts';


test.describe('A. Site navigation with working properly', () => {
    //Close Page after each test
    test.afterEach(async ({ page }) => {
        await page.close();
    })
    test('A.1 Top Navigation bar is visible and links to correct pages', async ({ context }) => {
        //For each of the Top bar Navigation button:
        // - expect it to be visible
        // - click it to navigate to page
        // - expect url to match correct url from test-data/topNavBarExpected 
        await Promise.all(a1TestData.expectedLinks.map(async expectedLink => {
            //Create New page
            const navPage = await context.newPage();
            //Open Hacker News in new page
            await navPage.goto('https://news.ycombinator.com/');
            
            //Click link
            // await topNavBar.navByLinkName(expectedLink.name)
            const newTopNavBar =  new TopNavBar(navPage);
            await newTopNavBar.navByLinkName(expectedLink.name);            
            
            //Expect resulting page url to match the test-data url
            expect(navPage.url()).toBe(expectedLink.url);
            //close page
            await navPage.close();
        }))
    })
    test('A.2 Search bar yields results with matching keywords', async ({ page, footerNavBar }) => {
        //Import test parameters
        const testQuery = a2TestData.searchQuery;

        //Search test input
        await footerNavBar.searchStr(testQuery)
        
        //Check that search results match the testQuery
        let numValidResults = await page.locator('article').getByText(testQuery).count();
        
        //Fail test if no matching results appear
        expect(numValidResults > 0).toBeTruthy()
    })
    test('A.3 Footer bar links navigate to correct pages', async ({ page, context, footerNavBar }) => {
        //Test each link from test-data
        for await (const expectedLink of a3TestData.expectedLinks)  {
            //Await promised New page
            const [newPage] = await Promise.all([
                context.waitForEvent('page'),
                //Click footer link with open in new tab set to true
                footerNavBar.navFootBarByName(expectedLink.name,true)
            ])
            //wait for page to load
            await newPage.waitForLoadState('domcontentloaded');
            //Expect url of newPage to match test-data
            await expect(newPage.url()).toBe(expectedLink.url)
            
            //Close newPage
            await newPage.close()
        }
    })
})