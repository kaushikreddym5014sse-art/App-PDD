from selenium.webdriver.common.by import By
from automation.pages.base_page import BasePage
from automation.config.config import Config

class VerifyPage(BasePage):
    SEARCH_INPUT = (By.XPATH, "//input[@placeholder='Enter SHA-256 Certificate Hash (e.g. 0x7f8a9b2c...)']")
    VERIFY_BTN = (By.XPATH, "//button[contains(., 'Verify')]")
    DEMO_SEARCH_BTN = (By.XPATH, "//button[contains(., 'Demo Search')]")
    CERTIFICATE_CARD = (By.XPATH, "//div[contains(@class, 'glass-panel-neon')]")
    NOT_FOUND_BANNER = (By.XPATH, "//*[contains(text(), 'Certificate Not Found')]")

    def open_verify(self):
        url = Config.BASE_URL.rstrip('/') + "/verify/"
        self.open(url)

    def verify_hash(self, hash_str):
        self.open_verify()
        self.type(*self.SEARCH_INPUT, hash_str)
        self.click(*self.VERIFY_BTN)
