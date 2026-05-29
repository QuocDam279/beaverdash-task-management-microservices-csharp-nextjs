import json
import logging
import inspect
import httpx
from typing import List, Dict, Any, Optional
from google.genai import types

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Helper classes to wrap OpenAI-compatible responses so the chat loop can
# treat them identically to google-genai responses.
# ---------------------------------------------------------------------------

class MockFunctionCall:
    """Mimics google.genai types.FunctionCall for OpenAI tool_calls."""
    def __init__(self, name: str, args: dict):
        self.name = name
        self.args = args


class MockPart:
    """Mimics a google.genai Part so thought_signature access works."""
    def __init__(self, text=None, function_call=None):
        self.text = text
        self.function_call = function_call
        self.thought_signature = None  # OpenAI models don't have this


class MockContent:
    def __init__(self, parts):
        self.parts = parts


class MockCandidate:
    def __init__(self, parts):
        self.content = MockContent(parts)


class OpenAICompatibleResponse:
    """
    Wraps an OpenAI-compatible JSON response so it exposes the same
    interface as a google-genai GenerateContentResponse.
    """
    def __init__(self, raw: dict):
        self._raw = raw
        choice = raw.get("choices", [{}])[0]
        message = choice.get("message", {})

        # --- text ---
        self.text = message.get("content") or None

        # --- function_calls ---
        self.function_calls = None
        tool_calls = message.get("tool_calls")
        if tool_calls:
            self.function_calls = []
            for tc in tool_calls:
                fn = tc.get("function", {})
                name = fn.get("name", "")
                try:
                    args = json.loads(fn.get("arguments", "{}"))
                except json.JSONDecodeError:
                    args = {}
                self.function_calls.append(MockFunctionCall(name=name, args=args))

        # --- candidates (for thought_signature extraction) ---
        parts = []
        if self.text:
            parts.append(MockPart(text=self.text))
        if self.function_calls:
            for fc in self.function_calls:
                parts.append(MockPart(function_call=fc))
        self.candidates = [MockCandidate(parts)] if parts else []


def build_openai_tools(tools: List[Any]) -> List[dict]:
    """
    Convert the Python tool functions into OpenAI function-calling
    tool definitions by inspecting signatures and docstrings.
    """
    openai_tools = []
    for fn in tools:
        sig = inspect.signature(fn)
        doc = inspect.getdoc(fn) or ""

        # Parse Args section from docstring
        properties = {}
        required = []
        in_args = False
        for line in doc.splitlines():
            stripped = line.strip()
            if stripped.startswith("Args:"):
                in_args = True
                continue
            if in_args:
                if stripped == "" or (not stripped.startswith(" ") and ":" not in stripped and stripped != ""):
                    # Might be a new section
                    if not stripped.startswith(" ") and not stripped == "":
                        in_args = False
                        continue
                if ":" in stripped:
                    param_part, desc = stripped.split(":", 1)
                    param_name = param_part.strip()
                    if param_name == "self":
                        continue
                    properties[param_name] = {
                        "type": "string",
                        "description": desc.strip()
                    }

        # Mark parameters without defaults as required
        for pname, param in sig.parameters.items():
            if pname == "self":
                continue
            if param.default is inspect.Parameter.empty and pname in properties:
                required.append(pname)

        # Extract the first line of docstring as the function description
        func_desc = doc.split("\n")[0].strip() if doc else fn.__name__

        openai_tools.append({
            "type": "function",
            "function": {
                "name": fn.__name__,
                "description": func_desc,
                "parameters": {
                    "type": "object",
                    "properties": properties,
                    "required": required,
                }
            }
        })
    return openai_tools


def convert_gemini_contents_to_openai_messages(
    contents: List[types.Content], system_instruction: str
) -> List[dict]:
    """
    Convert a list of google-genai Content objects into OpenAI chat messages.
    """
    messages = [
        {"role": "system", "content": system_instruction}
    ]

    for content in contents:
        role = content.role  # "user" | "model" | "tool"

        if role == "user":
            text_parts = [p.text for p in content.parts if hasattr(p, "text") and p.text]
            if text_parts:
                messages.append({"role": "user", "content": "\n".join(text_parts)})

        elif role == "model":
            text_parts = []
            tool_calls = []
            for p in content.parts:
                if hasattr(p, "function_call") and p.function_call:
                    fc = p.function_call
                    tool_calls.append({
                        "id": f"call_{fc.name}_{id(fc)}",
                        "type": "function",
                        "function": {
                            "name": fc.name,
                            "arguments": json.dumps(fc.args, ensure_ascii=False)
                        }
                    })
                elif hasattr(p, "text") and p.text:
                    text_parts.append(p.text)

            msg: Dict[str, Any] = {"role": "assistant"}
            if text_parts:
                msg["content"] = "\n".join(text_parts)
            else:
                msg["content"] = None
            if tool_calls:
                msg["tool_calls"] = tool_calls
            messages.append(msg)

        elif role == "tool":
            # Each part is a function response
            for p in content.parts:
                if hasattr(p, "function_response") and p.function_response:
                    fr = p.function_response
                    # Find matching tool_call id from the previous assistant message
                    tool_call_id = f"call_{fr.name}_{fr.name}"
                    # Search backwards for a matching tool_call
                    for prev in reversed(messages):
                        if prev.get("role") == "assistant" and prev.get("tool_calls"):
                            for tc in prev["tool_calls"]:
                                if tc["function"]["name"] == fr.name:
                                    tool_call_id = tc["id"]
                                    break
                            break
                    result_str = ""
                    if isinstance(fr.response, dict):
                        result_str = fr.response.get("result", json.dumps(fr.response, ensure_ascii=False))
                    else:
                        result_str = str(fr.response)
                    messages.append({
                        "role": "tool",
                        "tool_call_id": tool_call_id,
                        "content": result_str
                    })

    return messages


async def call_openai_compatible(
    api_url: str,
    api_key: str,
    model: str,
    contents: List[types.Content],
    tools: List[Any],
    system_instruction: str,
) -> OpenAICompatibleResponse:
    """
    Sends a chat completion request to an OpenAI-compatible endpoint
    and returns a wrapped response object.
    """
    messages = convert_gemini_contents_to_openai_messages(contents, system_instruction)
    openai_tools = build_openai_tools(tools)

    payload: Dict[str, Any] = {
        "model": model,
        "messages": messages,
        "temperature": 0.2,
    }
    if openai_tools:
        payload["tools"] = openai_tools
        payload["tool_choice"] = "auto"

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}",
    }

    async with httpx.AsyncClient(timeout=60.0) as client:
        resp = await client.post(api_url, json=payload, headers=headers)
        resp.raise_for_status()
        return OpenAICompatibleResponse(resp.json())
