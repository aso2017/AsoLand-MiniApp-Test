import os
import requests

BOT_TOKEN = os.environ.get("BOT_TOKEN", "YOUR_TELEGRAM_BOT_TOKEN")
WEBAPP_URL = os.environ.get("WEBAPP_URL", "https://your-domain.com")

url = f"https://api.telegram.org/bot{BOT_TOKEN}/setChatMenuButton"
payload = {
    "menu_button": {
        "type": "web_app",
        "text": "AsoLand 🚀",
        "web_app": {"url": WEBAPP_URL}
    }
}

response = requests.post(url, json=payload)
print(response.json())