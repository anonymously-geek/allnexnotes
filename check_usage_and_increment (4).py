from datetime import date
from supabase import create_client
from supabase.lib.client_options import ClientOptions
import os

def check_and_increment_usage(user_id: str, feature: str):
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    client_options = ClientOptions(
        headers={
            "Authorization": f"Bearer {supabase_key}",
            "apikey": supabase_key,
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
    )
    
    supabase = create_client(
        supabase_url,
        supabase_key,
        options=client_options
    )
    
    # Fetch current usage + plan
    user = supabase.table("users").select("*").eq("id", user_id).single().execute().data
    usage = supabase.table("usage_limits").select("*").eq("user_id", user_id).eq("feature", feature).single().execute().data
    plan = user["plan"]
    reset_at = usage["reset_at"]
    used_count = usage["used_count"]

    # Fetch plan limits
    plan_limits = supabase.table("plan_limits").select("*").eq("plan", plan).single().execute().data
    allowed = plan_limits.get(f"{feature}_limit", 0)

    if date.today() >= reset_at:
        supabase.table("usage_limits").update({"used_count": 0, "reset_at": date.today()}).eq("user_id", user_id).eq("feature", feature).execute()
        used_count = 0

    if used_count >= allowed:
        raise Exception(f"{feature} limit reached for plan '{plan}'")

    # Update usage count
    supabase.table("usage_limits").update({"used_count": used_count + 1}).eq("user_id", user_id).eq("feature", feature).execute()
    return True