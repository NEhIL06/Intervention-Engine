import { useEffect, useState } from "react";
import { BACKEND_WS_URL, STUDENT_ID } from "../config";
import { getStudentStatus, StudentStatus } from "../api/client";

interface StudentState {
    status: StudentStatus;
    task: string | null;
    loading: boolean;
    error: string | null;
}

interface WebSocketEvent {
    event: "STATUS_CHANGED" | "INTERVENTION_ASSIGNED";
    status: StudentStatus;
    task?: string | null;
    message?: string;
}

/**
 * Custom hook to manage student state with WebSocket real-time updates
 * Fetches initial status and maintains WebSocket connection for live updates
 */
export function useStudentState() {
    const [state, setState] = useState<StudentState>({
        status: "ON_TRACK",
        task: null,
        loading: true,
        error: null,
    });

    useEffect(() => {
        let ws: WebSocket | null = null;
        let isMounted = true;

        async function init() {
            try {
                // 1. Fetch initial status from backend
                console.log("Fetching initial student status...");
                const data = await getStudentStatus(STUDENT_ID);

                if (!isMounted) return;

                console.log("Initial status:", data);
                setState((prev) => ({
                    ...prev,
                    status: data.status,
                    task: data.current_task,
                    loading: false,
                    error: null,
                }));
            } catch (e: any) {
                console.error("Failed to load status:", e);
                if (!isMounted) return;
                setState((prev) => ({
                    ...prev,
                    loading: false,
                    error: "Failed to load status. Please check your connection.",
                }));
            }

            // 2. Open WebSocket connection for real-time updates
            try {
                const wsUrl = `${BACKEND_WS_URL}/ws/${STUDENT_ID}`;
                console.log("Connecting to WebSocket:", wsUrl);
                ws = new WebSocket(wsUrl);

                ws.onopen = () => {
                    console.log("WebSocket connected successfully");
                };

                ws.onmessage = (event) => {
                    try {
                        const data: WebSocketEvent = JSON.parse(event.data);
                        console.log("WebSocket event received:", data);

                        if (data.event === "STATUS_CHANGED") {
                            setState((prev) => ({
                                ...prev,
                                status: data.status,
                                task: data.task ?? null,
                            }));
                        } else if (data.event === "INTERVENTION_ASSIGNED") {
                            setState((prev) => ({
                                ...prev,
                                status: data.status,
                                task: data.task ?? null,
                            }));
                        }
                    } catch (error) {
                        console.error("Failed to parse WebSocket message:", error);
                    }
                };

                ws.onerror = (error) => {
                    console.error("WebSocket error:", error);
                };

                ws.onclose = () => {
                    console.log("WebSocket connection closed");
                };
            } catch (e) {
                console.error("Failed to open WebSocket:", e);
                // App can still function via HTTP polling if needed
            }
        }

        init();

        // Cleanup function
        return () => {
            isMounted = false;
            if (ws && ws.readyState === WebSocket.OPEN) {
                console.log("Closing WebSocket connection");
                ws.close();
            }
        };
    }, []);

    return state;
}
