"""Prompt system — dynamically loads agent instructions from YAML files."""

import os
import yaml
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

# Directories containing YAML prompts
AGENTS_DIR = Path(__file__).parent / "agents"
TOOLS_DIR = Path(__file__).parent / "tools"

# Dictionaries to hold the loaded prompts
_AGENT_PROMPTS = {}
_TOOL_PROMPTS = {}


def load_prompts():
    """Load all .yaml files from the agents and tools directories."""
    # Load Agent Prompts
    if AGENTS_DIR.exists():
        for yaml_file in AGENTS_DIR.glob("*.yaml"):
            try:
                with open(yaml_file, "r", encoding="utf-8") as f:
                    data = yaml.safe_load(f)
                    if isinstance(data, dict) and "instruction" in data:
                        _AGENT_PROMPTS[yaml_file.stem.upper()] = data["instruction"]
            except Exception as e:
                logger.error(f"Failed to load agent prompt from {yaml_file}: {type(e).__name__}: {e}")

    # Load Tool Prompts
    if TOOLS_DIR.exists():
        for yaml_file in TOOLS_DIR.glob("*.yaml"):
            try:
                with open(yaml_file, "r", encoding="utf-8") as f:
                    data = yaml.safe_load(f)
                    if isinstance(data, dict) and "prompts" in data:
                        _TOOL_PROMPTS[yaml_file.stem.upper()] = data["prompts"]
            except Exception as e:
                logger.error(f"Failed to load tool prompt from {yaml_file}: {type(e).__name__}: {e}")


# Initial load
load_prompts()


def __getattr__(name):
    """Allow importing agent prompts as constants."""
    if name in _AGENT_PROMPTS:
        return _AGENT_PROMPTS[name]
    raise AttributeError(f"module {__name__} has no attribute {name}")


class PromptLoader:
    """Access for agent and tool prompts."""

    @staticmethod
    def get_agent_prompt(name: str) -> str:
        """Get the instruction for a specific agent by name."""
        return _AGENT_PROMPTS.get(name.upper(), "")

    @staticmethod
    def get_tool_prompt(tool_file: str, prompt_key: str, **variables) -> str:
        """Get and format a specific prompt for a tool."""
        file_prompts = _TOOL_PROMPTS.get(tool_file.upper(), {})
        template = file_prompts.get(prompt_key, "")
        if variables and "{" in template:
            try:
                return template.format(**variables)
            except Exception as e:
                logger.warning(f"Tool prompt formatting failed for {tool_file}.{prompt_key}: {e}")
        return template
