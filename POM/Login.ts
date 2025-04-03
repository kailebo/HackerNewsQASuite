import { type Locator, type Page } from "playwright";
import { MailSlurp } from 'mailslurp-client'

//Handles interactions with logging into Hacker News
// Actions:
//  - Create account (user, pw, )
//  - Login with input user & password
//  - Create New account

export type User = {
    username: string,
    password: string,
    emailApiKey: string,
    inboxId: string
}

export class Login {
    readonly page: Page;
    readonly loginLink: Locator;
    readonly accountLink: Locator;
    //Login
    readonly loginButton: Locator;
    readonly logoutButton: Locator;
    readonly loginSection: Locator
    readonly userInput: Locator;
    readonly pwInput: Locator;
    //Password Reset
    readonly forgotPasswordLink: Locator;
    readonly resetPwButton: Locator;
    readonly newPasswordInput: Locator;
    readonly changePasswordButton: Locator;
    //Create Account
    readonly createAccButton: Locator;
    readonly createAccSection: Locator;
    readonly createUserInput: Locator;
    readonly createPwInput: Locator;
    //Account Page
    readonly emailInput: Locator;
    readonly updateButton: Locator;

    constructor(page) {
        this.page = page;
        this.loginLink = page.getByRole('link', { name: /log*in/ })
        this.accountLink = page.locator('#me');
        this.logoutButton = page.locator('#logout');
        //Login Section Locators        
        this.loginButton = page.getByRole('button', { name: 'login' });
        this.loginSection = page.locator('form').filter({ has: this.loginButton });
        this.userInput = this.loginSection.locator('input[name="acct"]');
        this.pwInput = this.loginSection.locator('input[name="pw"]');
        //Password Reset
        this.forgotPasswordLink = this.page.getByRole('link').filter({ hasText: /(forgot)*(password)/ });
        this.resetPwButton = this.page.getByRole('button', {name: /reset/ });
        this.newPasswordInput = this.page.locator('input[name="pw"]');
        this.changePasswordButton = this.page.getByRole('button', { name: 'Change' });
        //Create Account Locators
        this.createAccButton = page.getByRole('button', { name: 'create account' });
        this.createAccSection = page.locator('form').filter({ has: this.createAccButton });
        this.createUserInput = this.createAccSection.locator('input[name="acct"]');
        this.createPwInput = this.createAccSection.locator('input[name="pw"]');
        //Account Page
        this.emailInput = page.locator('input[name="email"]');
        this.updateButton = page.getByRole('button', { name: 'update' });

    }
    async navLogin() {
        await this.loginLink.click();
        await this.page.waitForLoadState('domcontentloaded');                  
    }
    async navAccount() {
        await this.accountLink.click();
        await this.page.waitForLoadState('domcontentloaded');
    }
    async loginUser(user: string, pw: string) {
        //Go to login page
        await this.navLogin();
        //Enter username and password
        await this.userInput.fill(user);
        await this.pwInput.fill(pw);
        //Click Login
        await this.loginButton.click();
        await this.page.waitForLoadState('domcontentloaded');
        await this.reCaptchaCheck(this.loginButton);
    }
    async logoutUser() {
        await this.logoutButton.click();
        await this.page.waitForLoadState('domcontentloaded');
    }
    async forgotPassword() {
        //Click forgot Password
        await this.forgotPasswordLink.click();
        await this.page.waitForLoadState('domcontentloaded');
        //Send Reset email
        await this.resetPwButton.click();
        await this.page.waitForLoadState('domcontentloaded');
        await this.reCaptchaCheck(this.resetPwButton);
    }
    async enterNewPassword(newPassword) {
        //Enter Password and click change
        await this.newPasswordInput.fill(newPassword);
        await this.changePasswordButton.click();
        await this.page.waitForLoadState('domcontentloaded')
    }
    async createNewAcc(newUser: string,newPw: string,newEmail: string='') {
        //Go to login page
        await this.navLogin();
        //Enter username and password
        await this.createUserInput.fill(newUser);
        await this.createPwInput.fill(newPw);
        //Click Create Account
        await this.createAccButton.click();
        await this.page.waitForLoadState('domcontentloaded');
        
        //Check for reCaptcha
        await this.reCaptchaCheck(this.createAccButton)

        //Add email to account if input
        if (newEmail) {
            await this.addEmailToAccount(newEmail);
        }
    }
    async addEmailToAccount(newEmail) {
        //Open Account page
        await this.navAccount();
        //Enter email
        await this.emailInput.fill(newEmail);
        await this.updateButton.click();
        await this.reCaptchaCheck(this.updateButton);
    }
    async reCaptchaCheck(previousClick) {
        //Checks for reCaptcha and pauses for manual solving
        const reCaptchaVisiable = await this.page.locator('.g-recaptcha').isVisible()
        if (reCaptchaVisiable) {
            console.log('Please solve reCaptcha manually')
            await this.page.waitForTimeout(30000) //set number of ms to solve
            if (await previousClick.isVisible()) {
                await previousClick.click();
                await this.page.waitForLoadState('domcontentloaded')
            }
            return true
        } else {
            return false
        }
    }
    //Mailslurp
    async createNewEmail() {
        const myApiKey = 'e506d06cbd278e2752399dae732914d3e1589a86c5ba06fb3ad27b9c6e202a77';
        const mailslurp = new MailSlurp( { apiKey: myApiKey });
        return await mailslurp.inboxController.createInboxWithDefaults();
    }

}