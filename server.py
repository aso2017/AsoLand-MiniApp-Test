import os, sys, hashlib, hmac, time, base64, secrets, asyncio, shutil, sqlite3, json
from urllib.parse import parse_qsl
from pathlib import Path
from fastapi import FastAPI, HTTPException, UploadFile, File, Query, Form
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from telegram import Bot as TelegramBot
from pydantic import BaseModel

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(Path(__file__).resolve().parent))
import asoland_bot as bot

app = FastAPI(title="AsoLand Telegram Mini App API")
UPLOAD_ROOT = ROOT / "uploads"
UPLOAD_ROOT.mkdir(exist_ok=True)
MAX_UPLOAD = 25 * 1024 * 1024
file_sessions = {}
image_sessions = {}
MEDIA_ROOT = ROOT / "media_jobs"
MEDIA_ROOT.mkdir(exist_ok=True)
user_alerts = {}
user_reminders = {}
download_semaphore = asyncio.Semaphore(1)

DB_PATH = Path(os.getenv("ASOLAND_DB_PATH", str(ROOT / "asoland_users.db"))).expanduser()
DB_PATH.parent.mkdir(parents=True, exist_ok=True)
def db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("""CREATE TABLE IF NOT EXISTS users (
        user_id TEXT PRIMARY KEY,
        first_name TEXT DEFAULT '',
        username TEXT DEFAULT '',
        coins INTEGER DEFAULT 0,
        xp INTEGER DEFAULT 0,
        streak INTEGER DEFAULT 0,
        last_reward TEXT DEFAULT '',
        is_pro INTEGER DEFAULT 0,
        referral_code TEXT UNIQUE,
        created_at REAL,
        updated_at REAL
    )""")
    conn.commit()
    return conn

def telegram_user(init_data: str):
    if not init_data or not validate_init_data(init_data):
        return None
    data = dict(parse_qsl(init_data, keep_blank_values=True))
    try:
        return json.loads(data.get("user", "{}"))
    except Exception:
        return None

def ensure_user(init_data: str):
    user = telegram_user(init_data)
    if not user or not user.get("id"):
        return None
    uid = str(user["id"]); now = time.time()
    conn = db()
    row = conn.execute("SELECT * FROM users WHERE user_id=?", (uid,)).fetchone()
    if not row:
        code = hashlib.sha256(("asoland:"+uid).encode()).hexdigest()[:10]
        conn.execute("INSERT INTO users(user_id,first_name,username,referral_code,created_at,updated_at) VALUES(?,?,?,?,?,?)",
                     (uid,user.get("first_name",""),user.get("username",""),code,now,now))
    else:
        conn.execute("UPDATE users SET first_name=?, username=?, updated_at=? WHERE user_id=?",
                     (user.get("first_name",""),user.get("username",""),now,uid))
    conn.commit()
    row=conn.execute("SELECT * FROM users WHERE user_id=?", (uid,)).fetchone()
    conn.close()
    return dict(row)


class ChatIn(BaseModel):
    text: str
    language: str = "fa"
    initData: str = ""

class FileActionIn(BaseModel):
    file_id: str
    action: str
    user_input: str = ""
    language: str = "fa"

class TeacherIn(BaseModel):
    text: str
    level: str = "intermediate"
    mode: str = "conversation"
    language: str = "fa"

class WeatherIn(BaseModel):
    city: str
    language: str = "fa"

class TextIn(BaseModel):
    text: str
    language: str = "fa"

class NewsIn(BaseModel):
    category: str = "general"
    language: str = "fa"


class AccountIn(BaseModel):
    initData: str = ""
    language: str = "fa"

def validate_init_data(init_data: str) -> bool:
    token = os.getenv("BOT_TOKEN", "")
    if not token or not init_data:
        return False
    data = dict(parse_qsl(init_data, keep_blank_values=True))
    received = data.pop("hash", None)
    if not received:
        return False
    check = "\n".join(f"{k}={data[k]}" for k in sorted(data))
    secret = hmac.new(b"WebAppData", token.encode(), hashlib.sha256).digest()
    calc = hmac.new(secret, check.encode(), hashlib.sha256).hexdigest()
    try:
        auth_date = int(data.get("auth_date", "0") or 0)
    except ValueError:
        return False
    return hmac.compare_digest(calc, received) and time.time() - auth_date < 86400


def safe_image_ext(name: str) -> str:
    ext = Path(name or "image.jpg").suffix.lower()
    return ext if ext in {".jpg", ".jpeg", ".png", ".webp"} else ".jpg"


async def cleanup_sessions():
    now = time.time()
    for sid, session in list(file_sessions.items()):
        if now - session.get("created", now) > 3600:
            file_sessions.pop(sid, None)
            Path(session.get("path", "")).unlink(missing_ok=True)




@app.get("/api/account")
async def account(initData: str = ""):
    u=ensure_user(initData)
    if not u:
        return {"authenticated":False,"coins":0,"xp":0,"level":1,"streak":0,"claimed":False,"isPro":False,"referralCode":""}
    level=max(1,int(u["xp"])//100+1)
    return {"authenticated":True,"userId":u["user_id"],"firstName":u["first_name"],"username":u["username"],
            "coins":int(u["coins"]),"xp":int(u["xp"]),"level":level,"streak":int(u["streak"]),
            "claimed":u["last_reward"]==time.strftime("%Y-%m-%d"),"isPro":bool(u["is_pro"]),
            "referralCode":u["referral_code"]}

@app.post("/api/rewards/daily")
async def daily_reward(payload: AccountIn):
    u=ensure_user(payload.initData)
    if not u: raise HTTPException(401,"برای دریافت جایزه، Mini App را از داخل Telegram باز کن")
    today=time.strftime("%Y-%m-%d")
    conn=db(); row=conn.execute("SELECT * FROM users WHERE user_id=?", (u["user_id"],)).fetchone()
    if row["last_reward"]==today:
        conn.close()
        return {"claimed":False,"reward":0,"coins":row["coins"],"xp":row["xp"],"level":row["xp"]//100+1,"streak":row["streak"],"isPro":bool(row["is_pro"])}
    reward=20; streak=int(row["streak"])+1; coins=int(row["coins"])+reward; xp=int(row["xp"])+25
    conn.execute("UPDATE users SET coins=?,xp=?,streak=?,last_reward=?,updated_at=? WHERE user_id=?",
                 (coins,xp,streak,today,time.time(),u["user_id"]))
    conn.commit(); conn.close()
    return {"claimed":True,"reward":reward,"coins":coins,"xp":xp,"level":xp//100+1,"streak":streak,"isPro":bool(row["is_pro"])}

@app.get("/api/health")
async def health():
    try:
        import yt_dlp
        ytdlp_version = getattr(yt_dlp, "version", None)
        ytdlp_version = getattr(ytdlp_version, "__version__", str(ytdlp_version or "unknown"))
    except Exception:
        ytdlp_version = "unavailable"
    try:
        import gallery_dl
        gallery_dl_version = getattr(gallery_dl, "__version__", "installed")
    except Exception:
        gallery_dl_version = "unavailable"
    deno = shutil.which("deno")
    # Cookie configuration is platform-specific.  Keep the legacy aggregate
    # field for compatibility, but report each platform separately so the
    # health endpoint does not incorrectly show Instagram as anonymous.
    def _cookie_has_session(env_b64: str, env_text: str, key: str) -> dict:
        """Report whether cookie env is set and whether a key name appears after decode (no secret leak)."""
        raw_b64 = os.getenv(env_b64, "") or ""
        raw_txt = os.getenv(env_text, "") or ""
        present = bool(raw_b64.strip() or raw_txt.strip())
        has_key = False
        if present:
            try:
                import base64 as _b64
                blob = raw_txt if raw_txt.strip() else _b64.b64decode("".join(raw_b64.split()), validate=False).decode("utf-8", "replace")
                has_key = key in blob
            except Exception:
                has_key = False
        return {"configured": present, f"has_{key}": has_key}

    ig = _cookie_has_session("INSTAGRAM_COOKIES_B64", "INSTAGRAM_COOKIES_TEXT", "sessionid")
    yt = _cookie_has_session("YOUTUBE_COOKIES_B64", "YOUTUBE_COOKIES_TEXT", "SID")
    cookie_flags = {
        "instagram": ig["configured"],
        "instagram_has_sessionid": ig.get("has_sessionid", False),
        "youtube": yt["configured"],
        "youtube_has_SID": yt.get("has_SID", False),
        "tiktok": bool(os.getenv("TIKTOK_COOKIES_B64") or os.getenv("TIKTOK_COOKIES_TEXT")),
        "facebook": bool(os.getenv("FACEBOOK_COOKIES_B64") or os.getenv("FACEBOOK_COOKIES_TEXT")),
        "twitter": bool(os.getenv("TWITTER_COOKIES_B64") or os.getenv("TWITTER_COOKIES_TEXT")),
        "reddit": bool(os.getenv("REDDIT_COOKIES_B64") or os.getenv("REDDIT_COOKIES_TEXT")),
        "aparat": bool(os.getenv("APARAT_COOKIES_B64") or os.getenv("APARAT_COOKIES_TEXT")),
        "generic": bool(os.getenv("YT_DLP_COOKIES_B64") or os.getenv("YT_DLP_COOKIES_TEXT") or os.getenv("YT_DLP_COOKIES")),
    }
    return {
        "ok": True,
        "service": "AsoLand Mini App",
        "version": "5.4-multi-backend",
        "downloader": {
            "yt_dlp": ytdlp_version,
            "gallery_dl": gallery_dl_version,
            "backends": ["yt-dlp", "gallery-dl"],
            "fallback_platforms": ["Instagram", "Twitter / X", "Reddit", "TikTok", "Facebook"],
            "deno": bool(deno),
            "cookie_configured": any(cookie_flags.values()),
            "cookie_configured_platforms": cookie_flags,
            "proxy_configured": bool(os.getenv("DOWNLOAD_PROXY")),
            "impersonation_configured": bool(os.getenv("YT_DLP_IMPERSONATE_TARGET")),
            "youtube_po_token_configured": bool(os.getenv("YT_DLP_YOUTUBE_PO_TOKEN")),
            "youtube_player_client": os.getenv("YT_DLP_YOUTUBE_PLAYER_CLIENT", "android,ios,mweb,web"),
            "hint": "Primary=yt-dlp, fallback=gallery-dl for IG/Twitter/Reddit. Cookies still recommended on Render free tier.",
        },
        "features": ["ai","voice","translate","summarize","download","music","lyrics","sticker","qr","subtitle","files","vision","teacher","weather","prices","fortune","calculator","currency","calendar","news","student","config","alerts","reminders"]
    }


@app.get("/api/me")
async def me(initData: str = ""):
    if initData and validate_init_data(initData):
        data = dict(parse_qsl(initData, keep_blank_values=True))
        import json
        user = json.loads(data.get("user", "{}"))
        return {"authenticated": True, "user": {"id": user.get("id"), "first_name": user.get("first_name", ""), "username": user.get("username", "")}}
    return {"authenticated": False, "user": None}


@app.post("/api/ai/chat")
async def ai_chat(payload: ChatIn):
    if not payload.text.strip():
        raise HTTPException(400, "متن خالی است")
    lang = payload.language if payload.language in {"fa", "ckb", "en"} else "fa"
    if lang == "ckb":
        system = (
            "You are AsoLand AI. Respond ONLY in natural Kurdish Sorani (Central Kurdish). "
            "Use Kurdish Sorani grammar and vocabulary. Do not answer in Persian unless the user explicitly asks for Persian. "
            "Be accurate, natural and helpful."
        )
    elif lang == "en":
        system = "You are AsoLand AI. Respond ONLY in natural English. Be accurate, natural and helpful."
    else:
        system = "You are AsoLand AI. Respond ONLY in standard Persian used in Iran. Be accurate, natural and helpful."
    try:
        result = await bot.groq_chat([
            {"role": "system", "content": system},
            {"role": "user", "content": payload.text},
        ], temperature=.35, max_tokens=1800)
        # Current bot.groq_chat returns (reply, error). Normalize both
        # tuple-style and plain-string results so Mini App chat works.
        if isinstance(result, tuple):
            reply, error = (result + (None, None))[:2]
            if error:
                raise RuntimeError(str(error))
            result = reply
        if not result or not str(result).strip():
            raise RuntimeError("پاسخ خالی از سرویس هوش مصنوعی")
        return {"reply": str(result).strip()}
    except Exception as e:
        raise HTTPException(502, str(e)[:300])


@app.get("/api/fortune")
async def fortune(name: str = "دوست من", language: str = "fa"):
    try:
        result = await bot.get_daily_fortune(name or "دوست من")
        result = await localize_output(result, language)
        return {"text": result, "language": language}
    except Exception as e:
        raise HTTPException(502, str(e)[:300])

@app.post("/api/calculator")
async def calculator(payload: TextIn):
    try:
        return {"text": bot.calculate_advanced(payload.text.strip()), "language": payload.language}
    except Exception as e:
        raise HTTPException(400, str(e)[:300])

@app.post("/api/currency")
async def currency(payload: TextIn):
    try:
        result = await bot.convert_currency(payload.text.strip())
        result = await localize_output(result, payload.language)
        return {"text": result, "language": payload.language}
    except Exception as e:
        raise HTTPException(502, str(e)[:300])

@app.get("/api/calendar")
async def calendar(language: str = "fa"):
    result = await localize_output(bot.get_today_calendar(), language)
    return {"text": result, "language": language}

@app.post("/api/news")
async def news(payload: NewsIn):
    allowed = {"general", "tech", "economy", "crypto", "student"}
    category = payload.category if payload.category in allowed else "general"
    try:
        result = await bot.news_text(category)
        result = await localize_output(result, payload.language)
        return {"text": result, "language": payload.language}
    except Exception as e:
        raise HTTPException(502, str(e)[:300])

@app.post("/api/student")
async def student(payload: TextIn):
    try:
        result = await bot.solve_student_problem(payload.text.strip())
        result = await localize_output(result, payload.language)
        return {"text": result, "language": payload.language}
    except Exception as e:
        raise HTTPException(502, str(e)[:300])

@app.get("/api/prices")
async def prices(language: str = "fa"):
    try:
        lang = language if language in ("fa", "ckb", "en") else "fa"
        return {"text": await bot.get_do_l4_prices(lang), "language": lang}
    except Exception as e:
        raise HTTPException(502, str(e)[:300])


# Open-Meteo's geocoding index is built from GeoNames and mostly matches the
# *indexed* spelling of a place (usually English/romanized) via prefix matching.
# Re-querying with a different `language` value only changes which localized
# name comes back — it does NOT translate the search term itself. So a Persian
# or Kurdish city name that has no Farsi/Sorani alternate name indexed simply
# never matches, even though the fallback below always ran. We fix this by:
#  1) trying the raw query as typed,
#  2) trying a curated FA/CKB -> EN translation for common cities so the
#     Latin-indexed name is what actually gets searched,
#  3) falling back to OpenStreetMap/Nominatim, which indexes Persian and
#     Kurdish names far more completely than GeoNames does.
_CITY_ALIASES = {
    "تهران": "Tehran", "مشهد": "Mashhad", "اصفهان": "Isfahan", "اصفهان‌": "Isfahan",
    "کرج": "Karaj", "شیراز": "Shiraz", "تبریز": "Tabriz", "قم": "Qom", "اهواز": "Ahvaz",
    "کرمانشاه": "Kermanshah", "ارومیه": "Urmia", "رشت": "Rasht", "زاهدان": "Zahedan",
    "همدان": "Hamadan", "کرمان": "Kerman", "یزد": "Yazd", "اردبیل": "Ardabil",
    "بندرعباس": "Bandar Abbas", "اراک": "Arak", "قزوین": "Qazvin", "زنجان": "Zanjan",
    "سنندج": "Sanandaj", "خرم‌آباد": "Khorramabad", "خرم آباد": "Khorramabad",
    "گرگان": "Gorgan", "ساری": "Sari", "بوشهر": "Bushehr", "بجنورد": "Bojnord",
    "ایلام": "Ilam", "یاسوج": "Yasuj", "شهرکرد": "Shahrekord", "سمنان": "Semnan",
    "بیرجند": "Birjand", "پیرانشهر": "Piranshahr", "مهاباد": "Mahabad", "بانه": "Baneh",
    "سقز": "Saqqez", "مریوان": "Marivan", "بوکان": "Bukan", "نقده": "Naghadeh",
    "هه‌ولێر": "Erbil", "هەولێر": "Erbil", "اربیل": "Erbil", "سلێمانی": "Sulaymaniyah",
    "سلیمانیه": "Sulaymaniyah", "دهۆک": "Duhok", "دهوک": "Duhok", "کەرکووک": "Kirkuk",
    "کرکوک": "Kirkuk", "بغداد": "Baghdad", "بەغدا": "Baghdad", "نجف": "Najaf",
    "کربلا": "Karbala", "بصره": "Basra",
}

async def _geocode_city(client, city: str, language: str):
    async def _search(name: str, lang: str):
        r = await client.get(
            "https://geocoding-api.open-meteo.com/v1/search",
            params={"name": name, "count": 5, "language": lang, "format": "json"},
        )
        r.raise_for_status()
        return (r.json() or {}).get("results") or []

    lang_param = {"fa": "fa", "ckb": "en", "en": "en"}.get(language, "fa")

    # 1) exact term as typed
    results = await _search(city, lang_param)
    # 2) same term, English display language (helps some partial matches)
    if not results:
        results = await _search(city, "en")
    # 3) curated FA/CKB -> EN alias for common regional cities
    alias = _CITY_ALIASES.get(city) or _CITY_ALIASES.get(city.replace("‌", " ").strip())
    if not results and alias:
        results = await _search(alias, "en")
    if results:
        return results[0], None

    # 4) Nominatim (OpenStreetMap) as a last resort — its index has far
    # better coverage of Persian/Kurdish place names than GeoNames does.
    try:
        r = await client.get(
            "https://nominatim.openstreetmap.org/search",
            params={"q": alias or city, "format": "jsonv2", "limit": 1, "accept-language": lang_param},
            headers={"User-Agent": "AsoLand-MiniApp/1.0"},
        )
        r.raise_for_status()
        items = r.json() or []
        if items:
            it = items[0]
            return {
                "name": (it.get("display_name") or city).split(",")[0].strip(),
                "latitude": float(it["lat"]), "longitude": float(it["lon"]),
                "country": (it.get("display_name") or "").split(",")[-1].strip(),
            }, None
    except Exception:
        pass
    return None, f"شهر «{city}» پیدا نشد"


@app.post("/api/weather")
async def weather(payload: WeatherIn):
    city = payload.city.strip()
    if len(city) < 2:
        raise HTTPException(400, "نام شهر را وارد کن")
    try:
        # Direct Open-Meteo call keeps Mini App weather independent from Bot handlers.
        async with bot.httpx.AsyncClient(timeout=15.0) as client:
            place, err = await _geocode_city(client, city, payload.language)
            if err:
                raise HTTPException(404, err)
            lat, lon = place["latitude"], place["longitude"]
            forecast = await client.get(
                "https://api.open-meteo.com/v1/forecast",
                params={
                    "latitude": lat, "longitude": lon,
                    "current": "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,cloud_cover",
                    "daily": "temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset",
                    "forecast_days": 3, "timezone": "auto", "wind_speed_unit": "kmh",
                },
            )
            forecast.raise_for_status()
            data = forecast.json() or {}
            cur, daily = data.get("current", {}), data.get("daily", {})
            codes_by_lang = {
                "fa": {0:"آسمان صاف",1:"عمدتاً صاف",2:"نیمه‌ابری",3:"ابری",45:"مه",48:"مه یخ‌زن",51:"نم‌نم باران سبک",53:"نم‌نم باران",55:"نم‌نم باران شدید",61:"باران سبک",63:"باران",65:"باران شدید",71:"برف سبک",73:"برف",75:"برف شدید",80:"رگبار سبک",81:"رگبار",82:"رگبار شدید",95:"رعدوبرق",96:"رعدوبرق با تگرگ",99:"رعدوبرق و تگرگ شدید"},
                "ckb": {0:"ئاسمانی ڕوون",1:"بە زۆری ڕوون",2:"نیوە هەور",3:"هەور",45:"تەم",48:"تەمی سارد",51:"بارانی سووک",53:"باران",55:"بارانی توند",61:"بارانی سووک",63:"باران",65:"بارانی توند",71:"بەفرێکی سووک",73:"بەفر",75:"بەفری توند",80:"بارانی پڕۆژەیی سووک",81:"بارانی پڕۆژەیی",82:"بارانی پڕۆژەیی توند",95:"گەڕماوی",96:"گەڕماوی لەگەڵ تۆفان",99:"گەڕماوی و تگرگ"},
                "en": {0:"Clear sky",1:"Mainly clear",2:"Partly cloudy",3:"Overcast",45:"Fog",48:"Freezing fog",51:"Light drizzle",53:"Drizzle",55:"Heavy drizzle",61:"Light rain",63:"Rain",65:"Heavy rain",71:"Light snow",73:"Snow",75:"Heavy snow",80:"Light showers",81:"Showers",82:"Heavy showers",95:"Thunderstorm",96:"Thunderstorm with hail",99:"Heavy thunderstorm with hail"}
            }
            codes = codes_by_lang.get(payload.language, codes_by_lang["fa"])
            def v(k, default="—"):
                x=cur.get(k); return default if x is None else x
            mx=(daily.get("temperature_2m_max") or [None])[0]
            mn=(daily.get("temperature_2m_min") or [None])[0]
            rp=(daily.get("precipitation_probability_max") or [None])[0]
            name=place.get("name") or city
            country=place.get("country") or ""
            Lw={"fa":("آب‌وهوای","دما","احساس واقعی","وضعیت","رطوبت","باد","پوشش ابر","بارش فعلی","احتمال بارش امروز","کمینه/بیشینه امروز","وضعیت نامشخص"),"ckb":("کەش و هەوای","پلەی گەرمی","هەستی گەرمی","دۆخ","شێداری","با","داپۆشینی هەور","بارینی ئێستا","ڕێژەی باران بۆ ئەمڕۆ","کەمترین/زۆرترین ئەمڕۆ","دۆخی نەزانراو"),"en":("Weather in","Temperature","Feels like","Condition","Humidity","Wind","Cloud cover","Current precipitation","Today rain probability","Today low/high","Unknown")}.get(payload.language,("Weather in","Temperature","Feels like","Condition","Humidity","Wind","Cloud cover","Current precipitation","Today rain probability","Today low/high","Unknown"))
            text=(f"🌤 <b>{Lw[0]} {name}</b>" + (f"، {country}" if country and payload.language!='en' else (f", {country}" if country else "")) + "\n\n"
                  f"🌡 {Lw[1]}: <b>{v('temperature_2m')}°C</b>\n"
                  f"🤗 {Lw[2]}: <b>{v('apparent_temperature')}°C</b>\n"
                  f"☁️ {Lw[3]}: <b>{codes.get(cur.get('weather_code'),Lw[10])}</b>\n"
                  f"💧 {Lw[4]}: <b>{v('relative_humidity_2m')}%</b>\n"
                  f"💨 {Lw[5]}: <b>{v('wind_speed_10m')} km/h</b>\n"
                  f"☁️ {Lw[6]}: <b>{v('cloud_cover')}%</b>\n"
                  f"🌧 {Lw[7]}: <b>{v('precipitation')} mm</b>\n"
                  f"☔ {Lw[8]}: <b>{rp if rp is not None else '—'}%</b>\n"
                  f"📈 {Lw[9]}: <b>{mn if mn is not None else '—'}° / {mx if mx is not None else '—'}°</b>\n\n"
                  "📡 منبع: Open-Meteo")
            return {"ok": True, "text": text, "city": name, "country": country}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(502, "اتصال به سرویس آب‌وهوا ناموفق بود. چند لحظه بعد دوباره تلاش کن.")


@app.post("/api/teacher")
async def teacher(payload: TeacherIn):
    if not payload.text.strip():
        raise HTTPException(400, "متن خالی است")
    level = payload.level if payload.level in {"beginner", "intermediate", "advanced"} else "intermediate"
    mode = payload.mode if payload.mode in {"conversation", "correct", "vocabulary", "grammar"} else "conversation"
    try:
        prompt = bot.get_english_teacher_prompt(level, mode)
        if payload.language == "ckb":
            prompt += "\nExplain your feedback and instructions in Kurdish Sorani."
        elif payload.language == "en":
            prompt += "\nExplain your feedback and instructions in English."
        else:
            prompt += "\nExplain your feedback and instructions in Persian."
        result = await bot.groq_chat([
            {"role": "system", "content": prompt},
            {"role": "user", "content": payload.text},
        ], temperature=.45, max_tokens=1600)
        if isinstance(result, tuple):
            reply, error = (result + (None, None))[:2]
            if error:
                raise RuntimeError(str(error))
            result = reply
        if not result:
            raise RuntimeError("پاسخ خالی از سرویس هوش مصنوعی")
        return {"reply": str(result).strip()}
    except Exception as e:
        raise HTTPException(502, str(e)[:300])


@app.post("/api/vision")
async def vision(file: UploadFile = File(...)):
    content_type = file.content_type or ""
    if not content_type.startswith("image/"):
        raise HTTPException(400, "فقط فایل تصویری مجاز است.")
    sid = secrets.token_urlsafe(18)
    ext = safe_image_ext(file.filename)
    target = UPLOAD_ROOT / f"vision_{sid}{ext}"
    size = 0
    try:
        with target.open("wb") as out:
            while True:
                chunk = await file.read(1024 * 1024)
                if not chunk: break
                size += len(chunk)
                if size > 10 * 1024 * 1024:
                    raise HTTPException(413, "حجم تصویر بیشتر از ۱۰ مگابایت است.")
                out.write(chunk)
        result = await bot.ocr_image(str(target))
        if not result:
            raise HTTPException(422, "از تصویر نتیجه‌ای دریافت نشد.")
        return {"result": result}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(502, str(e)[:300])
    finally:
        target.unlink(missing_ok=True)
        await file.close()



@app.post("/api/vision/solve")
async def vision_solve(file: UploadFile = File(...), language: str = "fa"):
    if not (file.content_type or "").startswith("image/"): raise HTTPException(400,"فقط تصویر مجاز است")
    sid=secrets.token_urlsafe(12); path=UPLOAD_ROOT/f"solve_{sid}{safe_image_ext(file.filename)}"
    try:
        with path.open('wb') as f:
            while True:
                c=await file.read(1024*1024)
                if not c: break
                f.write(c)
        result=await bot.solve_image_question(str(path), None)
        if language=="ckb":
            # Keep the solution in Sorani when requested.
            result=await bot.groq_chat([{"role":"system","content":"Translate the solution to natural Central Kurdish (Sorani). Keep formulas and steps unchanged."},{"role":"user","content":result}],temperature=.2,max_tokens=2200)
            if isinstance(result,tuple): result=result[0]
        elif language=="en":
            result=await bot.groq_chat([{"role":"system","content":"Translate the solution to English. Keep formulas and steps unchanged."},{"role":"user","content":result}],temperature=.2,max_tokens=2200)
            if isinstance(result,tuple): result=result[0]
        return {"result":str(result)}
    except Exception as e: raise HTTPException(502,str(e)[:300])
    finally: path.unlink(missing_ok=True); await file.close()

@app.get("/api/weather-chart")
async def weather_chart(city: str):
    path=await bot.get_weather_chart(city.strip())
    if not path or not Path(path).exists(): raise HTTPException(404,"نمودار هوا در دسترس نیست")
    sid=secrets.token_urlsafe(12); out=MEDIA_ROOT/f"weather_{sid}.png"; Path(path).replace(out); return {"url":f"/media/{out.name}"}

@app.post("/api/files/upload")
async def upload_file(file: UploadFile = File(...)):
    await cleanup_sessions()
    filename = file.filename or "file"
    ext = Path(filename).suffix.lower()
    if ext not in bot.SMART_FILE_EXTENSIONS:
        raise HTTPException(400, "فرمت فایل پشتیبانی نمی‌شود. فقط PDF، DOCX و TXT مجاز است.")
    sid = secrets.token_urlsafe(18)
    target = UPLOAD_ROOT / f"{sid}{ext}"
    size = 0
    try:
        with target.open("wb") as out:
            while True:
                chunk = await file.read(1024 * 1024)
                if not chunk: break
                size += len(chunk)
                if size > MAX_UPLOAD:
                    raise HTTPException(413, "حجم فایل بیشتر از ۲۵ مگابایت است.")
                out.write(chunk)
        text = await asyncio.to_thread(bot.extract_smart_file_text, str(target), ext)
        if not text:
            raise HTTPException(422, "از این فایل متن قابل خواندن پیدا نشد.")
        file_sessions[sid] = {"path": str(target), "name": filename, "text": text, "created": time.time()}
        return {"id": sid, "name": filename, "characters": len(text), "preview": text[:1000]}
    except HTTPException:
        target.unlink(missing_ok=True); raise
    except Exception as e:
        target.unlink(missing_ok=True)
        raise HTTPException(422, f"خطا در خواندن فایل: {str(e)[:300]}")
    finally:
        await file.close()


@app.post("/api/files/action")
async def file_action(payload: FileActionIn):
    await cleanup_sessions()
    session = file_sessions.get(payload.file_id)
    if not session:
        raise HTTPException(404, "فایل پیدا نشد یا منقضی شده است.")
    if time.time() - session.get("created", time.time()) > 3600:
        file_sessions.pop(payload.file_id, None)
        Path(session["path"]).unlink(missing_ok=True)
        raise HTTPException(410, "نشست فایل منقضی شده است. فایل را دوباره بارگذاری کن.")
    allowed = {"summary", "notes", "question", "translate", "quiz", "flashcards"}
    if payload.action not in allowed:
        raise HTTPException(400, "عملیات فایل نامعتبر است.")
    try:
        user_input = payload.user_input.strip()
        if payload.language == "ckb":
            user_input += "\nRespond in Kurdish Sorani."
        elif payload.language == "en":
            user_input += "\nRespond in English."
        else:
            user_input += "\nRespond in Persian."
        result = await bot.smart_file_ai_action(session["text"], payload.action, user_input)
        return {"result": result, "name": session["name"]}
    except Exception as e:
        raise HTTPException(502, str(e)[:300])


@app.delete("/api/files/{file_id}")
async def delete_file(file_id: str):
    session = file_sessions.pop(file_id, None)
    if session:
        Path(session["path"]).unlink(missing_ok=True)
    return {"ok": True}



class AlertIn(BaseModel):
    symbol: str
    target: float
    direction: str = "above"
    user_id: str = ""

class ReminderIn(BaseModel):
    text: str
    due: str = ""
    user_id: str = ""

class TranslateIn(BaseModel):
    text: str
    target_language: str = "fa"

class FancyIn(BaseModel):
    text: str

class DownloadIn(BaseModel):
    url: str
    quality: str = "720"
    user_id: str = ""  # Telegram WebApp initData
    initData: str = ""

class MusicSearchIn(BaseModel):
    query: str

class LyricsIn(BaseModel):
    artist: str = ""
    title: str

class SubtitleIn(BaseModel):
    target_language: str = "ckb"

class ConfigIn(BaseModel):
    protocol: str = "vless"


def _lang_instruction(language: str) -> str:
    return {"ckb":"\nRespond only in natural Central Kurdish (Sorani).", "en":"\nRespond only in English.", "fa":"\nRespond only in standard Persian."}.get(language, "\nRespond only in standard Persian.")


async def localize_output(text: str, language: str) -> str:
    if not text or language == "fa":
        return text
    target = {"ckb":"natural Central Kurdish (Sorani)", "en":"natural English"}.get(language)
    if not target:
        return text
    prompt = (f"Translate the following app output into {target}. Preserve emojis, numbers, line breaks and HTML <b> tags. "
              "Return only the translated text. Do not add explanations.")
    try:
        result = await bot.groq_chat([{"role":"system","content":prompt},{"role":"user","content":text}], temperature=.15, max_tokens=1800)
        if isinstance(result, tuple):
            result, err = (result + (None,None))[:2]
            if err: return text
        return str(result).strip() or text
    except Exception:
        return text

def _user_key(value: str) -> str:
    return value or "anonymous"


@app.post("/api/voice-to-text")
async def voice_to_text(file: UploadFile = File(...), language: str = "auto"):
    sid = secrets.token_urlsafe(16)
    ext = ".webm" if (file.filename or "").lower().endswith(".webm") else ".ogg"
    target = UPLOAD_ROOT / f"voice_{sid}{ext}"
    try:
        size = 0
        with target.open("wb") as out:
            while True:
                chunk = await file.read(1024 * 1024)
                if not chunk: break
                size += len(chunk)
                if size > 25 * 1024 * 1024: raise HTTPException(413, "حجم ویس بیشتر از ۲۵ مگابایت است.")
                out.write(chunk)
        lang = language if language in {"auto","fa","en","ckb"} else "auto"
        # Browser recordings are commonly WebM/Opus. Normalize to OGG/Opus first
        # so the same STT path used by the Telegram bot receives a predictable format.
        stt_path = target
        if ext == ".webm":
            normalized = UPLOAD_ROOT / f"voice_{sid}.ogg"
            proc = await asyncio.create_subprocess_exec(
                "ffmpeg", "-y", "-i", str(target), "-vn", "-acodec", "libopus", "-b:a", "64k", str(normalized),
                stdout=asyncio.subprocess.DEVNULL, stderr=asyncio.subprocess.PIPE
            )
            _, stderr = await proc.communicate()
            if proc.returncode != 0 or not normalized.exists():
                raise HTTPException(422, "تبدیل فرمت ویس ناموفق بود.")
            stt_path = normalized
        result = await bot.speech_to_text(str(stt_path), lang)
        if stt_path != target:
            stt_path.unlink(missing_ok=True)
        if not result:
            raise HTTPException(502, "تبدیل ویس به متن ناموفق بود. کلید سرویس یا فرمت صدا را بررسی کن.")
        return {"text": result, "language": lang}
    except HTTPException: raise
    except Exception as e: raise HTTPException(502, str(e)[:300])
    finally:
        target.unlink(missing_ok=True)
        await file.close()


@app.post("/api/translate")
async def translate(payload: TranslateIn):
    if not payload.text.strip(): raise HTTPException(400, "متن خالی است")
    target = payload.target_language if payload.target_language in {"fa","ckb","en"} else "fa"
    prompt = f"Translate the following text to { {'fa':'standard Persian','ckb':'natural Central Kurdish (Sorani)','en':'English'}[target] }. Return only the translation."
    try:
        result = await bot.groq_chat([{"role":"system","content":prompt},{"role":"user","content":payload.text}], temperature=.2, max_tokens=1800)
        if isinstance(result, tuple):
            result, err = (result + (None,None))[:2]
            if err: raise RuntimeError(str(err))
        return {"text": str(result).strip()}
    except Exception as e: raise HTTPException(502, str(e)[:300])


@app.post("/api/summarize")
async def summarize(payload: TextIn):
    if not payload.text.strip(): raise HTTPException(400, "متن خالی است")
    try:
        result = await bot.summarize_text(payload.text.strip())
        return {"text": result}
    except Exception as e: raise HTTPException(502, str(e)[:300])


@app.post("/api/fancy-text")
async def fancy_text(payload: FancyIn):
    if not payload.text.strip(): raise HTTPException(400, "متن خالی است")
    return {"items": bot.convert_to_fancy_fonts(payload.text.strip())}


@app.post("/api/qr")
async def qr(payload: TextIn):
    if not payload.text.strip(): raise HTTPException(400, "متن یا لینک را وارد کن")
    import qrcode
    img = qrcode.make(payload.text.strip())
    sid = secrets.token_urlsafe(16); path = MEDIA_ROOT / f"qr_{sid}.png"
    img.save(path)
    return {"url": f"/media/{path.name}"}


@app.post("/api/short-link")
async def short_link(payload: TextIn):
    if not payload.text.strip().startswith(("http://","https://")): raise HTTPException(400,"لینک معتبر وارد کن")
    result = await bot.short_url(payload.text.strip())
    if not result: raise HTTPException(502,"کوتاه‌کردن لینک ناموفق بود")
    return {"url": result}


@app.post("/api/sticker")
async def sticker(file: UploadFile | None = File(None), text: str = Form(""), mode: str = Form("text"), font: str = Form(""), bg: str = Form("4080b4"), fg: str = Form("ffffff"), initData: str = Form("")):
    # WebApp form fields can arrive as strings; normalize aggressively so Arabic/Persian
    # input is never mistaken for an empty value.
    text = str(text or "").replace("\x00", "").strip()
    if not text:
        raise HTTPException(400,"متن استیکر را وارد کن")
    def rgb(v, default):
        try:
            v=v.strip().lstrip('#'); return tuple(int(v[i:i+2],16) for i in (0,2,4))+(255,)
        except: return default
    out=None; temp=None
    try:
        if mode == "image":
            if not file: raise HTTPException(400,"عکس را انتخاب کن")
            sid=secrets.token_urlsafe(16); temp=UPLOAD_ROOT/f"sticker_{sid}{safe_image_ext(file.filename)}"
            with temp.open('wb') as f:
                while True:
                    c=await file.read(1024*1024)
                    if not c: break
                    f.write(c)
            out=await asyncio.to_thread(bot.create_image_text_sticker,str(temp),text,font or None,512,rgb(fg,(255,255,255,255)))
        else:
            out=await asyncio.to_thread(bot.create_text_sticker,text,rgb(bg,(64,128,180,255)),rgb(fg,(255,255,255,255)),512,font or None)
        if not out: raise HTTPException(502,"ساخت استیکر ناموفق بود؛ فونت را بررسی کن")
        sid=secrets.token_urlsafe(16); path=MEDIA_ROOT/f"sticker_{sid}.webp"; path.write_bytes(out.getvalue())
        sent = False
        chat_id = None
        token = os.getenv("BOT_TOKEN", "")
        if initData and validate_init_data(initData) and token:
            try:
                data = dict(parse_qsl(initData, keep_blank_values=True))
                import json
                user = json.loads(data.get("user", "{}"))
                chat_id = user.get("id")
                if chat_id:
                    async with TelegramBot(token) as tg_bot:
                        bio = BytesIO(path.read_bytes())
                        bio.name = "sticker.webp"
                        await tg_bot.send_sticker(chat_id=chat_id, sticker=bio)
                        sent = True
            except Exception as send_err:
                # Sticker preview still succeeds if Telegram delivery fails.
                sent = False
                chat_id = None
                print(f"Mini App sticker Telegram delivery failed: {send_err}")
        return {"url":f"/media/{path.name}", "sent": sent, "chat_id": chat_id}
    except HTTPException: raise
    except Exception as e: raise HTTPException(502,str(e)[:300])
    finally:
        if temp: temp.unlink(missing_ok=True)
        if file: await file.close()


@app.post("/api/download")
async def download(payload: DownloadIn):
    url = payload.url.strip()
    if not bot.extract_url(url):
        raise HTTPException(400, "لینک پشتیبانی‌شده وارد کن (یوتیوب، اینستاگرام، تیک‌تاک، آپارات، ...)")
    quality = payload.quality if payload.quality in {"360", "720", "1080", "audio"} else "720"
    # Older frontend sends the signed Telegram initData in user_id; newer
    # versions can send it explicitly as initData. Never trust a raw chat id.
    init_data = (payload.initData or payload.user_id or "").strip()
    if not validate_init_data(init_data):
        raise HTTPException(401, "Mini App را از داخل Telegram باز کن تا فایل به ربات ارسال شود")
    try:
        tg_data = dict(parse_qsl(init_data, keep_blank_values=True))
        tg_user = json.loads(tg_data.get("user", "{}"))
        chat_id = tg_user.get("id")
        if not chat_id:
            raise HTTPException(401, "شناسه Telegram کاربر پیدا نشد")
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(401, "اطلاعات Telegram معتبر نیست")

    sid = secrets.token_urlsafe(16)
    outdir = MEDIA_ROOT / sid
    outdir.mkdir()
    try:
        async with download_semaphore:
            result = await asyncio.to_thread(bot.download_media, url, str(outdir), quality)
        path = Path(result["filename"])
        if not path.exists():
            raise RuntimeError("فایل خروجی ساخته نشد")
        try:
            rel = path.relative_to(outdir)
        except ValueError:
            dest = outdir / path.name
            if path.resolve() != dest.resolve():
                shutil.copy2(path, dest)
            rel = Path(path.name)

        # The previous endpoint only returned a browser download URL. That is
        # why the Mini App appeared to download successfully but nothing arrived
        # in the Telegram bot. Send the generated media to the authenticated
        # Telegram user here, then return the URL as a secondary fallback.
        token = os.getenv("BOT_TOKEN", "").strip()
        if not token:
            raise RuntimeError("BOT_TOKEN در Environment Variables تنظیم نشده است")
        caption = str(result.get("title") or path.stem)[:900]
        is_audio = bool(result.get("is_audio", False) or quality == "audio")
        # Telegram Bot API rejects video/audio uploads above ~50MB. Without this
        # check the send_video/send_audio call below raised an opaque Telegram
        # error and the Mini App showed "download failed" even though the file
        # downloaded correctly. Large files now go through as a document instead
        # (matches the fallback already used by bot.upload_file for the /download
        # command in the Telegram bot itself).
        file_size = path.stat().st_size
        async with TelegramBot(token) as tg_bot:
            with path.open("rb") as fh:
                if is_audio:
                    await tg_bot.send_audio(chat_id=chat_id, audio=fh, caption=caption)
                elif file_size <= bot.MAX_FILE_SIZE:
                    await tg_bot.send_video(chat_id=chat_id, video=fh, caption=caption, supports_streaming=True)
                else:
                    await tg_bot.send_document(
                        chat_id=chat_id, document=fh,
                        caption=caption + "\n\n📦 فایل حجیم",
                    )

        return {
            "ok": True,
            "sent": True,
            "url": f"/media/{sid}/{rel.as_posix()}",
            "title": result.get("title"),
            "audio": is_audio,
            "platform": result.get("platform"),
        }
    except HTTPException:
        shutil.rmtree(outdir, ignore_errors=True)
        raise
    except Exception as e:
        shutil.rmtree(outdir, ignore_errors=True)
        message = str(e)[:600]
        lower = message.lower()
        if "429" in lower or "too many requests" in lower or "محدود کرده" in message:
            raise HTTPException(429, message)
        raise HTTPException(502, message)


@app.post("/api/music/search")
async def music_search(payload: MusicSearchIn):
    if not payload.query.strip(): raise HTTPException(400,"نام آهنگ را وارد کن")
    results=await bot.search_youtube(payload.query.strip(),6)
    return {"results":results}


@app.post("/api/music/lyrics")
async def lyrics(payload: LyricsIn):
    if not payload.title.strip(): raise HTTPException(400,"نام آهنگ را وارد کن")
    result=await bot.get_lyrics(payload.artist.strip(),payload.title.strip())
    if not result: raise HTTPException(404,"متن آهنگ پیدا نشد")
    return {"text":result}


@app.post("/api/subtitle")
async def subtitle(file: UploadFile = File(...), target_language: str = "ckb"):
    lang=target_language if target_language in {"ckb","fa","en"} else "ckb"
    sid=secrets.token_urlsafe(16); temp=UPLOAD_ROOT/f"subtitle_{sid}.mp4"
    out=None
    try:
        size=0
        with temp.open('wb') as f:
            while True:
                c=await file.read(1024*1024)
                if not c: break
                size+=len(c)
                if size>200*1024*1024: raise HTTPException(413,"حجم ویدیو بیشتر از ۲۰۰ مگابایت است")
                f.write(c)
        # process_subtitle expects a Telegram status message only for progress edits; use a lightweight shim.
        class Status:
            async def edit_text(self,*a,**kw): return None
        result=await bot.process_subtitle(str(temp),Status(),lang)
        job=secrets.token_urlsafe(12); jobdir=MEDIA_ROOT/job; jobdir.mkdir()
        srt=Path(result["srt_path"]); srt_dest=jobdir/"subtitle.srt"; srt_dest.write_bytes(srt.read_bytes())
        response={"srt_url":f"/media/{job}/subtitle.srt","language":lang}
        vp=result.get("video_path")
        if vp and Path(vp).exists():
            vd=jobdir/"subtitled.mp4"; vd.write_bytes(Path(vp).read_bytes()); response["video_url"]=f"/media/{job}/subtitled.mp4"
        shutil.rmtree(result.get("temp_dir", ""), ignore_errors=True)
        return response
    except HTTPException: raise
    except Exception as e: raise HTTPException(502,str(e)[:500])
    finally:
        temp.unlink(missing_ok=True); await file.close()


@app.post("/api/config")
async def config(payload: ConfigIn):
    protocol=payload.protocol if payload.protocol in {"vless","vmess","trojan","ss"} else "vless"
    try:
        configs=await bot.fetch_configs(protocol)
        if not configs: raise HTTPException(404,"کانفیگی پیدا نشد")
        return {"protocol":protocol,"configs":configs[:10]}
    except HTTPException: raise
    except Exception as e: raise HTTPException(502,str(e)[:300])


@app.post("/api/alerts")
async def create_alert(payload: AlertIn):
    if payload.direction not in {"above","below"}: raise HTTPException(400,"جهت هشدار نامعتبر است")
    key=_user_key(payload.user_id); item={"symbol":payload.symbol.lower().strip(),"target":payload.target,"direction":payload.direction,"created":time.time()}
    user_alerts.setdefault(key,[]).append(item)
    return {"ok":True,"alerts":user_alerts[key]}

@app.get("/api/alerts")
async def list_alerts(user_id: str = ""):
    return {"alerts":user_alerts.get(_user_key(user_id),[])}

@app.delete("/api/alerts")
async def delete_alert(user_id: str = "", index: int = 0):
    arr=user_alerts.get(_user_key(user_id),[])
    if 0 <= index < len(arr): arr.pop(index)
    return {"alerts":arr}

@app.post("/api/reminders")
async def create_reminder(payload: ReminderIn):
    key=_user_key(payload.user_id); item={"text":payload.text.strip(),"due":payload.due,"created":time.time()}
    if not item["text"]: raise HTTPException(400,"متن یادآوری خالی است")
    user_reminders.setdefault(key,[]).append(item)
    return {"reminders":user_reminders[key]}

@app.get("/api/reminders")
async def list_reminders(user_id: str = ""):
    return {"reminders":user_reminders.get(_user_key(user_id),[])}

@app.delete("/api/reminders")
async def delete_reminder(user_id: str = "", index: int = 0):
    arr=user_reminders.get(_user_key(user_id),[])
    if 0 <= index < len(arr): arr.pop(index)
    return {"reminders":arr}



@app.post("/api/compress-image")
async def compress_image(file: UploadFile = File(...), quality: int = 75):
    sid=secrets.token_urlsafe(12); src=UPLOAD_ROOT/f"ci_{sid}{safe_image_ext(file.filename)}"; dst=MEDIA_ROOT/f"ci_{sid}.jpg"
    try:
        with src.open('wb') as f:
            while True:
                c=await file.read(1024*1024)
                if not c: break
                f.write(c)
        img=Image.open(src).convert('RGB'); img.save(dst,'JPEG',quality=max(20,min(95,quality)),optimize=True)
        return {"url":f"/media/{dst.name}","size":dst.stat().st_size}
    except Exception as e: raise HTTPException(502,str(e)[:300])
    finally: src.unlink(missing_ok=True); await file.close()

@app.post("/api/compress-video")
async def compress_video(file: UploadFile = File(...)):
    sid=secrets.token_urlsafe(12); src=UPLOAD_ROOT/f"cv_{sid}.mp4"; dst=MEDIA_ROOT/f"cv_{sid}.mp4"
    try:
        with src.open('wb') as f:
            while True:
                c=await file.read(1024*1024)
                if not c: break
                f.write(c)
        proc=await asyncio.create_subprocess_exec("ffmpeg","-y","-i",str(src),"-vf","scale='min(1280,iw)':-2","-c:v","libx264","-crf","28","-preset","veryfast","-c:a","aac","-b:a","96k",str(dst),stdout=asyncio.subprocess.DEVNULL,stderr=asyncio.subprocess.PIPE)
        _,err=await proc.communicate()
        if proc.returncode!=0 or not dst.exists(): raise HTTPException(422,"فشرده‌سازی ویدیو ناموفق بود")
        return {"url":f"/media/{dst.name}","size":dst.stat().st_size}
    except HTTPException: raise
    except Exception as e: raise HTTPException(502,str(e)[:300])
    finally: src.unlink(missing_ok=True); await file.close()

@app.post("/api/photo-to-pdf")
async def photo_to_pdf(files: list[UploadFile] = File(...)):
    sid=secrets.token_urlsafe(12); paths=[]
    try:
        from PIL import Image
        for i,file in enumerate(files[:30]):
            ext=safe_image_ext(file.filename); path=UPLOAD_ROOT/f"pdf_{sid}_{i}{ext}"
            with path.open('wb') as f:
                while True:
                    c=await file.read(1024*1024)
                    if not c: break
                    f.write(c)
            paths.append(path); await file.close()
        imgs=[Image.open(p).convert('RGB') for p in paths]
        if not imgs: raise HTTPException(400,"عکسی انتخاب نشده")
        out=MEDIA_ROOT/f"photos_{sid}.pdf"; imgs[0].save(out,save_all=True,append_images=imgs[1:])
        for im in imgs: im.close()
        return {"url":f"/media/{out.name}"}
    except HTTPException: raise
    except Exception as e: raise HTTPException(502,str(e)[:300])
    finally:
        for p in paths: p.unlink(missing_ok=True)

@app.post("/api/text-to-word")
async def text_to_word(payload: TextIn):
    if not payload.text.strip(): raise HTTPException(400,"متن خالی است")
    try:
        buf=bot.create_word_document(payload.text.strip()); sid=secrets.token_urlsafe(12); out=MEDIA_ROOT/f"AsoLand_{sid}.docx"; out.write_bytes(buf.getvalue()); return {"url":f"/media/{out.name}"}
    except Exception as e: raise HTTPException(502,str(e)[:300])

@app.get("/api/chart")
async def chart(coin: str = "bitcoin", days: int = 7):
    try:
        buf=await bot.get_crypto_history_chart(coin, max(1,min(30,days)))
        if not buf: raise HTTPException(404,"نمودار در دسترس نیست")
        sid=secrets.token_urlsafe(12); out=MEDIA_ROOT/f"chart_{sid}.png"; Path(buf).replace(out); return {"url":f"/media/{out.name}"}
    except HTTPException: raise
    except Exception as e: raise HTTPException(502,str(e)[:300])

@app.get("/api/clock")
async def clock(language: str = "fa"):
    return {"text": bot.get_jalali_datetime(language if language in {"fa","ckb","en"} else "fa")}

@app.get("/media/{path:path}")
async def media(path: str):
    target = (MEDIA_ROOT / path).resolve()
    root = MEDIA_ROOT.resolve()
    if root not in target.parents and target != root:
        raise HTTPException(403, "دسترسی غیرمجاز")
    if not target.exists() or not target.is_file():
        raise HTTPException(404, "فایل پیدا نشد")
    # Help browsers / Telegram WebView download with a sensible filename
    return FileResponse(
        target,
        filename=target.name,
        content_disposition_type="attachment",
    )

@app.get("/")
async def home():
    from fastapi.responses import FileResponse
    return FileResponse(ROOT / "index.html")


# Serve Mini App assets (app.js, styles.css, images, etc.) from the repository root.
app.mount("/", StaticFiles(directory=ROOT, html=True), name="web")
