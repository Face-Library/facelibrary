"""Face Library MVP -- Secure Likeness Licensing Platform API.

Core features:
- Talent uploads face/likeness images
- Clients submit licensing requests
- Manual admin review workflow
- One AI agent for IP/contract generation, validation, improvement
- Three licensing categories (Standard, Exclusive, Time-Limited)
- Stripe payment integration
- Watermark tracking placeholder
"""
import os
import sys
import json
import hashlib
import secrets
import uuid
from datetime import datetime
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Depends, Request, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

sys.path.insert(0, os.path.dirname(__file__))

from models import (
    init_db, seed_demo_data, get_db, User, TalentProfile, ClientProfile, AgentProfile,
    TalentAgentLink, LicenseRequest, Contract, AuditLog, WatermarkTracking,
    LicenseStatus, LicenseType,
)
from agents.contract import ContractAgent

contract_agent = ContractAgent()


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    seed_demo_data()
    yield


app = FastAPI(
    title="Face Library MVP API",
    description="Secure Likeness Licensing Platform -- MVP",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -- Helpers -----------------------------------------------------------------

def _hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    h = hashlib.sha256((salt + password).encode()).hexdigest()
    return f"{salt}:{h}"


def _verify_password(password: str, stored: str) -> bool:
    try:
        salt, h = stored.split(":")
        return hashlib.sha256((salt + password).encode()).hexdigest() == h
    except Exception:
        return False


def _log_audit(db: Session, license_id: int | None, agent: str, action: str, details: str,
               model: str | None = None, tokens: int | None = None):
    db.add(AuditLog(
        license_id=license_id, agent_name=agent, action=action,
        details=details, model_used=model, tokens_used=tokens,
    ))
    db.commit()


# -- Request Models ----------------------------------------------------------

class SignupRequest(BaseModel):
    email: str
    password: str
    name: str
    role: str  # talent, client, agent
    company: str | None = None

class LoginRequest(BaseModel):
    email: str
    password: str

class TalentRegisterRequest(BaseModel):
    user_id: int
    bio: str | None = None
    stage_name: str | None = None
    categories: str | None = None
    nationality: str | None = None
    ethnicity: str | None = None
    gender: str | None = None
    age: int | None = None
    restricted_categories: str | None = None
    min_price_per_use: float = 100.0
    max_license_duration_days: int = 365
    allow_ai_training: bool = False
    geo_scope: str = "global"
    instagram: str | None = None
    tiktok: str | None = None
    youtube: str | None = None
    has_agent: bool = False
    agent_email: str | None = None

class ClientRegisterRequest(BaseModel):
    user_id: int
    company_name: str
    industry: str | None = None
    website: str | None = None
    phone: str | None = None
    role_title: str | None = None
    referral_source: str | None = None
    ai_tools_used: str | None = None
    description: str | None = None

class AgentRegisterRequest(BaseModel):
    user_id: int
    agency_name: str
    website: str | None = None
    portfolio_url: str | None = None
    instagram: str | None = None
    industry: str | None = None
    country: str | None = None

class LicenseRequestCreate(BaseModel):
    client_id: int
    talent_id: int
    license_type: str = "standard"
    use_case: str
    campaign_description: str | None = None
    desired_duration_days: int = 30
    desired_regions: str | None = None
    content_type: str = "image"
    exclusivity: bool = False
    proposed_price: float | None = None

class ReviewRequest(BaseModel):
    status: str  # under_review, approved, rejected
    admin_notes: str | None = None
    reviewed_by: str | None = None

class ContractImproveRequest(BaseModel):
    feedback: str

class TalentPreferencesUpdate(BaseModel):
    restricted_categories: str | None = None
    min_price_per_use: float | None = None
    max_license_duration_days: int | None = None
    allow_ai_training: bool | None = None
    allow_video_generation: bool | None = None
    allow_image_generation: bool | None = None
    geo_scope: str | None = None
    approval_mode: str | None = None
    instagram: str | None = None
    tiktok: str | None = None
    youtube: str | None = None

class TalentAgentLinkRequest(BaseModel):
    talent_id: int
    agent_id: int
    approval_type: str = "both_required"


# ============================================================================
# AUTH
# ============================================================================

@app.post("/api/auth/signup")
def signup(req: SignupRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == req.email).first():
        raise HTTPException(400, "Email already registered")

    role = req.role.lower()
    if role == "brand":
        role = "client"
    if role not in ("talent", "client", "agent"):
        raise HTTPException(400, "Invalid role")

    user = User(
        email=req.email, name=req.name, role=role,
        company=req.company, password_hash=_hash_password(req.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"id": user.id, "email": user.email, "name": user.name, "role": user.role}


@app.post("/api/auth/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not _verify_password(req.password, user.password_hash or ""):
        raise HTTPException(401, "Invalid credentials")
    return {"id": user.id, "email": user.email, "name": user.name, "role": user.role,
            "company": user.company}


@app.get("/api/auth/me/{user_id}")
def get_me(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")
    return {"id": user.id, "email": user.email, "name": user.name, "role": user.role,
            "company": user.company}


# ============================================================================
# TALENT
# ============================================================================

@app.post("/api/talent/register")
def register_talent(req: TalentRegisterRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == req.user_id).first()
    if not user:
        raise HTTPException(404, "User not found")

    profile = TalentProfile(
        user_id=req.user_id, bio=req.bio, stage_name=req.stage_name,
        categories=req.categories, nationality=req.nationality,
        ethnicity=req.ethnicity, gender=req.gender, age=req.age,
        restricted_categories=req.restricted_categories,
        min_price_per_use=req.min_price_per_use,
        max_license_duration_days=req.max_license_duration_days,
        allow_ai_training=req.allow_ai_training, geo_scope=req.geo_scope,
        instagram=req.instagram, tiktok=req.tiktok, youtube=req.youtube,
        has_agent=req.has_agent, agent_email=req.agent_email,
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return {"id": profile.id, "user_id": profile.user_id, "name": user.name}


@app.post("/api/talent/{talent_id}/upload-image")
async def upload_talent_image(talent_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Upload a talent's face/likeness photo."""
    talent = db.query(TalentProfile).filter(TalentProfile.id == talent_id).first()
    if not talent:
        raise HTTPException(404, "Talent not found")

    # Save to local uploads directory (in production, use Supabase Storage)
    upload_dir = os.path.join(os.path.dirname(__file__), "..", "uploads", "talent")
    os.makedirs(upload_dir, exist_ok=True)

    ext = file.filename.split(".")[-1] if file.filename and "." in file.filename else "jpg"
    filename = f"talent_{talent_id}_{uuid.uuid4().hex[:8]}.{ext}"
    filepath = os.path.join(upload_dir, filename)

    contents = await file.read()
    with open(filepath, "wb") as f:
        f.write(contents)

    image_url = f"/uploads/talent/{filename}"
    talent.image_url = image_url
    db.commit()

    return {"image_url": image_url, "filename": filename}


@app.get("/api/talent/{talent_id}")
def get_talent(talent_id: int, db: Session = Depends(get_db)):
    talent = db.query(TalentProfile).filter(TalentProfile.id == talent_id).first()
    if not talent:
        raise HTTPException(404, "Talent not found")
    user = db.query(User).filter(User.id == talent.user_id).first()

    # Check for linked agent
    link = db.query(TalentAgentLink).filter(TalentAgentLink.talent_id == talent.id).first()
    agent_info = None
    if link:
        agent = db.query(AgentProfile).filter(AgentProfile.id == link.agent_id).first()
        if agent:
            agent_user = db.query(User).filter(User.id == agent.user_id).first()
            agent_info = {
                "id": agent.id, "agency_name": agent.agency_name,
                "name": agent_user.name if agent_user else None,
                "approval_type": link.approval_type,
            }

    return {
        "id": talent.id, "user_id": talent.user_id,
        "name": user.name if user else None, "email": user.email if user else None,
        "bio": talent.bio, "stage_name": talent.stage_name,
        "categories": talent.categories, "nationality": talent.nationality,
        "ethnicity": talent.ethnicity, "gender": talent.gender, "age": talent.age,
        "image_url": talent.image_url, "avatar_url": talent.avatar_url,
        "restricted_categories": talent.restricted_categories,
        "min_price_per_use": talent.min_price_per_use,
        "max_license_duration_days": talent.max_license_duration_days,
        "allow_ai_training": talent.allow_ai_training,
        "allow_video_generation": talent.allow_video_generation,
        "allow_image_generation": talent.allow_image_generation,
        "geo_scope": talent.geo_scope, "approval_mode": talent.approval_mode,
        "instagram": talent.instagram, "tiktok": talent.tiktok, "youtube": talent.youtube,
        "has_agent": talent.has_agent, "agent_email": talent.agent_email,
        "linked_agent": agent_info,
        "watermark_id": talent.watermark_id,
        "created_at": str(talent.created_at),
    }


@app.put("/api/talent/{talent_id}/preferences")
def update_talent_preferences(talent_id: int, req: TalentPreferencesUpdate, db: Session = Depends(get_db)):
    talent = db.query(TalentProfile).filter(TalentProfile.id == talent_id).first()
    if not talent:
        raise HTTPException(404, "Talent not found")
    for field, value in req.model_dump(exclude_none=True).items():
        setattr(talent, field, value)
    db.commit()
    return {"status": "updated"}


@app.get("/api/talent/{talent_id}/requests")
def get_talent_requests(talent_id: int, db: Session = Depends(get_db)):
    requests = db.query(LicenseRequest).filter(LicenseRequest.talent_id == talent_id).all()
    result = []
    for r in requests:
        client = db.query(ClientProfile).filter(ClientProfile.id == r.client_id).first()
        client_user = db.query(User).filter(User.id == client.user_id).first() if client else None
        result.append({
            "id": r.id, "status": r.status, "license_type": r.license_type,
            "use_case": r.use_case, "content_type": r.content_type,
            "desired_duration_days": r.desired_duration_days,
            "proposed_price": r.proposed_price,
            "client_name": client.company_name if client else None,
            "client_contact": client_user.name if client_user else None,
            "payment_status": r.payment_status,
            "created_at": str(r.created_at),
        })
    return result


@app.get("/api/talents")
def list_talents(db: Session = Depends(get_db)):
    talents = db.query(TalentProfile).all()
    result = []
    for t in talents:
        user = db.query(User).filter(User.id == t.user_id).first()
        result.append({
            "id": t.id, "user_id": t.user_id,
            "name": user.name if user else None,
            "stage_name": t.stage_name, "bio": t.bio,
            "categories": t.categories, "gender": t.gender,
            "image_url": t.image_url, "avatar_url": t.avatar_url,
            "min_price_per_use": t.min_price_per_use,
            "instagram": t.instagram, "tiktok": t.tiktok, "youtube": t.youtube,
            "geo_scope": t.geo_scope,
        })
    return result


# ============================================================================
# CLIENT (renamed from Brand)
# ============================================================================

@app.post("/api/client/register")
def register_client(req: ClientRegisterRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == req.user_id).first()
    if not user:
        raise HTTPException(404, "User not found")

    profile = ClientProfile(
        user_id=req.user_id, company_name=req.company_name,
        industry=req.industry, website=req.website, phone=req.phone,
        role_title=req.role_title, referral_source=req.referral_source,
        ai_tools_used=req.ai_tools_used, description=req.description,
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return {"id": profile.id, "user_id": profile.user_id, "company_name": profile.company_name}


@app.get("/api/client/{client_id}")
def get_client(client_id: int, db: Session = Depends(get_db)):
    client = db.query(ClientProfile).filter(ClientProfile.id == client_id).first()
    if not client:
        raise HTTPException(404, "Client not found")
    user = db.query(User).filter(User.id == client.user_id).first()
    return {
        "id": client.id, "user_id": client.user_id,
        "name": user.name if user else None,
        "company_name": client.company_name, "industry": client.industry,
        "website": client.website, "phone": client.phone,
        "role_title": client.role_title, "referral_source": client.referral_source,
        "ai_tools_used": client.ai_tools_used, "description": client.description,
    }


@app.get("/api/client/{client_id}/requests")
def get_client_requests(client_id: int, db: Session = Depends(get_db)):
    requests = db.query(LicenseRequest).filter(LicenseRequest.client_id == client_id).all()
    result = []
    for r in requests:
        talent = db.query(TalentProfile).filter(TalentProfile.id == r.talent_id).first()
        talent_user = db.query(User).filter(User.id == talent.user_id).first() if talent else None
        result.append({
            "id": r.id, "status": r.status, "license_type": r.license_type,
            "use_case": r.use_case, "content_type": r.content_type,
            "desired_duration_days": r.desired_duration_days,
            "proposed_price": r.proposed_price,
            "talent_name": talent_user.name if talent_user else None,
            "talent_image": talent.image_url if talent else None,
            "payment_status": r.payment_status,
            "contract_generated": r.contract_generated,
            "created_at": str(r.created_at),
        })
    return result


# Keep backward-compatible brand endpoints
@app.post("/api/brand/register")
def register_brand_compat(req: ClientRegisterRequest, db: Session = Depends(get_db)):
    return register_client(req, db)

@app.get("/api/brand/{client_id}")
def get_brand_compat(client_id: int, db: Session = Depends(get_db)):
    return get_client(client_id, db)

@app.get("/api/brand/{client_id}/requests")
def get_brand_requests_compat(client_id: int, db: Session = Depends(get_db)):
    return get_client_requests(client_id, db)


# ============================================================================
# AGENT (Talent Agency)
# ============================================================================

@app.post("/api/agent/register")
def register_agent(req: AgentRegisterRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == req.user_id).first()
    if not user:
        raise HTTPException(404, "User not found")

    profile = AgentProfile(
        user_id=req.user_id, agency_name=req.agency_name,
        website=req.website, portfolio_url=req.portfolio_url,
        instagram=req.instagram, industry=req.industry, country=req.country,
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return {"id": profile.id, "user_id": profile.user_id, "agency_name": profile.agency_name}


@app.get("/api/agent/{agent_id}")
def get_agent(agent_id: int, db: Session = Depends(get_db)):
    agent = db.query(AgentProfile).filter(AgentProfile.id == agent_id).first()
    if not agent:
        raise HTTPException(404, "Agent not found")
    user = db.query(User).filter(User.id == agent.user_id).first()

    # Get managed talents
    links = db.query(TalentAgentLink).filter(TalentAgentLink.agent_id == agent.id).all()
    managed = []
    for link in links:
        t = db.query(TalentProfile).filter(TalentProfile.id == link.talent_id).first()
        if t:
            tu = db.query(User).filter(User.id == t.user_id).first()
            managed.append({
                "id": t.id, "name": tu.name if tu else None,
                "categories": t.categories, "geo_scope": t.geo_scope,
                "approval_type": link.approval_type,
                "image_url": t.image_url,
            })

    return {
        "id": agent.id, "user_id": agent.user_id,
        "name": user.name if user else None,
        "agency_name": agent.agency_name, "website": agent.website,
        "portfolio_url": agent.portfolio_url, "instagram": agent.instagram,
        "industry": agent.industry, "country": agent.country,
        "managed_talents": managed,
    }


@app.get("/api/agent/{agent_id}/requests")
def get_agent_requests(agent_id: int, db: Session = Depends(get_db)):
    links = db.query(TalentAgentLink).filter(TalentAgentLink.agent_id == agent_id).all()
    talent_ids = [link.talent_id for link in links]
    if not talent_ids:
        return []
    requests = db.query(LicenseRequest).filter(LicenseRequest.talent_id.in_(talent_ids)).all()
    result = []
    for r in requests:
        talent = db.query(TalentProfile).filter(TalentProfile.id == r.talent_id).first()
        talent_user = db.query(User).filter(User.id == talent.user_id).first() if talent else None
        client = db.query(ClientProfile).filter(ClientProfile.id == r.client_id).first()
        result.append({
            "id": r.id, "status": r.status, "license_type": r.license_type,
            "use_case": r.use_case,
            "talent_name": talent_user.name if talent_user else None,
            "client_name": client.company_name if client else None,
            "proposed_price": r.proposed_price,
            "created_at": str(r.created_at),
        })
    return result


# ============================================================================
# TALENT-AGENT LINKING
# ============================================================================

@app.post("/api/talent-agent/link")
def link_talent_agent(req: TalentAgentLinkRequest, db: Session = Depends(get_db)):
    existing = db.query(TalentAgentLink).filter(
        TalentAgentLink.talent_id == req.talent_id,
        TalentAgentLink.agent_id == req.agent_id,
    ).first()
    if existing:
        raise HTTPException(400, "Link already exists")

    link = TalentAgentLink(
        talent_id=req.talent_id, agent_id=req.agent_id,
        approval_type=req.approval_type,
    )
    db.add(link)

    talent = db.query(TalentProfile).filter(TalentProfile.id == req.talent_id).first()
    if talent:
        talent.has_agent = True
    db.commit()
    return {"id": link.id, "status": "linked"}


@app.delete("/api/talent-agent/link/{link_id}")
def unlink_talent_agent(link_id: int, db: Session = Depends(get_db)):
    link = db.query(TalentAgentLink).filter(TalentAgentLink.id == link_id).first()
    if not link:
        raise HTTPException(404, "Link not found")
    db.delete(link)
    db.commit()
    return {"status": "unlinked"}


@app.get("/api/talent-agent/links/{agent_id}")
def get_agent_links(agent_id: int, db: Session = Depends(get_db)):
    links = db.query(TalentAgentLink).filter(TalentAgentLink.agent_id == agent_id).all()
    return [{"id": l.id, "talent_id": l.talent_id, "agent_id": l.agent_id,
             "approval_type": l.approval_type} for l in links]


# ============================================================================
# LICENSING
# ============================================================================

@app.post("/api/licensing/request")
def create_license_request(req: LicenseRequestCreate, db: Session = Depends(get_db)):
    talent = db.query(TalentProfile).filter(TalentProfile.id == req.talent_id).first()
    if not talent:
        raise HTTPException(404, "Talent not found")
    client = db.query(ClientProfile).filter(ClientProfile.id == req.client_id).first()
    if not client:
        raise HTTPException(404, "Client not found")

    price = req.proposed_price or talent.min_price_per_use
    license_req = LicenseRequest(
        client_id=req.client_id, talent_id=req.talent_id,
        license_type=req.license_type, use_case=req.use_case,
        campaign_description=req.campaign_description,
        desired_duration_days=req.desired_duration_days,
        desired_regions=req.desired_regions, content_type=req.content_type,
        exclusivity=req.exclusivity, proposed_price=price,
        license_token=f"FL-LIC-{uuid.uuid4().hex[:8].upper()}",
    )
    db.add(license_req)
    db.commit()
    db.refresh(license_req)

    _log_audit(db, license_req.id, "system", "license_created",
               f"License request created by {client.company_name} for talent #{req.talent_id}")

    return {"id": license_req.id, "status": license_req.status, "license_token": license_req.license_token}


@app.post("/api/licensing/{license_id}/generate-contract")
def generate_contract(license_id: int, db: Session = Depends(get_db)):
    """Run the contract agent to generate an IP licensing agreement."""
    lic = db.query(LicenseRequest).filter(LicenseRequest.id == license_id).first()
    if not lic:
        raise HTTPException(404, "License not found")

    talent = db.query(TalentProfile).filter(TalentProfile.id == lic.talent_id).first()
    talent_user = db.query(User).filter(User.id == talent.user_id).first() if talent else None
    client = db.query(ClientProfile).filter(ClientProfile.id == lic.client_id).first()

    talent_data = {
        "name": talent_user.name if talent_user else "Unknown",
        "bio": talent.bio if talent else None,
        "restricted_categories": talent.restricted_categories if talent else None,
        "min_price_per_use": talent.min_price_per_use if talent else 100,
        "allow_ai_training": talent.allow_ai_training if talent else False,
    }
    client_data = {
        "company_name": client.company_name if client else "Unknown",
        "industry": client.industry if client else None,
    }
    request_data = {
        "license_type": lic.license_type,
        "use_case": lic.use_case,
        "content_type": lic.content_type,
        "desired_duration_days": lic.desired_duration_days,
        "desired_regions": lic.desired_regions,
        "exclusivity": lic.exclusivity,
        "proposed_price": lic.proposed_price,
    }

    result = contract_agent.generate_contract(talent_data, client_data, request_data)

    # Save contract
    contract = Contract(
        license_id=license_id,
        license_type=lic.license_type,
        contract_text=result["contract_text"],
        generated_by=result["agent"],
        model_used=result["model"],
        uk_law_compliant=True,
    )
    db.add(contract)
    lic.contract_generated = True
    lic.status = LicenseStatus.UNDER_REVIEW.value
    db.commit()

    _log_audit(db, license_id, "contract_agent", "contract_generated",
               f"IP licensing agreement generated ({result['model']})",
               result["model"], result["tokens_used"])

    return {
        "status": "contract_generated",
        "license_type": lic.license_type,
        "model": result["model"],
        "tokens_used": result["tokens_used"],
    }


@app.post("/api/licensing/{license_id}/validate-contract")
def validate_contract(license_id: int, db: Session = Depends(get_db)):
    """Run the contract agent to validate an existing contract."""
    contract = db.query(Contract).filter(Contract.license_id == license_id).order_by(Contract.id.desc()).first()
    if not contract:
        raise HTTPException(404, "No contract found for this license")

    result = contract_agent.validate_contract(contract.contract_text)

    _log_audit(db, license_id, "contract_agent", "contract_validated",
               f"Contract validation: {json.dumps(result.get('result', {}))[:500]}",
               result["model"], result["tokens_used"])

    return {"validation": result.get("result"), "model": result["model"]}


@app.post("/api/licensing/{license_id}/improve-contract")
def improve_contract(license_id: int, req: ContractImproveRequest, db: Session = Depends(get_db)):
    """Improve a contract based on user feedback."""
    contract = db.query(Contract).filter(Contract.license_id == license_id).order_by(Contract.id.desc()).first()
    if not contract:
        raise HTTPException(404, "No contract found")

    result = contract_agent.improve_contract(contract.contract_text, req.feedback)

    # Save as new version
    new_contract = Contract(
        license_id=license_id,
        license_type=contract.license_type,
        contract_text=result["contract_text"],
        generated_by=result["agent"],
        model_used=result["model"],
        uk_law_compliant=True,
    )
    db.add(new_contract)
    db.commit()

    _log_audit(db, license_id, "contract_agent", "contract_improved",
               f"Contract improved based on feedback: {req.feedback[:200]}",
               result["model"], result["tokens_used"])

    return {"status": "improved", "model": result["model"]}


@app.post("/api/licensing/{license_id}/review")
def review_license(license_id: int, req: ReviewRequest, db: Session = Depends(get_db)):
    """Manual admin review of a license request."""
    lic = db.query(LicenseRequest).filter(LicenseRequest.id == license_id).first()
    if not lic:
        raise HTTPException(404, "License not found")

    valid_statuses = ["under_review", "awaiting_approval", "approved", "rejected"]
    if req.status not in valid_statuses:
        raise HTTPException(400, f"Invalid status. Must be one of: {valid_statuses}")

    lic.status = req.status
    lic.admin_notes = req.admin_notes
    lic.reviewed_by = req.reviewed_by
    lic.reviewed_at = datetime.utcnow()
    db.commit()

    _log_audit(db, license_id, "admin", "manual_review",
               f"Status set to {req.status} by {req.reviewed_by}: {req.admin_notes}")

    return {"status": lic.status, "reviewed_at": str(lic.reviewed_at)}


@app.post("/api/licensing/{license_id}/approve")
def approve_license(license_id: int, request: Request, db: Session = Depends(get_db)):
    """Talent approves or rejects a license request."""
    body = {}
    try:
        import asyncio
        body = asyncio.get_event_loop().run_until_complete(request.json())
    except Exception:
        pass

    lic = db.query(LicenseRequest).filter(LicenseRequest.id == license_id).first()
    if not lic:
        raise HTTPException(404, "License not found")

    approved = body.get("approved", True)
    lic.status = LicenseStatus.APPROVED.value if approved else LicenseStatus.REJECTED.value
    db.commit()

    action = "approved" if approved else "rejected"
    _log_audit(db, license_id, "talent", f"license_{action}", f"License {action} by talent")

    return {"status": lic.status}


@app.get("/api/licensing/{license_id}")
def get_license(license_id: int, db: Session = Depends(get_db)):
    lic = db.query(LicenseRequest).filter(LicenseRequest.id == license_id).first()
    if not lic:
        raise HTTPException(404, "License not found")

    talent = db.query(TalentProfile).filter(TalentProfile.id == lic.talent_id).first()
    talent_user = db.query(User).filter(User.id == talent.user_id).first() if talent else None
    client = db.query(ClientProfile).filter(ClientProfile.id == lic.client_id).first()
    client_user = db.query(User).filter(User.id == client.user_id).first() if client else None

    contract = db.query(Contract).filter(Contract.license_id == license_id).order_by(Contract.id.desc()).first()

    # Watermark tracking
    tracking = db.query(WatermarkTracking).filter(WatermarkTracking.license_id == license_id).all()

    return {
        "id": lic.id, "status": lic.status, "license_type": lic.license_type,
        "use_case": lic.use_case, "campaign_description": lic.campaign_description,
        "content_type": lic.content_type,
        "desired_duration_days": lic.desired_duration_days,
        "desired_regions": lic.desired_regions,
        "exclusivity": lic.exclusivity,
        "proposed_price": lic.proposed_price,
        "license_token": lic.license_token,
        "contract_generated": lic.contract_generated,
        "admin_notes": lic.admin_notes,
        "reviewed_by": lic.reviewed_by,
        "reviewed_at": str(lic.reviewed_at) if lic.reviewed_at else None,
        "payment_status": lic.payment_status,
        "created_at": str(lic.created_at),
        "talent": {
            "id": talent.id if talent else None,
            "name": talent_user.name if talent_user else None,
            "image_url": talent.image_url if talent else None,
            "categories": talent.categories if talent else None,
        },
        "client": {
            "id": client.id if client else None,
            "name": client_user.name if client_user else None,
            "company_name": client.company_name if client else None,
        },
        "contract": {
            "id": contract.id,
            "text": contract.contract_text,
            "license_type": contract.license_type,
            "uk_law_compliant": contract.uk_law_compliant,
            "created_at": str(contract.created_at),
        } if contract else None,
        "watermark_tracking": [{
            "id": t.id, "platform": t.platform_detected,
            "url": t.detection_url, "is_authorized": t.is_authorized,
            "status": t.status, "detected_at": str(t.detected_at) if t.detected_at else None,
        } for t in tracking],
    }


@app.get("/api/licenses")
def list_licenses(db: Session = Depends(get_db)):
    licenses = db.query(LicenseRequest).all()
    return [{
        "id": l.id, "status": l.status, "license_type": l.license_type,
        "use_case": l.use_case, "proposed_price": l.proposed_price,
        "payment_status": l.payment_status, "created_at": str(l.created_at),
    } for l in licenses]


# ============================================================================
# WATERMARK TRACKING
# ============================================================================

class WatermarkReportRequest(BaseModel):
    license_id: int
    talent_id: int
    watermark_id: str
    platform_detected: str | None = None
    detection_url: str | None = None
    is_authorized: bool = True
    notes: str | None = None

@app.post("/api/watermark/report")
def report_watermark_detection(req: WatermarkReportRequest, db: Session = Depends(get_db)):
    """Report a watermark detection (authorized or unauthorized use)."""
    record = WatermarkTracking(
        license_id=req.license_id, talent_id=req.talent_id,
        watermark_id=req.watermark_id,
        platform_detected=req.platform_detected,
        detection_url=req.detection_url,
        detected_at=datetime.utcnow(),
        is_authorized=req.is_authorized,
        status="active" if req.is_authorized else "violation_detected",
        notes=req.notes,
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    _log_audit(db, req.license_id, "watermark_tracker", "detection_reported",
               f"{'Authorized' if req.is_authorized else 'UNAUTHORIZED'} use on {req.platform_detected}")

    return {"id": record.id, "status": record.status}


@app.get("/api/watermark/license/{license_id}")
def get_watermark_tracking(license_id: int, db: Session = Depends(get_db)):
    records = db.query(WatermarkTracking).filter(WatermarkTracking.license_id == license_id).all()
    return [{
        "id": r.id, "watermark_id": r.watermark_id,
        "platform": r.platform_detected, "url": r.detection_url,
        "detected_at": str(r.detected_at) if r.detected_at else None,
        "is_authorized": r.is_authorized, "status": r.status,
        "notes": r.notes,
    } for r in records]


@app.get("/api/watermark/talent/{talent_id}")
def get_talent_watermark_tracking(talent_id: int, db: Session = Depends(get_db)):
    records = db.query(WatermarkTracking).filter(WatermarkTracking.talent_id == talent_id).all()
    violations = [r for r in records if not r.is_authorized]
    return {
        "total_detections": len(records),
        "violations": len(violations),
        "records": [{
            "id": r.id, "license_id": r.license_id, "watermark_id": r.watermark_id,
            "platform": r.platform_detected, "is_authorized": r.is_authorized,
            "status": r.status, "detected_at": str(r.detected_at) if r.detected_at else None,
        } for r in records],
    }


# ============================================================================
# AUDIT
# ============================================================================

@app.get("/api/audit/logs")
def get_all_audit_logs(db: Session = Depends(get_db)):
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(200).all()
    return [{
        "id": l.id, "license_id": l.license_id,
        "agent_name": l.agent_name, "action": l.action,
        "details": l.details, "model_used": l.model_used,
        "tokens_used": l.tokens_used,
        "created_at": str(l.created_at),
    } for l in logs]


@app.get("/api/audit/{license_id}")
def get_audit_trail(license_id: int, db: Session = Depends(get_db)):
    logs = db.query(AuditLog).filter(AuditLog.license_id == license_id).order_by(AuditLog.created_at).all()
    return [{
        "id": l.id, "agent_name": l.agent_name, "action": l.action,
        "details": l.details, "model_used": l.model_used,
        "tokens_used": l.tokens_used,
        "created_at": str(l.created_at),
    } for l in logs]


# ============================================================================
# PAYMENTS (Stripe)
# ============================================================================

import stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "")

@app.post("/api/payments/checkout")
async def create_checkout(request: Request, db: Session = Depends(get_db)):
    body = await request.json()
    license_id = body.get("license_id")

    lic = db.query(LicenseRequest).filter(LicenseRequest.id == license_id).first()
    if not lic:
        raise HTTPException(404, "License not found")

    talent = db.query(TalentProfile).filter(TalentProfile.id == lic.talent_id).first()
    talent_user = db.query(User).filter(User.id == talent.user_id).first() if talent else None

    try:
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[{
                "price_data": {
                    "currency": "gbp",
                    "product_data": {
                        "name": f"Face Library License - {talent_user.name if talent_user else 'Talent'}",
                        "description": f"{lic.license_type.title()} license: {lic.use_case[:100]}",
                    },
                    "unit_amount": int((lic.proposed_price or 100) * 100),
                },
                "quantity": 1,
            }],
            mode="payment",
            success_url=body.get("success_url", "http://localhost:3000/license/" + str(license_id) + "?paid=true"),
            cancel_url=body.get("cancel_url", "http://localhost:3000/license/" + str(license_id)),
            metadata={"license_id": str(license_id)},
        )
        lic.stripe_session_id = session.id
        db.commit()
        return {"checkout_url": session.url, "session_id": session.id}
    except Exception as e:
        raise HTTPException(500, f"Stripe error: {str(e)}")


@app.post("/api/payments/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    payload = await request.body()
    sig = request.headers.get("stripe-signature", "")
    webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET", "")

    try:
        if webhook_secret:
            event = stripe.Webhook.construct_event(payload, sig, webhook_secret)
        else:
            event = json.loads(payload)
    except Exception as e:
        raise HTTPException(400, f"Webhook error: {str(e)}")

    if event.get("type") == "checkout.session.completed":
        session = event["data"]["object"]
        license_id = session.get("metadata", {}).get("license_id")
        if license_id:
            lic = db.query(LicenseRequest).filter(LicenseRequest.id == int(license_id)).first()
            if lic:
                lic.payment_status = "paid"
                lic.status = LicenseStatus.ACTIVE.value
                db.commit()
                _log_audit(db, int(license_id), "stripe", "payment_completed",
                           f"Payment received: GBP {lic.proposed_price}")

    return {"status": "ok"}


@app.get("/api/payments/revenue")
def get_revenue(db: Session = Depends(get_db)):
    paid = db.query(LicenseRequest).filter(LicenseRequest.payment_status == "paid").all()
    total = sum(l.proposed_price or 0 for l in paid)
    platform_fee = total * 0.10
    talent_payout = total - platform_fee
    return {
        "total_revenue": total,
        "platform_fees": platform_fee,
        "talent_payouts": talent_payout,
        "paid_licenses": len(paid),
    }


# ============================================================================
# LICENSE TEMPLATES
# ============================================================================

@app.get("/api/license-templates")
def get_license_templates():
    """Return the three licensing categories."""
    from agents.contract import TEMPLATES
    return [
        {"type": k, **v}
        for k, v in TEMPLATES.items()
    ]


# ============================================================================
# HEALTH
# ============================================================================

@app.get("/api/health")
def health():
    return {
        "status": "healthy",
        "version": "1.0.0-mvp",
        "features": {
            "contract_agent": True,
            "manual_review": True,
            "watermark_tracking": True,
            "stripe_payments": True,
            "license_templates": ["standard", "exclusive", "time_limited"],
        },
    }
