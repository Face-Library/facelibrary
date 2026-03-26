"""Face Library MVP -- Secure Likeness Licensing Platform API.

Uses Supabase REST API (via supabase-py) instead of SQLAlchemy for all database operations.
This eliminates Postgres connection issues and works over HTTPS everywhere.
"""
import os
import sys
import json
import uuid
from datetime import datetime
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

sys.path.insert(0, os.path.dirname(__file__))

from supabase_client import supabase_admin
from agents.contract import ContractAgent

contract_agent = ContractAgent()


# -- Supabase DB helper ------------------------------------------------------

def db():
    """Return the Supabase admin client (bypasses RLS)."""
    if not supabase_admin:
        raise HTTPException(500, "Supabase not configured")
    return supabase_admin


@asynccontextmanager
async def lifespan(app: FastAPI):
    if not supabase_admin:
        print("[WARNING] Supabase not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env")
    else:
        print("[Supabase] Connected via REST API")
        # Check if data exists
        res = db().table("users").select("id", count="exact").execute()
        print(f"[Supabase] {res.count} users in database")
    yield


app = FastAPI(
    title="Face Library MVP API",
    description="Secure Likeness Licensing Platform -- MVP (Supabase REST API)",
    version="1.1.0",
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
    import bcrypt
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def _verify_password(password: str, stored: str) -> bool:
    try:
        if stored.startswith("$2"):
            import bcrypt
            return bcrypt.checkpw(password.encode(), stored.encode())
        else:
            import hashlib
            salt, h = stored.split(":")
            return hashlib.sha256((salt + password).encode()).hexdigest() == h
    except Exception:
        return False


def _log_audit(license_id: int | None, agent_name: str, action: str, details: str,
               model_used: str | None = None, tokens_used: int | None = None):
    try:
        db().table("audit_logs").insert({
            "license_id": license_id,
            "agent_name": agent_name,
            "action": action,
            "details": details,
            "model_used": model_used,
            "tokens_used": tokens_used,
        }).execute()
    except Exception:
        pass  # Don't fail on audit log errors


# -- Request Models ----------------------------------------------------------

class SignupRequest(BaseModel):
    email: str
    password: str
    name: str
    role: str
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

class LicenseRequestCreate(BaseModel):
    client_id: int
    talent_id: int
    license_type: str = "standard"
    use_case: str
    desired_duration_days: int = 30
    desired_regions: str | None = None
    content_type: str = "image"
    proposed_price: float | None = None

class ReviewRequest(BaseModel):
    status: str
    admin_notes: str | None = None
    reviewed_by: str | None = None

class ContractImproveRequest(BaseModel):
    feedback: str

class TalentPreferencesUpdate(BaseModel):
    restricted_categories: str | None = None
    categories: str | None = None
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

class WatermarkReportRequest(BaseModel):
    license_id: int
    talent_id: int
    watermark_id: str
    platform_detected: str | None = None
    detection_url: str | None = None
    is_authorized: bool = True
    notes: str | None = None


# ============================================================================
# AUTH
# ============================================================================

@app.post("/api/auth/signup")
def signup(req: SignupRequest):
    existing = db().table("users").select("id").eq("email", req.email).execute()
    if existing.data:
        raise HTTPException(400, "Email already registered")

    role = req.role.lower()
    if role == "brand":
        role = "client"
    if role not in ("talent", "client", "agent"):
        raise HTTPException(400, "Invalid role")

    res = db().table("users").insert({
        "email": req.email, "name": req.name, "role": role,
        "company": req.company, "password_hash": _hash_password(req.password),
    }).execute()
    user = res.data[0]
    return {"id": user["id"], "email": user["email"], "name": user["name"], "role": user["role"]}


@app.post("/api/auth/login")
def login(req: LoginRequest):
    res = db().table("users").select("*").eq("email", req.email).execute()
    if not res.data:
        raise HTTPException(401, "Invalid credentials")
    user = res.data[0]
    if not _verify_password(req.password, user.get("password_hash", "")):
        raise HTTPException(401, "Invalid credentials")
    return {"id": user["id"], "email": user["email"], "name": user["name"],
            "role": user["role"], "company": user.get("company")}


@app.get("/api/auth/me/{user_id}")
def get_me(user_id: int):
    res = db().table("users").select("*").eq("id", user_id).execute()
    if not res.data:
        raise HTTPException(404, "User not found")
    u = res.data[0]
    return {"id": u["id"], "email": u["email"], "name": u["name"],
            "role": u["role"], "company": u.get("company")}


# ============================================================================
# TALENT
# ============================================================================

@app.post("/api/talent/register")
def register_talent(req: TalentRegisterRequest):
    user_res = db().table("users").select("*").eq("id", req.user_id).execute()
    if not user_res.data:
        raise HTTPException(404, "User not found")

    data = req.model_dump(exclude_none=True)
    res = db().table("talent_profiles").insert(data).execute()
    profile = res.data[0]
    return {"id": profile["id"], "user_id": profile["user_id"], "name": user_res.data[0]["name"]}


@app.post("/api/talent/{talent_id}/upload-image")
async def upload_talent_image(talent_id: int, file: UploadFile = File(...)):
    talent_res = db().table("talent_profiles").select("id").eq("id", talent_id).execute()
    if not talent_res.data:
        raise HTTPException(404, "Talent not found")

    upload_dir = os.path.join(os.path.dirname(__file__), "..", "uploads", "talent")
    os.makedirs(upload_dir, exist_ok=True)

    ext = file.filename.split(".")[-1] if file.filename and "." in file.filename else "jpg"
    filename = f"talent_{talent_id}_{uuid.uuid4().hex[:8]}.{ext}"
    filepath = os.path.join(upload_dir, filename)

    contents = await file.read()
    with open(filepath, "wb") as f:
        f.write(contents)

    image_url = f"/uploads/talent/{filename}"
    db().table("talent_profiles").update({"image_url": image_url}).eq("id", talent_id).execute()
    return {"image_url": image_url, "filename": filename}


@app.get("/api/talent/{talent_id}")
def get_talent(talent_id: int):
    t_res = db().table("talent_profiles").select("*").eq("id", talent_id).execute()
    if not t_res.data:
        raise HTTPException(404, "Talent not found")
    t = t_res.data[0]

    u_res = db().table("users").select("name,email").eq("id", t["user_id"]).execute()
    user = u_res.data[0] if u_res.data else {}

    # Check for linked agent
    link_res = db().table("talent_agent_links").select("*").eq("talent_id", talent_id).execute()
    agent_info = None
    if link_res.data:
        link = link_res.data[0]
        agent_res = db().table("agent_profiles").select("*").eq("id", link["agent_id"]).execute()
        if agent_res.data:
            agent = agent_res.data[0]
            au_res = db().table("users").select("name").eq("id", agent["user_id"]).execute()
            agent_info = {
                "id": agent["id"], "agency_name": agent.get("agency_name"),
                "name": au_res.data[0]["name"] if au_res.data else None,
                "approval_type": link.get("approval_type"),
            }

    return {
        "id": t["id"], "user_id": t["user_id"],
        "name": user.get("name"), "email": user.get("email"),
        "bio": t.get("bio"), "stage_name": t.get("stage_name"),
        "categories": t.get("categories"), "nationality": t.get("nationality"),
        "ethnicity": t.get("ethnicity"), "gender": t.get("gender"), "age": t.get("age"),
        "image_url": t.get("image_url"), "avatar_url": t.get("avatar_url"),
        "restricted_categories": t.get("restricted_categories"),
        "min_price_per_use": t.get("min_price_per_use"),
        "max_license_duration_days": t.get("max_license_duration_days"),
        "allow_ai_training": t.get("allow_ai_training"),
        "allow_video_generation": t.get("allow_video_generation"),
        "allow_image_generation": t.get("allow_image_generation"),
        "geo_scope": t.get("geo_scope"), "approval_mode": t.get("approval_mode"),
        "instagram": t.get("instagram"), "tiktok": t.get("tiktok"), "youtube": t.get("youtube"),
        "linked_agent": agent_info,
        "created_at": t.get("created_at"),
    }


@app.put("/api/talent/{talent_id}/preferences")
def update_talent_preferences(talent_id: int, req: TalentPreferencesUpdate):
    t_res = db().table("talent_profiles").select("id").eq("id", talent_id).execute()
    if not t_res.data:
        raise HTTPException(404, "Talent not found")
    updates = req.model_dump(exclude_none=True)
    if updates:
        db().table("talent_profiles").update(updates).eq("id", talent_id).execute()
    return {"status": "updated"}


@app.get("/api/talent/{talent_id}/requests")
def get_talent_requests(talent_id: int):
    res = db().table("license_requests").select("*").eq("talent_id", talent_id).execute()
    result = []
    for r in res.data:
        client_res = db().table("client_profiles").select("company_name,user_id").eq("id", r["client_id"]).execute()
        client = client_res.data[0] if client_res.data else {}
        client_name = client.get("company_name")
        result.append({
            "id": r["id"], "status": r["status"], "license_type": r.get("license_type"),
            "use_case": r.get("use_case"), "content_type": r.get("content_type"),
            "desired_duration_days": r.get("desired_duration_days"),
            "proposed_price": r.get("proposed_price"),
            "client_name": client_name,
            "payment_status": r.get("payment_status"),
            "created_at": r.get("created_at"),
        })
    return result


@app.get("/api/talents")
def list_talents():
    res = db().table("talent_profiles").select("*").execute()
    result = []
    for t in res.data:
        u_res = db().table("users").select("name").eq("id", t["user_id"]).execute()
        name = u_res.data[0]["name"] if u_res.data else None
        result.append({
            "id": t["id"], "user_id": t["user_id"], "name": name,
            "stage_name": t.get("stage_name"), "bio": t.get("bio"),
            "categories": t.get("categories"), "gender": t.get("gender"),
            "image_url": t.get("image_url"), "avatar_url": t.get("avatar_url"),
            "min_price_per_use": t.get("min_price_per_use"),
            "instagram": t.get("instagram"), "tiktok": t.get("tiktok"),
            "youtube": t.get("youtube"), "geo_scope": t.get("geo_scope"),
        })
    return result


# ============================================================================
# CLIENT (renamed from Brand)
# ============================================================================

@app.post("/api/client/register")
def register_client(req: ClientRegisterRequest):
    user_res = db().table("users").select("id").eq("id", req.user_id).execute()
    if not user_res.data:
        raise HTTPException(404, "User not found")

    data = req.model_dump(exclude_none=True)
    res = db().table("client_profiles").insert(data).execute()
    profile = res.data[0]
    return {"id": profile["id"], "user_id": profile["user_id"], "company_name": profile.get("company_name")}


@app.get("/api/client/{client_id}")
def get_client(client_id: int):
    res = db().table("client_profiles").select("*").eq("id", client_id).execute()
    if not res.data:
        raise HTTPException(404, "Client not found")
    c = res.data[0]
    u_res = db().table("users").select("name").eq("id", c["user_id"]).execute()
    return {
        "id": c["id"], "user_id": c["user_id"],
        "name": u_res.data[0]["name"] if u_res.data else None,
        "company_name": c.get("company_name"), "industry": c.get("industry"),
        "website": c.get("website"), "phone": c.get("phone"),
        "role_title": c.get("role_title"), "referral_source": c.get("referral_source"),
        "ai_tools_used": c.get("ai_tools_used"), "description": c.get("description"),
    }


@app.get("/api/client/{client_id}/requests")
def get_client_requests(client_id: int):
    res = db().table("license_requests").select("*").eq("client_id", client_id).execute()
    result = []
    for r in res.data:
        t_res = db().table("talent_profiles").select("user_id,image_url").eq("id", r["talent_id"]).execute()
        talent = t_res.data[0] if t_res.data else {}
        tu_res = db().table("users").select("name").eq("id", talent.get("user_id", 0)).execute() if talent.get("user_id") else type("", (), {"data": []})()
        result.append({
            "id": r["id"], "status": r["status"], "license_type": r.get("license_type"),
            "use_case": r.get("use_case"), "content_type": r.get("content_type"),
            "desired_duration_days": r.get("desired_duration_days"),
            "proposed_price": r.get("proposed_price"),
            "talent_name": tu_res.data[0]["name"] if tu_res.data else None,
            "talent_image": talent.get("image_url"),
            "payment_status": r.get("payment_status"),
            "contract_generated": r.get("contract_generated"),
            "created_at": r.get("created_at"),
        })
    return result


# Backward-compatible brand endpoints
@app.post("/api/brand/register")
def register_brand_compat(req: ClientRegisterRequest):
    return register_client(req)

@app.get("/api/brand/{client_id}")
def get_brand_compat(client_id: int):
    return get_client(client_id)

@app.get("/api/brand/{client_id}/requests")
def get_brand_requests_compat(client_id: int):
    return get_client_requests(client_id)


# ============================================================================
# AGENT
# ============================================================================

@app.post("/api/agent/register")
def register_agent(req: AgentRegisterRequest):
    user_res = db().table("users").select("id").eq("id", req.user_id).execute()
    if not user_res.data:
        raise HTTPException(404, "User not found")

    data = req.model_dump(exclude_none=True)
    res = db().table("agent_profiles").insert(data).execute()
    profile = res.data[0]
    return {"id": profile["id"], "user_id": profile["user_id"], "agency_name": profile.get("agency_name")}


@app.get("/api/agent/{agent_id}")
def get_agent(agent_id: int):
    res = db().table("agent_profiles").select("*").eq("id", agent_id).execute()
    if not res.data:
        raise HTTPException(404, "Agent not found")
    a = res.data[0]
    u_res = db().table("users").select("name").eq("id", a["user_id"]).execute()

    links = db().table("talent_agent_links").select("*").eq("agent_id", agent_id).execute()
    managed = []
    for link in links.data:
        t_res = db().table("talent_profiles").select("*").eq("id", link["talent_id"]).execute()
        if t_res.data:
            t = t_res.data[0]
            tu = db().table("users").select("name").eq("id", t["user_id"]).execute()
            managed.append({
                "id": t["id"], "name": tu.data[0]["name"] if tu.data else None,
                "categories": t.get("categories"), "geo_scope": t.get("geo_scope"),
                "approval_type": link.get("approval_type"), "image_url": t.get("image_url"),
            })

    return {
        "id": a["id"], "user_id": a["user_id"],
        "name": u_res.data[0]["name"] if u_res.data else None,
        "agency_name": a.get("agency_name"), "website": a.get("website"),
        "portfolio_url": a.get("portfolio_url"), "instagram": a.get("instagram"),
        "industry": a.get("industry"),
        "managed_talents": managed,
    }


@app.get("/api/agent/{agent_id}/requests")
def get_agent_requests(agent_id: int):
    links = db().table("talent_agent_links").select("talent_id").eq("agent_id", agent_id).execute()
    talent_ids = [l["talent_id"] for l in links.data]
    if not talent_ids:
        return []
    # Supabase doesn't support .in_() the same way, query each
    result = []
    for tid in talent_ids:
        reqs = db().table("license_requests").select("*").eq("talent_id", tid).execute()
        for r in reqs.data:
            t_res = db().table("talent_profiles").select("user_id").eq("id", r["talent_id"]).execute()
            tu = db().table("users").select("name").eq("id", t_res.data[0]["user_id"]).execute() if t_res.data else type("", (), {"data": []})()
            c_res = db().table("client_profiles").select("company_name").eq("id", r["client_id"]).execute()
            result.append({
                "id": r["id"], "status": r["status"], "license_type": r.get("license_type"),
                "use_case": r.get("use_case"),
                "talent_name": tu.data[0]["name"] if tu.data else None,
                "client_name": c_res.data[0]["company_name"] if c_res.data else None,
                "proposed_price": r.get("proposed_price"),
                "created_at": r.get("created_at"),
            })
    return result


# ============================================================================
# TALENT-AGENT LINKING
# ============================================================================

@app.post("/api/talent-agent/link")
def link_talent_agent(req: TalentAgentLinkRequest):
    existing = db().table("talent_agent_links").select("id").eq("talent_id", req.talent_id).eq("agent_id", req.agent_id).execute()
    if existing.data:
        raise HTTPException(400, "Link already exists")

    res = db().table("talent_agent_links").insert({
        "talent_id": req.talent_id, "agent_id": req.agent_id,
        "approval_type": req.approval_type,
    }).execute()
    return {"id": res.data[0]["id"], "status": "linked"}


@app.delete("/api/talent-agent/link/{link_id}")
def unlink_talent_agent(link_id: int):
    db().table("talent_agent_links").delete().eq("id", link_id).execute()
    return {"status": "unlinked"}


@app.get("/api/talent-agent/links/{agent_id}")
def get_agent_links(agent_id: int):
    res = db().table("talent_agent_links").select("*").eq("agent_id", agent_id).execute()
    return [{"id": l["id"], "talent_id": l["talent_id"], "agent_id": l["agent_id"],
             "approval_type": l.get("approval_type")} for l in res.data]


# ============================================================================
# LICENSING
# ============================================================================

@app.post("/api/licensing/request")
def create_license_request(req: LicenseRequestCreate):
    t_res = db().table("talent_profiles").select("min_price_per_use").eq("id", req.talent_id).execute()
    if not t_res.data:
        raise HTTPException(404, "Talent not found")
    c_res = db().table("client_profiles").select("company_name").eq("id", req.client_id).execute()
    if not c_res.data:
        raise HTTPException(404, "Client not found")

    price = req.proposed_price or t_res.data[0].get("min_price_per_use", 100)
    data = {
        "client_id": req.client_id, "talent_id": req.talent_id,
        "license_type": req.license_type, "use_case": req.use_case,
        "desired_duration_days": req.desired_duration_days,
        "desired_regions": req.desired_regions, "content_type": req.content_type,
        "proposed_price": price,
        "license_token": f"FL-LIC-{uuid.uuid4().hex[:8].upper()}",
        "status": "pending", "payment_status": "unpaid",
    }
    res = db().table("license_requests").insert(data).execute()
    lic = res.data[0]

    _log_audit(lic["id"], "system", "license_created",
               f"License request created by {c_res.data[0]['company_name']}")

    return {"id": lic["id"], "status": lic["status"], "license_token": lic["license_token"]}


@app.post("/api/licensing/{license_id}/generate-contract")
def generate_contract(license_id: int):
    lic_res = db().table("license_requests").select("*").eq("id", license_id).execute()
    if not lic_res.data:
        raise HTTPException(404, "License not found")
    lic = lic_res.data[0]

    t_res = db().table("talent_profiles").select("*").eq("id", lic["talent_id"]).execute()
    talent = t_res.data[0] if t_res.data else {}
    tu_res = db().table("users").select("name").eq("id", talent.get("user_id", 0)).execute()
    c_res = db().table("client_profiles").select("company_name,industry").eq("id", lic["client_id"]).execute()
    client = c_res.data[0] if c_res.data else {}

    talent_data = {
        "name": tu_res.data[0]["name"] if tu_res.data else "Unknown",
        "bio": talent.get("bio"),
        "restricted_categories": talent.get("restricted_categories"),
        "min_price_per_use": talent.get("min_price_per_use", 100),
        "allow_ai_training": talent.get("allow_ai_training", False),
    }
    client_data = {"company_name": client.get("company_name", "Unknown"), "industry": client.get("industry")}
    request_data = {
        "license_type": lic.get("license_type"), "use_case": lic.get("use_case"),
        "content_type": lic.get("content_type"),
        "desired_duration_days": lic.get("desired_duration_days"),
        "desired_regions": lic.get("desired_regions"),
        "proposed_price": lic.get("proposed_price"),
    }

    result = contract_agent.generate_contract(talent_data, client_data, request_data)

    db().table("contracts").insert({
        "license_id": license_id, "license_type": lic.get("license_type"),
        "contract_text": result["contract_text"],
    }).execute()

    db().table("license_requests").update({
        "contract_generated": True, "status": "under_review",
    }).eq("id", license_id).execute()

    _log_audit(license_id, "contract_agent", "contract_generated",
               f"IP licensing agreement generated ({result['model']})",
               result["model"], result["tokens_used"])

    return {"status": "contract_generated", "license_type": lic.get("license_type"),
            "model": result["model"], "tokens_used": result["tokens_used"]}


@app.post("/api/licensing/{license_id}/validate-contract")
def validate_contract(license_id: int):
    c_res = db().table("contracts").select("contract_text").eq("license_id", license_id).order("id", desc=True).limit(1).execute()
    if not c_res.data:
        raise HTTPException(404, "No contract found")

    result = contract_agent.validate_contract(c_res.data[0]["contract_text"])
    _log_audit(license_id, "contract_agent", "contract_validated",
               f"Validation: {json.dumps(result.get('result', {}))[:500]}",
               result["model"], result["tokens_used"])
    return {"validation": result.get("result"), "model": result["model"]}


@app.post("/api/licensing/{license_id}/improve-contract")
def improve_contract(license_id: int, req: ContractImproveRequest):
    c_res = db().table("contracts").select("*").eq("license_id", license_id).order("id", desc=True).limit(1).execute()
    if not c_res.data:
        raise HTTPException(404, "No contract found")

    result = contract_agent.improve_contract(c_res.data[0]["contract_text"], req.feedback)

    db().table("contracts").insert({
        "license_id": license_id, "license_type": c_res.data[0].get("license_type"),
        "contract_text": result["contract_text"],
    }).execute()

    _log_audit(license_id, "contract_agent", "contract_improved",
               f"Improved: {req.feedback[:200]}", result["model"], result["tokens_used"])
    return {"status": "improved", "model": result["model"]}


@app.post("/api/licensing/{license_id}/review")
def review_license(license_id: int, req: ReviewRequest):
    lic_res = db().table("license_requests").select("id").eq("id", license_id).execute()
    if not lic_res.data:
        raise HTTPException(404, "License not found")

    valid = ["under_review", "awaiting_approval", "approved", "rejected"]
    if req.status not in valid:
        raise HTTPException(400, f"Invalid status. Must be one of: {valid}")

    db().table("license_requests").update({
        "status": req.status, "admin_notes": req.admin_notes,
        "reviewed_by": req.reviewed_by, "reviewed_at": datetime.utcnow().isoformat(),
    }).eq("id", license_id).execute()

    _log_audit(license_id, "admin", "manual_review",
               f"Status set to {req.status} by {req.reviewed_by}: {req.admin_notes}")
    return {"status": req.status}


@app.post("/api/licensing/{license_id}/approve")
async def approve_license(license_id: int, request: Request):
    body = {}
    try:
        body = await request.json()
    except Exception:
        pass

    lic_res = db().table("license_requests").select("id").eq("id", license_id).execute()
    if not lic_res.data:
        raise HTTPException(404, "License not found")

    approved = body.get("approved", True)
    status = "approved" if approved else "rejected"
    db().table("license_requests").update({"status": status}).eq("id", license_id).execute()

    _log_audit(license_id, "talent", f"license_{status}", f"License {status} by talent")
    return {"status": status}


@app.get("/api/licensing/{license_id}")
def get_license(license_id: int):
    lic_res = db().table("license_requests").select("*").eq("id", license_id).execute()
    if not lic_res.data:
        raise HTTPException(404, "License not found")
    lic = lic_res.data[0]

    t_res = db().table("talent_profiles").select("*").eq("id", lic["talent_id"]).execute()
    talent = t_res.data[0] if t_res.data else {}
    tu = db().table("users").select("name").eq("id", talent.get("user_id", 0)).execute() if talent.get("user_id") else type("", (), {"data": []})()

    c_res = db().table("client_profiles").select("*").eq("id", lic["client_id"]).execute()
    client = c_res.data[0] if c_res.data else {}
    cu = db().table("users").select("name").eq("id", client.get("user_id", 0)).execute() if client.get("user_id") else type("", (), {"data": []})()

    contract_res = db().table("contracts").select("*").eq("license_id", license_id).order("id", desc=True).limit(1).execute()
    contract = contract_res.data[0] if contract_res.data else None

    tracking_res = db().table("watermark_tracking").select("*").eq("license_id", license_id).execute()

    return {
        "id": lic["id"], "status": lic["status"], "license_type": lic.get("license_type"),
        "use_case": lic.get("use_case"), "content_type": lic.get("content_type"),
        "desired_duration_days": lic.get("desired_duration_days"),
        "desired_regions": lic.get("desired_regions"),
        "proposed_price": lic.get("proposed_price"),
        "license_token": lic.get("license_token"),
        "contract_generated": lic.get("contract_generated"),
        "admin_notes": lic.get("admin_notes"),
        "reviewed_by": lic.get("reviewed_by"),
        "reviewed_at": lic.get("reviewed_at"),
        "payment_status": lic.get("payment_status"),
        "created_at": lic.get("created_at"),
        "talent": {
            "id": talent.get("id"), "name": tu.data[0]["name"] if tu.data else None,
            "image_url": talent.get("image_url"), "categories": talent.get("categories"),
        },
        "client": {
            "id": client.get("id"), "name": cu.data[0]["name"] if cu.data else None,
            "company_name": client.get("company_name"),
        },
        "contract": {
            "id": contract["id"], "text": contract.get("contract_text"),
            "license_type": contract.get("license_type"),
            "created_at": contract.get("created_at"),
        } if contract else None,
        "watermark_tracking": [{
            "id": t["id"], "platform": t.get("platform_detected"),
            "url": t.get("detection_url"), "is_authorized": t.get("is_authorized"),
            "status": t.get("status"), "detected_at": t.get("detected_at"),
        } for t in tracking_res.data],
    }


@app.get("/api/licenses")
def list_licenses():
    res = db().table("license_requests").select("id,status,license_type,use_case,proposed_price,payment_status,created_at").execute()
    return res.data


# ============================================================================
# WATERMARK TRACKING
# ============================================================================

@app.post("/api/watermark/report")
def report_watermark(req: WatermarkReportRequest):
    data = {
        "license_id": req.license_id, "talent_id": req.talent_id,
        "watermark_id": req.watermark_id, "platform_detected": req.platform_detected,
        "detection_url": req.detection_url, "detected_at": datetime.utcnow().isoformat(),
        "is_authorized": req.is_authorized,
        "status": "active" if req.is_authorized else "violation_detected",
        "notes": req.notes,
    }
    res = db().table("watermark_tracking").insert(data).execute()
    record = res.data[0]

    _log_audit(req.license_id, "watermark_tracker", "detection_reported",
               f"{'Authorized' if req.is_authorized else 'UNAUTHORIZED'} use on {req.platform_detected}")
    return {"id": record["id"], "status": record["status"]}


@app.get("/api/watermark/license/{license_id}")
def get_watermark_tracking(license_id: int):
    res = db().table("watermark_tracking").select("*").eq("license_id", license_id).execute()
    return [{
        "id": r["id"], "watermark_id": r.get("watermark_id"),
        "platform": r.get("platform_detected"), "url": r.get("detection_url"),
        "detected_at": r.get("detected_at"),
        "is_authorized": r.get("is_authorized"), "status": r.get("status"),
        "notes": r.get("notes"),
    } for r in res.data]


@app.get("/api/watermark/talent/{talent_id}")
def get_talent_watermarks(talent_id: int):
    res = db().table("watermark_tracking").select("*").eq("talent_id", talent_id).execute()
    violations = [r for r in res.data if not r.get("is_authorized")]
    return {
        "total_detections": len(res.data), "violations": len(violations),
        "records": [{
            "id": r["id"], "license_id": r.get("license_id"),
            "watermark_id": r.get("watermark_id"),
            "platform": r.get("platform_detected"),
            "is_authorized": r.get("is_authorized"),
            "status": r.get("status"), "detected_at": r.get("detected_at"),
        } for r in res.data],
    }


# ============================================================================
# AUDIT
# ============================================================================

@app.get("/api/audit/logs")
def get_all_audit_logs():
    res = db().table("audit_logs").select("*").order("created_at", desc=True).limit(200).execute()
    return res.data


@app.get("/api/audit/{license_id}")
def get_audit_trail(license_id: int):
    res = db().table("audit_logs").select("*").eq("license_id", license_id).order("created_at").execute()
    return res.data


# ============================================================================
# PAYMENTS (Stripe)
# ============================================================================

import stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "")

@app.post("/api/payments/checkout")
async def create_checkout(request: Request):
    body = await request.json()
    license_id = body.get("license_id")

    lic_res = db().table("license_requests").select("*").eq("id", license_id).execute()
    if not lic_res.data:
        raise HTTPException(404, "License not found")
    lic = lic_res.data[0]

    t_res = db().table("talent_profiles").select("user_id").eq("id", lic["talent_id"]).execute()
    talent_name = "Talent"
    if t_res.data:
        tu = db().table("users").select("name").eq("id", t_res.data[0]["user_id"]).execute()
        if tu.data:
            talent_name = tu.data[0]["name"]

    try:
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[{
                "price_data": {
                    "currency": "gbp",
                    "product_data": {
                        "name": f"Face Library License - {talent_name}",
                        "description": f"{lic.get('license_type', 'standard').title()} license: {(lic.get('use_case') or '')[:100]}",
                    },
                    "unit_amount": int((lic.get("proposed_price", 100)) * 100),
                },
                "quantity": 1,
            }],
            mode="payment",
            success_url=body.get("success_url", f"http://localhost:3000/license/{license_id}?paid=true"),
            cancel_url=body.get("cancel_url", f"http://localhost:3000/license/{license_id}"),
            metadata={"license_id": str(license_id)},
        )
        return {"checkout_url": session.url, "session_id": session.id}
    except Exception as e:
        raise HTTPException(500, f"Stripe error: {str(e)}")


@app.post("/api/payments/webhook")
async def stripe_webhook(request: Request):
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
            db().table("license_requests").update({
                "payment_status": "paid", "status": "active",
            }).eq("id", int(license_id)).execute()
            _log_audit(int(license_id), "stripe", "payment_completed",
                       f"Payment received")
    return {"status": "ok"}


@app.get("/api/payments/revenue")
def get_revenue():
    res = db().table("license_requests").select("proposed_price").eq("payment_status", "paid").execute()
    total = sum(r.get("proposed_price", 0) for r in res.data)
    return {
        "total_revenue": total,
        "platform_fees": total * 0.10,
        "talent_payouts": total * 0.90,
        "paid_licenses": len(res.data),
    }


# ============================================================================
# LICENSE TEMPLATES
# ============================================================================

@app.get("/api/license-templates")
def get_license_templates():
    from agents.contract import TEMPLATES
    return [{"type": k, **v} for k, v in TEMPLATES.items()]


# ============================================================================
# HEALTH
# ============================================================================

@app.get("/api/health")
def health():
    return {
        "status": "healthy",
        "version": "1.1.0-mvp",
        "database": "supabase",
        "features": {
            "contract_agent": True,
            "manual_review": True,
            "watermark_tracking": True,
            "stripe_payments": True,
            "license_templates": ["standard", "exclusive", "time_limited"],
        },
    }
