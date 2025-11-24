import React from "react";
import { View, Text, StyleSheet } from "react-native";

export function LockedView() {
    return (
        <View style={styles.container}>
            <View style={styles.iconContainer}>
                <Text style={styles.icon}>🔒</Text>
            </View>

            <Text style={styles.title}>System Locked</Text>

            <Text style={styles.message}>
                Analysis in progress. Waiting for Mentor...
            </Text>

            <View style={styles.statusBar}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Processing your submission</Text>
            </View>

            <Text style={styles.hint}>
                You'll be notified when the mentor reviews your performance.
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "#1a1f35",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 24,
    },
    icon: {
        fontSize: 48,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#ffffff",
        marginBottom: 16,
        textAlign: "center",
    },
    message: {
        fontSize: 18,
        color: "#94a3b8",
        textAlign: "center",
        marginBottom: 32,
        lineHeight: 26,
    },
    statusBar: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1a1f35",
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        marginBottom: 24,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#f59e0b",
        marginRight: 12,
    },
    statusText: {
        color: "#f59e0b",
        fontSize: 14,
        fontWeight: "600",
    },
    hint: {
        fontSize: 14,
        color: "#64748b",
        textAlign: "center",
        fontStyle: "italic",
    },
});
