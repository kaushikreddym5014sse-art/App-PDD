from selenium.webdriver.common.by import By
from automation.pages.base_page import BasePage
from automation.config.config import Config

class IssuerPage(BasePage):
    ISSUE_SINGLE_TAB = (By.XPATH, "//button[contains(., 'Issue Single')]")
    BATCH_UPLOAD_TAB = (By.XPATH, "//button[contains(., 'Batch Upload')]")
    HISTORY_TAB = (By.XPATH, "//button[contains(., 'Issuance History')]")

    HOLDER_NAME_INPUT = (By.XPATH, "//input[@name='holder_name']")
    DEGREE_INPUT = (By.XPATH, "//input[@name='degree']")
    INSTITUTION_INPUT = (By.XPATH, "//input[@name='institution']")
    ISSUE_DATE_INPUT = (By.XPATH, "//input[@name='issue_date']")
    GRADE_INPUT = (By.XPATH, "//input[@name='grade']")
    REG_NUMBER_INPUT = (By.XPATH, "//input[@name='reg_number']")
    SUBMIT_ISSUE_BTN = (By.XPATH, "//button[contains(., 'Issue Certificate to Backend')]")

    DOWNLOAD_TEMPLATE_BTN = (By.XPATH, "//button[contains(., 'Download Sample CSV Template')]")
    CSV_FILE_INPUT = (By.XPATH, "//input[@type='file']")
    PROCESS_BATCH_BTN = (By.XPATH, "//button[contains(., 'Process & Issue All')]")

    SUCCESS_BANNER = (By.XPATH, "//*[contains(text(), 'Certificate Issued!') or contains(text(), 'Successfully issued')]")

    def open_issuer(self):
        url = Config.BASE_URL.rstrip('/') + "/issuer/"
        self.open(url)

    def issue_certificate(self, holder_name, degree, institution, issue_date="2026-05-15", grade="A+", reg_number="BC-REG-99001"):
        self.open_issuer()
        self.type(*self.HOLDER_NAME_INPUT, holder_name)
        self.type(*self.DEGREE_INPUT, degree)
        self.type(*self.INSTITUTION_INPUT, institution)
        if self.is_displayed(*self.GRADE_INPUT):
            self.type(*self.GRADE_INPUT, grade)
        if self.is_displayed(*self.REG_NUMBER_INPUT):
            self.type(*self.REG_NUMBER_INPUT, reg_number)
        self.click(*self.SUBMIT_ISSUE_BTN)
