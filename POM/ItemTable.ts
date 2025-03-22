import { type Locator, type Page } from '@playwright/test';

//This POM is designed to interact with the html tables that list almost all of the content 
// of Hacker New's various pages
//Actions:
// - get item details by id
// - get item details by username
//item details retrieved:
// - title, user, timestamp, url, comment count

export class ItemTable {
    readonly page: Page;
    
    constructor(page) {

    }
}