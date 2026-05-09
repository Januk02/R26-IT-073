import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

interface Props {
    visible: boolean;
    onClose: () => void;
    readiness: number;
    latestSGI: number;
}

export default function XAIRoadmapModal({ visible, onClose, readiness, latestSGI }: Props) {
    if (!visible) return null;

    // AI logic determining the primary advice
    const getAdvice = () => {
        if (readiness >= 80) return "Your profile is highly competitive. Focus on advanced networking and tailoring your resume to specific companies.";
        if (readiness >= 50) return "You have a solid foundation but need to close specific skill gaps. Prioritize the high-weight technical requirements.";
        return "You are in the early stages for this role. Focus heavily on acquiring core foundational skills and building a portfolio.";
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <Animated.View entering={FadeInUp.duration(400)} style={styles.modalContent}>
                    
                    {/* Header */}
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.headerTitle}>AI Action Plan</Text>
                            <Text style={styles.headerSub}>Explainable AI Roadmap (XAI)</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Ionicons name="close" size={24} color="#64748B" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                        
                        {/* Summary Card */}
                        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.summaryCard}>
                            <Ionicons name="bulb" size={28} color="#F59E0B" />
                            <View style={styles.summaryTextContainer}>
                                <Text style={styles.summaryTitle}>AI Assessment</Text>
                                <Text style={styles.summaryText}>{getAdvice()}</Text>
                            </View>
                        </Animated.View>

                        <Text style={styles.sectionTitle}>Your 3-Phase Roadmap</Text>

                        {/* Phase 1 */}
                        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.phaseCard}>
                            <View style={[styles.phaseIconBg, { backgroundColor: '#E8F5E9' }]}>
                                <Text style={[styles.phaseNumber, { color: '#2E7D32' }]}>1</Text>
                            </View>
                            <View style={styles.phaseContent}>
                                <Text style={styles.phaseTitle}>Skill Acquisition (High Weight)</Text>
                                <Text style={styles.phaseDesc}>Start by learning the top missing skills identified in your latest scan. Use platforms like Coursera or Udemy.</Text>
                            </View>
                        </Animated.View>

                        {/* Phase 2 */}
                        <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.phaseCard}>
                            <View style={[styles.phaseIconBg, { backgroundColor: '#E0F2FE' }]}>
                                <Text style={[styles.phaseNumber, { color: '#0284C7' }]}>2</Text>
                            </View>
                            <View style={styles.phaseContent}>
                                <Text style={styles.phaseTitle}>Build Proof of Work</Text>
                                <Text style={styles.phaseDesc}>Theoretical knowledge isn't enough. Build 2-3 projects utilizing the newly acquired skills and push them to GitHub.</Text>
                            </View>
                        </Animated.View>

                        {/* Phase 3 */}
                        <Animated.View entering={FadeInDown.delay(400).duration(400)} style={styles.phaseCard}>
                            <View style={[styles.phaseIconBg, { backgroundColor: '#F3E8FF' }]}>
                                <Text style={[styles.phaseNumber, { color: '#9333EA' }]}>3</Text>
                            </View>
                            <View style={styles.phaseContent}>
                                <Text style={styles.phaseTitle}>Market Penetration</Text>
                                <Text style={styles.phaseDesc}>Update your LinkedIn, align your resume with the target role keywords, and begin applying to Junior/Mid-level positions.</Text>
                            </View>
                        </Animated.View>

                    </ScrollView>

                    {/* Action Button */}
                    <TouchableOpacity style={styles.actionBtn} onPress={onClose}>
                        <Text style={styles.actionBtnText}>Got it, Let's get to work!</Text>
                    </TouchableOpacity>

                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, height: '80%', padding: 20, paddingBottom: 40 },
    
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#1E293B' },
    headerSub: { fontSize: 13, color: '#64748B', marginTop: 2, fontWeight: '600' },
    closeBtn: { backgroundColor: '#F1F5F9', padding: 8, borderRadius: 20 },

    scrollContent: { paddingBottom: 20 },

    summaryCard: { flexDirection: 'row', backgroundColor: '#FFFBEB', padding: 16, borderRadius: 16, alignItems: 'flex-start', marginBottom: 25, borderWidth: 1, borderColor: '#FEF3C7' },
    summaryTextContainer: { flex: 1, marginLeft: 12 },
    summaryTitle: { fontSize: 16, fontWeight: 'bold', color: '#92400E', marginBottom: 4 },
    summaryText: { fontSize: 13, color: '#B45309', lineHeight: 20 },

    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B', marginBottom: 15 },

    phaseCard: { flexDirection: 'row', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 16, marginBottom: 15, borderWidth: 1, borderColor: '#E2E8F0', elevation: 1, shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 4 },
    phaseIconBg: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    phaseNumber: { fontSize: 18, fontWeight: 'bold' },
    phaseContent: { flex: 1 },
    phaseTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', marginBottom: 4 },
    phaseDesc: { fontSize: 13, color: '#64748B', lineHeight: 20 },

    actionBtn: { backgroundColor: '#2E7D32', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
    actionBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }
});
