import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { StudentStatus } from "../api/client";

interface StatusBannerProps {
    status: StudentStatus;
}

export function StatusBanner({ status }: StatusBannerProps) {
    const getStatusInfo = () => {
        switch (status) {
            case "ON_TRACK":
                return {
                    color: "#10b981",
                    text: "On Track",
                    icon: "✅",
                    message: "You're doing great! Keep up the good work.",
                };
            case "NEEDS_INTERVENTION":
                return {
                    color: "#f59e0b",
                    text: "Under Review",
                    icon: "⏳",
                    message: "Your performance is being reviewed.",
                };
            case "ASSIGNED_TASK":
                return {
                    color: "#6366f1",
                    text: "Task Assigned",
                    icon: "📋",
                    message: "Complete your remedial task to continue.",
                };
            default:
                return {
                    color: "#64748b",
                    text: "Unknown",
                    icon: "❓",
                    message: "",
                };
        }
    };

    const info = getStatusInfo();

    return (
        <View style={[styles.container, { borderLeftColor: info.color }]}>
            <View style={styles.header}>
                <Text style={styles.icon}>{info.icon}</Text>
                <Text style={[styles.statusText, { color: info.color }]}>
                    {info.text}
                </Text>
            </View>
            {info.message && (
                <Text style={styles.message}>{info.message}</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#1a1f35",
        borderRadius: 8,
        padding: 16,
        borderLeftWidth: 4,
        marginVertical: 8,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
    },
    icon: {
        fontSize: 20,
        marginRight: 12,
    },
    statusText: {
        fontSize: 16,
        fontWeight: "600",
    },
    message: {
        marginTop: 8,
        fontSize: 14,
        color: "#94a3b8",
        marginLeft: 32,
    },
});
