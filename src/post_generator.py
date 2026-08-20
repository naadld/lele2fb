"""
Post Generator Module for Facebook Fanpage & Group
Incorporates double-layer copywriting heuristics and Comment-to-Inbox Lead Funnel.
"""
import os
import json
import logging
from typing import Dict, Any, List

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("PostGenerator")

DOCUMENT_TEMPLATES = [
    {
        "topic": "Bảng Bẫy Âm Điệu Pinyin HSK 1-3 & Quy Tắc Biến Điệu",
        "description": "Tổng hợp chi tiết cách phân biệt âm c/z, x/sh, q/ch và biến âm của 不 (Bù/Bú), 一 (Yī/Yí/Yì), biến điệu hai thanh 3 đi liền nhau.",
        "target_level": "HSK 1-3",
        "cta": "Bình luận 'TÀI LIỆU' để nhận ngay trọn bộ sơ đồ Mindmap & Audio luyện nghe miễn phí!"
    },
    {
        "topic": "100 Cụm Từ Tiếng Trung Viral Trong Phim Ảnh & Đời Sống",
        "description": "Các cụm từ 3-4 chữ thông dụng nhất người bản xứ dùng hàng ngày nhưng sách giáo khoa ít khi dạy kỹ.",
        "target_level": "HSK 2-3",
        "cta": "Bình luận 'TÀI LIỆU' bên dưới, Lê Lê gửi trọn bộ file PDF vào tin nhắn cho bạn nhé!"
    },
    {
        "topic": "Sổ Tay 300 Chữ Hán Cốt Lõi Kèm Hình Minh Họa & Pinyin Chuẩn",
        "description": "Phương pháp nhớ chữ Hán qua bộ thủ và câu chuyện trực quan sinh động, không lo quên chữ.",
        "target_level": "HSK 1-2",
        "cta": "Để lại bình luận 'TÀI LIỆU' để nhận file tải độc quyền từ Lê Lê nha!"
    }
]


def generate_document_sharing_post(template_index: int = 0) -> Dict[str, Any]:
    """
    Generate 14:00 Document Sharing Post with Comment-to-Inbox strategy.
    """
    idx = template_index % len(DOCUMENT_TEMPLATES)
    tpl = DOCUMENT_TEMPLATES[idx]

    post_content = f"""📚 TỔNG HỢP: {tpl['topic'].upper()} 🎯

Bạn đang tự học tiếng Trung nhưng thường xuyên gặp khó khăn khi:
👉 Phân biệt các âm dễ nhầm lẫn?
👉 Không nhớ quy tắc biến điệu khi ghép câu?
👉 Muốn có tài liệu ngắn gọn, dễ hiểu để tra cứu nhanh?

Lê Lê đã tổng hợp đầy đủ:
✅ Sơ đồ tư duy Mindmap {tpl['target_level']} trực quan, dễ nhớ.
✅ {tpl['description']}.
✅ Kèm audio phát âm chuẩn giọng Bắc Kinh để bạn tự luyện phản xạ tại nhà.

👇 {tpl['cta']} ❤️

───────────────────
#lelehoctiengtrung #hoctiengtrung #pinyin #tiengtrungmoibatdau #{tpl['target_level'].lower().replace(' ', '').replace('-', '')} #tailieutiengtrung #tuhoc"""

    return {
        "title": tpl["topic"],
        "level": tpl["target_level"],
        "content": post_content,
        "trigger_keyword": "TÀI LIỆU"
    }


if __name__ == "__main__":
    post = generate_document_sharing_post(0)
    print("=== SAMPLE 14:00 DOCUMENT SHARING POST ===")
    print(post["content"])
