# 📘 LELE FACEBOOK & COMMUNITY DAILY ENGINE
### Hệ Thống Tự Động Hóa Fanpage & Group Cộng Đồng "Lê Lê Học Tiếng Trung"

> **Kiến trúc:** 100% Serverless Cloud (Cloudflare Worker 2 + GitHub Actions `lele2fb`)  
> **Phiên bản:** v1.0

---

### 📂 Cấu trúc thư mục:
- `cloudflare/`: Mã nguồn Cloudflare Worker 2 (`lele-facebook`) xử lý Meta Webhooks, Auto-Reply "TÀI LIỆU", Buffer 2 và Telegram Bot 2.
- `src/`: Các module sinh bài đăng Comment-to-Inbox, Tình báo đối thủ (Radar), và Lead Magnet Generator.
- `.github/workflows/`: Quy trình quét đối thủ tự động `CompetitorRadar.yml`.
- `docs/`: Tài liệu chiến lược tăng trưởng Fanpage & Group `FB_COMMUNITY_STRATEGY.md`.
