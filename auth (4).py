from fastapi import APIRouter, HTTPException, Depends, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr, constr
from supabase import create_client, Client
from supabase.lib.client_options import ClientOptions
import os
from typing import Optional
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

security = HTTPBearer()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("Missing Supabase configuration")

# Initialize Supabase client with ClientOptions
client_options = ClientOptions(
    headers={
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "apikey": SUPABASE_KEY,
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
)

supabase: Client = create_client(
    SUPABASE_URL,
    SUPABASE_KEY,
    options=client_options
)

MIN_PASSWORD_LENGTH = 8

class AuthRequest(BaseModel):
    email: EmailStr
    password: constr(min_length=MIN_PASSWORD_LENGTH)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    expires_in: Optional[int]
    refresh_token: Optional[str]
    user: dict

class UserCreateResponse(BaseModel):
    id: str
    email: str
    plan: str

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        user = supabase.auth.get_user(credentials.credentials)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        db_user = supabase.from_("users").select("*").eq("id", user.user.id).maybe_single().execute()
        if not db_user.data:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found in database",
            )
            
        return user.user
    except Exception as e:
        logger.error(f"Authentication failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

@router.post("/api/signup", response_model=UserCreateResponse)
async def signup(request: AuthRequest):
    try:
        logger.info(f"Signup attempt for email: {request.email}")
        
        existing = supabase.from_("users").select("id").eq("email", request.email).execute()
        if existing.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        auth_response = supabase.auth.sign_up({
            "email": request.email,
            "password": request.password,
            "options": {
                "data": {
                    "plan": "free"
                }
            }
        })
        
        if auth_response.get("error"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=auth_response["error"]["message"]
            )

        user = auth_response.user
        user_data = {
            "id": user.id,
            "email": request.email,
            "plan": "free"
        }
        
        db_response = supabase.from_("users").insert(user_data).execute()
        
        if db_response.error:
            supabase.auth.admin.delete_user(user.id)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create user profile"
            )

        logger.info(f"New user created: {user.id}")
        return UserCreateResponse(**user_data)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Signup error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )

@router.post("/api/signin", response_model=TokenResponse)
async def signin(request: AuthRequest):
    try:
        logger.info(f"Signin attempt for email: {request.email}")
        
        auth_response = supabase.auth.sign_in_with_password({
            "email": request.email,
            "password": request.password
        })
        
        if auth_response.get("error"):
            logger.warning(f"Failed login for {request.email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        user_data = supabase.from_("users").select("*").eq("id", auth_response.user.id).single().execute()
        
        return {
            "access_token": auth_response.session.access_token,
            "token_type": "bearer",
            "expires_in": auth_response.session.expires_in,
            "refresh_token": auth_response.session.refresh_token,
            "user": {
                **auth_response.user.model_dump(),
                **user_data.data
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Signin error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication failed"
        )

@router.post("/api/signout")
async def signout(current_user: dict = Depends(get_current_user)):
    try:
        supabase.auth.sign_out()
        return {"message": "Successfully signed out"}
    except Exception as e:
        logger.error(f"Signout error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Logout failed"
        )

@router.get("/api/me")
async def get_current_user_profile(current_user: dict = Depends(get_current_user)):
    try:
        user_data = supabase.from_("users").select("*").eq("id", current_user.id).single().execute()
        return user_data.data
    except Exception as e:
        logger.error(f"Failed to fetch user profile: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch user data"
        )