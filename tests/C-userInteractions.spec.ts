//Import Playwright testing tools
import { expect } from '@playwright/test';
//Import playwright test and custom POM fixtures
import { test } from '../POM/pomFixtureExtend.ts'
//Import MailSlurp to handle new User authentication
import { MailSlurp } from 'mailslurp-client' 


test.describe('User login working properly', async () => {
    test.afterEach(async ({ page }) => {
        // # Teardown
        await page.close();
    })

    test('C.1 New users can create accounts', async ({ login, user }) => {
        // # Setup
        //remove test timeout due to manual reCaptcha solving
        test.setTimeout(0);
        //Randomize username
        const username = 'kjoApp' + Math.floor(Math.random()*1000);
                        
        // # Execute Test
        //Use randomized username any password and no email
        await login.createNewAcc(username,user.password);

        //Expect username to show on Account button
        await expect.soft(login.accountLink).toHaveText(username)
    })
    test('C.2 Exsiting users can login and out', async ({ login, user }) => {
        //remove test timeout due to manual reCaptcha solving
        test.setTimeout(0);
        
        //Set Username and Password
        await login.loginUser(user.username,user.password);

        //Expect username to show on Account button
        await expect.soft(login.accountLink).toHaveText(user.username)

        //Logout User
        await login.logoutUser();

        //Expect login button to return
        await expect.soft(login.accountLink).toBeHidden()
    })   
    test('C.3 Users can recover account with forgot password reset', async ({ page, login, user, topNavBar }) => {
        //remove test timeout due to manual reCaptcha solving
        test.setTimeout(0);
        //User Info
        const username = 'kjoApp' + Math.floor(Math.random()*1000);
        const firstForgottenPassword = '*l3g0B@man-V01c3*_F1R$tTRY!' + Math.floor(Math.random()*1000);
        const newPassword = '*l3g0B@man-V01c3*_F1R$tTRY!' + Math.floor(Math.random()*1000);
        //Create email for user with mailslurp to receive recovery email        
        const mailslurp = new MailSlurp({ apiKey: user.emailApiKey });
        const userInbox = await mailslurp.inboxController.createInboxWithDefaults();
        const userEmail = await userInbox.emailAddress;
        //Create Hacker News Account
        await login.createNewAcc(username, firstForgottenPassword, userEmail);
        //logout
        await login.logoutUser();
        
        //Attempt Login
        await login.loginUser(username,newPassword)

        //Expect wrong password message
        await expect.soft(page.locator('body')).toContainText('Bad login.')

        //Forgot password
        await login.forgotPassword();
        await expect.soft(page.getByText(/(password)*(sent)*(recovery)/)).toBeVisible();

        //Wait to recieve email
        const resetLinkEmail = await mailslurp.waitController.waitForLatestEmail({
            inboxId: userInbox.id,
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
        await login.loginUser(username,newPassword);
        await topNavBar.navLogo();

        //Expect to be logged in
        await expect.soft(login.accountLink).toHaveText(username)
    })
})