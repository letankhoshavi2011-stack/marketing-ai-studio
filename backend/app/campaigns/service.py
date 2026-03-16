"""Campaign business logic."""

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.db.repositories import CampaignRepository, ConversationRepository, VersionRepository
from app.models.campaign import CampaignDoc, CampaignStatus
from app.models.conversation import ConversationDoc
from app.models.version import VersionDoc


class CampaignService:
    """Manages campaign lifecycle operations within a workspace."""

    def __init__(self, db: AsyncIOMotorDatabase):
        self.repo = CampaignRepository(db)
        self.conv_repo = ConversationRepository(db)
        self.version_repo = VersionRepository(db)

    async def create_campaign(self, workspace_id: str, user_id: str, name: str) -> dict:
        """Create a campaign with initial conversation and version 0."""
        campaign = CampaignDoc(workspace_id=workspace_id, user_id=user_id, name=name)
        data = campaign.model_dump(by_alias=True)
        await self.repo.create(data)

        # Create the conversation document for this campaign
        conv = ConversationDoc(
            campaign_id=data["uuid"],
            workspace_id=workspace_id,
            user_id=user_id,
        )
        await self.conv_repo.create(conv.model_dump(by_alias=True))

        # Create version 0 snapshot
        v0 = VersionDoc(
            campaign_id=data["uuid"],
            workspace_id=workspace_id,
            version_number=0,
            snapshot=campaign.brand_dna.model_dump(),
            change_description="Initial campaign creation",
            triggered_by="creation",
        )
        await self.version_repo.create(v0.model_dump(by_alias=True))

        return data

    async def list_campaigns(self, workspace_id: str) -> list[dict]:
        """List all campaigns in a workspace."""
        return await self.repo.list_by_workspace(workspace_id)

    async def get_campaign(self, campaign_uuid: str, user_id: str) -> dict | None:
        """Get a campaign by UUID. Validates user ownership."""
        campaign = await self.repo.find_by_uuid(campaign_uuid)
        if campaign and campaign.get("user_id") == user_id:
            return campaign
        return None

    async def update_campaign(self, campaign_uuid: str, user_id: str, updates: dict) -> bool:
        """Update campaign name or status."""
        campaign = await self.repo.find_by_uuid(campaign_uuid)
        if not campaign or campaign.get("user_id") != user_id:
            return False
        clean = {}
        if "name" in updates and updates["name"]:
            clean["name"] = updates["name"]
        if "status" in updates and updates["status"]:
            # Validate status
            try:
                CampaignStatus(updates["status"])
                clean["status"] = updates["status"]
            except ValueError:
                return False
        return await self.repo.update(campaign_uuid, clean) if clean else False

    async def update_brand_dna(self, campaign_uuid: str, user_id: str, dna_updates: dict) -> bool:
        """Merge updates into the campaign's brand_dna."""
        campaign = await self.repo.find_by_uuid(campaign_uuid)
        if not campaign or campaign.get("user_id") != user_id:
            return False
        current_dna = campaign.get("brand_dna", {})
        for key, value in dna_updates.items():
            if value is not None:
                current_dna[key] = value
        return await self.repo.update_brand_dna(campaign_uuid, current_dna)

    async def delete_campaign(self, campaign_uuid: str, user_id: str) -> bool:
        """Delete a campaign."""
        campaign = await self.repo.find_by_uuid(campaign_uuid)
        if not campaign or campaign.get("user_id") != user_id:
            return False
        return await self.repo.delete(campaign_uuid)
