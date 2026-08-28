import os
import httpx

TOKEN = os.getenv('BOT_TOKEN', '')
APP_URL = os.getenv('MINI_APP_URL', '').rstrip('/')
TEXT = os.getenv('MINI_APP_MENU_TEXT', 'AsoLand 🚀')

if not TOKEN or not APP_URL:
    raise SystemExit('BOT_TOKEN و MINI_APP_URL را تنظیم کنید.')

url = f'https://api.telegram.org/bot{TOKEN}/setChatMenuButton'
payload = {'menu_button': {'type': 'web_app', 'text': TEXT, 'web_app': {'url': APP_URL}}}

r = httpx.post(url, json=payload, timeout=20)
r.raise_for_status()
print(r.json())
