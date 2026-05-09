import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

interface Props {
    onDegreeChange: (degree: string) => void;
    apiBaseUrl: string;
}

export default function SmartDegreeInput({ onDegreeChange, apiBaseUrl }: Props) {
    const [inputValue, setInputValue] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSelected, setIsSelected] = useState(false);

    // Debounced backend call for fuzzy degree suggestions
    useEffect(() => {
        if (isSelected) return; // Don't search after user has selected a suggestion

        const delayDebounceFn = setTimeout(async () => {
            if (inputValue.trim().length >= 2) {
                setIsLoading(true);
                try {
                    const response = await axios.get(`${apiBaseUrl}/api/suggest-degrees`, {
                        params: { q: inputValue.trim() },
                        timeout: 3000,
                    });
                    setSuggestions(response.data.suggestions || []);
                } catch (error) {
                    console.log('Degree suggestion API unavailable');
                    setSuggestions([]);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setSuggestions([]);
            }
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [inputValue, isSelected, apiBaseUrl]);

    const selectDegree = (degree: string) => {
        setInputValue(degree);
        setSuggestions([]);
        setIsSelected(true);
        onDegreeChange(degree);
    };

    const handleTextChange = (text: string) => {
        setInputValue(text);
        setIsSelected(false);
        onDegreeChange(text); // Always send current text back up
    };

    const clearDegree = () => {
        setInputValue('');
        setSuggestions([]);
        setIsSelected(false);
        onDegreeChange('');
    };

    return (
        <View style={styles.container}>
            <View style={styles.inputRow}>
                <TextInput
                    style={[styles.input, isSelected && styles.inputSelected]}
                    value={inputValue}
                    onChangeText={handleTextChange}
                    placeholder="e.g. BSc in IT, Master in CS..."
                    placeholderTextColor="#94A3B8"
                />
                {isLoading && <ActivityIndicator size="small" color="#2E7D32" style={styles.spinner} />}
                {isSelected && (
                    <TouchableOpacity onPress={clearDegree} style={styles.clearBtn}>
                        <Ionicons name="close-circle" size={20} color="#64748B" />
                    </TouchableOpacity>
                )}
            </View>

            {!isSelected && inputValue.trim().length >= 2 && (
                <Text style={styles.hint}>
                    <Ionicons name="information-circle-outline" size={12} color="#94A3B8" /> Tip: "BSc", "MSc", "CS" all work — we'll match it!
                </Text>
            )}

            {suggestions.length > 0 && (
                <ScrollView style={styles.suggestionBox} keyboardShouldPersistTaps="handled" nestedScrollEnabled={true}>
                    {suggestions.map((item, index) => (
                        <TouchableOpacity key={index} style={styles.suggestionItem} onPress={() => selectDegree(item)}>
                            <Ionicons name="school-outline" size={16} color="#2E7D32" style={{ marginRight: 10 }} />
                            <Text style={styles.suggestionText}>{item}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { position: 'relative', zIndex: 40 },
    inputRow: { position: 'relative' },
    input: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 14, fontSize: 16, color: '#1E293B', paddingRight: 40 },
    inputSelected: { borderColor: '#2E7D32', backgroundColor: '#E8F5E9' },
    spinner: { position: 'absolute', right: 14, top: 16 },
    clearBtn: { position: 'absolute', right: 14, top: 16 },
    hint: { fontSize: 12, color: '#94A3B8', marginTop: 6, marginLeft: 4 },
    suggestionBox: { position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#FFFFFF', borderRadius: 12, marginTop: 5, elevation: 5, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, maxHeight: 200, zIndex: 100, borderWidth: 1, borderColor: '#C8E6C9' },
    suggestionItem: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
    suggestionText: { color: '#1E293B', fontSize: 15, fontWeight: '500' }
});
