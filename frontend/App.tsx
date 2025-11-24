import React from "react";
import { SafeAreaView, View, Text, StyleSheet, StatusBar } from "react-native";
import { FocusScreen } from "./src/screens/FocusScreen";

export default function App() {
    return (
        <>
            <StatusBar barStyle="light-content" backgroundColor="#050816" />
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>⚡ Focus Mode</Text>
                    <Text style={styles.subtitle}>Intervention Engine Demo</Text>
                </View>
                <View style={styles.content}>
                    <FocusScreen />
                </View>
            </SafeAreaView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#050816",
    },
    header: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
        backgroundColor: "#0a0f1e",
        borderBottomWidth: 1,
        borderBottomColor: "#1a1f35",
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#ffffff",
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: "#6366f1",
        fontWeight: "600",
        letterSpacing: 1,
        textTransform: "uppercase",
    },
    content: {
        flex: 1,
    },
});
