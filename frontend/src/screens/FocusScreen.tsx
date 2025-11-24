import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
    ScrollView,
    Alert,
} from "react-native";
import { useStudentState } from "../hooks/useStudentState";
import { submitDailyCheckin, markTaskComplete } from "../api/client";
import { STUDENT_ID } from "../config";
import { FocusTimer } from "../components/FocusTimer";
import { QuizInput } from "../components/QuizInput";
import { LockedView } from "../components/LockedView";
import { RemedialView } from "../components/RemedialView";
import { StatusBanner } from "../components/StatusBanner";

export function FocusScreen() {
    const { status, task, loading, error } = useStudentState();

    const [quizScore, setQuizScore] = useState("");
    const [focusMinutes, setFocusMinutes] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [marking, setMarking] = useState(false);

    // Loading state
    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#6366f1" />
                <Text style={styles.loadingText}>Loading status...</Text>
            </View>
        );
    }

    // Error state
    if (error) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.errorText}>{error}</Text>
                <Text style={styles.errorHint}>
                    Please check your internet connection and refresh.
                </Text>
            </View>
        );
    }

    // Handle daily check-in submission
    const handleSubmit = async () => {
        const score = parseInt(quizScore);

        // Validation
        if (isNaN(score) || score < 0 || score > 10) {
            Alert.alert("Invalid Score", "Please enter a quiz score between 0 and 10");
            return;
        }

        if (focusMinutes === 0) {
            Alert.alert("No Focus Time", "Please start and stop the timer first");
            return;
        }

        try {
            setSubmitting(true);
            console.log("Submitting check-in:", { score, focusMinutes });

            const response = await submitDailyCheckin(STUDENT_ID, score, focusMinutes);

            console.log("Check-in response:", response);

            // Show feedback
            Alert.alert("Submitted!", response.status);

            // Reset form
            setQuizScore("");
            setFocusMinutes(0);
        } catch (error: any) {
            console.error("Submission error:", error);
            Alert.alert("Error", "Failed to submit check-in. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    // Handle marking task complete
    const handleMarkComplete = async () => {
        try {
            setMarking(true);
            console.log("Marking task complete");

            await markTaskComplete(STUDENT_ID);

            console.log("Task marked complete");
            // WebSocket will update status back to ON_TRACK
        } catch (error: any) {
            console.error("Mark complete error:", error);
            Alert.alert("Error", "Failed to mark task complete. Please try again.");
        } finally {
            setMarking(false);
        }
    };

    // ---------- LOCKED STATE ----------
    if (status === "NEEDS_INTERVENTION") {
        return (
            <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
                <StatusBanner status={status} />
                <LockedView />
            </ScrollView>
        );
    }

    // ---------- REMEDIAL STATE ----------
    if (status === "ASSIGNED_TASK") {
        return (
            <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
                <StatusBanner status={status} />
                <RemedialView
                    task={task || "Complete the assigned task"}
                    onMarkComplete={handleMarkComplete}
                    isLoading={marking}
                />
            </ScrollView>
        );
    }

    // ---------- NORMAL STATE (ON_TRACK) ----------
    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
            <StatusBanner status={status} />

            <View style={styles.content}>
                <Text style={styles.sectionTitle}>Daily Check-In</Text>
                <Text style={styles.sectionDescription}>
                    Track your focus time and complete the daily quiz.
                </Text>

                <FocusTimer onFocusMinutesChange={setFocusMinutes} />

                <QuizInput value={quizScore} onChangeText={setQuizScore} />

                <TouchableOpacity
                    style={[
                        styles.submitButton,
                        submitting && styles.submitButtonDisabled,
                    ]}
                    onPress={handleSubmit}
                    disabled={submitting}
                >
                    <Text style={styles.submitButtonText}>
                        {submitting ? "Submitting..." : "Submit Daily Check-In"}
                    </Text>
                </TouchableOpacity>

                <View style={styles.infoBox}>
                    <Text style={styles.infoText}>
                        ℹ️ You need a quiz score {'>'} 7 and focus time {'>'} 60 minutes to pass.
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#050816",
    },
    scrollContent: {
        padding: 16,
    },
    centerContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#050816",
        padding: 24,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: "#94a3b8",
    },
    errorIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    errorText: {
        fontSize: 18,
        color: "#ef4444",
        textAlign: "center",
        marginBottom: 8,
    },
    errorHint: {
        fontSize: 14,
        color: "#64748b",
        textAlign: "center",
    },
    content: {
        flex: 1,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#ffffff",
        marginTop: 16,
        marginBottom: 8,
    },
    sectionDescription: {
        fontSize: 14,
        color: "#94a3b8",
        marginBottom: 16,
        lineHeight: 20,
    },
    submitButton: {
        backgroundColor: "#6366f1",
        borderRadius: 8,
        padding: 18,
        alignItems: "center",
        marginTop: 24,
    },
    submitButtonDisabled: {
        backgroundColor: "#4b5563",
        opacity: 0.6,
    },
    submitButtonText: {
        color: "#ffffff",
        fontSize: 18,
        fontWeight: "600",
    },
    infoBox: {
        backgroundColor: "#1a1f35",
        borderRadius: 8,
        padding: 16,
        marginTop: 16,
        borderWidth: 1,
        borderColor: "#334155",
    },
    infoText: {
        fontSize: 14,
        color: "#94a3b8",
        lineHeight: 20,
    },
});
