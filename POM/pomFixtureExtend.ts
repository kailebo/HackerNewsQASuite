//Import playwright tests as base so I can extend it with custom fixtures
import { test as base } from '@playwright/test'
//Import POM classes to extend onto test
import { FooterNavBar } from './FooterNavBar.ts'
import { ItemTable } from './ItemTable.ts'
import { Login, type User } from './Login.ts'
import { TestSetup } from './TestSetup.ts'
import { TopNavBar } from './TopNavBar.ts'

type MyFixtures =  {
    user: User;
    footerNavBar: FooterNavBar;
    itemTable: ItemTable;
    login: Login;
    testSetup: TestSetup;
    topNavBar: TopNavBar;    
}

//Extend playwright test base with POM models
export const test = base.extend<MyFixtures>({
    user: [{
        username: 'kjoApp01',
        password: '*l3g0B@man-V01c3*_F1R$tTRY!',
        emailApiKey: 'e506d06cbd278e2752399dae732914d3e1589a86c5ba06fb3ad27b9c6e202a77',
        inboxId: '5ca30ca2-1840-428f-97f0-3aa774cabbfe'},
        { option: true }
    ],
    footerNavBar: async ({ page },use) => {
        await use(new FooterNavBar(page))
    },
    itemTable: async ({ page },use) => {
        await use(new ItemTable(page))
    },
    login: async ({ page },use) => {
        await use(new Login(page))
    },
    testSetup: [async ({ page }, use) => {
        //This fixture is set to auto: true which means it will run before each
        // test. Therefore this replaces
        const setup = new TestSetup(page);
        await setup.gotoHackerNews();
        await use(setup)
    }, {auto: true}],
    topNavBar: async ({ page }, use) => {
        await use(new TopNavBar(page))
    }    
})