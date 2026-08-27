from selenium.webdriver.common.by import By
from automation.pages.base_page import BasePage
from automation.config.config import Config

class ProfilePage(BasePage):
    FULL_NAME_INPUT = (By.XPATH, "//input[@type='text' and @value]")
    SAVE_CHANGES_BTN = (By.XPATH, "//button[contains(., 'Save Profile Changes')]")
    SUCCESS_ALERT = (By.XPATH, "//*[contains(text(), 'Profile details saved')]")
    SIGN_OUT_BTN = (By.XPATH, "//button[contains(., 'Sign Out')]")

    def open_profile(self):
        url = Config.BASE_URL.rstrip('/') + "/profile/"
        self.open(url)

    def update_profile(self, name):
        self.open_profile()
        self.type(*self.FULL_NAME_INPUT, name)
        self.click(*self.SAVE_CHANGES_BTN)
