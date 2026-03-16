"""Google Cloud Storage provider — upload, download, signed URLs."""

import logging
import uuid
from datetime import timedelta
from typing import Any

from google.cloud import storage

from app.core.config import settings

logger = logging.getLogger(__name__)

_client: storage.Client | None = None
_bucket: storage.Bucket | None = None


def _is_gcs_configured() -> bool:
    """Check if Google Cloud Storage is properly configured in the environment."""
    return bool(settings.gcs_bucket_name and settings.gcs_project_id)


def _get_bucket() -> storage.Bucket:
    """Get or initialize the GCS bucket handle."""
    global _client, _bucket
    if _bucket is None:
        _client = storage.Client(project=settings.gcs_project_id)
        _bucket = _client.bucket(settings.gcs_bucket_name)
    return _bucket


async def upload_bytes(
    data: bytes,
    workspace_uuid: str,
    campaign_id: str,
    asset_type: str,
    filename: str | None = None,
    content_type: str = "image/png",
) -> dict[str, str]:
    """Upload raw bytes to GCS and return path + signed URL.

    Returns:
        {"gcs_path": "...", "gcs_url": "..."}
    """
    if not filename:
        ext = content_type.split("/")[-1]
        if ext == "jpeg": ext = "jpg"
        filename = f"{uuid.uuid4()}.{ext}"

    # Fallback to local storage if GCS is not configured
    if not _is_gcs_configured():
        import os
        local_path = os.path.join("assets", filename)
        with open(local_path, "wb") as f:
            f.write(data)
        
        local_url = f"http://localhost:{settings.port}/assets/{filename}"
        logger.info("Saved %s to local fallback: %s", asset_type, local_path)
        return {"gcs_path": filename, "gcs_url": local_url}

    gcs_path = f"{workspace_uuid}/{campaign_id}/{asset_type}/{filename}"
    bucket = _get_bucket()
    blob = bucket.blob(gcs_path)
    blob.upload_from_string(data, content_type=content_type)

    if settings.gcs_public_read:
        blob.make_public()
        public_url = blob.public_url
        logger.info("Uploaded %s to GCS (public): %s", asset_type, gcs_path)
        return {"gcs_path": gcs_path, "gcs_url": public_url}
    else:
        signed_url = blob.generate_signed_url(expiration=timedelta(days=7))
        logger.info("Uploaded %s to GCS (signed): %s", asset_type, gcs_path)
        return {"gcs_path": gcs_path, "gcs_url": signed_url}


async def upload_file(
    file_path: str,
    workspace_uuid: str,
    campaign_id: str,
    asset_type: str,
    filename: str | None = None,
    content_type: str = "image/png",
) -> dict[str, str]:
    """Upload a local file to GCS."""
    import os
    import shutil
    if not filename:
        filename = os.path.basename(file_path)

    # Fallback to local storage if GCS is not configured
    if not _is_gcs_configured():
        local_path = os.path.join("assets", filename)
        shutil.copy2(file_path, local_path)
        
        local_url = f"http://localhost:{settings.port}/assets/{filename}"
        logger.info("Saved file %s to local fallback: %s", file_path, local_path)
        return {"gcs_path": filename, "gcs_url": local_url}

    gcs_path = f"{workspace_uuid}/{campaign_id}/{asset_type}/{filename}"
    bucket = _get_bucket()
    blob = bucket.blob(gcs_path)
    blob.upload_from_filename(file_path, content_type=content_type)

    if settings.gcs_public_read:
        blob.make_public()
        public_url = blob.public_url
        logger.info("Uploaded file %s to GCS (public): %s", file_path, gcs_path)
        return {"gcs_path": gcs_path, "gcs_url": public_url}
    else:
        signed_url = blob.generate_signed_url(expiration=timedelta(days=7))
        logger.info("Uploaded file %s to GCS (signed): %s", file_path, gcs_path)
        return {"gcs_path": gcs_path, "gcs_url": signed_url}


async def get_signed_url(gcs_path: str, expiration_hours: int = 24 * 7) -> str:
    """Generate a URL for an existing GCS object (public or signed)."""
    if not _is_gcs_configured():
        # It's a local file in the assets directory
        return f"http://localhost:{settings.port}/assets/{gcs_path}"

    bucket = _get_bucket()
    blob = bucket.blob(gcs_path)

    if settings.gcs_public_read:
        if not blob.public_url:
            blob.make_public()
        return blob.public_url

    return blob.generate_signed_url(expiration=timedelta(hours=expiration_hours))


async def delete_file(gcs_path: str) -> None:
    """Delete a file from GCS."""
    if not _is_gcs_configured():
        import os
        local_path = os.path.join("assets", gcs_path)
        if os.path.exists(local_path):
            os.remove(local_path)
            logger.info("Deleted local fallback object: %s", gcs_path)
        return

    bucket = _get_bucket()
    blob = bucket.blob(gcs_path)
    blob.delete()
    logger.info("Deleted GCS object: %s", gcs_path)


async def download_bytes(gcs_path: str) -> bytes:
    """Download file contents as bytes."""
    if not _is_gcs_configured():
        import os
        local_path = os.path.join("assets", gcs_path)
        with open(local_path, "rb") as f:
            return f.read()

    bucket = _get_bucket()
    blob = bucket.blob(gcs_path)
    return blob.download_as_bytes()
