import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
    const router = useRouter();

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.header}>
                <Text style={styles.welcomeText}>Welcome to EduSoul</Text>
                <Text style={styles.subtitleText}>What would you like to focus on today?</Text>
            </View>

            <View style={styles.grid}>
                {/* Module 1: Degree Advisor */}
                <TouchableOpacity
                    style={styles.card}
                    onPress={() => router.push('/(degree-module)/')}
                >
                    <View style={[styles.iconContainer, { backgroundColor: '#e3f2fd' }]}>
                        <Ionicons name="school-outline" size={32} color="#1976d2" />
                    </View>
                    <Text style={styles.cardTitle}>Degree Advisor</Text>
                    <Text style={styles.cardDesc}>Plan your academic journey and track credits.</Text>
                </TouchableOpacity>

                {/* Module 2: YOUR MODULE (Career AI) */}
                <TouchableOpacity
                    style={styles.card}
                    onPress={() => router.push('/(career-module)')}
                >
                    <View style={[styles.iconContainer, { backgroundColor: '#e8f5e9' }]}>
                        <Ionicons name="briefcase-outline" size={32} color="#388e3c" />
                    </View>
                    <Text style={styles.cardTitle}>Career AI</Text>
                    <Text style={styles.cardDesc}>Calculate your Skill-Gap Index and find roles.</Text>
                </TouchableOpacity>

                {/* Module 3: Study Assistance */}
                <TouchableOpacity
                    style={styles.card}
                    onPress={() => router.push('/(study-module)')}
                >
                    <View style={[styles.iconContainer, { backgroundColor: '#fff3e0' }]}>
                        <Ionicons name="book-outline" size={32} color="#f57c00" />
                    </View>
                    <Text style={styles.cardTitle}>Study Assist</Text>
                    <Text style={styles.cardDesc}>Get help with assignments and scheduling.</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, backgroundColor: '#f8fafc', padding: 20, paddingTop: 60 },
    header: { marginBottom: 30 },
    welcomeText: { fontSize: 28, fontWeight: 'bold', color: '#1e293b', marginBottom: 8 },
    subtitleText: { fontSize: 16, color: '#64748b' },
    grid: { gap: 20 },
    card: { backgroundColor: '#fff', padding: 20, borderRadius: 16, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5 },
    iconContainer: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
    cardTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e293b', marginBottom: 8 },
    cardDesc: { fontSize: 14, color: '#64748b', lineHeight: 20 }
});