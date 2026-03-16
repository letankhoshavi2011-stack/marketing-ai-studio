"""Utility helpers for the Prompt Library feature."""

import re
from typing import List

from app.models.prompt_library import InputVariable


def extract_input_variables(template: str) -> List[InputVariable]:
    """Extract {variable_name} placeholders from prompt template.

    Skips JSON example braces like ``{{...}}`` (double-braced / escaped).
    Returns a de-duplicated list preserving first-occurrence order.
    """
    # Find single-braced variables but skip double-braced (escaped) ones
    raw = re.findall(r'(?<!\{)\{([a-zA-Z_][a-zA-Z0-9_]*)\}(?!\})', template)
    seen: set[str] = set()
    result: List[InputVariable] = []
    for name in raw:
        if name not in seen:
            seen.add(name)
            result.append(
                InputVariable(
                    name=name,
                    description=f"Input: {name.replace('_', ' ')}",
                    required=True,
                )
            )
    return result
