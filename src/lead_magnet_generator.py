"""
Lead Magnet Generator Module
Interfaces with NotebookLM / Google Sheets to compile PDF Cheatsheets & Quiz for Facebook Group.
"""
import logging
from typing import Dict, Any, List

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("LeadMagnetGenerator")


def compile_hsk_study_guide(sheet_batches: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Format and structure batch vocabulary into a Study Guide for NotebookLM digestion.
    """
    logger.info(f"Compiling {len(sheet_batches)} batches into HSK Study Guide Lead Magnet...")

    study_guide_text = "# BÍ KÍP PHẢN XẠ PINYIN & BẢNG BẪY ÂM ĐIỆU CHUẨN HSK\n\n"
    study_guide_text += "> Tài liệu độc quyền từ cộng đồng **Lê Lê Học Tiếng Trung**\n\n"

    for b in sheet_batches:
        topic = b.get("topic", "")
        level = b.get("level", "")
        words = b.get("words", [])

        study_guide_text += f"## 📌 Chủ Đề: {topic} ({level})\n"
        for idx, w in enumerate(words, start=1):
            hz = w.get("hanzi", "")
            py = w.get("pinyin", "")
            mn = w.get("meaning", "")
            study_guide_text += f"{idx}. **{hz}** (`{py}`): {mn}\n"
        study_guide_text += "\n---\n\n"

    return {
        "title": "Bí Kíp Phản Xạ Pinyin & Bảng Bẫy Âm Điệu HSK",
        "content": study_guide_text,
        "format": "markdown_for_pdf"
    }


if __name__ == "__main__":
    sample_batches = [
        {
            "topic": "HSK 1 • Đồ Ăn & Thức Uống",
            "level": "HSK 1",
            "words": [
                {"hanzi": "苹果", "pinyin": "píng guǒ", "meaning": "Quả táo"},
                {"hanzi": "米饭", "pinyin": "mǐ fàn", "meaning": "Cơm"}
            ]
        }
    ]
    guide = compile_hsk_study_guide(sample_batches)
    print("=== SAMPLE LEAD MAGNET CONTENT ===")
    print(guide["content"][:300])
