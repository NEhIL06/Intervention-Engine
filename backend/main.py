from fastapi import FastAPI, Depends, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
import httpx

from contextlib import asynccontextmanager
from fastapi import FastAPI
from db import get_db, engine, Base
from websocket_manager import manager
from schemas import (
    DailyCheckinRequest, DailyCheckinResponse,
    AssignInterventionRequest, MarkCompleteRequest,
    SimpleMessage, StudentStatusResponse
)
from models import (
    Student, DailyLog, Intervention,
    StudentStatus, CheckinResult, InterventionStatus
)
from config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Don't create tables on startup - defer until first request
    # This avoids IPv6 connection issues during Render deployment
    print("App starting up...")
    
    yield
    
    print("System shutting down")

app = FastAPI(title="Alcovia Intervention Backend",lifespan=lifespan)

# Parse allowed origins from settings
# Supports comma-separated list or "*" for all origins
if settings.allowed_origins == "*":
    origins = ["https://interventionengine.netlify.app"]
else:
    origins = [origin.strip() for origin in settings.allowed_origins.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    """Health check endpoint that also ensures database tables are created"""
    try:
        # Try to create tables if they don't exist (idempotent operation)
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        return {"status": "ok", "database": "connected"}
    except Exception as e:
        # Even if DB connection fails, return ok so Render doesn't restart
        print(f"Database connection note: {e}")
        return {"status": "ok", "database": "initializing"}

@app.websocket("/ws/{student_id}")
async def websocket_endpoint(websocket: WebSocket, student_id: str):
    sid = UUID(student_id)
    await manager.connect(sid, websocket)
    try:
        # keep connection open; we don't expect messages from client
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(sid, websocket)

@app.post("/daily-checkin", response_model=DailyCheckinResponse)
async def daily_checkin(
    payload: DailyCheckinRequest,
    db: AsyncSession = Depends(get_db),
):
    # 1. Load student
    result = await db.execute(select(Student).where(Student.id == payload.student_id))
    student = result.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # 2. Evaluate performance
    is_success = payload.quiz_score > 7 and payload.focus_minutes > 60
    result_status = CheckinResult.SUCCESS if is_success else CheckinResult.FAILURE

    # 3. Log daily check-in
    log = DailyLog(
        student_id=payload.student_id,
        quiz_score=payload.quiz_score,
        focus_minutes=payload.focus_minutes,
        result_status=result_status,
    )
    db.add(log)

    if is_success:
        student.status = StudentStatus.ON_TRACK
        await db.commit()

        await manager.send_to_student(
            payload.student_id,
            {
                "event": "STATUS_CHANGED",
                "status": StudentStatus.ON_TRACK,
                "task": None,
            },
        )
        return DailyCheckinResponse(status="On Track")

    # Failure branch → set NEEDS_INTERVENTION
    student.status = StudentStatus.NEEDS_INTERVENTION
    await db.commit()

    # Trigger n8n workflow (fire-and-forget)
    async with httpx.AsyncClient() as client:
        try:
            await client.post(
                settings.n8n_webhook_url,
                json={
                    "student_id": str(student.id),
                    "student_name": student.name,
                    "quiz_score": payload.quiz_score,
                    "focus_minutes": payload.focus_minutes,
                },
                timeout=5,
            )
        except Exception:
            # For assignment: log, don't crash
            pass

    await manager.send_to_student(
        payload.student_id,
        {
            "event": "STATUS_CHANGED",
            "status": StudentStatus.NEEDS_INTERVENTION,
            "task": None,
            "message": "Analysis in progress. Waiting for Mentor...",
        },
    )

    return DailyCheckinResponse(status="Pending Mentor Review")

@app.post("/assign-intervention", response_model=SimpleMessage)
async def assign_intervention(
    payload: AssignInterventionRequest,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Student).where(Student.id == payload.student_id))
    student = result.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Timeout path: Auto-unlock
    if payload.task == "Auto-unlock":
        student.status = StudentStatus.ON_TRACK
        await db.commit()

        await manager.send_to_student(
            payload.student_id,
            {
                "event": "STATUS_CHANGED",
                "status": StudentStatus.ON_TRACK,
                "task": None,
            },
        )
        return SimpleMessage(message="Student auto-unlocked")

    # Normal mentor-approved path
    intervention = Intervention(
        student_id=payload.student_id,
        task=payload.task,        # e.g. "Read Chapter 4"
        assigned_by="mentor",
        status=InterventionStatus.PENDING,
    )
    db.add(intervention)
    student.status = StudentStatus.ASSIGNED_TASK
    await db.commit()

    await manager.send_to_student(
        payload.student_id,
        {
            "event": "INTERVENTION_ASSIGNED",
            "status": StudentStatus.ASSIGNED_TASK,
            "task": payload.task,
        },
    )

    return SimpleMessage(message="Intervention assigned")


@app.post("/mark-complete", response_model=SimpleMessage)
async def mark_complete(
    payload: MarkCompleteRequest,
    db: AsyncSession = Depends(get_db),
):
    # Find latest pending intervention
    from sqlalchemy import select, desc

    result = await db.execute(
        select(Intervention)
        .where(
            Intervention.student_id == payload.student_id,
            Intervention.status == InterventionStatus.PENDING,
        )
        .order_by(Intervention.assigned_at.desc())
    )
    intervention = result.scalar_one_or_none()
    if intervention:
        intervention.status = InterventionStatus.COMPLETED

    result = await db.execute(select(Student).where(Student.id == payload.student_id))
    student = result.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    student.status = StudentStatus.ON_TRACK
    await db.commit()

    await manager.send_to_student(
        payload.student_id,
        {
            "event": "STATUS_CHANGED",
            "status": StudentStatus.ON_TRACK,
            "task": None,
        },
    )

    return SimpleMessage(message="Task completed, back to normal state")


@app.get("/student/{student_id}/status", response_model=StudentStatusResponse)
async def get_student_status(
    student_id: str,
    db: AsyncSession = Depends(get_db),
):
    sid = UUID(student_id)
    result = await db.execute(select(Student).where(Student.id == sid))
    student = result.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    result = await db.execute(
        select(Intervention)
        .where(
            Intervention.student_id == sid,
            Intervention.status == InterventionStatus.PENDING,
        )
        .order_by(Intervention.assigned_at.desc())
    )
    intervention = result.scalar_one_or_none()

    return StudentStatusResponse(
        student_id=sid,
        status=student.status,
        current_task=intervention.task if intervention else None,
    )
