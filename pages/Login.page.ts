import { expect, Locator, Page } from "@playwright/test";

export class LoginPage {
    private loginForm: Locator;
    private usernameInput: Locator;
    private passwordInput: Locator;
    private logInButton: Locator;


    constructor(page: Page) {
        this.loginForm = page.locator('div.login-card');
        this.usernameInput = page.getByRole('textbox', { name: 'User name' })
        this.passwordInput = page.locator('#user_password')
        this.logInButton = page.getByRole('button', { name: 'Log in' })
    }

    async logIn(username: string, password: string) {
        await this.usernameInput.fill(username);
        await this.passwordInput.fill(password);
        await this.logInButton.click();
        await expect(this.loginForm).toBeHidden({ timeout: 30_000 });
    }
}