"""Simplified LLM client for Face Library MVP.

Uses OpenAI-compatible API (configurable provider).
Supports FLock, OpenRouter, or any OpenAI-compatible endpoint.
"""
import os
import json
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

# Primary LLM client
client = OpenAI(
    api_key=os.getenv("LLM_API_KEY", os.getenv("FLOCK_API_KEY", "")),
    base_url=os.getenv("LLM_BASE_URL", os.getenv("FLOCK_BASE_URL", "https://api.flock.io/v1")),
)

MODEL = os.getenv("LLM_MODEL", os.getenv("FLOCK_MODEL_FAST", "deepseek-v3.2"))


def chat(
    messages: list[dict],
    model: str | None = None,
    temperature: float = 0.7,
    max_tokens: int = 2048,
) -> dict:
    """Send a chat completion request.

    Returns dict with 'content', 'model', 'tokens_used'.
    """
    use_model = model or MODEL

    try:
        response = client.chat.completions.create(
            model=use_model,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
        )
        msg = response.choices[0].message
        usage = response.usage
        return {
            "content": msg.content or "",
            "model": use_model,
            "tokens_used": usage.total_tokens if usage else 0,
        }
    except Exception as e:
        print(f"[LLM] Error: {e}")
        return {
            "content": f"[LLM Error: {str(e)}]",
            "model": use_model,
            "tokens_used": 0,
            "error": str(e),
        }


def chat_json(
    messages: list[dict],
    model: str | None = None,
    temperature: float = 0.3,
    max_tokens: int = 2048,
) -> dict:
    """Chat completion that returns parsed JSON."""
    result = chat(messages, model=model, temperature=temperature, max_tokens=max_tokens)
    content = result["content"]

    try:
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()
        result["parsed"] = json.loads(content)
    except (json.JSONDecodeError, IndexError):
        result["parsed"] = None

    return result
