# models.py
import enum
from sqlalchemy import Column, String, Integer, Enum, ForeignKey, DateTime, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from db import Base
import uuid

class StudentStatus(str, enum.Enum):
    ON_TRACK = "ON_TRACK"
    NEEDS_INTERVENTION = "NEEDS_INTERVENTION"
    ASSIGNED_TASK = "ASSIGNED_TASK"

class InterventionStatus(str, enum.Enum):
    PENDING = "PENDING"
    COMPLETED = "COMPLETED"

class CheckinResult(str, enum.Enum):
    SUCCESS = "SUCCESS"
    FAILURE = "FAILURE"

class Student(Base):
    __tablename__ = "students"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    status = Column(Enum(StudentStatus), nullable=False, server_default="ON_TRACK")
    created_at = Column(DateTime(timezone=True), server_default=text("NOW()"))

    interventions = relationship("Intervention", back_populates="student")
    daily_logs = relationship("DailyLog", back_populates="student")

class DailyLog(Base):
    __tablename__ = "daily_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id"), nullable=False)
    quiz_score = Column(Integer, nullable=False)
    focus_minutes = Column(Integer, nullable=False)
    result_status = Column(Enum(CheckinResult), nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=text("NOW()"))

    student = relationship("Student", back_populates="daily_logs")

class Intervention(Base):
    __tablename__ = "interventions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id"), nullable=False)
    task = Column(String, nullable=False)
    assigned_by = Column(String, nullable=False)  # "mentor" or "system"
    status = Column(Enum(InterventionStatus), nullable=False, server_default="PENDING")
    assigned_at = Column(DateTime(timezone=True), server_default=text("NOW()"))
    completed_at = Column(DateTime(timezone=True), nullable=True)

    student = relationship("Student", back_populates="interventions")
