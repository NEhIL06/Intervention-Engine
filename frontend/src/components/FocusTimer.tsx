import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface FocusTimerProps {
    onFocusMinutesChange: (minutes: number) => void;
}

export function FocusTimer({ onFocusMinutesChange }: FocusTimerProps) {
    const [startTime, setStartTime] = useState<number | null>(null);
    const [elapsedMinutes, setElapsedMinutes] = useState(0);
    const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

    const isRunning = startTime !== null;

    const startTimer = () => {
        const now = Date.now();
        setStartTime(now);

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
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Focus Timer</Text>

            <View style={styles.timerDisplay}>
                <Text style={styles.timerText}>
                    {elapsedMinutes} {elapsedMinutes === 1 ? "minute" : "minutes"}
                </Text>
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
                <Text style={styles.hint}>Stay focused! Timer is running...</Text>
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
    hint: {
        marginTop: 12,
        fontSize: 14,
        color: "#94a3b8",
        textAlign: "center",
        fontStyle: "italic",
    },
});
