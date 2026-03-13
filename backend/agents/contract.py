"""IP & Contract Agent -- The single AI agent for the MVP.

Handles:
- Contract generation from templates (Standard, Exclusive, Time-Limited)
- IP validation and analysis
- Contract improvement based on talent/client needs
"""
from llm_client import chat


# -- Contract Templates ------------------------------------------------------

TEMPLATES = {
    "standard": {
        "name": "Standard License",
        "description": "Non-exclusive license for digital content usage.",
        "exclusivity": False,
        "default_duration_days": 90,
    },
    "exclusive": {
        "name": "Exclusive License",
        "description": "Exclusive rights to use likeness within specified category.",
        "exclusivity": True,
        "default_duration_days": 180,
    },
    "time_limited": {
        "name": "Time-Limited License",
        "description": "Short-term campaign license with strict time bounds.",
        "exclusivity": False,
        "default_duration_days": 30,
    },
}


class ContractAgent:
    name = "contract_agent"

    SYSTEM_PROMPT = """You are the IP & Contract Agent for Face Library, a secure likeness licensing platform.

Your role is to generate, validate, and improve legally-compliant licensing contracts for the use of a person's likeness in AI-generated content.

All contracts must align with UK legal frameworks:
- UK Copyright, Designs and Patents Act 1988
- UK GDPR (Data Protection Act 2018)
- Consumer Rights Act 2015
- The right to one's own image under UK common law

Generate a complete, professional licensing contract with these sections:

1. PARTIES -- Licensor (talent) and Licensee (client) details
2. DEFINITIONS -- Key terms (Likeness, Licensed Content, Territory, etc.)
3. GRANT OF LICENSE -- Scope, duration, exclusivity, permitted uses
4. RESTRICTIONS -- What the licensee cannot do (deepfakes, defamatory use, etc.)
5. COMPENSATION -- Fee structure, payment terms
6. INTELLECTUAL PROPERTY -- IP ownership, moral rights, no AI training clause
7. DATA PROTECTION -- GDPR compliance
8. TERMINATION -- Conditions, notice period, post-termination obligations
9. DISPUTE RESOLUTION -- Governing law (England & Wales)
10. GENERAL PROVISIONS -- Entire agreement, severability

Output the full contract text with proper legal clause numbering."""

    VALIDATION_PROMPT = """You are an IP law specialist reviewing a licensing contract for Face Library.

Analyze the contract for:
1. Legal compliance with UK law (Copyright Act 1988, GDPR, Consumer Rights Act 2015)
2. IP protection adequacy -- are the talent's likeness rights properly protected?
3. Fairness -- are terms balanced between talent and client?
4. Completeness -- are any critical clauses missing?
5. Risk areas -- any terms that could be exploited?

Provide your analysis as JSON:
{
    "is_valid": true/false,
    "overall_score": 1-10,
    "issues": [{"severity": "high/medium/low", "clause": "...", "issue": "...", "suggestion": "..."}],
    "missing_clauses": ["..."],
    "recommendations": ["..."],
    "summary": "Brief overall assessment"
}"""

    def generate_contract(self, talent_profile: dict, client_profile: dict, license_request: dict) -> dict:
        """Generate a new contract based on license type and request details."""
        license_type = license_request.get("license_type", "standard")
        template = TEMPLATES.get(license_type, TEMPLATES["standard"])

        messages = [
            {"role": "system", "content": self.SYSTEM_PROMPT},
            {"role": "user", "content": f"""Generate a {template['name']} contract:

LICENSOR (TALENT):
- Name: {talent_profile.get('name', '[TALENT NAME]')}
- Bio: {talent_profile.get('bio', 'N/A')}
- Restricted categories: {talent_profile.get('restricted_categories', 'None')}
- Min price: GBP {talent_profile.get('min_price_per_use', 100)}
- AI training allowed: {talent_profile.get('allow_ai_training', False)}

LICENSEE (CLIENT):
- Company: {client_profile.get('company_name', '[CLIENT NAME]')}
- Industry: {client_profile.get('industry', 'N/A')}

LICENSE DETAILS:
- Type: {template['name']} ({template['description']})
- Use case: {license_request.get('use_case', 'AI-generated content')}
- Content type: {license_request.get('content_type', 'image')}
- Duration: {license_request.get('desired_duration_days', template['default_duration_days'])} days
- Regions: {license_request.get('desired_regions', 'United Kingdom')}
- Exclusivity: {template['exclusivity'] or license_request.get('exclusivity', False)}
- Proposed price: GBP {license_request.get('proposed_price', talent_profile.get('min_price_per_use', 100))}

Generate a complete, enforceable contract under the laws of England and Wales."""},
        ]

        result = chat(messages, temperature=0.3, max_tokens=4096)

        return {
            "agent": self.name,
            "contract_text": result["content"],
            "license_type": license_type,
            "model": result["model"],
            "tokens_used": result["tokens_used"],
        }

    def validate_contract(self, contract_text: str) -> dict:
        """Validate an existing contract for IP compliance and completeness."""
        from llm_client import chat_json

        messages = [
            {"role": "system", "content": self.VALIDATION_PROMPT},
            {"role": "user", "content": f"Review this licensing contract:\n\n{contract_text}"},
        ]

        result = chat_json(messages, temperature=0.2, max_tokens=2048)

        return {
            "agent": self.name,
            "action": "validation",
            "result": result.get("parsed"),
            "model": result["model"],
            "tokens_used": result["tokens_used"],
        }

    def improve_contract(self, contract_text: str, feedback: str) -> dict:
        """Improve a contract based on talent/client feedback."""
        messages = [
            {"role": "system", "content": self.SYSTEM_PROMPT},
            {"role": "user", "content": f"""Improve this existing contract based on the feedback provided.

EXISTING CONTRACT:
{contract_text}

FEEDBACK / REQUESTED CHANGES:
{feedback}

Generate the improved contract with all changes incorporated. Maintain legal compliance."""},
        ]

        result = chat(messages, temperature=0.3, max_tokens=4096)

        return {
            "agent": self.name,
            "action": "improvement",
            "contract_text": result["content"],
            "model": result["model"],
            "tokens_used": result["tokens_used"],
        }
