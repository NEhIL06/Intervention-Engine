from typing import Dict, List
from fastapi import WebSocket
from uuid import UUID

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[UUID, List[WebSocket]] = {}

    async def connect(self, student_id: UUID, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.setdefault(student_id, []).append(websocket)

    def disconnect(self, student_id: UUID, websocket: WebSocket):
        conns = self.active_connections.get(student_id, [])
        if websocket in conns:
            conns.remove(websocket)
        if not conns:
            self.active_connections.pop(student_id, None)

    async def send_to_student(self, student_id: UUID, data: dict):
        for ws in self.active_connections.get(student_id, []):
            await ws.send_json(data)

manager = ConnectionManager()
