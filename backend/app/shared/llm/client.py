import hashlib, json, re, logging
from groq import AsyncGroq
from openai import AsyncOpenAI
from tenacity import retry, stop_after_attempt, wait_exponential
from app.core.config import get_settings

logger = logging.getLogger(__name__)

_cache: dict[str, str] = {}


def _cache_key(prompt: str, system: str) -> str:
    return hashlib.md5(f"{system}::{prompt}".encode()).hexdigest()


@retry(stop=stop_after_attempt(3), wait=wait_exponential(min=2, max=15))
async def _call_groq(system: str, prompt: str, max_tokens: int = 4096) -> str:
    client = AsyncGroq(api_key=get_settings().groq_api_key)
    resp = await client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "system", "content": system}, {"role": "user", "content": prompt}],
        temperature=0.3,
        max_tokens=max_tokens,
    )
    content = resp.choices[0].message.content
    if not content:
        raise ValueError("Groq returned empty response")
    return content


@retry(stop=stop_after_attempt(2), wait=wait_exponential(min=1, max=10))
async def _call_openai(system: str, prompt: str, max_tokens: int = 4096) -> str:
    client = AsyncOpenAI(api_key=get_settings().openai_api_key)
    resp = await client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "system", "content": system}, {"role": "user", "content": prompt}],
        temperature=0.3,
        max_tokens=max_tokens,
    )
    content = resp.choices[0].message.content
    if not content:
        raise ValueError("OpenAI returned empty response")
    return content


async def llm_generate(prompt: str, system: str = "You are a helpful assistant.", use_cache: bool = True, max_tokens: int = 4096) -> str:
    key = _cache_key(prompt, system)
    if use_cache and key in _cache:
        return _cache[key]

    provider = get_settings().llm_provider
    result = None
    try:
        if provider == "groq":
            result = await _call_groq(system, prompt, max_tokens)
        else:
            result = await _call_openai(system, prompt, max_tokens)
    except Exception as e:
        logger.warning(f"Primary LLM ({provider}) failed: {e}. Trying fallback...")
        try:
            if provider == "groq":
                result = await _call_openai(system, prompt, max_tokens)
            else:
                result = await _call_groq(system, prompt, max_tokens)
        except Exception as e2:
            logger.error(f"Fallback LLM also failed: {e2}")
            raise ValueError(f"Both LLM providers failed. Primary: {e}, Fallback: {e2}")

    _cache[key] = result
    return result


def _extract_json(raw: str) -> dict:
    """Robustly extract JSON from LLM response that may contain markdown or extra text."""
    text = raw.strip()

    # Try direct parse first
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Strip markdown code fences: ```json ... ``` or ``` ... ```
    match = re.search(r'```(?:json)?\s*\n?(.*?)\n?\s*```', text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1).strip())
        except json.JSONDecodeError:
            pass

    # Find first { ... } block
    brace_start = text.find('{')
    if brace_start != -1:
        depth = 0
        for i in range(brace_start, len(text)):
            if text[i] == '{':
                depth += 1
            elif text[i] == '}':
                depth -= 1
                if depth == 0:
                    try:
                        return json.loads(text[brace_start:i + 1])
                    except json.JSONDecodeError:
                        break

    raise ValueError(f"Could not extract JSON from LLM response. Raw (first 500 chars): {text[:500]}")


async def llm_generate_json(prompt: str, system: str = "You are a helpful assistant. Always respond in valid JSON.", max_tokens: int = 4096) -> dict:
    raw = await llm_generate(prompt, system, max_tokens=max_tokens)
    logger.debug(f"LLM raw response (first 200): {raw[:200]}")
    return _extract_json(raw)
