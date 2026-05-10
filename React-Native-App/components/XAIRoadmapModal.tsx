import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import Animated, { FadeInUp, FadeInDown, Layout } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useCareerData } from '../app/(career-module)/CareerContext';

interface Props {
    visible: boolean;
    onClose: () => void;
    pathway: any; // Context pathway containing missing_requirements, market_readiness, current_skills, etc.
}

export default function XAIRoadmapModal({ visible, onClose, pathway }: Props) {
    const { updatePathwayProgress } = useCareerData();

    if (!visible || !pathway) return null;

    const missingSkills = pathway.missing_requirements || [];
    const masteredSkills = pathway.current_skills || [];
    const gapsCount = missingSkills.length;
    const masteredCount = masteredSkills.length; 

    const handleLearnSkill = (skillObj: any) => {
        // Calculate new missing requirements by filtering out the learned skill
        const newMissing = missingSkills.filter((req: any) => req.req !== skillObj.req);
        
        // Add the newly learned skill to mastered skills
        const newMastered = [...masteredSkills, skillObj.req];

        // Simulate score improvements
        // SGI decreases (Gap gets smaller), Readiness increases
        const impact = Math.round(skillObj.weight * 1.5);
        const newReadiness = Math.min(100, (pathway.market_readiness || 0) + impact);
        
        const currentSgi = pathway.matchScore || pathway.sgi_score || 0;
        const newSgi = Math.max(0, currentSgi - impact);

        updatePathwayProgress(pathway.id, {
            missing_requirements: newMissing,
            current_skills: newMastered,
            market_readiness: newReadiness,
            matchScore: newSgi,
            initial_skills_count: newMastered.length
        });
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
                    
                    {/* Header Controls */}
                    <View style={styles.headerControls}>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Ionicons name="close" size={24} color="#64748B" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                        
                        {/* Title and Career Path Name */}
                        <View style={styles.titleRow}>
                            <View>
                                <Text style={styles.mainTitle}>Career Roadmap</Text>
                                <Text style={styles.careerRoleText}>{pathway.role}</Text>
                            </View>
                            <View style={styles.phasesBadge}>
                                <Text style={styles.phasesBadgeText}>{gapsCount > 0 ? `${gapsCount} PHASES REMAINING` : `ALL PHASES COMPLETE`}</Text>
                            </View>
                        </View>

                        {/* Hero Stats Card (Market Readiness, SGI) */}
                        <View style={[styles.heroCard, { backgroundColor: '#1E3A8A' }]}>
                            <Text style={styles.heroSubText}>DETAILED ANALYSIS</Text>
                            <View style={styles.heroStatsRow}>
                                <View style={styles.heroStatBox}>
                                    <Text style={styles.heroStatValue}>{(pathway.market_readiness || 0).toFixed(0)}%</Text>
                                    <Text style={styles.heroStatLabel}>READINESS</Text>
                                </View>
                                <View style={styles.heroStatBox}>
                                    <Text style={styles.heroStatValue}>{(pathway.matchScore || pathway.sgi_score || 0).toFixed(0)}%</Text>
                                    <Text style={styles.heroStatLabel}>SGI SCORE</Text>
                                </View>
                                <View style={styles.heroStatBox}>
                                    <Text style={styles.heroStatValue}>{(pathway.confidence_score || 85).toFixed(0)}%</Text>
                                    <Text style={styles.heroStatLabel}>CONFIDENCE</Text>
                                </View>
                            </View>
                        </View>

                        {/* Top Badges Row */}
                        <View style={styles.topBadgesRow}>
                            <View style={[styles.topBadge, { backgroundColor: '#4ADE80' }]}>
                                <Text style={[styles.topBadgeNumber, { color: '#064E3B' }]}>{masteredCount}</Text>
                                <Text style={[styles.topBadgeLabel, { color: '#064E3B' }]}>SKILLS MASTERED</Text>
                            </View>
                            <View style={[styles.topBadge, { backgroundColor: '#F1F5F9' }]}>
                                <Text style={[styles.topBadgeNumber, { color: '#1E3A8A' }]}>{gapsCount < 10 ? `0${gapsCount}` : gapsCount}</Text>
                                <Text style={[styles.topBadgeLabel, { color: '#475569' }]}>GAPS IDENTIFIED</Text>
                            </View>
                        </View>

                        {/* Timeline */}
                        <View style={styles.timelineContainer}>
                            
                            {/* Mastered Skills */}
                            {masteredSkills.map((skill: string, index: number) => (
                                <Animated.View key={`mastered-${index}`} entering={FadeInDown.delay(100 + (index * 50)).duration(400)} layout={Layout.springify()} style={styles.nodeWrapper}>
                                    <View style={styles.timelineCol}>
                                        <View style={[styles.circle, { backgroundColor: '#16A34A' }]}>
                                            <Ionicons name="checkmark" size={14} color="#FFF" />
                                        </View>
                                        {(index !== masteredSkills.length - 1 || missingSkills.length > 0) && <View style={styles.line} />}
                                    </View>
                                    <View style={[styles.card, { borderColor: '#16A34A', borderLeftWidth: 4 }]}>
                                        <View style={styles.cardHeader}>
                                            <Text style={styles.cardTitle}>{skill}</Text>
                                            <View style={[styles.statusTag, { backgroundColor: '#DCFCE7' }]}>
                                                <Text style={[styles.statusTagText, { color: '#16A34A' }]}>COMPLETED</Text>
                                            </View>
                                        </View>
                                        <Text style={styles.cardDesc}>Validated skill mapped from your profile.</Text>
                                    </View>
                                </Animated.View>
                            ))}

                            {/* Missing Skills (All are learnable) */}
                            {missingSkills.map((skill: any, index: number) => {
                                const isCritical = index === 0; // Highlight the top gap
                                const impactValue = Math.round(skill.weight * 1.5);
                                
                                return (
                                <Animated.View key={`missing-${index}`} entering={FadeInDown.delay(300 + (index * 100)).duration(400)} layout={Layout.springify()} style={styles.nodeWrapper}>
                                    <View style={styles.timelineCol}>
                                        <View style={[styles.circle, { backgroundColor: isCritical ? '#C2410C' : '#3B82F6' }]}>
                                            <Ionicons name={isCritical ? "alert" : "school"} size={14} color="#FFF" />
                                        </View>
                                        {index !== missingSkills.length - 1 && <View style={styles.line} />}
                                    </View>
                                    <View style={[styles.card, { borderColor: isCritical ? '#C2410C' : '#3B82F6', borderLeftWidth: 4 }]}>
                                        <View style={styles.cardHeader}>
                                            <Text style={styles.cardTitle}>{skill.req}</Text>
                                            <View style={[styles.statusTag, { backgroundColor: isCritical ? '#FFEDD5' : '#DBEAFE' }]}>
                                                <Text style={[styles.statusTagText, { color: isCritical ? '#C2410C' : '#1E40AF' }]}>
                                                    {isCritical ? 'CRITICAL GAP' : 'TARGET SKILL'}
                                                </Text>
                                            </View>
                                        </View>
                                        <Text style={styles.cardDesc}>
                                            {isCritical ? 'Highest priority missing skill to close the gap for this role.' : 'Recommended skill for market readiness.'}
                                        </Text>
                                        
                                        {/* AI Impact Forecast */}
                                        <View style={styles.impactBox}>
                                            <View style={styles.impactBoxHeader}>
                                                <Ionicons name="sparkles" size={14} color={isCritical ? '#C2410C' : '#3B82F6'} style={{ marginRight: 6 }} />
                                                <Text style={[styles.impactTitle, { color: isCritical ? '#C2410C' : '#3B82F6' }]}>AI IMPACT FORECAST</Text>
                                            </View>
                                            <Text style={styles.impactText}>
                                                "Completing this module reduces your SGI by <Text style={styles.impactHighlight}>-{impactValue}%</Text>."
                                            </Text>
                                        </View>

                                        <TouchableOpacity 
                                            style={[styles.learnBtn, { backgroundColor: isCritical ? '#C2410C' : '#1E3A8A' }]} 
                                            onPress={() => handleLearnSkill(skill)}
                                            activeOpacity={0.8}
                                        >
                                            <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                                            <Text style={styles.learnBtnText}>Mark as Learned</Text>
                                        </TouchableOpacity>
                                    </View>
                                </Animated.View>
                            )})}

                        </View>
                        
                    </ScrollView>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#FAFAFA', borderTopLeftRadius: 32, borderTopRightRadius: 32, height: '90%', padding: 25, paddingBottom: 40 },
    
    headerControls: { alignItems: 'flex-end', marginBottom: 10 },
    closeBtn: { backgroundColor: '#F1F5F9', padding: 8, borderRadius: 20 },

    scrollContent: { paddingBottom: 40 },

    // Title Row
    titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
    mainTitle: { fontSize: 24, fontWeight: 'bold', color: '#64748B', lineHeight: 30 },
    careerRoleText: { fontSize: 28, fontWeight: 'bold', color: '#1E3A8A', marginTop: 4 },
    phasesBadge: { backgroundColor: '#F1F5F9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginTop: 10 },
    phasesBadgeText: { fontSize: 10, fontWeight: 'bold', color: '#475569', letterSpacing: 0.5 },

    // Hero Stats Card
    heroCard: { borderRadius: 16, padding: 20, marginBottom: 25, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
    heroSubText: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 15 },
    heroStatsRow: { flexDirection: 'row', justifyContent: 'space-between' },
    heroStatBox: { alignItems: 'center', flex: 1 },
    heroStatValue: { color: '#FFFFFF', fontSize: 24, fontWeight: 'bold' },
    heroStatLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 9, fontWeight: '700', letterSpacing: 0.5, marginTop: 4 },

    // Top Badges
    topBadgesRow: { flexDirection: 'row', gap: 15, marginBottom: 25 },
    topBadge: { flex: 1, borderRadius: 16, padding: 20, justifyContent: 'center' },
    topBadgeNumber: { fontSize: 32, fontWeight: 'bold', marginBottom: 4 },
    topBadgeLabel: { fontSize: 11, fontWeight: 'bold', letterSpacing: 0.5 },

    // Timeline
    timelineContainer: { paddingLeft: 10 },
    nodeWrapper: { flexDirection: 'row', marginBottom: 20 },
    timelineCol: { width: 40, alignItems: 'center' },
    circle: { width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center', zIndex: 2, borderWidth: 3, borderColor: '#FFFFFF', elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 3 },
    line: { width: 2, flex: 1, backgroundColor: '#E2E8F0', position: 'absolute', top: 26, bottom: -20, zIndex: 1 },

    // Cards
    card: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#E2E8F0', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
    cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', flex: 1, marginRight: 10 },
    
    statusTag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    statusTagText: { fontSize: 9, fontWeight: 'bold', letterSpacing: 0.5 },
    cardDesc: { fontSize: 13, color: '#64748B', lineHeight: 20, marginBottom: 15 },

    // Impact Box
    impactBox: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: '#F1F5F9' },
    impactBoxHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    impactTitle: { fontSize: 11, fontWeight: 'bold', letterSpacing: 0.5 },
    impactText: { fontSize: 13, color: '#334155', fontStyle: 'italic', lineHeight: 20 },
    impactHighlight: { color: '#16A34A', fontWeight: 'bold' },

    // Learn Button
    learnBtn: { flexDirection: 'row', padding: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center', elevation: 2, shadowOpacity: 0.3, shadowRadius: 5 },
    learnBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' }
});
