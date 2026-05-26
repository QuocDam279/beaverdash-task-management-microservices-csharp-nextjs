import re

# Các mẫu tin nhắn chào hỏi / chit-chat không cần tra cứu tài liệu RAG
_CASUAL_PATTERNS = [
    r"^(xin\s+)?ch[àa]o",
    r"^hi\b", r"^hello\b", r"^hey\b",
    r"^cảm ơn", r"^thank",
    r"^tạm biệt", r"^bye\b", r"^goodbye\b",
    r"^ok\b", r"^okay\b", r"^ừ\b", r"^uh\b",
    r"^bạn (là|tên) (gì|ai)",
    r"^(bạn )?kh[oỏ]e\b",
    r"^(bạn )?có thể (làm|giúp) (được )?(gì|những gì)",
    r"^giúp (tôi|mình)",
    r"^haha", r"^hehe", r"^lol\b",
    r"^good\s*(morning|afternoon|evening|night)",
    r"^chào buổi\s*(sáng|chiều|tối)",
]
_CASUAL_RE = re.compile("|".join(_CASUAL_PATTERNS), re.IGNORECASE)


def is_casual_message(text: str) -> bool:
    """Kiểm tra tin nhắn có phải chào hỏi / chit-chat đơn giản không.
    
    Trả về True nếu tin nhắn ngắn (≤ 12 từ) và khớp với các mẫu casual,
    để bỏ qua RAG retrieval cho những tin nhắn này.
    """
    cleaned = text.strip()
    if not cleaned:
        return True
    # Tin nhắn dài thường là câu hỏi thực sự
    if len(cleaned.split()) > 12:
        return False
    return bool(_CASUAL_RE.search(cleaned))
