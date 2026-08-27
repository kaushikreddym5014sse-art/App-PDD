from selenium.webdriver.common.by import By
from automation.pages.base_page import BasePage
from automation.config.config import Config

class LoginPage(BasePage):
    EMAIL_INPUT = (By.XPATH, "//input[@type='email']")
    PASSWORD_INPUT = (By.XPATH, "//input[@type='password']")
    SIGN_IN_BTN = (By.XPATH, "//button[contains(., 'Sign In & Unlock') or contains(., 'Sign In')]")
    DEMO_LOGIN_BTN = (By.XPATH, "//button[contains(., 'One-Click Demo')]")
    CREATE_ACCOUNT_TAB = (By.XPATH, "//button[contains(., 'Create Account')]")
    FULL_NAME_INPUT = (By.XPATH, "//input[@placeholder='e.g. Alex Rivera']")
    INSTITUTION_INPUT = (By.XPATH, "//input[@placeholder='e.g. BlockCertify University']")
    REGISTER_BTN = (By.XPATH, "//button[contains(., 'Create Account & Unlock')]")
    SUCCESS_ALERT = (By.XPATH, "//*[contains(text(), 'Authentication successful') or contains(text(), 'Account created')]")
    ERROR_ALERT = (By.XPATH, "//*[contains(text(), 'Failed') or contains(text(), 'Please fill')]")

    def open_login(self):
        url = Config.BASE_URL.rstrip('/') + "/login/"
        self.open(url)

    def demo_login(self):
        self.open_login()
        if self.is_displayed(*self.DEMO_LOGIN_BTN):
            self.click(*self.DEMO_LOGIN_BTN)
        else:
            self.login("institution@blockcertify.io", "demo123")

    def login(self, email, password):
        self.open_login()
        self.type(*self.EMAIL_INPUT, email)
        self.type(*self.PASSWORD_INPUT, password)
        self.click(*self.SIGN_IN_BTN)

    def register(self, full_name, email, password, institution="BlockCertify Academy"):
        self.open_login()
        self.click(*self.CREATE_ACCOUNT_TAB)
        self.type(*self.FULL_NAME_INPUT, full_name)
        self.type(*self.EMAIL_INPUT, email)
        self.type(*self.PASSWORD_INPUT, password)
        if self.is_displayed(*self.INSTITUTION_INPUT):
            self.type(*self.INSTITUTION_INPUT, institution)
        self.click(*self.REGISTER_BTN)
