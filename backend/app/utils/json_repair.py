"""
Robust JSON parsing and repair for LLM outputs.

LLMs (especially with multilingual text) often produce truncated or malformed JSON.
This module provides utilities to repair and parse such output.
"""

import json
import re
import logging
from typing import Any, Dict, Optional

logger = logging.getLogger(__name__)


def strip_markdown_fences(raw: str) -> str:
    """Remove markdown code fences (```json ... ```) from LLM output."""
    raw = raw.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    if raw.endswith("```"):
        raw = raw[:-3]
    return raw.strip()


def repair_truncated_json(raw: str) -> str:
    """
    Attempt to repair truncated JSON by:
    1. Closing unterminated strings
    2. Removing trailing commas
    3. Balancing brackets and braces
    """
    if not raw:
        return raw

    # Track state: are we inside a string?
    in_string = False
    escape_next = False
    brace_depth = 0
    bracket_depth = 0
    last_significant_char = ""

    for ch in raw:
        if escape_next:
            escape_next = False
            continue
        if ch == "\\":
            if in_string:
                escape_next = True
            continue
        if ch == '"' and not escape_next:
            in_string = not in_string
            continue
        if in_string:
            continue
        # Outside string
        if ch == '{':
            brace_depth += 1
        elif ch == '}':
            brace_depth -= 1
        elif ch == '[':
            bracket_depth += 1
        elif ch == ']':
            bracket_depth -= 1
        if ch.strip():
            last_significant_char = ch

    repaired = raw

    # If we ended inside a string, close it
    if in_string:
        # Find the last quote to see if we need to escape anything
        repaired += '"'
        logger.info("JSON repair: closed unterminated string")

    # Remove trailing commas before closing brackets/braces
    repaired = re.sub(r',\s*$', '', repaired)

    # Balance brackets and braces
    # Re-count after string closure
    brace_depth = 0
    bracket_depth = 0
    in_string = False
    escape_next = False
    for ch in repaired:
        if escape_next:
            escape_next = False
            continue
        if ch == "\\":
            if in_string:
                escape_next = True
            continue
        if ch == '"' and not escape_next:
            in_string = not in_string
            continue
        if in_string:
            continue
        if ch == '{':
            brace_depth += 1
        elif ch == '}':
            brace_depth -= 1
        elif ch == '[':
            bracket_depth += 1
        elif ch == ']':
            bracket_depth -= 1

    # Close any open arrays then objects
    if bracket_depth > 0 or brace_depth > 0:
        # Remove any trailing comma before we close
        repaired = re.sub(r',\s*$', '', repaired.rstrip())
        repaired += ']' * bracket_depth
        repaired += '}' * brace_depth
        logger.info("JSON repair: closed %d brackets, %d braces", bracket_depth, brace_depth)

    return repaired


def safe_json_parse(raw: str) -> Optional[Dict[str, Any]]:
    """
    Parse JSON from LLM output with progressive repair attempts:
    1. Direct parse
    2. Strip markdown fences + parse
    3. Repair truncated JSON + parse
    4. Extract first JSON object with regex + parse
    """
    if not raw or not raw.strip():
        return None

    # Attempt 1: Direct parse
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        pass

    # Attempt 2: Strip markdown fences
    cleaned = strip_markdown_fences(raw)
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    # Attempt 3: Repair truncation
    repaired = repair_truncated_json(cleaned)
    try:
        result = json.loads(repaired)
        logger.info("JSON parsed successfully after repair")
        return result
    except json.JSONDecodeError as e:
        logger.warning("JSON repair attempt failed: %s", e)

    # Attempt 4: Extract first JSON object via regex
    match = re.search(r'\{', cleaned)
    if match:
        subset = cleaned[match.start():]
        repaired2 = repair_truncated_json(subset)
        try:
            result = json.loads(repaired2)
            logger.info("JSON parsed from extracted object after repair")
            return result
        except json.JSONDecodeError:
            pass

    return None
