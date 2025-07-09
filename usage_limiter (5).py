from fastapi import Request, HTTPException, Depends
from datetime import datetime, date
from supabase import create_client
from supabase.lib.client_options import ClientOptions
import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# Create ClientOptions object
client_options = ClientOptions(
    headers={
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "apikey": SUPABASE_KEY,
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
)

supabase = create_client(
    SUPABASE_URL,
    SUPABASE_KEY,
    options=client_options
)

PLAN_LIMITS = {
    "free": {
        "summaries": {"limit": 3, "period": "day"},
        "questions": {"limit": 5, "period": "day"},
        "flashcards": {"limit": 3, "period": "day"},
        "humanize": {"limit": 10, "period": "month"},
        "uploads": {"limit": 1, "period": "day"}
    },
    "basic": {
        "summaries": {"limit": 300, "period": "month"},
        "questions": {"limit": 100, "period": "month"},
        "flashcards": {"limit": 300, "period": "month"},
        "humanize": {"limit": 20, "period": "month"},
        "uploads": {"limit": 15, "period": "day"}
    },
    "premium": {
        "summaries": {"limit": 900, "period": "month"},
        "questions": {"limit": 650, "period": "month"},
        "flashcards": {"limit": 900, "period": "month"},
        "humanize": {"limit": 200, "period": "month"},
        "uploads": {"limit": 50, "period": "day"}
    },
    "pro": {
        "summaries": {"limit": float('inf'), "period": "month"},
        "questions": {"limit": float('inf'), "period": "month"},
        "flashcards": {"limit": float('inf'), "period": "month"},
        "humanize": {"limit": float('inf'), "period": "month"},
        "uploads": {"limit": float('inf'), "period": "day"}
    }
}

def enforce_usage_limit(feature: str):
    async def limiter(request: Request):
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
        
        jwt = auth_header.split(" ")[1]
        
        try:
            user = supabase.auth.get_user(jwt)
            if not user:
                raise HTTPException(status_code=401, detail="Invalid user")
            
            user_id = user.user.id
            
            user_data = supabase.from_("users").select("plan").eq("id", user_id).single().execute()
            if not user_data.data:
                raise HTTPException(status_code=404, detail="User not found")
            
            plan = user_data.data.get("plan", "free")
            feature_limit = PLAN_LIMITS.get(plan, {}).get(feature, {})
            
            if not feature_limit:
                raise HTTPException(status_code=403, detail="Feature not available for your plan")
            
            today = date.today()
            usage_data = supabase.from_("usage_limits").select("*").eq("user_id", user_id).eq("feature", feature).maybe_single().execute()
            
            reset_date = today
            if feature_limit["period"] == "month":
                reset_date = date(today.year, today.month, 1)
            
            if not usage_data.data or (usage_data.data.get("reset_at") and date.fromisoformat(usage_data.data.get("reset_at")) < reset_date):
                supabase.from_("usage_limits").upsert({
                    "user_id": user_id,
                    "feature": feature,
                    "used_count": 0,
                    "reset_at": reset_date.isoformat()
                }).execute()
                used_count = 0
            else:
                used_count = usage_data.data.get("used_count", 0)
            
            if used_count >= feature_limit["limit"] and feature_limit["limit"] != float('inf'):
                raise HTTPException(
                    status_code=429, 
                    detail=f"{feature} limit reached for your {plan} plan ({used_count}/{feature_limit['limit']} {feature_limit['period']}ly). Upgrade for more capacity."
                )
            
            supabase.from_("usage_limits").upsert({
                "user_id": user_id,
                "feature": feature,
                "used_count": used_count + 1,
                "reset_at": reset_date.isoformat()
            }).execute()
            
            return user_id
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Usage limiter error: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")
    
    return Depends(limiter)