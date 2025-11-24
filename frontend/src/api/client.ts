import axios from "axios";
import { BACKEND_HTTP_URL } from "../config";

// Create axios instance with base URL
export const api = axios.create({
    baseURL: BACKEND_HTTP_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Type definitions matching backend schemas
export type StudentStatus = "ON_TRACK" | "NEEDS_INTERVENTION" | "ASSIGNED_TASK";

export interface StudentStatusResponse {
    student_id: string;
    status: StudentStatus;
    current_task: string | null;
}

export interface DailyCheckinResponse {
    status: string;
}

export interface SimpleMessageResponse {
    message: string;
}

// API Functions

/**
 * Get current student status
 */
export async function getStudentStatus(studentId: string): Promise<StudentStatusResponse> {
    const res = await api.get(`/student/${studentId}/status`);
    return res.data;
}

/**
 * Submit daily check-in with quiz score and focus time
 */
export async function submitDailyCheckin(
    studentId: string,
    quizScore: number,
    focusMinutes: number
): Promise<DailyCheckinResponse> {
    const res = await api.post("/daily-checkin", {
        student_id: studentId,
        quiz_score: quizScore,
        focus_minutes: focusMinutes,
    });
    return res.data;
}

/**
 * Mark current remedial task as complete
 */
export async function markTaskComplete(studentId: string): Promise<SimpleMessageResponse> {
    const res = await api.post("/mark-complete", {
        student_id: studentId,
    });
    return res.data;
}
