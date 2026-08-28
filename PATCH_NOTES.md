# AsoLand Mini App — Stability Patch

## Fixed
- Unified Telegram Mini App `initData` handling on the frontend and backend.
- Added `X-Telegram-Init-Data` transport while retaining query/body compatibility.
- Improved Telegram signature validation diagnostics and token normalization.
- Removed unsafe dependence on stale local account cache for authentication and rewards.
- Prevented cached points from being displayed for a different Telegram account.
- Made daily reward updates transactional to prevent double-claim races.
- Reset the daily streak after a missed day instead of incrementing indefinitely.
- Secured alerts/reminders so the server derives the user identity from signed Telegram data instead of trusting a client-provided identifier.
- Strengthened weather HTTP handling with retries, normalization of city names, and better provider-error handling.
- Added non-secret health diagnostics for Telegram environment configuration.
- Automatically enforces the Telegram bot chat menu button as a real Web App on service startup when `BOT_TOKEN` and `MINI_APP_URL` are configured.
- Bumped asset cache versions in `index.html`.

## Validation
- `python -m py_compile server.py asoland_bot.py` ✅
- `node --check app.js` ✅
- Telegram `initData` validation smoke test (valid/invalid/missing cases) ✅

## Deployment requirements
Set these Render environment variables at minimum:
- `BOT_TOKEN`
- `MINI_APP_URL`

Keep `MINI_APP_URL` pointed to the deployed HTTPS URL of this Mini App. The bot menu will be synchronized automatically at application startup.

## v5.6 — Weather fallback
- Added a browser-side Open-Meteo fallback for the weather panel.
- The Mini App now retries server weather first, then resolves the city and forecast directly from Open-Meteo when the server-side provider is unavailable.
- Added common Persian/Kurdish city aliases to the browser fallback.
- Weather button is disabled while a request is active to prevent duplicate calls.
- Empty city input is handled before any network request.
- Cache-busting query updated from app.js?v=47 to app.js?v=48.
- Server health version updated to 5.6-weather-fallback.

Validation performed:
- Python syntax: server.py, asoland_bot.py, set_menu_button.py
- JavaScript syntax: app.js
- Server-side direct DNS/network access to external weather providers is unavailable in this build environment, so external live requests could not be integration-tested here.
