import logging
import asyncio
from typing import List, Any, Optional
from google import genai
from google.genai import types

from app.core.config import settings
from app.services.llm_helpers import call_openai_compatible

logger = logging.getLogger(__name__)

class LLMRouter:
    """
    Handles fallback routing for LLM generation across Gemini, GitHub Models, and Groq APIs.
    """
    _PROVIDER_URLS = {
        "github": "https://models.inference.ai.azure.com/chat/completions",
        "groq": "https://api.groq.com/openai/v1/chat/completions",
    }

    def __init__(self):
        # Build the ordered list of model configs for the fallback loop.
        self._model_chain = [
            ("gemini-primary", "gemini", settings.GEMINI_MODEL_PRIMARY),
            ("gemini-secondary", "gemini", settings.GEMINI_MODEL_SECONDARY),
        ]
        if settings.GITHUB_MODEL_TOKEN:
            self._model_chain.append(
                ("gpt-4o-mini", "github", settings.GPT_MODEL)
            )
        if settings.GROQ_API_KEY:
            self._model_chain.append(
                ("llama-groq", "groq", settings.LLAMA_MODEL)
            )

    async def generate_content_with_fallback(
        self,
        client: genai.Client,
        contents: List[types.Content],
        tools: List[Any],
        system_instruction: str
    ) -> Any:
        """
        Tries each model in the configured chain in order.
        On failure the next model is attempted. If every model fails in
        a single pass the whole chain is retried after a delay.
        """
        gemini_config = types.GenerateContentConfig(
            system_instruction=system_instruction,
            tools=tools,
            temperature=0.2,
        )

        max_retries = 20
        retry_delay = 10  # seconds

        for attempt in range(1, max_retries + 1):
            last_error: Optional[Exception] = None

            for label, provider, model_name in self._model_chain:
                try:
                    logger.info(
                        f"[Attempt {attempt}/{max_retries}] Calling model '{label}' "
                        f"(provider={provider}, model={model_name})"
                    )

                    if provider == "gemini":
                        response = await client.aio.models.generate_content(
                            model=model_name,
                            contents=contents,
                            config=gemini_config,
                        )
                        return response

                    elif provider == "github":
                        response = await call_openai_compatible(
                            api_url=self._PROVIDER_URLS["github"],
                            api_key=settings.GITHUB_MODEL_TOKEN,
                            model=model_name,
                            contents=contents,
                            tools=tools,
                            system_instruction=system_instruction,
                        )
                        return response

                    elif provider == "groq":
                        response = await call_openai_compatible(
                            api_url=self._PROVIDER_URLS["groq"],
                            api_key=settings.GROQ_API_KEY,
                            model=model_name,
                            contents=contents,
                            tools=tools,
                            system_instruction=system_instruction,
                        )
                        return response

                except Exception as e:
                    last_error = e
                    logger.warning(
                        f"Model '{label}' failed on attempt {attempt}: {e}. "
                        f"Trying next model in chain..."
                    )
                    continue

            # All models in the chain failed for this attempt
            if attempt == max_retries:
                logger.error("All models exhausted after maximum retries.")
                raise last_error  # type: ignore[misc]

            logger.info(
                f"All models failed on attempt {attempt}. "
                f"Sleeping {retry_delay}s before retry..."
            )
            await asyncio.sleep(retry_delay)
