"""Seed default (system) prompts for all agents.

Loads instructions from YAML files and merges with hardcoded system prompts.
Run once on startup — idempotent (upserts by prompt_id).
"""

import logging
import yaml
import os
from datetime import datetime, timezone
from pathlib import Path

from app.models.prompt_library import PromptInDB
from app.services.prompt_utils import extract_input_variables
from app.agents.registry import registry
from app.prompts import AGENTS_DIR

logger = logging.getLogger(__name__)

# --- Hardcoded System Prompt Overrides (for complex agents) ---
SYSTEM_PROMPTS = {
    "brand_identity": (
        "You are a world-class Brand Strategist specializing in visual identity and brand architecture.\n"
        "You have deep expertise in color psychology, typography, and brand positioning.\n"
        "You ALWAYS respond with only valid JSON — no markdown, no explanation, just the raw JSON object.\n"
        "Your output must be precise, actionable, and unique to the specific business described."
    ),
    "brand_naming": "You are a professional brand namer. Return JSON.",
    "brand_voice": "You are a brand voice architect. Return JSON.",
    "tagline_slogan": "You are a master copywriter. Return JSON.",
    "target_audience": "You are a meticulous market researcher. Return JSON.",
    "brand_guardian": "You are a brand compliance auditor. Return JSON.",
}

DEFAULT_SYSTEM = "You are a specialized AI marketing agent. Follow the instructions precisely and return high-quality content."

async def seed_default_prompts() -> None:
    """Insert default system prompts if they don't already exist (idempotent)."""
    from app.core.database import get_database
    db = get_database()
    collection = db["prompt_library"]

    now = datetime.now(timezone.utc)
    inserted = 0
    updated = 0

    # 1. Gather all agents from registry
    all_agents = registry.list_agents()
    
    for agent in all_agents:
        agent_id = agent.agent_id
        prompt_id = f"default_{agent_id}"
        
        # Determine system prompt
        system_prompt = SYSTEM_PROMPTS.get(agent_id, DEFAULT_SYSTEM)
        
        # Load template from YAML if available
        yaml_path = AGENTS_DIR / f"{agent_id}.yaml"
        prompt_template = ""
        if yaml_path.exists():
            try:
                with open(yaml_path, "r", encoding="utf-8") as f:
                    data = yaml.safe_load(f)
                    prompt_template = data.get("instruction", "")
            except Exception as e:
                logger.error(f"Failed to load YAML for seeding {agent_id}: {e}")
        
        if not prompt_template:
            # Fallback if no YAML and no hardcoded (rare)
            logger.warning(f"No prompt template found for {agent_id}, skipping seed.")
            continue

        # Prepare variables
        input_vars = extract_input_variables(prompt_template)
        
        # Check if exists
        existing = await collection.find_one({"prompt_id": prompt_id})
        
        if existing:
            # Only update if it's a system default
            if existing.get("workspace_id") == "__system__" and existing.get("is_default") is True:
                changes = {}
                if existing.get("system_prompt") != system_prompt:
                    changes["system_prompt"] = system_prompt
                if existing.get("prompt_template") != prompt_template:
                    changes["prompt_template"] = prompt_template
                if existing.get("name") != agent.name:
                    changes["name"] = agent.name
                
                new_vars = [v.model_dump() for v in input_vars]
                if existing.get("input_variables") != new_vars:
                    changes["input_variables"] = new_vars

                if changes:
                    current_version = int(existing.get("version", 1))
                    changes["version"] = current_version + 1
                    changes["updated_at"] = now
                    await collection.update_one({"prompt_id": prompt_id}, {"$set": changes})
                    updated += 1
                    logger.info("Updated default prompt: %s", prompt_id)
            continue

        # Create new prompt
        prompt_doc = PromptInDB(
            prompt_id=prompt_id,
            workspace_id="__system__",
            agent_id=agent_id,
            category=agent.category,
            name=agent.name,
            description=f"Default system prompt for the {agent.name} agent.",
            system_prompt=system_prompt,
            prompt_template=prompt_template,
            input_variables=input_vars,
            is_default=True,
            is_active=True,
            model_tier="quality" if agent.category in ["brand", "strategy"] else "standard",
            temperature=0.7,
            created_by="system",
            created_at=now,
            updated_at=now,
            version=1,
        )

        await collection.insert_one(prompt_doc.model_dump())
        inserted += 1
        logger.info("Seeded default prompt: %s", prompt_id)

    logger.info("Seeded %d default prompt(s) and updated %d default prompt(s).", inserted, updated)
