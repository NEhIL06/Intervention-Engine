import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";

interface FocusTimerProps {
    onFocusMinutesChange: (minutes: number) => void;
}

export function FocusTimer({ onFocusMinutesChange }: FocusTimerProps) {
    const [startTime, setStartTime] = useState<number | null>(null);
    const [elapsedMinutes, setElapsedMinutes] = useState(0);
    const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
    const [tabSwitchDetected, setTabSwitchDetected] = useState(false);
    const [penaltyCount, setPenaltyCount] = useState(0);

    const isRunning = startTime !== null;

    // BONUS FEATURE: Tab Switching Detection
    useEffect(() => {
        if (!isRunning) return;

        const handleVisibilityChange = () => {
            // If page becomes hidden while timer is running
            if (document.hidden) {
                console.log("⚠️ TAB SWITCH DETECTED - Session will be penalized");
                setTabSwitchDetected(true);

                // Auto-fail the session after 3 seconds of being hidden
                setTimeout(() => {
                    if (document.hidden && isRunning) {
                        console.log("❌ AUTO-FAILING session due to tab switch");
                        failSession();
                    }
                }, 3000);
            } else if (tabSwitchDetected) {
                // Returning to tab after switching away
                Alert.alert(
                    "⚠️ Tab Switch Detected",
                    "You switched away from the focus session. This has been logged as a penalty.",
                    [{ text: "I Understand" }]
                );
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [isRunning, tabSwitchDetected]);

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

        setPenaltyCount(prev => prev + 1);

        Alert.alert(
            "❌ Session Failed",
            "Focus session automatically failed due to tab switching. Please stay focused on this tab during your focus time.",
            [{
                text: "OK",
                onPress: () => {
                    // Reset timer but don't record the time
                    setStartTime(null);
                    setIntervalId(null);
                    setElapsedMinutes(0);
                    setTabSwitchDetected(false);
                    onFocusMinutesChange(0); // Zero minutes for failed session
                }
            }]
        );

        console.log(`📝 Penalty logged. Total violations: ${penaltyCount + 1}`);
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
            </View>

            <View style={styles.buttonContainer}>
                {!isRunning ? (
                    <TouchableOpacity style={styles.startButton} onPress={startTimer}>
                        <Text style={styles.buttonText}>Start Focus Timer</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={styles.stopButton} onPress={stopTimer}>
                        <Text style={styles.buttonText}>Stop & Use This Time</Text>
                    </TouchableOpacity>
                )}
            </View>

            {isRunning && (
                <View style={styles.hintContainer}>
                    <Text style={styles.hint}>⏱️ Stay focused! Timer is running...</Text>
                    <Text style={styles.warning}>
                        ⚠️ Switching tabs will fail your session
                    </Text>
                </View>
            )}

            {penaltyCount > 0 && (
                <View style={styles.penaltyBox}>
                    <Text style={styles.penaltyText}>
                        ⚠️ Tab Switch Violations: {penaltyCount}
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
    penaltyText: {
        color: "#fca5a5",
        fontSize: 13,
        fontWeight: "600",
        textAlign: "center",
    },
});
