/**
 * Cloudflare Worker: lele-facebook
 * Dedicated Serverless Engine for Facebook Fanpage, Group & Instagram Automation
 * 
 * Connected Channels on Buffer 2:
 * 1. Facebook Fanpage: Lê Lê học tiếng Trung (6a86bd12ccaf649a67dfcae9)
 * 2. Facebook Group:   Học tiếng Trung cùng Lê Lê (6a86bd97ccaf649a67dfcca8)
 * 3. Instagram:        lelehoctiengtrung (6a86beacccaf649a67dfcfba)
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
        project: "LeLe Hoc Tieng Trung - Multi-Channel Community Engine",
        worker: "lele-facebook",
        status: "Online (100% Serverless)",
        channels: {
          fanpage: env.BUFFER_CHANNEL_ID_FB ? "Connected" : "Pending",
          group: env.BUFFER_CHANNEL_ID_GROUP ? "Connected" : "Pending",
          instagram: env.BUFFER_CHANNEL_ID_IG ? "Connected" : "Pending"
        },
        endpoints: {
          webhook: "/webhook (GET: Meta verification, POST: Event ingestion)",
          triggerPost: "/api/trigger-doc-post (POST: Multi-channel publish)"
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

                  console.log(`[FB-COMMENT] New comment from ${senderName} (${commentId}): "${commentMessage}"`);

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

    // 4. Trigger Document Post to Multi-Channels (POST /api/trigger-doc-post)
    if (url.pathname === "/api/trigger-doc-post" && (request.method === "POST" || request.method === "GET")) {
      try {
        const postText = `📚 TỔNG HỢP BÍ KÍP TỰ HỌC TIẾNG TRUNG & BẢNG BẪY ÂM ĐIỆU PINYIN CHUẨN HSK\n\n` +
          `Các bạn mới học tiếng Trung thường rất dễ nhầm lẫn giữa các âm c/z, x/sh, q/ch và biến điệu của 不 (Bù/Bú) hay 一 (Yī/Yí/Yì).\n\n` +
          `Lê Lê đã tổng hợp đầy đủ sơ đồ tư duy Mindmap kèm bảng tra cứu Pinyin chi tiết và file nghe chuẩn bản xứ trong bộ tài liệu này! ✨\n\n` +
          `👇 Bình luận "TÀI LIỆU" bên dưới bài viết này, Lê Lê sẽ tự động gửi link tải trọn bộ miễn phí vào tin nhắn cho bạn ngay nhé! ❤️\n\n` +
          `#lelehoctiengtrung #hoctiengtrung #pinyin #tiengtrungmoibatdau #hsk #tailieutiengtrung`;

        const results = {};
        const token = env.BUFFER_ACCESS_TOKEN_2 || config.bufferAccessToken;

        // 1. Post to Fanpage
        if (token && env.BUFFER_CHANNEL_ID_FB) {
          try {
            results.fanpage = await publishPostToBuffer(token, env.BUFFER_CHANNEL_ID_FB, postText, [], "facebook");
          } catch (e) { results.fanpage_error = e.message; }
        }

        // 2. Post to Group
        if (token && env.BUFFER_CHANNEL_ID_GROUP) {
          try {
            const groupText = `🎉 TÀI LIỆU MỚI CHO THÀNH VIÊN GROUP: BẢNG BẪY ÂM ĐIỆU PINYIN & MINIMAP HSK 1-3\n\n` +
              `Chào cả nhà! Hôm nay Lê Lê gửi tặng các bạn tài liệu tổng hợp quy tắc biến âm và mẹo phân biệt các âm dễ nhầm lẫn nhé.\n\n` +
              `Các bạn đang tự học gặp khó khăn ở âm nào nhất thì để lại comment bên dưới để Lê Lê hỗ trợ giải đáp nha! ✨`;
            results.group = await publishPostToBuffer(token, env.BUFFER_CHANNEL_ID_GROUP, groupText, [], "facebook");
          } catch (e) { results.group_error = e.message; }
        }

        // 3. Post to Instagram
        if (token && env.BUFFER_CHANNEL_ID_IG) {
          try {
            const igText = `Bảng Bẫy Âm Điệu Pinyin & 300 Từ Vựng HSK 1-3 🇨🇳✨\n\nFollow @lelehoctiengtrung để nhận thêm tài liệu học tiếng Trung mỗi ngày!\n\n#lelehoctiengtrung #hoctiengtrung #pinyin #hsk`;
            results.instagram = await publishPostToBuffer(token, env.BUFFER_CHANNEL_ID_IG, igText, [], "instagram");
          } catch (e) { results.instagram_error = e.message; }
        }

        await sendTelegramAlert(
          config.telegramBotToken,
          config.telegramChatId,
          `📢 <b>[Xuất Bản Đa Kênh - 14:00]</b>\n\n` +
          `📌 <b>Nội dung:</b> Chia sẻ tài liệu Pinyin & Mindmap HSK\n` +
          `📘 <b>Fanpage:</b> ${results.fanpage ? '✅ Đã lên lịch' : '⚠️ Bỏ qua'}\n` +
          `👥 <b>Group:</b> ${results.group ? '✅ Đã lên lịch' : '⚠️ Bỏ qua'}\n` +
          `📸 <b>Instagram:</b> ${results.instagram ? '✅ Đã lên lịch' : '⚠️ Bỏ qua'}`
        );

        return new Response(JSON.stringify({ success: true, results: results }, null, 2), {
          headers: { "Content-Type": "application/json" }
        });
      } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500, headers: { "Content-Type": "application/json" } });
      }
    }

    return new Response("Not Found", { status: 404 });
  },

  /**
   * Cron Scheduled Trigger Handler (14:00 GMT+7)
   */
  async scheduled(event, env, ctx) {
    const config = getFacebookConfig(env);
    console.log(`[FB-CRON] Triggered cron at ${event.cron}...`);

    if (event.cron === "0 7 * * *") {
      const token = env.BUFFER_ACCESS_TOKEN_2 || config.bufferAccessToken;
      const postText = `📚 TỔNG HỢP BÍ KÍP TỰ HỌC TIẾNG TRUNG & BẢNG BẪY ÂM ĐIỆU PINYIN CHUẨN HSK\n\n` +
        `Các bạn mới học tiếng Trung thường rất dễ nhầm lẫn giữa các âm c/z, x/sh, q/ch và biến điệu của 不 (Bù/Bú) hay 一 (Yī/Yí/Yì).\n\n` +
        `Lê Lê đã tổng hợp đầy đủ sơ đồ tư duy Mindmap kèm bảng tra cứu Pinyin chi tiết và file nghe chuẩn bản xứ trong bộ tài liệu này! ✨\n\n` +
        `👇 Bình luận "TÀI LIỆU" bên dưới bài viết này, Lê Lê sẽ tự động gửi link tải trọn bộ miễn phí vào tin nhắn cho bạn ngay nhé! ❤️\n\n` +
        `#lelehoctiengtrung #hoctiengtrung #pinyin #tiengtrungmoibatdau #hsk #tailieutiengtrung`;

      if (token && env.BUFFER_CHANNEL_ID_FB) {
        await publishPostToBuffer(token, env.BUFFER_CHANNEL_ID_FB, postText, [], "facebook");
      }
      if (token && env.BUFFER_CHANNEL_ID_GROUP) {
        const groupText = `🎉 TÀI LIỆU MỚI: BẢNG BẪY ÂM ĐIỆU PINYIN & MINIMAP HSK 1-3\n\nChúc cả nhà học tiếng Trung thật vui và hiệu quả cùng Lê Lê! ✨`;
        await publishPostToBuffer(token, env.BUFFER_CHANNEL_ID_GROUP, groupText, [], "facebook");
      }
    }
  }
};
