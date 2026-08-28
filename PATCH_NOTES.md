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
