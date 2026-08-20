"""
Configuration Module for Facebook Daily & Community Engine
"""
import os

# Meta / Facebook Graph API
FB_PAGE_ACCESS_TOKEN = os.getenv("FB_PAGE_ACCESS_TOKEN", "")
FB_VERIFY_TOKEN = os.getenv("FB_VERIFY_TOKEN", "LELE_FB_WEBHOOK_VERIFY_SECRET")
FB_APP_SECRET = os.getenv("FB_APP_SECRET", "")
FB_PAGE_ID = os.getenv("FB_PAGE_ID", "")
FB_GROUP_ID = os.getenv("FB_GROUP_ID", "")
GROUP_INVITE_URL = os.getenv("GROUP_INVITE_URL", "https://facebook.com/groups/lelehoctiengtrung")

# Buffer Account 2 (Posts & Groups)
BUFFER_ACCESS_TOKEN_2 = os.getenv("BUFFER_ACCESS_TOKEN_2", os.getenv("BUFFER_ACCESS_TOKEN", ""))
BUFFER_CHANNEL_ID_FB = os.getenv("BUFFER_CHANNEL_ID_FB", "")

# Telegram Bot 2 (Facebook & Community Management)
TELEGRAM_BOT_TOKEN_FB = os.getenv("TELEGRAM_BOT_TOKEN_FB", os.getenv("TELEGRAM_BOT_TOKEN", ""))
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "1187577977")

# Gemini API Keys for Post Generation & Trend Analysis
GEMINI_API_KEYS = os.getenv("GEMINI_API_KEYS", os.getenv("GEMINI_API_KEY", ""))

# NotebookLM / GeminiNotebook Path
NOTEBOOKLM_PATH = "/media/vpsg16gb/HaRiDisk/LIBRARY/GeminiNotebook"
