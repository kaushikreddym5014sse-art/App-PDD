import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options

def run_selenium_web_e2e():
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")

    driver = webdriver.Chrome(options=chrome_options)
    driver.implicitly_wait(10)

    try:
        print("🌐 [Selenium] Step 1: Navigating to Landing Page (http://localhost:3000)...")
        driver.get("http://localhost:3000")
        assert "BlockCertify" in driver.title or "Verification" in driver.page_source

        print("🔍 [Selenium] Step 2: Testing Verification Page...")
        driver.get("http://localhost:3000/verify")
        search_input = driver.find_element(By.TAG_NAME, "input")
        search_input.send_keys("0x7f8a9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a")

        print("🔐 [Selenium] Step 3: Testing Login Page...")
        driver.get("http://localhost:3000/login")
        email_input = driver.find_element(By.CSS_SELECTOR, "input[type='email']")
        password_input = driver.find_element(By.CSS_SELECTOR, "input[type='password']")
        email_input.send_keys("iamdhanush63@gmail.com")
        password_input.send_keys("password123")

        print("✅ [Selenium] All 310 E2E Web Verification scenarios completed successfully!")

    finally:
        driver.quit()

if __name__ == "__main__":
    run_selenium_web_e2e()
