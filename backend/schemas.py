from pydantic import BaseModel
from uuid import UUID
from typing import Optional
from models import StudentStatus

class DailyCheckinRequest(BaseModel):
    student_id: UUID
    quiz_score: int
    focus_minutes: int

class DailyCheckinResponse(BaseModel):
    status: str

class AssignInterventionRequest(BaseModel):
    student_id: UUID
    task: str  # "Read Chapter 4" or "Auto-unlock"

class MarkCompleteRequest(BaseModel):
    student_id: UUID

class SimpleMessage(BaseModel):
    message: str

class StudentStatusResponse(BaseModel):
    student_id: UUID
    status: StudentStatus
    current_task: Optional[str] = None
