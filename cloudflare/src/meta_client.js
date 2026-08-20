/**
 * Meta Graph API Client for Facebook Fanpage & Messenger Automations
 */

const GRAPH_API_BASE = "https://graph.facebook.com/v21.0";

/**
 * Automatically Like a Comment on Fanpage
 */
export async function likeComment(pageAccessToken, commentId) {
  if (!pageAccessToken || !commentId) return null;
  const url = `${GRAPH_API_BASE}/${commentId}/likes?access_token=${encodeURIComponent(pageAccessToken)}`;
  try {
    const res = await fetch(url, { method: "POST" });
    return await res.json();
  } catch (err) {
    console.error(`[META-API] Error liking comment ${commentId}:`, err);
    return null;
  }
}

/**
 * Automatically Reply to a Comment on Fanpage
 */
export async function replyToComment(pageAccessToken, commentId, message) {
  if (!pageAccessToken || !commentId || !message) return null;
  const url = `${GRAPH_API_BASE}/${commentId}/comments`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: message,
        access_token: pageAccessToken
      })
    });
    return await res.json();
  } catch (err) {
    console.error(`[META-API] Error replying to comment ${commentId}:`, err);
    return null;
  }
}

/**
 * Send Private Reply via Messenger for a Comment (Comment-to-Inbox)
 */
export async function sendPrivateReply(pageAccessToken, commentId, message) {
  if (!pageAccessToken || !commentId || !message) return null;
  const url = `${GRAPH_API_BASE}/${commentId}/private_replies`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: message,
        access_token: pageAccessToken
      })
    });
    return await res.json();
  } catch (err) {
    console.error(`[META-API] Error sending private reply to ${commentId}:`, err);
    return null;
  }
}

/**
 * Send direct Messenger text message
 */
export async function sendMessengerMessage(pageAccessToken, recipientId, message) {
  if (!pageAccessToken || !recipientId || !message) return null;
  const url = `${GRAPH_API_BASE}/me/messages?access_token=${encodeURIComponent(pageAccessToken)}`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipient: { id: recipientId },
        message: { text: message }
      })
    });
    return await res.json();
  } catch (err) {
    console.error(`[META-API] Error sending Messenger message to ${recipientId}:`, err);
    return null;
  }
}
