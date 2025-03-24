import { Browser, type Locator, type Page } from '@playwright/test';
import { readlink } from 'fs';

//This POM is designed to interact with the html tables that list almost all of the content 
// of Hacker New's various pages
//Actions:
// - get item details by id
// - get item details by username
//item details retrieved:
// - title, user, timestamp, url, comment count

export class ItemTable {
    readonly page: Page;
    readonly commentsLoc: Locator;
    readonly moreItemsButton: Locator;
    readonly itemTopRow: Locator;
    

    
    constructor(page) {
        this.page = page;
        this.commentsLoc = page.locator('.subline a[href^="item?id="]:not(.age *)');
        this.moreItemsButton = page.locator('.morelink');
        this.itemTopRow = page.locator('.athing');
    }
    async waitForTableToLoad() {
        this.page.waitForLoadState('domcontentloaded')
        // await this.page.waitForFunction(async () => {
        //     //Waits for all 30 items on page to load. 
        //     // This is good when targeting all content matching a locator on the page
        //     return await this.itemTopRow.count() >= 30;
        // })
    }
    async getItemDetailsById(itemId,getAll=false,getRank=false,getTitle=false,getUrl=false,getUser=false,getTime=false,getComments=false) {
        //This method uses an items hacker news id number to make sure all the details it pulls are for the same item
        // the item must be showing on the current page.
        // - Set getAll to true to pull all details or set individual items to true to pull just certain details
        // - details you are not retieving will be set to null
        this.waitForTableToLoad()
        
        //If getAll is assign true all getBooleans are overwritten to true
        getAll ? getRank = getTitle = getUrl = getUser = getTime = getComments = true : getAll;
        const id = itemId
        //Get detals from top row
        // Since id starts with a number we have to escape that first number to unicode in order for it to be located.
        const firstNum = itemId[0];
        const afterFirstNum = itemId.slice(1,itemId.length)
        const topRowLoc = this.page.locator(`#\\3${firstNum} ${afterFirstNum}`)
        const rank = getRank ? await topRowLoc.locator('[class="rank"]').textContent() : null;
        const title = getTitle ? await topRowLoc.locator('.title a:not(.sitebit *)').textContent() : null;
        const url = getUrl ? await topRowLoc.locator('.title .sitebit').getByRole('link').textContent() : null;
        //Get details from lower subline row while still matching item to id
        const subtextRowLoc = this.page.locator(`.subline:has([id="score_${itemId}"])`)
        const user = getUser ? await subtextRowLoc.locator('.hnuser').textContent() : null;
        const time = getTime ? await subtextRowLoc.locator('.age').getAttribute('title') : null;
        const comments = getComments ? await subtextRowLoc.locator(`[href="item?id=${itemId}"]:not(.age *)`).textContent() : null;

        //Return Obj of details
        return { id, rank, title, url, user, time, comments}
    }
    async showMoreItems() {
        await this.moreItemsButton.click()
        await this.page.waitForLoadState('domcontentloaded')
        await this.page.waitForSelector('.athing')
    }
}