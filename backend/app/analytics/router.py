"""Analytics API router for querying token usage and costs."""

import logging
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, Query

from app.auth.dependencies import get_current_user
from app.core.database import get_database

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/summary")
async def get_analytics_summary(
    workspace_id: str | None = Query(None),
    campaign_id: str | None = Query(None),
    days: int = Query(30, ge=1, le=365),
    user: dict = Depends(get_current_user),
):
    """Get high-level metrics (total cost, tokens, requests)."""
    db = get_database()
    
    match_query = {"user_id": user["_id"]}
    if workspace_id:
        match_query["workspace_id"] = workspace_id
    if campaign_id:
        match_query["campaign_id"] = campaign_id
        
    cutoff_date = datetime.now(timezone.utc) - timedelta(days=days)
    match_query["created_at"] = {"$gte": cutoff_date}

    pipeline = [
        {"$match": match_query},
        {
            "$group": {
                "_id": None,
                "total_cost": {"$sum": "$cost_usd"},
                "total_tokens": {
                    "$sum": {
                        "$add": [
                            {"$ifNull": ["$tokens_input", 0]},
                            {"$ifNull": ["$tokens_output", 0]}
                        ]
                    }
                },
                "total_requests": {"$sum": 1},
            }
        }
    ]

    cursor = db.analytics_logs.aggregate(pipeline)
    results = await cursor.to_list(1)
    
    if not results:
        return {"total_cost": 0.0, "total_tokens": 0, "total_requests": 0}
        
    res = results[0]
    return {
        "total_cost": round(res.get("total_cost") or 0, 4),
        "total_tokens": res.get("total_tokens") or 0,
        "total_requests": res.get("total_requests") or 0,
    }


@router.get("/timeseries")
async def get_analytics_timeseries(
    workspace_id: str | None = Query(None),
    campaign_id: str | None = Query(None),
    days: int = Query(30),
    user: dict = Depends(get_current_user),
):
    """Get daily token and cost usage for charting."""
    db = get_database()
    match_query = {"user_id": user["_id"]}
    if workspace_id: match_query["workspace_id"] = workspace_id
    if campaign_id: match_query["campaign_id"] = campaign_id
        
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)
    match_query["created_at"] = {"$gte": cutoff}

    pipeline = [
        {"$match": match_query},
        {
            "$group": {
                "_id": {
                    "$dateToString": {"format": "%Y-%m-%d", "date": "$created_at"}
                },
                "cost": {"$sum": {"$ifNull": ["$cost_usd", 0]}},
                "tokens": {
                    "$sum": {
                        "$add": [
                            {"$ifNull": ["$tokens_input", 0]},
                            {"$ifNull": ["$tokens_output", 0]}
                        ]
                    }
                },
                "avg_latency": {"$avg": "$latency_ms"},
            }
        },
        {"$sort": {"_id": 1}}
    ]

    cursor = db.analytics_logs.aggregate(pipeline)
    results = await cursor.to_list(length=100)
    
    # Format for Recharts {date, cost, tokens}
    formatted = [
        {
            "date": r["_id"],
            "cost": round(r.get("cost") or 0, 4),
            "tokens": r.get("tokens") or 0,
            "avg_latency": round(r.get("avg_latency") or 0, 2)
        }
        for r in results
    ]
    return formatted


@router.get("/agents")
async def get_agent_usage(
    workspace_id: str | None = Query(None),
    campaign_id: str | None = Query(None),
    days: int = Query(30),
    user: dict = Depends(get_current_user),
):
    """Get usage breakdown by agent."""
    db = get_database()
    match_query = {"user_id": user["_id"]}
    if workspace_id: match_query["workspace_id"] = workspace_id
    if campaign_id: match_query["campaign_id"] = campaign_id
        
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)
    match_query["created_at"] = {"$gte": cutoff}

    pipeline = [
        {"$match": match_query},
        {
            "$group": {
                "_id": "$agent_name",
                "cost": {"$sum": {"$ifNull": ["$cost_usd", 0]}},
                "tokens": {
                    "$sum": {
                        "$add": [
                            {"$ifNull": ["$tokens_input", 0]},
                            {"$ifNull": ["$tokens_output", 0]}
                        ]
                    }
                },
                "calls": {"$sum": 1},
                "avg_latency": {"$avg": "$latency_ms"},
            }
        },
        {"$sort": {"cost": -1}}
    ]

    cursor = db.analytics_logs.aggregate(pipeline)
    results = await cursor.to_list(length=100)
    
    formatted = [
        {
            "name": r.get("_id") or "Unknown",
            "cost": round(r.get("cost") or 0, 4),
            "tokens": r.get("tokens") or 0,
            "calls": r.get("calls") or 0,
            "avg_latency": round(r.get("avg_latency") or 0, 2)
        }
        for r in results
    ]
    return formatted
@router.get("/logs")
async def get_analytics_logs(
    workspace_id: str | None = Query(None),
    agent_name: str | None = Query(None),
    limit: int = Query(100, ge=1, le=1000),
    user: dict = Depends(get_current_user),
):
    """Get detailed usage logs for the dashboard table."""
    db = get_database()
    match_query = {"user_id": user["_id"]}
    
    if workspace_id:
        match_query["workspace_id"] = workspace_id
    if agent_name:
        match_query["agent_name"] = agent_name
        
    cursor = db.analytics_logs.find(match_query).sort("created_at", -1).limit(limit)
    logs = await cursor.to_list(length=limit)
    
    for log in logs:
        log["id"] = str(log.pop("_id"))
        
    return logs
