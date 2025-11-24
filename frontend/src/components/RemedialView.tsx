import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface RemedialViewProps {
    task: string;
    onMarkComplete: () => void;
    isLoading: boolean;
}

export function RemedialView({ task, onMarkComplete, isLoading }: RemedialViewProps) {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.icon}>📚</Text>
                <Text style={styles.title}>Remedial Task Assigned</Text>
            </View>

            <View style={styles.taskCard}>
                <Text style={styles.taskLabel}>Your assigned task:</Text>
                <Text style={styles.taskText}>{task}</Text>
            </View>

            <Text style={styles.instructions}>
                Complete this task to return to normal focus mode.
            </Text>

            <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={onMarkComplete}
                disabled={isLoading}
            >
                <Text style={styles.buttonText}>
                    {isLoading ? "Marking Complete..." : "Mark Complete"}
                </Text>
            </TouchableOpacity>

            <Text style={styles.note}>
                Note: Only mark complete after you've finished the task.
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
    },
    header: {
        alignItems: "center",
        marginBottom: 32,
    },
    icon: {
        fontSize: 64,
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#ffffff",
        textAlign: "center",
    },
    taskCard: {
        backgroundColor: "#1a1f35",
        borderRadius: 12,
        padding: 24,
        marginBottom: 24,
        borderLeftWidth: 4,
        borderLeftColor: "#6366f1",
    },
    taskLabel: {
        fontSize: 14,
        color: "#94a3b8",
        marginBottom: 12,
        textTransform: "uppercase",
        letterSpacing: 1,
    },
    taskText: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#ffffff",
        lineHeight: 32,
    },
    instructions: {
        fontSize: 16,
        color: "#cbd5e1",
        textAlign: "center",
        marginBottom: 32,
        lineHeight: 24,
    },
    button: {
        backgroundColor: "#10b981",
        borderRadius: 8,
        padding: 18,
        alignItems: "center",
        marginBottom: 16,
    },
    buttonDisabled: {
        backgroundColor: "#4b5563",
        opacity: 0.6,
    },
    buttonText: {
        color: "#ffffff",
        fontSize: 18,
        fontWeight: "600",
    },
    note: {
        fontSize: 13,
        color: "#64748b",
        textAlign: "center",
        fontStyle: "italic",
    },
});
