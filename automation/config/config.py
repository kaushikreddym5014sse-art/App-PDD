import os

class Config:
    BASE_URL = os.getenv("BASE_URL", "https://kaushikreddym5014sse-art.github.io/App-PDD/")
    HEADLESS = os.getenv("HEADLESS", "true").lower() == "true"
    DEFAULT_TIMEOUT = int(os.getenv("DEFAULT_TIMEOUT", "15"))
    EXPLICIT_WAIT = int(os.getenv("EXPLICIT_WAIT", "10"))
    
    # Reports & Evidence Directory Paths
    BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    REPORTS_DIR = os.path.join(BASE_DIR, "reports")
    SCREENSHOTS_DIR = os.path.join(BASE_DIR, "screenshots")
    LOGS_DIR = os.path.join(BASE_DIR, "logs")

    @classmethod
    def ensure_dirs(cls):
        os.makedirs(cls.REPORTS_DIR, exist_ok=True)
        os.makedirs(cls.SCREENSHOTS_DIR, exist_ok=True)
        os.makedirs(cls.LOGS_DIR, exist_ok=True)

Config.ensure_dirs()
