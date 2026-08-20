/**
 * Cloudflare Worker: lele-facebook
 * Dedicated Serverless Engine for Facebook Fanpage & Group Automation
 * 
 * Features:
 * 1. Meta Webhook Handshake & Event Listener (Auto-Reply & Like on 'TÀI LIỆU')
 * 2. Comment-to-Inbox Private Messenger Delivery
 * 3. 14:00 Document Sharing Post Publisher via Buffer Account 2
 * 4. Telegram Bot 2 Real-Time Notifications
 */

import { getFacebookConfig } from "./config.js";
import { likeComment, replyToComment, sendPrivateReply } from "./meta_client.js";
import { publishPostToBuffer } from "./buffer_client.js";
import { sendTelegramAlert } from "./telegram.js";

// Keywords that trigger Document Delivery & Auto-Reply
const DOCUMENT_REQUEST_KEYWORDS = [
  "tài liệu", "tai lieu", "tailieu",
  "xin", "cho em xin", "cho mình xin",
  "pdf", "hsk", "sách", "sach",
  "link", "gửi em", "gui em", "gửi mình"
];

function isDocumentRequest(text = "") {
  const lower = text.toLowerCase().trim();
  return DOCUMENT_REQUEST_KEYWORDS.some(kw => lower.includes(kw));
}

export default {
  /**
   * HTTP Request Handler
   */
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const config = getFacebookConfig(env);

    // 1. Health check endpoint
    if (url.pathname === "/" || url.pathname === "/health") {
      return new Response(JSON.stringify({
        project: "LeLe Hoc Tieng Trung - Facebook Community Engine",
        worker: "lele-facebook",
        status: "Online (100% Serverless)",
        endpoints: {
          webhook: "/webhook (GET: Meta verification, POST: Event ingestion)",
          triggerPost: "/api/trigger-doc-post (POST: Publish 14:00 post)"
        },
        time: new Date().toISOString()
      }, null, 2), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // 2. Meta Webhook Verification Handshake (GET /webhook)
    if (url.pathname === "/webhook" && request.method === "GET") {
      const mode = url.searchParams.get("hub.mode");
      const token = url.searchParams.get("hub.verify_token");
      const challenge = url.searchParams.get("hub.challenge");

      if (mode === "subscribe" && token === config.fbVerifyToken) {
        console.log("[META-WEBHOOK] Verification successful!");
        return new Response(challenge, { status: 200 });
      } else {
        console.warn("[META-WEBHOOK] Verification failed. Token mismatch.");
        return new Response("Forbidden", { status: 403 });
      }
    }

    // 3. Meta Webhook Event Ingestion (POST /webhook)
    if (url.pathname === "/webhook" && request.method === "POST") {
      try {
        const body = await request.json();
        console.log("[META-EVENT] Incoming Webhook Event:", JSON.stringify(body));

        if (body.object === "page" && Array.isArray(body.entry)) {
          for (const entry of body.entry) {
            // Handle Changes (Feed / Comments)
            if (Array.isArray(entry.changes)) {
              for (const change of entry.changes) {
                const value = change.value || {};
                const item = value.item;
                const verb = value.verb;

                // Detect new comments on page posts
                if (item === "comment" && (verb === "add" || !verb)) {
                  const commentId = value.comment_id;
                  const commentMessage = value.message || "";
                  const senderName = value.from?.name || "Người học";
                  const senderId = value.from?.id || "";

                  console.log(`[FB-COMMENT] New comment from ${senderName} (${commentId}): "${commentMessage}"`);

                  // Check if comment is requesting documents
                  if (isDocumentRequest(commentMessage)) {
                    console.log(`[FB-AUTO-REPLY] Triggering Document Funnel for comment ${commentId}...`);

                    // Step 1: Auto Like Comment
                    if (config.fbPageAccessToken) {
                      await likeComment(config.fbPageAccessToken, commentId);
                    }

                    // Step 2: Public Reply Comment
                    const publicReplyText = `Dạ Lê Lê đã gửi link trọn bộ tài liệu qua tin nhắn cho bạn rồi nhé! ✨ Bạn nhớ kiểm tra hộp thư chờ và tham gia Group học tập để nhận thêm tài liệu mỗi tuần cùng Lê Lê nha: ${config.groupInviteUrl}`;
                    if (config.fbPageAccessToken) {
                      await replyToComment(config.fbPageAccessToken, commentId, publicReplyText);
                    }

                    // Step 3: Private Reply via Messenger
                    const privateMsgText = `Chào ${senderName} nha! Lê Lê gửi bạn trọn bộ tài liệu học tiếng Trung độc quyền nè: https://drive.google.com/drive/folders/1Y240J5-oXA-UDm2IKvp7qCBVsRempbCB\n\nChúc bạn học thật tốt! Đừng quên tham gia Group của chúng mình nhé: ${config.groupInviteUrl}`;
                    if (config.fbPageAccessToken) {
                      await sendPrivateReply(config.fbPageAccessToken, commentId, privateMsgText);
                    }

                    // Step 4: Notify Telegram Bot 2
                    await sendTelegramAlert(
                      config.telegramBotToken,
                      config.telegramChatId,
                      `💬 <b>[Facebook Fanpage - Tương Tác Xin Tài Liệu]</b>\n\n` +
                      `👤 <b>Người học:</b> ${senderName}\n` +
                      `📝 <b>Bình luận:</b> "<i>${commentMessage}</i>"\n` +
                      `✅ <b>Hành động tự động:</b> Đã Like, Trả lời bình luận & Gửi link qua Inbox!`
                    );
                  }
                }
              }
            }
          }
        }

        return new Response("EVENT_RECEIVED", { status: 200 });
      } catch (err) {
        console.error("[META-WEBHOOK] Error processing event:", err);
        return new Response("Error", { status: 500 });
      }
    }

    // 4. Trigger Document Post Endpoint (POST /api/trigger-doc-post)
    if (url.pathname === "/api/trigger-doc-post" && (request.method === "POST" || request.method === "GET")) {
      try {
        const postText = `📚 TỔNG HỢP BÍ KÍP TỰ HỌC TIẾNG TRUNG & BẢNG BẪY ÂM ĐIỆU PINYIN CHUẨN HSK\n\n` +
          `Các bạn mới học tiếng Trung thường rất dễ nhầm lẫn giữa các âm c/z, x/sh, q/ch và biến điệu của 不 (Bù/Bú) hay 一 (Yī/Yí/Yì).\n\n` +
          `Lê Lê đã tổng hợp đầy đủ sơ đồ tư duy Mindmap kèm bảng tra cứu Pinyin chi tiết và file nghe chuẩn bản xứ trong bộ tài liệu này! ✨\n\n` +
          `👇 Bình luận "TÀI LIỆU" bên dưới bài viết này, Lê Lê sẽ tự động gửi link tải trọn bộ miễn phí vào tin nhắn cho bạn ngay nhé! ❤️\n\n` +
          `#lelehoctiengtrung #hoctiengtrung #pinyin #tiengtrungmoibatdau #hsk #tailieutiengtrung`;

        let bufferRes = null;
        if (config.bufferAccessToken && config.bufferChannelId) {
          bufferRes = await publishPostToBuffer(config.bufferAccessToken, config.bufferChannelId, postText);
        }

        await sendTelegramAlert(
          config.telegramBotToken,
          config.telegramChatId,
          `📢 <b>[Lên Lịch Bài Đăng 14:00 - Chia Sẻ Tài Liệu]</b>\n\n` +
          `📌 <b>Chủ đề:</b> Bí Kíp Tự Học Tiếng Trung & Bảng Bẫy Âm Điệu Pinyin\n` +
          `🎯 <b>Chiến thuật:</b> Comment-to-Inbox (Phễu kéo tương tác Fanpage & Group)\n` +
          `📊 <b>Trạng thái:</b> ${bufferRes ? "Đã gửi lên Buffer 2" : "Sẵn sàng đăng"}`
        );

        return new Response(JSON.stringify({ success: true, message: "14:00 Document Sharing Post triggered successfully.", buffer: bufferRes }, null, 2), {
          headers: { "Content-Type": "application/json" }
        });
      } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500, headers: { "Content-Type": "application/json" } });
      }
    }

    return new Response("Not Found", { status: 404 });
  },

  /**
   * Cron Scheduled Trigger Handler
   */
  async scheduled(event, env, ctx) {
    const config = getFacebookConfig(env);
    console.log(`[FB-CRON] Fired at ${event.cron}. Executing 14:00 Document Sharing Post...`);

    // 14:00 GMT+7 (07:00 UTC) Document Sharing Post
    if (event.cron === "0 7 * * *") {
      try {
        const postText = `📚 TỔNG HỢP BÍ KÍP TỰ HỌC TIẾNG TRUNG & BẢNG BẪY ÂM ĐIỆU PINYIN CHUẨN HSK\n\n` +
          `Các bạn mới học tiếng Trung thường rất dễ nhầm lẫn giữa các âm c/z, x/sh, q/ch và biến điệu của 不 (Bù/Bú) hay 一 (Yī/Yí/Yì).\n\n` +
          `Lê Lê đã tổng hợp đầy đủ sơ đồ tư duy Mindmap kèm bảng tra cứu Pinyin chi tiết và file nghe chuẩn bản xứ trong bộ tài liệu này! ✨\n\n` +
          `👇 Bình luận "TÀI LIỆU" bên dưới bài viết này, Lê Lê sẽ tự động gửi link tải trọn bộ miễn phí vào tin nhắn cho bạn ngay nhé! ❤️\n\n` +
          `#lelehoctiengtrung #hoctiengtrung #pinyin #tiengtrungmoibatdau #hsk #tailieutiengtrung`;

        if (config.bufferAccessToken && config.bufferChannelId) {
          await publishPostToBuffer(config.bufferAccessToken, config.bufferChannelId, postText);
        }

        await sendTelegramAlert(
          config.telegramBotToken,
          config.telegramChatId,
          `📢 <b>[Lịch Tự Động 14:00 - Đã Đăng Bài Chia Sẻ Tài Liệu]</b>\n\n` +
          `🎯 <b>Chiến thuật:</b> Comment-to-Inbox kích hoạt tự động phản hồi khi có comment "TÀI LIỆU".\n` +
          `✨ Bot đang lắng nghe Webhook để tự động gửi link qua Messenger cho người học!`
        );
      } catch (err) {
        console.error("[FB-CRON] Error executing 14:00 post:", err);
      }
    }
  }
};
