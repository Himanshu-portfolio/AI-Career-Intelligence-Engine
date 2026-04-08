from pydantic import BaseModel
from typing import Optional


class ResumeUploadResponse(BaseModel):
    user_id: str
    profile: dict


class ProfileSetup(BaseModel):
    target_role: str = "Backend Engineer"
    target_companies: list[str] = ["Amazon", "Flipkart", "Razorpay"]
    dsa_level: int = 2
    backend_level: int = 6
    system_design_level: int = 4
    hours_per_week: int = 15


class JobInput(BaseModel):
    job_text: str
    url: Optional[str] = None
    source: str = "manual"


class ProgressUpdate(BaseModel):
    status: str  # NOT_STARTED, IN_PROGRESS, COMPLETED, NEEDS_REVIEW
    score: Optional[float] = None


class MockQuestionRequest(BaseModel):
    session_type: str = "dsa"
    company: str = "Generic"
    difficulty: str = "medium"
    topic: str = "arrays"


class AnswerSubmission(BaseModel):
    answer_text: str
    code: str = ""
