# Face Library — Pitch Deck

**Secure AI Likeness Licensing Infrastructure**
UK AI Agent Hackathon EP.4 x OpenClaw | Imperial College London | March 2026
Team: **Not.Just.AI**

---

## Slide 1: The Problem

> Generative AI can now create hyper-realistic images and videos of **real people** without their consent.

- **No consent layer** — Who gave permission for their face to be used?
- **No compensation** — Creators aren't paid when their likeness generates value
- **No compliance** — Is usage legal under UK/EU data protection and IP law?
- **No audit trail** — Who used what, when, and under what terms?

**$15.7B** projected market for AI-generated content by 2027. Zero standardized infrastructure for human identity rights.

---

## Slide 2: The Solution

**Face Library** is the permission and monetization layer for human identity in generative AI.

Three portals. Nine AI agents. One platform.

```
TALENT          ->  Control your likeness  ->  Set preferences, approve uses
AGENTS          ->  Manage talent rosters  ->  Configurable approval workflows
BRANDS          ->  License a likeness     ->  AI handles compliance + contracts
```

---

## Slide 3: How It Works — 7-Step Agent Pipeline

When a brand requests a talent's likeness, **9 autonomous AI agents** process the request:

```
REQUEST -> [1] Compliance Check -> [2] Price Negotiation -> [3] Contract Generation
        -> [4] License Token    -> [5] Avatar Prompt     -> [6] Fingerprint Scan
        -> [7] Web3 Rights      -> AUDIT LOG             -> TALENT APPROVAL
```

- **~90 seconds** from request to full UK-law-compliant contract
- **Zero human intervention** in processing (human-in-the-loop for approval)
- **Full audit trail** on every decision

---

## Slide 4: Live Demo

| | |
|---|---|
| **Frontend** | https://face-library.vercel.app |
| **Backend API** | https://face-library.onrender.com |
| **Swagger Docs** | https://face-library.onrender.com/docs |
| **GitHub** | https://github.com/aswin-giridhar/face-library |

### Demo Flow
1. Sign up as Talent -> AI chat onboarding -> Set preferences
2. Sign up as Brand -> Create license request -> Select talent
3. Click **Run Orchestrator** -> Watch 9 agents process in real-time
4. View: risk assessment, AI-negotiated price, 12-section UK-law contract, Web3 metadata
5. Talent reviews and approves

---

## Slide 5: The 9 AI Agents

| Agent | What It Does | Model |
|-------|-------------|-------|
| **Compliance & Risk** | Scans for content risk, GDPR, ethical concerns | FLock DeepSeek V3.2 + Z.AI GLM-4.5 |
| **Pricing Negotiator** | Dynamic pricing with SDG 8 alignment | FLock Qwen3 235B |
| **IP Contract** | Full 12-section UK-law-compliant contract | Z.AI GLM-4.5 |
| **License Token** | UUID token issuance for tracking | Local |
| **Avatar Generation** | Image/avatar prompt generation | FLock DeepSeek V3.2 |
| **Likeness Fingerprint** | Unauthorized use detection & scanning | FLock DeepSeek V3.2 |
| **Web3 Rights** | ERC-721 metadata on Polygon | Local (Animoca) |
| **Talent Discovery** | AI-driven talent matching for brands | FLock DeepSeek V3.2 |
| **Audit & Logging** | Immutable transaction logging | Local |

**Pipeline Orchestrator** coordinates all agents with full metadata tracking (tokens, models, latency).

---

## Slide 6: Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, TypeScript, Tailwind CSS (17 pages) |
| Backend | Python FastAPI, SQLAlchemy (31 API endpoints) |
| LLM (Primary) | FLock.io — 5 open-source models (Qwen3, DeepSeek, Kimi) |
| LLM (Legal) | Z.AI GLM-4.5 via OpenRouter (contract generation) |
| Agent Platform | OpenClaw Gateway (9 agents, 2 providers) |
| Observability | Anyway SDK (OpenTelemetry — 4 span types) |
| Web3 | ERC-721, Polygon (Animoca integration) |
| Auth | Supabase Auth + SHA-256 fallback |

---

## Slide 7: Bounty Track Coverage

### FLock.io ($5K) — Best Use of Open-Source AI Models
- **5 FLock models** powering all agent inference
- SDG 8/10/16 alignment with live tracking (`/api/sdg/impact`)
- Multi-channel: 17-page web app + full REST API

### Z.AI ($4K) — Best Use of GLM Model
- GLM-4.5 generates **12-section UK-law-compliant IP contracts** (14,000+ chars)
- GLM-4.5 generates **compliance executive summaries**
- Resilient 3-tier fallback: Z.AI Direct -> OpenRouter GLM -> FLock

### Claw for Human ($500) — Most Impactful AI Agent
- 9 agents protecting **human identity rights** in generative AI
- Full OpenClaw integration with gateway config
- Human-in-the-loop: agents process, humans approve

### AnyWay (Mac Mini) — Best Use of Anyway SDK
- OpenTelemetry with **4 span types** (session, agent, LLM, tool)
- 100% sample rate to Anyway collector
- Pricing API for commercialization

### Animoca ($1K) — Best Multi-Agent System
- **9 coordinated agents** in 7-step pipeline
- Agent decision history API + per-agent statistics
- **Web3 ERC-721** smart contract metadata on Polygon
- Full audit trail with Claw Console

---

## Slide 8: SDG Alignment

| SDG | How We Contribute |
|-----|-------------------|
| **SDG 8: Decent Work** | Fair compensation for creators. Negotiator agent ensures market-rate pricing. |
| **SDG 10: Reduced Inequalities** | Individual creators get the same IP protection as corporations. Compliance blocks unfair requests. |
| **SDG 16: Peace, Justice** | Transparent, auditable licensing with UK law compliance. Every transaction logged. |

Live metrics: `GET /api/sdg/impact`

---

## Slide 9: What Makes Us Different

| Feature | Face Library | Others |
|---------|-------------|--------|
| AI-generated contracts | 12-section UK-law contract in ~30s | Manual legal process |
| Multi-agent pipeline | 9 agents, 7 steps, fully autonomous | Single-purpose tools |
| Compliance-first | Risk assessment before any processing | Compliance as afterthought |
| Web3 rights | On-chain IP tracking (ERC-721, Polygon) | No blockchain |
| Human-in-the-loop | Talent approves every use | Consent buried in ToS |
| Open-source AI | All FLock open-source models | Proprietary models |
| Full audit trail | Every agent decision logged and traceable | Black box |

---

## Slide 10: Key Metrics (Live Pipeline Test)

| Metric | Value |
|--------|-------|
| Pipeline execution time | ~90-150 seconds |
| Agents executed per request | 8 (+ orchestrator) |
| Unique models per pipeline | 3 (DeepSeek, Qwen3, GLM-4.5) |
| Tokens per pipeline | ~6,500 |
| Contract length | 12,000-14,000 characters |
| Contract sections | 12 (UK law compliant) |
| Risk categories assessed | 5 (content, brand, legal, ethical, geo) |
| API endpoints | 31 |
| Frontend pages | 17 |
| Providers used | FLock + Z.AI (via OpenRouter) |

---

## Slide 11: Product Screenshots

### Landing Page
- Hero: "Secure Likeness Licensing Infrastructure"
- Trust bar: AI-Generated Contracts, Watermarked Drafts, Escrow, Time-Stamping, UK Law
- Three portals: Talent, Agents, Brands
- 9-agent showcase with providers and SDG tags

### Brand Dashboard
- License request form (talent, campaign, content type, duration, regions)
- "Run Orchestrator" button triggers full 7-agent pipeline
- Expandable audit logs per request

### License Detail Page
- Risk assessment with color-coded risk flags
- AI-negotiated price with breakdown
- Full contract text (expandable)
- Web3 ERC-721 metadata
- Complete audit timeline

### Claw Console
- Real-time agent activity feed
- Filter by agent type
- Token usage and model tracking

---

## Slide 12: Future Roadmap

1. **Real image generation** — Connect avatar prompts to Z.AI image API
2. **Live Web3 deployment** — Deploy ERC-721 contracts on Polygon mainnet
3. **Supabase PostgreSQL** — Scale from SQLite to managed PostgreSQL
4. **Real-time notifications** — WebSocket push for license approvals
5. **Mobile app** — React Native talent approval app
6. **Marketplace** — Public talent discovery marketplace
7. **API monetization** — Usage-based pricing for brands via Stripe

---

## Slide 13: Team

### Not.Just.AI

Built at the **UK AI Agent Hackathon EP.4 x OpenClaw**
Imperial College London, March 2026

---

## Thank You

**Face Library** — Your likeness, your terms.

| | |
|---|---|
| Live Demo | https://face-library.vercel.app |
| API Docs | https://face-library.onrender.com/docs |
| GitHub | https://github.com/aswin-giridhar/face-library |
