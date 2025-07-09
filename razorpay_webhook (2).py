from fastapi import APIRouter, Request, HTTPException
import hmac
import hashlib
import json
import os
from datetime import datetime
from supabase import create_client
from supabase.lib.client_options import ClientOptions

router = APIRouter()

# Initialize Supabase client
client_options = ClientOptions(
    headers={
        "Authorization": f"Bearer {os.getenv('SUPABASE_SERVICE_ROLE_KEY')}",
        "apikey": os.getenv("SUPABASE_SERVICE_ROLE_KEY"),
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
)

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE_KEY"),
    options=client_options
)

@router.post("/api/razorpay-webhook")
async def razorpay_webhook(request: Request):
    # Get the forwarded signature from proxy
    signature = request.headers.get("x-razorpay-signature")
    if not signature:
        raise HTTPException(status_code=400, detail="Missing signature header")

    # Verify the forwarded request
    body_bytes = await request.body()
    generated_signature = hmac.new(
        bytes(os.getenv("RAZORPAY_WEBHOOK_SECRET"), 'utf-8'),
        msg=body_bytes,
        digestmod=hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(generated_signature, signature):
        raise HTTPException(status_code=400, detail="Invalid signature")

    # Process payload
    payload = json.loads(body_bytes.decode("utf-8"))
    event = payload.get("event")
    subscription = payload.get("payload", {}).get("subscription", {}).get("entity", {})
    
    # Validate required fields
    required_fields = ["customer_id", "id", "plan_id", "status", "start_at", "current_end"]
    if not all(field in subscription for field in required_fields):
        raise HTTPException(status_code=400, detail="Missing required subscription fields")

    # Map plan IDs
    PLAN_LOOKUP = {
        'plan_QmHPGorBzs8DcF': 'pro',
        'plan_QmHzCbr1d8V0Z': 'premium',
        'plan_QmHiWLzGOH65E4': 'basic'
    }
    internal_plan = PLAN_LOOKUP.get(subscription["plan_id"])
    
    if not internal_plan:
        raise HTTPException(status_code=400, detail="Unrecognized plan ID")

    try:
        # Update subscription
        supabase.table("subscriptions").upsert({
            "id": subscription["id"],
            "user_id": subscription["customer_id"],
            "plan": internal_plan,
            "status": subscription["status"],
            "started_at": datetime.utcfromtimestamp(subscription["start_at"]).isoformat(),
            "current_end": datetime.utcfromtimestamp(subscription["current_end"]).isoformat()
        }).execute()

        # Update user plan
        supabase.table("users").update({
            "plan": internal_plan,
            "plan_updated_at": datetime.utcnow().isoformat()
        }).eq("id", subscription["customer_id"]).execute()

        # Reset usage limits for upgraded users
        if event == "subscription.activated":
            supabase.table("usage_limits").update({
                "used_count": 0,
                "reset_at": datetime.utcnow().date().isoformat()
            }).eq("user_id", subscription["customer_id"]).execute()

        return {"status": "success"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database update failed: {str(e)}")