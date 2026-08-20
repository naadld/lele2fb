# 📘 CHIẾN LƯỢC PHÁT TRIỂN FANPAGE & FACEBOOK GROUP
## Kênh "Lê Lê Học Tiếng Trung" (@lelehoctiengtrung)

> **Kiến trúc:** 100% Serverless Cloud (Cloudflare Worker 2 `lele-facebook` + GitHub Actions `lele2fb`)  
> **Phiên bản:** v1.0 (Độc lập 100% với Pipeline Video `pinyinquiz`)  
> **Cập nhật:** 20/08/2026

---

## 🗺️ 1. MÔ HÌNH PHỄU TĂNG TRƯỞNG KÉP (DUAL GROWTH FUNNEL)

```text
               ┌────────────────────────────────────────────────────────┐
               │ 🌟 FANPAGE LÊ LÊ HỌC TIẾNG TRUNG                       │
               │ • 07:00 / 13:00 / 19:00: Video Reels Manim 60fps       │
               │ • 14:00: Bài viết chia sẻ tài liệu (Comment-to-Inbox)  │
               └───────────────────────────┬────────────────────────────┘
                                           │
                        (Comment "TÀI LIỆU" ➔ Auto Messenger Bot)
                                           │
                                           ▼
               ┌────────────────────────────────────────────────────────┐
               │ 👥 FACEBOOK GROUP CỘNG ĐỒNG                            │
               │ • Nhận link Google Drive trọn bộ Ebook / Mindmap       │
               │ • Bàn luận bẫy âm điệu Pinyin & tham gia Minigame      │
               │ • Nuôi dưỡng tệp người học trung thành (UGC)           │
               └────────────────────────────────────────────────────────┘
```

---

## 🤖 2. CẤU HÌNH CLOUDFLARE WORKER (`lele-facebook`)

- **Domain:** `https://lele-facebook.hothihuong113.workers.dev`
- **Webhook Endpoint:** `/webhook`
- **Tính năng cốt lõi:**
  1. **Tự động Like & Reply Comment:** Nhận diện các từ khóa `tài liệu`, `tai lieu`, `xin`, `pdf`, `hsk`...
  2. **Gửi tin nhắn riêng (Private Reply):** Tự động gửi link Google Drive qua Messenger.
  3. **Lên lịch đăng bài 14:00:** Tự động đẩy bài viết ảnh qua **Buffer Account 2**.
  4. **Báo cáo Telegram Bot 2:** Thông báo người học xin tài liệu và chỉ số tương tác về Telegram.

---

## 🔑 3. CÁC SECRETS CẦN THIẾT (CẤU HÌNH TRÊN CLOUDFLARE)

Chạy lệnh trên terminal hoặc cấu hình trên Dashboard Cloudflare (`lele-facebook`):
```bash
npx wrangler secret put FB_PAGE_ACCESS_TOKEN
npx wrangler secret put FB_VERIFY_TOKEN
npx wrangler secret put FB_APP_SECRET
npx wrangler secret put BUFFER_ACCESS_TOKEN_2
npx wrangler secret put TELEGRAM_BOT_TOKEN_FB
```

---

## 🐙 4. GITHUB REPOSITORY ĐỘC LẬP

- **Repo URL:** `https://github.com/naadld/lele2fb`
- **Nhiệm vụ:**
  - Chạy `CompetitorRadar.yml` định kỳ để quét trend Douyin / YouTube của đối thủ.
  - Lưu trữ mã nguồn công cụ và template bài viết.
