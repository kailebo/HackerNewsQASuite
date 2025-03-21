const { chromium } = require('playwright');
const { expect } = require('@playwright/test');

// # Kaileb O'Neil's Hacker News Chronologic Order Test:
//  Hello, thank you for reviewing my code. You can uncomment this top comment and paste into .md file for easier reading
 
// I have built this project in a js class allows me to mimic some of the structure and scalablity
//  of Playwrights tests while in a .js file. Below is an outline of the class methods:

// ## constructor
// - set number of articles to test
// - set whether to run test headless
// ## runTest
// - This runs all methods to test Hack News articles for correct Chronological order
// - runs within try block to catch and report any errors
// ## setup 
// - launches browser and waits for page content to load
// ## teardown
// - closes browser
// ## fetchArticlesEvaluateAll
// - Fetches the requested number of articles
// - This method uses evaluateAll to get all articles in one browser call 
// - This method proved to be the faster method and is used by `this.runTest()`
// ## fetchArticlesInParallel
// - Fetches the requested number of articles
// - This method fetches page elements in full page batches and uses Promise.All to asynchronously get id, rank and time data
// - This method proved slower than evaluateAll with testing since the data being extracted is static the reduced calls to browser
//      saved more time than the asynchronious computing 
// ## validateArticleOrder
// - Goes through articles array and checks for chronlogical order
// - Prints errors for each articles out of order else report all articles or correctly sorted
// ## runTestFailCheck
// - runs setup and article fetch, expect to have the correct number of articles fetched
// - replaces some articles with fakes with randomized timestamps. These should be caught as chorological errors by `this.validateArticleOrder()`
// ## fetchSpeedTest
// - runs both fetch methods and prints time elapsed while running each method
// - I used this repeatedly to verify that `evaluateAll()` was the fastest approach for this project


class HackerNewsTest {
    constructor(numArticlesToTest = 100, runHeadless = false) {
        this.numArticlesToTest = numArticlesToTest;
        this.articles = []; 
    }
    //Runs full test with setup and teardown within try block
    async runTest() {
        await this.setup();
        try {
            //Get articles to test from Hacker News
            await this.fetchArticlesEvaluateAll();
            //Check Order of articles
            await this.validateArticleOrder();
        } catch (error) {
            console.error('Test encountered an error:', error);
        } finally {
            await this.teardown();
        }
    }
    //Launch New page to run test
    async setup() {
        console.log('...launching browser')
        this.browser = await chromium.launch({ headless: runHeadless });
        this.context = await this.browser.newContext();
        this.page = await this.context.newPage();
        await this.page.goto('https://news.ycombinator.com/newest');
        await this.page.waitForLoadState('domcontentloaded');
        await this.page.waitForSelector('.athing');
    }
    //Close browser after testing
    async teardown() {
        await this.browser.close();
    }
    
    //Get articles rank and timestamps from Hacker News
    async fetchArticlesEvaluateAll() {
        this.articles = []
        console.log(`...fetching ${this.numArticlesToTest} articles from Hacker News`)
        while (this.articles.length < this.numArticlesToTest) {
            const articlesOnPage = await this.page.locator('.athing').evaluateAll(articles =>
              //Since the Rank and timestamp values in Hacker News do not share the same parent I am using the post id number to verify
              // that I am indeeded pairing the timestamp and rank from the same article
              articles.map(article => ({
                    //id and rank share the same parent which we targeted with locatro('.athing')
                    id: article.getAttribute('id'),
                    rank: article.querySelector('.rank')?.textContent?.trim(),
                    //
                    time: document.querySelector(`.age:has([href="item?id=${article.getAttribute('id')}"])`)?.getAttribute('title'),
                }))
            );
            
            //Push articles from this page to articles array
            this.articles.push(...articlesOnPage);

            //If we need more articles to test, click 'More' button to show more articles
            if (this.articles.length < this.numArticlesToTest) {
                await this.page.locator('.morelink').click();
                await this.page.waitForLoadState('domcontentloaded');
                await this.page.waitForSelector('.athing');
            }
        }
        //Slice article array down to exactally number of articles to test
        this.articles = this.articles.slice(0, this.numArticlesToTest);
    
    }
    //Get articles rank and timestamps from Hacker News
    // This method pulls article top rows from each page at once and uses Promise.All() 
    //  to get id,rank and time data for each article. Note each timestamp will requre its own call to browser
    async fetchArticlesInParallel() {
        this.articles = []
        console.log(`...fetching ${this.numArticlesToTest} articles from Hacker News`)
        while (this.articles.length < this.numArticlesToTest) {
            //Fetch the top row of each article on page
            const articleTopRows = await this.page.locator('.athing').all()
            //Pull the id and rank data from all the article top rows
            const articlesOnPage = await Promise.all(articleTopRows.map(async articleTopRow => {
                const id = await articleTopRow.getAttribute('id');
                const rank = await articleTopRow.locator('.rank').textContent;
                const time = await this.page.locator(`.age:has([href="item?id=${id}"])`).getAttribute('title')
                //Return an object for each artile with its id, rank and timestamp
                return { id, rank, time }
                })       
            )
            
            //Push articles from this page to articles array
            this.articles.push(...articlesOnPage);

            //If we need more articles to test, click 'More' button to show more articles
            if (this.articles.length < this.numArticlesToTest) {
                await this.page.locator('.morelink').click();
                await this.page.waitForLoadState('domcontentloaded');
                await this.page.waitForSelector('.athing');
            }
        }
        //Slice article array down to exactally number of articles to test
        this.articles = this.articles.slice(0, this.numArticlesToTest);
    }
    //Check for chornological order within the articles array
    async validateArticleOrder() {
        console.log(`...validating first ${this.numArticlesToTest} articles are correctly sorted`);

        // Sort articles based on timestamps. If hacker news if correctly sorted no changes will be made
        const sortedArticles = [...this.articles].sort((expectedNewer, expectedOlder) => {
            let aTime = expectedNewer.time.split(' ')[1]
            let bTime = expectedOlder.time.split(' ')[1]
            return bTime - aTime
        })
        
        // Verify each article position
        let sortingErrors = []; //Where we will store any order errors found
        await Promise.all(this.articles.map(async (article, index) => {
            if (article.id !== sortedArticles[index].id) {
                sortingErrors.push(`  Article id:  ${article.id} is Rank ${article.rank} should be Rank ${sortedArticles.findIndex(obj => obj.id == article.id) + 1}.`);
            }
        }));

        //If there were errors found in articles order log them to console
        if (sortingErrors.length > 0) {
            console.error(`\n❌ Errors found in Article Order:\n${sortingErrors.join("\n")}`);
            expect(sortingErrors.length).toBe(0);  // Forces a test failure
        } else {
            console.log(`✅ The top ${this.numArticlesToTest} Hacker News articles are correctly sorted.`);
        }
    }
    async runTestFailCheck(numFakeArticles=5) {
        //This is designed to test that the above code is working properly
        // 1. It checks that the number of articles returned are equal to the numArticlesToTest
        // 2. It then add fake data to the articles array in order to check that validateSorting is
        //      properally catching errors in articles order
        await this.setup()
        try {
            //Fetch Articles
            await this.fetchArticlesEvaluateAll();
            //Check that requested number of articles were fetched
            expect(this.articles.length == this.numArticlesToTest).toBeTruthy();
            //Replace some articles with fake articles that are not in chronoclogical order
            console.log(`...adding ${numFakeArticles} fake article with these ranks: `);
            for(let fakes = 0; fakes<1; fakes++) {
                //Pick a random index in articles
                let randIndex = Math.floor(Math.random()*(this.numArticlesToTest))
                console.log(this.articles[randIndex].rank)
                //Set Time to be newer
                let timeArr = this.articles[randIndex].time.split(' ')
                timeArr[1] = parseInt(timeArr[1]) + Math.floor(Math.random()*1000) + 500
                this.articles[randIndex].time = `${timeArr[0]} ${timeArr[1]}`
            }
            //Check the chronological order of the articles
            //  this is exected to fail since some of the time stamps were randomized
            await this.validateArticleOrder();
        } catch(error) {
            console.error('Test encountered an error:', error);
        } finally {
            await this.teardown();
        }
    }
    //Run both methods for fetching article data to determine which one executes faster
    async fetchSpeedTest() {        
        await this.setup()
        try {
            //Check speed of evaluateAll method
            console.time('evaluateAll:')
            await this.fetchArticlesEvaluateAll();
            console.timeEnd('evaluateAll:')
             
            //Reset browser
            await this.teardown()
            await this.setup()
                         
            //Check speed of parallel method
            console.time('Promise.All:')
            await this.fetchArticlesInParallel();
            console.timeEnd('Promise.All:')
        } catch (error) {
            console.error('Test encountered an error:', error);
        } finally {
            await this.teardown();
        }
    }
}

// Execute the test
(async () => {
    //Set up Hack News Test Class and set articles to test to 100 and headless set to false
    const sortingTest = new HackerNewsTest(numArticlesToTest=10,runHeadless=false);
    //Run Test on Hacker News
    // await sortingTest.runTest();
    
    //Uncomment to fake nonchronological data and validate test is catching failures
    // await sortingTest.runTestFailCheck();

    //Uncomment to run Speed tests between fetching methods
    // await sortingTest.fetchSpeedTest();   
})(); 

//Thanks for considering my application. I look forward to hearing from you!