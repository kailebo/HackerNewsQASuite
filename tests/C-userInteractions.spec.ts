//Import Playwright testing tools
import { expect } from '@playwright/test';
//Import playwright test and custom POM fixtures
import { test } from '../POM/pomFixtureExtend.ts'
import { TestSetup } from '../POM/TestSetup.ts';
//Import MailSlurp to handle new User authentication
import { MailSlurp } from 'mailslurp-client' 
//Import test data used by these tests

//Tests
// C.1 Create Account
// C.2 Login Existing
// C.3 Forgot password

test.describe('User login working properly', async () => {
    test.afterEach(async ({ page }) => {
        // # Teardown
        await page.close();
    })

    test('C.1 New users can create accounts', async ({ login, user }) => {
        // # Setup
        //Randomize username
        const username = 'kjoApp' + Math.floor(Math.random()*100);
                        
        // # Execute Test
        //Use randomized username any password and no email
        await login.createNewAcc(username,user.password);

        //Expect username to show on Account button
        expect(login.accountLink).toHaveText(username)
    })
    test('C.2 Exsiting users can login and out', async ({ page, login, user }) => {
        //Set Username and Password
        await login.loginUser(user.username,user.password);

        //Expect username to show on Account button
        await expect(login.accountLink).toHaveText(user.username)

        //Logout User
        await login.logoutUser();

        //Expect login button to return
        await expect(login.accountLink).toBeHidden()
    })   
    test('C.3 Users can recover account with fogot password reset', async ({ page, login, user }) => {
        //Incorrect password that will also be set as new password
        const newPassword = '*l3g0B@man-V01c3*_F1R$tTRY!01';
        //Access mailslurp to receive recovery email        
        const mailslurp = new MailSlurp({ apiKey: user.emailApiKey });
        
        //Attempt Login
        await login.loginUser(user.username,newPassword)

        //Expect wrong password message
        await expect(page.locator('body')).toContainText('Bad login.')

        //Forgot password
        await login.forgotPassword();
        await expect(page.getByText(/(password)*(sent)*(recovery)/)).toBeVisible();

        //Wait to recieve email
        const resetLinkEmail = await mailslurp.waitController.waitForLatestEmail({
            inboxId: user.inboxId,
            timeout: 120_000,
            unreadOnly:true
        })
        //Get link from email
        const resetLink = resetLinkEmail.body?.match(/https?:\/\/[^\s]+/g)?.[0];

        //Navigate to resetLink
        if (resetLink) {
            await page.goto(resetLink);
        }

        //Enter New Password
        await login.enterNewPassword(newPassword);

        //Login with new Password
        await login.loginUser(user.username,newPassword);

        //Expect to be logged in
        await expect(login.accountLink).toHaveText(user.username)
    })
})