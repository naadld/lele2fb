/**
 * Configuration manager for lele-facebook Worker
 */
export function getFacebookConfig(env) {
  return {
    // Meta / Facebook Graph API Credentials
    fbVerifyToken: env.FB_VERIFY_TOKEN || "LELE_FB_WEBHOOK_VERIFY_SECRET",
    fbPageAccessToken: env.FB_PAGE_ACCESS_TOKEN || "",
    fbAppSecret: env.FB_APP_SECRET || "",
    fbPageId: env.FB_PAGE_ID || "",
    groupInviteUrl: env.GROUP_INVITE_URL || "https://facebook.com/groups/lelehoctiengtrung",

    // Buffer Account 2 (Posts & Groups)
    bufferAccessToken: env.BUFFER_ACCESS_TOKEN_2 || env.BUFFER_ACCESS_TOKEN || "",
    bufferChannelId: env.BUFFER_CHANNEL_ID_FB || "",

    // Telegram Bot 2 (Facebook & Community Manager)
    telegramBotToken: env.TELEGRAM_BOT_TOKEN_FB || env.TELEGRAM_BOT_TOKEN || "",
    telegramChatId: env.TELEGRAM_CHAT_ID || "1187577977",

    // AI Model
    aiModel: env.AI_MODEL || "@cf/meta/llama-3.3-70b-instruct"
  };
}
