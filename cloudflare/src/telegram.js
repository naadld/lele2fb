/**
 * Telegram client for Bot 2 (Facebook & Community Management)
 */
export async function sendTelegramAlert(botToken, chatId, message, inlineKeyboard = null) {
  if (!botToken || !chatId) {
    console.warn("[TELEGRAM-FB] Missing botToken or chatId. Skipping message.");
    return null;
  }

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  const payload = {
    chat_id: chatId,
    text: message,
    parse_mode: "HTML",
    disable_web_page_preview: false
  };

  if (inlineKeyboard) {
    payload.reply_markup = { inline_keyboard: inlineKeyboard };
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return await res.json();
  } catch (err) {
    console.error("[TELEGRAM-FB] Error sending Telegram alert:", err);
    return null;
  }
}
