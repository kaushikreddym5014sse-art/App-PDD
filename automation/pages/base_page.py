import os
import time
import logging
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By

class BasePage:
    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(driver, 10)
        self.logger = logging.getLogger(self.__class__.__name__)

    def open(self, url):
        self.driver.get(url)

    def find(self, by, locator, timeout=10):
        return WebDriverWait(self.driver, timeout).until(
            EC.presence_of_element_located((by, locator))
        )

    def find_visible(self, by, locator, timeout=10):
        return WebDriverWait(self.driver, timeout).until(
            EC.visibility_of_element_located((by, locator))
        )

    def click(self, by, locator):
        element = self.find_visible(by, locator)
        element.click()

    def type(self, by, locator, text):
        element = self.find_visible(by, locator)
        element.clear()
        element.send_keys(text)

    def get_text(self, by, locator):
        element = self.find_visible(by, locator)
        return element.text

    def is_displayed(self, by, locator, timeout=5):
        try:
            return self.find_visible(by, locator, timeout=timeout).is_displayed()
        except Exception:
            return False

    def take_screenshot(self, name):
        screenshot_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "screenshots"))
        os.makedirs(screenshot_dir, exist_ok=True)
        filename = os.path.join(screenshot_dir, f"{name}_{int(time.time())}.png")
        self.driver.save_screenshot(filename)
        return filename

    def get_browser_logs(self):
        try:
            return self.driver.get_log("browser")
        except Exception:
            return []
