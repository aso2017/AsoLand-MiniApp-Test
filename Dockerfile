# Use the official Deno binary instead of running the Deno install script.
# This avoids build failures from the installer/network during Render builds.
FROM denoland/deno:bin-2.9.4 AS deno

FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PATH="/usr/local/bin:${PATH}" \
    DENO_DIR=/tmp/deno

WORKDIR /app

# Runtime packages only. Deno is copied from the official Deno image above.
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        ffmpeg \
        ca-certificates \
        fonts-dejavu \
        fonts-noto-core \
        fonts-noto-extra \
    && rm -rf /var/lib/apt/lists/*

COPY --from=deno /deno /usr/local/bin/deno
RUN deno --version

COPY requirements.txt .
RUN pip install -r requirements.txt \
    && pip install --no-cache-dir --upgrade yt-dlp

# Secrets are supplied by Render Environment Variables/Secret Files.
# Do NOT copy .env or .env.example into the image.
COPY asoland_bot.py server.py set_menu_button.py index.html app.js styles.css logo.svg ./

RUN mkdir -p /app/uploads /app/media_jobs /tmp/deno \
    && chmod 755 /tmp/deno

EXPOSE 10000

CMD ["sh", "-c", "uvicorn server:app --host 0.0.0.0 --port ${PORT:-10000}"]
