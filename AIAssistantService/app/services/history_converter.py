import base64
import json
from typing import List
from google.genai import types
from app.models.chat import AIChatMessage

def convert_db_history_to_gemini(history: List[AIChatMessage]) -> List[types.Content]:
    """
    Converts internal database chat messages into google-genai SDK Content structures.
    """
    gemini_contents = []
    for msg in history:
        role = msg.role
        # Map 'assistant' to 'model' for Gemini SDK
        if role == "assistant":
            gemini_role = "model"
        else:
            gemini_role = role

        parts = []
        
        # Decode thought_signature from base64 if present
        thought_sig_bytes = None
        if getattr(msg, "thought_signature", None):
            try:
                thought_sig_bytes = base64.b64decode(msg.thought_signature)
            except Exception:
                pass
        
        # 1. Handle Text Content
        if msg.content:
            text_content = msg.content
            if text_content.startswith("{") and text_content.endswith("}"):
                try:
                    data = json.loads(text_content)
                    if "attachment" in data:
                        att = data["attachment"]
                        text_content = (
                            f"[Tài liệu đính kèm: {att.get('fileName')}]\n"
                            f"Nội dung tài liệu:\n{att.get('content')}\n"
                            f"---\n"
                            f"Yêu cầu: {data.get('text')}"
                        )
                except Exception:
                    pass
            parts.append(types.Part(text=text_content, thought_signature=thought_sig_bytes))
            
        # 2. Handle Tool Calls (from assistant)
        if msg.tool_calls:
            for tc in msg.tool_calls:
                fc = types.FunctionCall(name=tc["name"], args=tc["args"])
                part = types.Part(function_call=fc, thought_signature=thought_sig_bytes)
                parts.append(part)
        
        # 3. Handle Tool Results (from tool execution)
        if msg.tool_results:
            for tr in msg.tool_results:
                parts.append(
                    types.Part.from_function_response(
                        name=tr["name"],
                        response={"result": tr["result"]}
                    )
                )

        if parts:
            gemini_contents.append(
                types.Content(
                    role=gemini_role,
                    parts=parts
                )
            )
            
    return gemini_contents
