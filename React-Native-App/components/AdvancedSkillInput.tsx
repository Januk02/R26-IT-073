import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

interface Props {
    onSkillsChange: (skills: string[]) => void;
    apiBaseUrl: string;
}

export default function AdvancedSkillInput({ onSkillsChange, apiBaseUrl }: Props) {
    const [inputValue, setInputValue] = useState('');
    const [skills, setSkills] = useState<string[]>([]);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Debounced backend call for fuzzy skill suggestions
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (inputValue.trim().length >= 2) {
                setIsLoading(true);
                try {
                    const response = await axios.get(`${apiBaseUrl}/api/suggest-skills`, {
                        params: { q: inputValue.trim() },
                        timeout: 3000,
                    });
                    const backendSuggestions = response.data.suggestions || [];
                    // Filter out already-added skills
                    const filtered = backendSuggestions.filter(
                        (s: string) => !skills.includes(s)
                    );
                    setSuggestions(filtered);
                } catch (error) {
                    console.log('Skill suggestion API unavailable, using local filter');
                    setSuggestions([]);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setSuggestions([]);
            }
        }, 250);
        return () => clearTimeout(delayDebounceFn);
    }, [inputValue, skills, apiBaseUrl]);

    const addSkill = (skill: string) => {
        const newSkills = [...skills, skill];
        setSkills(newSkills);
        setInputValue('');
        setSuggestions([]);
        onSkillsChange(newSkills);
    };

    const removeSkill = (skillToRemove: string) => {
        const newSkills = skills.filter(s => s !== skillToRemove);
        setSkills(newSkills);
        onSkillsChange(newSkills);
    };

    const handleTextChange = (text: string) => {
        if (text.endsWith(',') || text.endsWith(' ')) {
            const cleanSkill = text.slice(0, -1).trim();
            // Accepts ANY word the user types, even if not in the database
            if (cleanSkill && !skills.includes(cleanSkill)) {
                addSkill(cleanSkill);
            } else {
                setInputValue('');
            }
        } else {
            setInputValue(text);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.chipContainer}>
                {skills.map((skill, index) => (
                    <Animated.View key={index} entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} style={styles.chip}>
                        <Text style={styles.chipText}>{skill}</Text>
                        <TouchableOpacity onPress={() => removeSkill(skill)}>
                            <Ionicons name="close-circle" size={18} color="#1E3A8A" />
                        </TouchableOpacity>
                    </Animated.View>
                ))}
            </View>

            <View style={styles.inputRow}>
                <TextInput
                    style={styles.input}
                    value={inputValue}
                    onChangeText={handleTextChange}
                    placeholder={skills.length === 0 ? "Type a skill and press comma or space..." : "Add another skill..."}
                    placeholderTextColor="#94A3B8"
                />
                {isLoading && <ActivityIndicator size="small" color="#1E3A8A" style={styles.spinner} />}
            </View>

            {suggestions.length > 0 && (
                <ScrollView style={styles.suggestionBox} keyboardShouldPersistTaps="handled" nestedScrollEnabled={true}>
                    {suggestions.map((item, index) => (
                        <TouchableOpacity key={index} style={styles.suggestionItem} onPress={() => addSkill(item)}>
                            <Ionicons name="flash-outline" size={16} color="#1E3A8A" style={{ marginRight: 10 }} />
                            <Text style={styles.suggestionText}>{item}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { position: 'relative', zIndex: 50 },
    chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
    chip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#DBEAFE', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 16, gap: 6 },
    chipText: { color: '#1E40AF', fontWeight: '700', fontSize: 14 },
    inputRow: { position: 'relative' },
    input: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 14, fontSize: 16, color: '#1E293B' },
    spinner: { position: 'absolute', right: 14, top: 16 },
    suggestionBox: { position: 'absolute', bottom: '100%', left: 0, right: 0, backgroundColor: '#FFFFFF', borderRadius: 12, marginBottom: 5, elevation: 5, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, maxHeight: 200, zIndex: 100, borderWidth: 1, borderColor: '#BFDBFE' },
    suggestionItem: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
    suggestionText: { color: '#1E293B', fontSize: 16, fontWeight: '500' }
});