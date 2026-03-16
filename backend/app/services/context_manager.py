"""Versioned context management — the core state backbone of the platform."""

import json
import logging
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from app.database import ContextVersionRecord
from app.models.context import BrandContext, ContextDelta, ContextVersion

logger = logging.getLogger(__name__)

# Maps tool-written state keys to BrandContext field names.
# Tools write structured data via tool_context.state[key] = value.
# This is DIFFERENT from agent output_keys which contain text responses.
TOOL_STATE_TO_FIELD: dict[str, str] = {
    "brand_names": "brand_names",           # from generate_brand_names tool
    "taglines": "taglines",                 # from generate_taglines tool
    "logo_concepts": "logo_concepts",       # from generate_logo_description tool
    "marketing_content": "content",         # from generate_marketing_content tool
    "campaign_concept": "campaign_concepts", # from generate_campaign_concept tool
    "generated_images": "images",           # from generate_image_from_prompt tool
    "generated_videos": "videos",           # from generate_video_from_prompt tool
    "media_adaptations": "visual_style",    # from adapt_media_for_platform tool
}

# BrandContext field types for validation during extraction
FIELD_EXPECTED_TYPE: dict[str, type] = {
    "brand_names": list,
    "taglines": list,
    "brand_identity": dict,
    "logo_concepts": list,
    "visual_style": dict,
    "campaign_concepts": list,
    "content": dict,
    "images": list,
    "videos": list,
    "seo_strategy": dict,
    "compliance_notes": list,
}


class ContextManager:
    """Manages versioned, immutable context snapshots for campaigns."""

    def __init__(self, session_factory: async_sessionmaker[AsyncSession]):
        self._session_factory = session_factory

    async def create_initial_context(self, campaign_id: str) -> ContextVersion:
        """Create version 0 with an empty BrandContext."""
        context = BrandContext()
        version = ContextVersion(
            version_number=0,
            campaign_id=campaign_id,
            context=context,
            delta=None,
        )

        async with self._session_factory() as session:
            record = ContextVersionRecord(
                campaign_id=campaign_id,
                version_number=0,
                context_json=context.model_dump_json(),
                delta_json=None,
            )
            session.add(record)
            await session.commit()

        logger.info(f"Created initial context for campaign {campaign_id}")
        return version

    async def get_current_context(self, campaign_id: str) -> ContextVersion | None:
        """Fetch the latest version of the context for a campaign."""
        async with self._session_factory() as session:
            result = await session.execute(
                select(ContextVersionRecord)
                .where(ContextVersionRecord.campaign_id == campaign_id)
                .order_by(ContextVersionRecord.version_number.desc())
                .limit(1)
            )
            record = result.scalar_one_or_none()

            if not record:
                return None

            return ContextVersion(
                version_number=record.version_number,
                campaign_id=record.campaign_id,
                context=BrandContext.model_validate_json(record.context_json),
                delta=ContextDelta.model_validate_json(record.delta_json) if record.delta_json else None,
                created_at=record.created_at,
            )

    async def apply_delta(
        self, campaign_id: str, delta: ContextDelta
    ) -> ContextVersion:
        """Apply a delta to the current context, creating a new immutable version."""
        current = await self.get_current_context(campaign_id)
        if not current:
            current = await self.create_initial_context(campaign_id)

        # Apply delta to produce new context
        new_context = delta.apply_to(current.context)
        new_version_number = current.version_number + 1

        version = ContextVersion(
            version_number=new_version_number,
            campaign_id=campaign_id,
            context=new_context,
            delta=delta,
        )

        async with self._session_factory() as session:
            record = ContextVersionRecord(
                campaign_id=campaign_id,
                version_number=new_version_number,
                context_json=new_context.model_dump_json(),
                delta_json=delta.model_dump_json(),
            )
            session.add(record)
            await session.commit()

        logger.info(f"Created context version {new_version_number} for campaign {campaign_id}")
        return version

    async def get_version_history(
        self, campaign_id: str
    ) -> list[ContextVersion]:
        """Get all context versions for a campaign."""
        async with self._session_factory() as session:
            result = await session.execute(
                select(ContextVersionRecord)
                .where(ContextVersionRecord.campaign_id == campaign_id)
                .order_by(ContextVersionRecord.version_number.asc())
            )
            records = result.scalars().all()

            return [
                ContextVersion(
                    version_number=r.version_number,
                    campaign_id=r.campaign_id,
                    context=BrandContext.model_validate_json(r.context_json),
                    delta=ContextDelta.model_validate_json(r.delta_json) if r.delta_json else None,
                    created_at=r.created_at,
                )
                for r in records
            ]

    @staticmethod
    def sync_context_to_adk_state(
        context: BrandContext, state: dict[str, Any]
    ) -> None:
        """Copy BrandContext fields into ADK session state for template injection.

        ALL fields are set (even empty ones) because ADK's {template} injection
        raises an error if a referenced variable is missing from state.
        """
        data = context.model_dump()
        for key, value in data.items():
            if isinstance(value, (dict, list)):
                state[key] = json.dumps(value)
            else:
                state[key] = str(value) if value else ""

        # Full context summary for agents that need it
        state["context_summary"] = context.model_dump_json()

    @staticmethod
    def get_default_state(campaign_id: str = "") -> dict[str, Any]:
        """Return default values for ALL state keys referenced by agent instructions.

        This prevents ADK 'Context variable not found' errors for {template} vars.
        """
        # BrandContext fields
        defaults: dict[str, Any] = {}
        for key, value in BrandContext().model_dump().items():
            if isinstance(value, (dict, list)):
                defaults[key] = json.dumps(value)
            else:
                defaults[key] = str(value) if value else ""

        # Agent output_keys (set after agents run)
        agent_output_keys = [
            "detected_intent",
            "requirements",
            "conversation_state",
            "brand_names_output",
            "taglines_output",
            "brand_identity_output",
            "logo_concepts_output",
            "visual_style_output",
            "campaign_concept_output",
            "content_output",
            "images_output",
            "video_output",
            "adapted_media_output",
            "compliance_result",
            "feedback_delta",
            "version_info",
            "optimization_suggestions",
        ]
        for key in agent_output_keys:
            defaults[key] = ""

        # Control variables
        defaults["context_summary"] = BrandContext().model_dump_json()
        defaults["current_version"] = "0"
        defaults["campaign_id"] = campaign_id

        return defaults

    @staticmethod
    def extract_outputs_from_adk_state(
        state: dict[str, Any]
    ) -> ContextDelta:
        """Read tool-written state keys and build a validated ContextDelta.

        Tools write structured data to state (lists, dicts) via tool_context.state.
        Agent output_keys contain text responses and are NOT used here.
        """
        changes: dict[str, Any] = {}

        for state_key, field_name in TOOL_STATE_TO_FIELD.items():
            value = state.get(state_key)
            if value is None:
                continue

            # Parse JSON strings back to structured data
            if isinstance(value, str):
                if not value or value == "[]" or value == "{}":
                    continue
                try:
                    value = json.loads(value)
                except json.JSONDecodeError:
                    # Not valid JSON — skip, this is likely a default or text
                    continue

            # Validate type matches what BrandContext expects
            expected_type = FIELD_EXPECTED_TYPE.get(field_name)
            if expected_type and not isinstance(value, expected_type):
                logger.warning(
                    f"Skipping state key '{state_key}': expected {expected_type.__name__}, "
                    f"got {type(value).__name__}"
                )
                continue

            # Skip empty containers
            if isinstance(value, (list, dict)) and not value:
                continue

            changes[field_name] = value

        return ContextDelta(changes=changes)
