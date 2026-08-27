from selenium.webdriver.common.by import By
from automation.pages.base_page import BasePage
from automation.config.config import Config

class DashboardPage(BasePage):
    WELCOME_HEADER = (By.XPATH, "//*[contains(text(), 'Welcome back')]")
    TOTAL_CREDENTIALS_STAT = (By.XPATH, "//*[contains(text(), 'Total Credentials')]")
    SEARCH_INPUT = (By.XPATH, "//input[@placeholder='Filter by degree, institution, or hash...']")
    PORTFOLIO_CARDS = (By.XPATH, "//div[contains(@class, 'p-4 rounded-2xl border')]")
    REFRESH_BTN = (By.XPATH, "//button[@title='Refresh Dashboard']")
    SIGN_OUT_BTN = (By.XPATH, "//button[@title='Sign Out']")

    def open_dashboard(self):
        url = Config.BASE_URL.rstrip('/') + "/dashboard/"
        self.open(url)

    def filter_credentials(self, text):
        self.type(*self.SEARCH_INPUT, text)

    def refresh(self):
        self.click(*self.REFRESH_BTN)
