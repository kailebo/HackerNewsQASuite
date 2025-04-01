//Import playwright tests as base so I can extend it with custom fixtures
import { test as base } from '@playwright/test'
//Import POM classes to extend onto test
import { FooterNavBar } from './FooterNavBar.ts'
import { ItemTable } from './ItemTable.ts'
import { TestSetup } from './TestSetup.ts'
import { TopNavBar } from './TopNavBar.ts'

type MyFixtures =  {
    footerNavBar: FooterNavBar;
    itemTable: ItemTable;
    testSetup: TestSetup;
    topNavBar: TopNavBar;
}

//Extend playwright test base with POM models
export const test = base.extend<MyFixtures>({
    footerNavBar: async ({ page },use) => {
        await use(new FooterNavBar(page))
    },
    itemTable: async ({ page },use) => {
        await use(new ItemTable(page))
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