import { type Locator, type Page } from "playwright/test";


//This POM lets test interact with the Navigation bar at the top of Hacker News
// Actions: 
// - there are methods for clicking on each of the navigation links
// - you can click on link by name of link. with 'logo' as the name of the Y combiner logo link
export class TopNavBar {
    readonly page: Page;
    readonly topNavBar: Locator;
    readonly logo: Locator;
    readonly hackerNews: Locator;
    readonly new: Locator;
    readonly past: Locator;
    readonly comments: Locator;
    readonly ask: Locator;
    readonly show: Locator;
    readonly jobs: Locator;
    readonly submit: Locator;
    readonly login: Locator;

    constructor(page:Page) {
        this.page = page;
        this.topNavBar = page.locator('tr:has(.pagetop)')
        this.logo = page.locator('tr:has(.pagetop) img')
        this.hackerNews = page.locator('tr:has(.pagetop) .hnname a')
        this.new = page.locator('tr:has(.pagetop) a:text-matches("new")')
        this.past = page.locator('tr:has(.pagetop) a:text-matches("past")')
        this.comments = page.locator('tr:has(.pagetop) a:text-matches("comments")')
        this.ask = page.locator('tr:has(.pagetop) a:text-matches("ask")')
        this.show = page.locator('tr:has(.pagetop) a:text-matches("show")')
        this.jobs = page.locator('tr:has(.pagetop) a:text-matches("jobs")')
        this.submit = page.locator('tr:has(.pagetop) a:text-matches("submit")')
        this.login = page.locator('tr:has(.pagetop) a:text-matches("login")')
    }
    async navByLinkName(linkName: string,openInNewTab: boolean = false) {
        //Assign locator based on name. since the logo link is an image with no name check for input logo
        const linkLoc = linkName == 'logo' ? this.logo : this.topNavBar.getByRole('link', { name: linkName, exact: true });
        //Click on link, if openInNewTab is true Ctrl+Shift click link
        openInNewTab ? await linkLoc.click({ modifiers: ['Control','Shift']}) : await linkLoc.click()
        await this.page.waitForLoadState('domcontentloaded');  
    }
    async navLogo() {
        await this.logo.isVisible();
        await this.logo.click();
        await this.page.waitForLoadState('domcontentloaded');
    }
    async navHackerNews() {
        await this.hackerNews.isVisible();
        await this.hackerNews.click();
        await this.page.waitForLoadState('domcontentloaded');
    }
    async navNew() {
        await this.new.isVisible();
        await this.new.click();
        await this.page.waitForLoadState('domcontentloaded');
    }
    async navPast() {
        await this.past.isVisible();
        await this.past.click();
        await this.page.waitForLoadState('domcontentloaded');
    }
    async navComments() {
        await this.comments.isVisible();
        await this.comments.click();
        await this.page.waitForLoadState('domcontentloaded');
    }
    async navAsk() {
        await this.ask.isVisible();
        await this.ask.click();
        await this.page.waitForLoadState('domcontentloaded');
    }
    async navShow() {
        await this.show.isVisible();
        await this.show.click();
        await this.page.waitForLoadState('domcontentloaded');
    }
    async navJobs() {
        await this.jobs.isVisible();
        await this.jobs.click();
        await this.page.waitForLoadState('domcontentloaded');
    }
    //Note these two are may not work as Hack News may blocking IPs from accessing 
    // certain areas of their site if they flag your IP as a bot for running automated tests on their site
    async navSubmit() {
        await this.submit.isVisible();
        await this.submit.click();
    }
    async navLogin() {
        await this.login.isVisible();
        await this.login.click();
    }
}
