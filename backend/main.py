import json
import os
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, validator
from typing import List, Optional

app = FastAPI(title="Expense Claims API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_FILE = "claims.json"

class ClaimRequest(BaseModel):
    employee_name: str
    expense_type: str
    amount: float
    expense_date: str

    @validator("employee_name")
    def employee_name_required(cls, v):
        if not v or not v.strip():
            raise ValueError("Employee name is required")
        return v

    @validator("expense_type")
    def expense_type_required(cls, v):
        if not v or not v.strip():
            raise ValueError("Expense type is required")
        return v

    @validator("amount")
    def amount_positive(cls, v):
        if v <= 0:
            raise ValueError("Amount must be greater than zero")
        return v

    @validator("expense_date")
    def date_not_future(cls, v):
        try:
            expense_date = datetime.strptime(v, "%Y-%m-%d").date()
            if expense_date > datetime.now().date():
                raise ValueError("Expense date cannot be in the future")
        except ValueError as e:
            if "Expense date" in str(e):
                raise
            raise ValueError("Invalid date format, use YYYY-MM-DD")
        return v

class Claim(ClaimRequest):
    id: str
    status: str = "Pending"

class UpdateClaimStatusRequest(BaseModel):
    status: str

    @validator("status")
    def status_valid(cls, v):
        if v not in ["Approved", "Rejected"]:
            raise ValueError("Status must be 'Approved' or 'Rejected'")
        return v

class ClaimSummary(BaseModel):
    total_count: int
    total_approved_amount: float
    pending_count: int
    approved_count: int
    rejected_count: int

def load_claims():
    if not os.path.exists(DATA_FILE):
        return {"claims": [], "next_id": 1}
    with open(DATA_FILE, "r") as f:
        return json.load(f)

def save_claims(data):
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=2)

def get_next_claim_id():
    data = load_claims()
    next_id = data.get("next_id", 1)
    data["next_id"] = next_id + 1
    save_claims(data)
    return f"CLM{next_id:03d}"

@app.get("/claims", response_model=List[Claim])
def get_all_claims(status: Optional[str] = None):
    data = load_claims()
    claims = data.get("claims", [])

    if status:
        if status not in ["Pending", "Approved", "Rejected"]:
            raise HTTPException(status_code=400, detail="Invalid status filter")
        claims = [c for c in claims if c.get("status") == status]

    return claims

@app.post("/claims", response_model=Claim)
def submit_claim(claim_request: ClaimRequest):
    data = load_claims()
    claim_id = get_next_claim_id()

    new_claim = {
        "id": claim_id,
        "employee_name": claim_request.employee_name,
        "expense_type": claim_request.expense_type,
        "amount": claim_request.amount,
        "expense_date": claim_request.expense_date,
        "status": "Pending"
    }

    data["claims"].append(new_claim)
    save_claims(data)

    return new_claim

@app.patch("/claims/{claim_id}", response_model=Claim)
def update_claim_status(claim_id: str, update_request: UpdateClaimStatusRequest):
    data = load_claims()
    claims = data.get("claims", [])

    claim = next((c for c in claims if c.get("id") == claim_id), None)
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    current_status = claim.get("status")
    if current_status != "Pending":
        raise HTTPException(
            status_code=400,
            detail=f"Cannot update {current_status} claim. Only Pending claims can be modified."
        )

    claim["status"] = update_request.status
    save_claims(data)

    return claim

@app.get("/claims/summary", response_model=ClaimSummary)
def get_summary():
    data = load_claims()
    claims = data.get("claims", [])

    total_count = len(claims)
    total_approved_amount = sum(c.get("amount", 0) for c in claims if c.get("status") == "Approved")
    pending_count = sum(1 for c in claims if c.get("status") == "Pending")
    approved_count = sum(1 for c in claims if c.get("status") == "Approved")
    rejected_count = sum(1 for c in claims if c.get("status") == "Rejected")

    return {
        "total_count": total_count,
        "total_approved_amount": total_approved_amount,
        "pending_count": pending_count,
        "approved_count": approved_count,
        "rejected_count": rejected_count
    }

@app.get("/health")
def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
