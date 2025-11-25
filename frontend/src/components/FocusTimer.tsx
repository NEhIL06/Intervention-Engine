import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";

interface FocusTimerProps {
    onFocusMinutesChange: (minutes: number) => void;
    onAutoLockTriggered: () => void; // Called when 3+ violations trigger auto-lock
}

export function FocusTimer({ onFocusMinutesChange, onAutoLockTriggered }: FocusTimerProps) {
    const [startTime, setStartTime] = useState<number | null>(null);
    const [elapsedMinutes, setElapsedMinutes] = useState(0);
    const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
    const [tabSwitchDetected, setTabSwitchDetected] = useState(false);
    const [penaltyCount, setPenaltyCount] = useState(0);
    const [autoLockTriggered, setAutoLockTriggered] = useState(false);

    const isRunning = startTime !== null;
    const MAX_VIOLATIONS = 3;

    // BONUS FEATURE: Tab Switching Detection with Auto-Lock
    useEffect(() => {
        if (!isRunning || autoLockTriggered) return;

        const handleVisibilityChange = () => {
            // If page becomes hidden while timer is running
            if (document.hidden) {
                console.log("⚠️ TAB SWITCH DETECTED - Session will be penalized");
                setTabSwitchDetected(true);

                // Auto-fail the session after 3 seconds of being hidden
                setTimeout(() => {
                    if (document.hidden && isRunning && !autoLockTriggered) {
                        console.log("❌ AUTO-FAILING session due to tab switch");
                        failSession();
                    }
                }, 3000);
            } else if (tabSwitchDetected) {
                // Returning to tab after switching away
                const newCount = penaltyCount + 1;
                const remaining = MAX_VIOLATIONS - newCount;

                if (remaining > 0) {
                    Alert.alert(
                        "⚠️ Tab Switch Detected",
                        `You switched away from the focus session. This has been logged as a penalty.\n\n${remaining} violation(s) remaining before auto-lock.`,
                        [{ text: "I Understand" }]
                    );
                }
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [isRunning, tabSwitchDetected, penaltyCount, autoLockTriggered]);

    const startTimer = () => {
        const now = Date.now();
        setStartTime(now);
        setTabSwitchDetected(false);

        // Update elapsed time every second
        const id = setInterval(() => {
            const elapsed = Math.floor((Date.now() - now) / 60000); // Convert to minutes
            setElapsedMinutes(elapsed);
        }, 1000);

        setIntervalId(id);
    };

    const stopTimer = () => {
        if (intervalId) {
            clearInterval(intervalId);
        }

        if (startTime) {
            const totalMinutes = Math.floor((Date.now() - startTime) / 60000);
            setElapsedMinutes(totalMinutes);
            onFocusMinutesChange(totalMinutes);
        }

        setStartTime(null);
        setIntervalId(null);
        setTabSwitchDetected(false);
    };

    const failSession = () => {
        if (intervalId) {
            clearInterval(intervalId);
        }

        const newPenaltyCount = penaltyCount + 1;
        setPenaltyCount(newPenaltyCount);

        // Check if we've reached the auto-lock threshold
        if (newPenaltyCount >= MAX_VIOLATIONS) {
            console.log(`🔒 AUTO-LOCK TRIGGERED: ${newPenaltyCount} violations reached`);

            // Stop timer completely
            setStartTime(null);
            setIntervalId(null);
            setElapsedMinutes(0);
            setTabSwitchDetected(false);
            setAutoLockTriggered(true);

            Alert.alert(
                "🔒 Account Locked",
                `You have exceeded the maximum tab switch violations (${MAX_VIOLATIONS}). Your account is now locked and the intervention process has been initiated. A mentor will review your case.`,
                [
                    {
                        text: "OK",
                        onPress: () => {
                            // Trigger the intervention flow (calls API to fail the check-in)
                            onAutoLockTriggered();
                        },
                    },
                ]
            );

            return;
        }

        // Regular session failure (not auto-lock yet)
        Alert.alert(
            "❌ Session Failed",
            `Focus session automatically failed due to tab switching. Please stay focused on this tab during your focus time.\n\nViolations: ${newPenaltyCount}/${MAX_VIOLATIONS}`,
            [
                {
                    text: "OK",
                    onPress: () => {
                        // Reset timer but don't record the time
                        setStartTime(null);
                        setIntervalId(null);
                        setElapsedMinutes(0);
                        setTabSwitchDetected(false);
                        onFocusMinutesChange(0); // Zero minutes for failed session
                    },
                },
            ]
        );

        console.log(`📝 Penalty logged. Total violations: ${newPenaltyCount}/${MAX_VIOLATIONS}`);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Focus Timer</Text>

            <View style={styles.timerDisplay}>
                <Text style={styles.timerText}>
                    {elapsedMinutes} {elapsedMinutes === 1 ? "minute" : "minutes"}
                </Text>
                {tabSwitchDetected && isRunning && (
                    <Text style={styles.warningText}>⚠️ Tab switch detected!</Text>
                )}
                {autoLockTriggered && (
                    <Text style={styles.lockText}>🔒 Auto-locked due to violations</Text>
                )}
            </View>

            <View style={styles.buttonContainer}>
                {!isRunning ? (
                    <TouchableOpacity
                        style={[styles.startButton, autoLockTriggered && styles.buttonDisabled]}
                        onPress={startTimer}
                        disabled={autoLockTriggered}
                    >
                        <Text style={styles.buttonText}>
                            {autoLockTriggered ? "Timer Disabled - Locked" : "Start Focus Timer"}
                        </Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={styles.stopButton} onPress={stopTimer}>
                        <Text style={styles.buttonText}>Stop & Use This Time</Text>
                    </TouchableOpacity>
                )}
            </View>

            {isRunning && !autoLockTriggered && (
                <View style={styles.hintContainer}>
                    <Text style={styles.hint}>⏱️ Stay focused! Timer is running...</Text>
                    <Text style={styles.warning}>
                        ⚠️ Switching tabs 3+ times will lock your account
                    </Text>
                </View>
            )}

            {penaltyCount > 0 && !autoLockTriggered && (
                <View style={[
                    styles.penaltyBox,
                    penaltyCount >= MAX_VIOLATIONS - 1 && styles.criticalPenaltyBox
                ]}>
                    <Text style={styles.penaltyText}>
                        ⚠️ Tab Switch Violations: {penaltyCount}/{MAX_VIOLATIONS}
                    </Text>
                    {penaltyCount >= MAX_VIOLATIONS - 1 && (
                        <Text style={styles.criticalWarning}>
                            🚨 CRITICAL: One more violation will lock your account!
                        </Text>
                    )}
                </View>
            )}

            {autoLockTriggered && (
                <View style={styles.lockBox}>
                    <Text style={styles.lockTitle}>🔒 Account Locked</Text>
                    <Text style={styles.lockMessage}>
                        Maximum violations reached. Intervention process initiated.
                    </Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#1a1f35",
        borderRadius: 12,
        padding: 20,
        marginVertical: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: "600",
        color: "#ffffff",
        marginBottom: 16,
    },
    timerDisplay: {
        backgroundColor: "#050816",
        borderRadius: 8,
        padding: 24,
        alignItems: "center",
        marginBottom: 16,
    },
    timerText: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#6366f1",
    },
    warningText: {
        marginTop: 8,
        fontSize: 14,
        color: "#f59e0b",
        fontWeight: "600",
    },
    lockText: {
        marginTop: 8,
        fontSize: 14,
        color: "#ef4444",
        fontWeight: "700",
    },
    buttonContainer: {
        marginTop: 8,
    },
    startButton: {
        backgroundColor: "#10b981",
        borderRadius: 8,
        padding: 16,
        alignItems: "center",
    },
    stopButton: {
        backgroundColor: "#ef4444",
        borderRadius: 8,
        padding: 16,
        alignItems: "center",
    },
    buttonDisabled: {
        backgroundColor: "#4b5563",
        opacity: 0.5,
    },
    buttonText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "600",
    },
    hintContainer: {
        marginTop: 12,
        alignItems: "center",
    },
    hint: {
        fontSize: 14,
        color: "#94a3b8",
        textAlign: "center",
        fontStyle: "italic",
    },
    warning: {
        marginTop: 4,
        fontSize: 12,
        color: "#f59e0b",
        textAlign: "center",
        fontWeight: "500",
    },
    penaltyBox: {
        marginTop: 12,
        backgroundColor: "#7f1d1d",
        borderRadius: 6,
        padding: 12,
        borderWidth: 1,
        borderColor: "#ef4444",
    },
    criticalPenaltyBox: {
        backgroundColor: "#450a0a",
        borderColor: "#dc2626",
        borderWidth: 2,
    },
    penaltyText: {
        color: "#fca5a5",
        fontSize: 13,
        fontWeight: "600",
        textAlign: "center",
    },
    criticalWarning: {
        marginTop: 8,
        color: "#fecaca",
        fontSize: 12,
        fontWeight: "700",
        textAlign: "center",
        textTransform: "uppercase",
    },
    lockBox: {
        marginTop: 12,
        backgroundColor: "#450a0a",
        borderRadius: 8,
        padding: 16,
        borderWidth: 2,
        borderColor: "#dc2626",
        alignItems: "center",
    },
    lockTitle: {
        color: "#fca5a5",
        fontSize: 16,
        fontWeight: "700",
        marginBottom: 8,
    },
    lockMessage: {
        color: "#fecaca",
        fontSize: 13,
        textAlign: "center",
        lineHeight: 18,
    },
});
