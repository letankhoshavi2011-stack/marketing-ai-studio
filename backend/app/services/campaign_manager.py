"""Campaign CRUD operations against SQLite."""

import logging

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from app.database import CampaignRecord, generate_uuid
from app.models.campaign import Campaign, CampaignStatus

logger = logging.getLogger(__name__)


class CampaignManager:
    """Manages campaign lifecycle in the database."""

    def __init__(self, session_factory: async_sessionmaker[AsyncSession]):
        self._session_factory = session_factory

    async def create_campaign(self, user_id: str, name: str) -> Campaign:
        """Create a new campaign."""
        campaign_id = generate_uuid()

        async with self._session_factory() as session:
            record = CampaignRecord(
                id=campaign_id,
                user_id=user_id,
                name=name,
            )
            session.add(record)
            await session.commit()
            await session.refresh(record)

            campaign = Campaign.model_validate(record)

        logger.info(f"Created campaign: {campaign_id} for user: {user_id}")
        return campaign

    async def get_campaign(self, campaign_id: str) -> Campaign | None:
        """Get a campaign by ID."""
        async with self._session_factory() as session:
            result = await session.execute(
                select(CampaignRecord).where(CampaignRecord.id == campaign_id)
            )
            record = result.scalar_one_or_none()
            if not record:
                return None
            return Campaign.model_validate(record)

    async def list_campaigns(self, user_id: str) -> list[Campaign]:
        """List all campaigns for a user."""
        async with self._session_factory() as session:
            result = await session.execute(
                select(CampaignRecord)
                .where(CampaignRecord.user_id == user_id)
                .order_by(CampaignRecord.created_at.desc())
            )
            records = result.scalars().all()
            return [Campaign.model_validate(r) for r in records]

    async def update_campaign_status(
        self, campaign_id: str, status: CampaignStatus
    ) -> Campaign | None:
        """Update a campaign's status."""
        async with self._session_factory() as session:
            await session.execute(
                update(CampaignRecord)
                .where(CampaignRecord.id == campaign_id)
                .values(status=status.value)
            )
            await session.commit()

        return await self.get_campaign(campaign_id)
