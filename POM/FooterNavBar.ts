import {type Page, type Locator} from '@playwright/test'

//This POM is designed to interact with navigation links and search bar at bottom of page

export class FooterNavBar {
    readonly page: Page;
    readonly searchBar: Locator;
    //These are specific to Search Results Page
    readonly searchResult: Locator;
    
    constructor(page) {
        this.page = page;
        this.searchBar = page.locator('input');
        //These are specific to Search Results Page
        this.searchResult = page.locator('article');

    }
    async searchStr(searchInput) {
        await this.searchBar.fill(searchInput);
        await this.searchBar.press('Enter');
        await this.page.waitForFunction(async () => await this.searchResult.count() >= 10);
    }
}