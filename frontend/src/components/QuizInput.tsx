import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";

interface QuizInputProps {
    value: string;
    onChangeText: (text: string) => void;
}

export function QuizInput({ value, onChangeText }: QuizInputProps) {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>Daily Quiz Score (0-10)</Text>
            <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChangeText}
                keyboardType="numeric"
                placeholder="Enter score"
                placeholderTextColor="#64748b"
                maxLength={2}
            />
            {value && (parseInt(value) > 10 || parseInt(value) < 0) && (
                <Text style={styles.error}>Score must be between 0 and 10</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 12,
    },
    label: {
        fontSize: 16,
        fontWeight: "600",
        color: "#ffffff",
        marginBottom: 8,
    },
    input: {
        backgroundColor: "#1a1f35",
        borderRadius: 8,
        padding: 16,
        fontSize: 18,
        color: "#ffffff",
        borderWidth: 2,
        borderColor: "#334155",
    },
    error: {
        color: "#ef4444",
        fontSize: 14,
        marginTop: 4,
    },
});
