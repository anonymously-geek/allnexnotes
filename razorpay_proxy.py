from fastapi import FastAPI, Request, HTTPException
import httpx
import hmac
import hashlib
import os
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST"],
    allow_headers=["*"],
)

RAZORPAY_SECRET = os.getenv("RAZORPAY_WEBHOOK_SECRET")
TARGET_WEBHOOK_URL = os.getenv("TARGET_WEBHOOK_URL")  # Your HF Space URL

@app.post("/proxy/razorpay-webhook")
async def proxy_webhook(request: Request):
    # Verify Razorpay signature first
    body_bytes = await request.body()
    signature = request.headers.get("x-razorpay-signature")
    
    if not signature:
        raise HTTPException(status_code=400, detail="Missing signature")
    
    generated_signature = hmac.new(
        bytes(RAZORPAY_SECRET, 'utf-8'),
        msg=body_bytes,
        digestmod=hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(generated_signature, signature):
        raise HTTPException(status_code=400, detail="Invalid signature")

    # Forward to target webhook
    async with httpx.AsyncClient() as client:
        try:
            headers = {
                "Content-Type": "application/json",
                "X-Forwarded-For": request.headers.get("X-Forwarded-For", ""),
                "X-Razorpay-Signature": signature
            }
            
            response = await client.post(
                TARGET_WEBHOOK_URL,
                content=body_bytes,
                headers=headers,
                timeout=10
            )
            response.raise_for_status()
            return {"status": "success"}
            
        except httpx.HTTPError as e:
            raise HTTPException(
                status_code=502,
                detail=f"Failed to forward webhook: {str(e)}"
            )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)