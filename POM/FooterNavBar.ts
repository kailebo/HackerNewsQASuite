import {type Page, type Locator} from '@playwright/test'

//This POM is designed to interact with navigation links and search bar at bottom of page
//Actions:
// - Click on navigation link by link name
// - Search an input query with Hacker News search box


export class FooterNavBar {
    readonly page: Page;
    readonly footerNavBar: Locator;    
    readonly searchBar: Locator;
    //These are specific to Search Results Page
    readonly searchResult: Locator;
    
    constructor(page) {
        this.page = page;
        this.footerNavBar = page.locator('.yclinks')
        this.searchBar = page.locator('input');
        //These are specific to Search Results Page
        this.searchResult = page.locator('article');

    }
    async navFootBarByName(linkName: string, openInNewTab:boolean = false) {
        //Create locator variable with input name
        const linkLoc = this.footerNavBar.getByRole('link', {name: linkName })
        //click on link or Ctrl+Shift click on like to open in new tab
        openInNewTab ? await linkLoc.click({ modifiers: ['Control','Shift'] }) : await linkLoc.click()
        //Wait for page dom to load
        await this.page.waitForLoadState('domcontentloaded');
    }
    async searchStr(searchInput: string) {
        //Paste input query into search box
        await this.searchBar.fill(searchInput);
        //Press enter to search
        await this.searchBar.press('Enter');
        //Wait for results page dom to load and a result selector to appear
        await this.page.waitForLoadState('domcontentloaded');
        await this.page.waitForSelector('article');
    }
    
}