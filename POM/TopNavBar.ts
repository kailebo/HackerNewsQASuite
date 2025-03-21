import { type Locator, type Page } from "playwright/test";


//This POM lets test interact with the Navigation bar at the top of Hacker News
export class TopNavBar {
    readonly page: Page;
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
async navLogo() {
    await this.logo.isVisible();
    await this.logo.click();
}
async navHackerNews() {
    await this.hackerNews.isVisible();
    await this.hackerNews.click();
}
async navNew() {
    await this.new.isVisible();
    await this.new.click();
}
async navPast() {
    await this.past.isVisible();
    await this.past.click();
}
async navComments() {
    await this.comments.isVisible();
    await this.comments.click();
}
async navAsk() {
    await this.ask.isVisible();
    await this.ask.click();
}
async navShow() {
    await this.show.isVisible();
    await this.show.click();
}
async navJobs() {
    await this.jobs.isVisible();
    await this.jobs.click();
}
async navSubmit() {
    await this.submit.isVisible();
    await this.submit.click();
}
async navLogin() {
    await this.login.isVisible();
    await this.login.click();
}
}