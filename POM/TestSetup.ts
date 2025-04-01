import { chromium, type Browser, type Locator, type Page } from "playwright/test";
import { TopNavBar } from "./TopNavBar";

//POM to open and close browsers for test on Hacker News

export class TestSetup {
    readonly page: Page;
    readonly hackerNewsURL: string;

    constructor(page: Page) {
        this.page = page
        this.hackerNewsURL = 'https://news.ycombinator.com/'
    }
    async gotoHackerNews() {
        await this.page.goto(this.hackerNewsURL, {waitUntil: "load", timeout: 120000});
    }
    async closePage() {
        await this.page.close()
    }
}