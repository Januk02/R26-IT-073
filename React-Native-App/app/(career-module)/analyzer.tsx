import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import Animated, { FadeInUp, FadeInDown, Layout } from 'react-native-reanimated';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import AdvancedSkillInput from '../../components/AdvancedSkillInput';
import SmartDegreeInput from '../../components/SmartDegreeInput';
import { useCareerData } from './CareerContext';

// ⚠️ Ensure this is your correct local IPv4
const PYTHON_API_BASE = 'http://192.168.1.4:8000';

// Advanced Green color palette
const CARD_COLORS = [
    { bg: '#2E7D32', accent: '#4CAF50', badge: '#E8F5E9', badgeText: '#2E7D32', label: 'BEST FIT' },
    { bg: '#388E3C', accent: '#66BB6A', badge: '#E8F5E9', badgeText: '#388E3C', label: '2ND MATCH' },
    { bg: '#43A047', accent: '#81C784', badge: '#E8F5E9', badgeText: '#43A047', label: '3RD MATCH' },
];

interface CareerResult {
    target_role: string;
    confidence_score: number;
    sgi_score: number;
    market_readiness: number;
    recommended_degree: string;
    missing_requirements: Array<{ req: string; weight: number; type: string }>;
}

export default function CareerAnalyzer() {
    const { saveNewPathway } = useCareerData();
    const [currentSkills, setCurrentSkills] = useState<string[]>([]);
    const [degreeInput, setDegreeInput] = useState<string>('');

    const [isSearching, setIsSearching] = useState(false);
    const [top3Results, setTop3Results] = useState<CareerResult[] | null>(null);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

    const generatePathways = async () => {
        if (currentSkills.length === 0) return;

        setIsSearching(true);
        setTop3Results(null);
        setSelectedIndex(null);

        try {
            const apiCall = axios.post(`${PYTHON_API_BASE}/api/generate-top3`, {
                skills: currentSkills,
                current_degree: degreeInput || "None",
            });

            const minimumDelay = new Promise(resolve => setTimeout(resolve, 2000));
            const [response] = await Promise.all([apiCall, minimumDelay]);

            const results = response.data.data;
            setTop3Results(results);
            
            // Auto-select the first (best) match
            setSelectedIndex(0);

            // We no longer auto-save here, the user must click "Save Pathway" in the detailed view.

        } catch (error) {
            console.error("Analysis Failed:", error);
            alert("Network Error. Is the Python server running?");
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

                {/* === INPUT FORM — Always visible === */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>AI Career Match</Text>
                    <Text style={styles.subtitle}>Analyze your profile against industry standards.</Text>
                </View>

                <View style={styles.inputCard}>
                    <Text style={styles.label}>Your Current Skills</Text>
                    <AdvancedSkillInput onSkillsChange={setCurrentSkills} apiBaseUrl={PYTHON_API_BASE} />

                    <Text style={[styles.label, { marginTop: 15 }]}>Current Degree (Optional)</Text>
                    <SmartDegreeInput onDegreeChange={setDegreeInput} apiBaseUrl={PYTHON_API_BASE} />

                    <TouchableOpacity
                        style={[styles.generateBtn, (currentSkills.length === 0 || isSearching) && styles.btnDisabled]}
                        onPress={generatePathways}
                        disabled={currentSkills.length === 0 || isSearching}
                    >
                        {isSearching ? (
                            <View style={styles.btnLoading}>
                                <ActivityIndicator size="small" color="#FFFFFF" />
                                <Text style={[styles.btnText, { marginLeft: 10 }]}>Analyzing Profile...</Text>
                            </View>
                        ) : (
                            <Text style={styles.btnText}>
                                {top3Results ? '🔄  Recalculate' : '🚀  Find Best Career Paths'}
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* === LOADING STATE === */}
                {isSearching && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#2E7D32" />
                        <Text style={styles.loadingText}>Mapping Career Trajectories...</Text>
                        <Text style={styles.loadingSub}>Running ML ensemble + Knowledge Graph analysis</Text>
                    </View>
                )}

                {/* === TOP 3 CAREER CARDS (ACCORDION) === */}
                {!isSearching && top3Results && (
                    <Animated.View entering={FadeInUp.delay(100).duration(400)}>
                        <Text style={styles.sectionHeader}>Top Career Matches</Text>
                        <Text style={styles.sectionSub}>Tap a career to see your detailed analysis</Text>

                        {top3Results.map((result, index) => {
                            const colors = CARD_COLORS[index];
                            const isSelected = selectedIndex === index;

                            return (
                                <Animated.View 
                                    key={index} 
                                    entering={FadeInUp.delay(150 * (index + 1)).duration(400)}
                                    layout={Layout.springify()} // Smooth layout shift when expanding
                                    style={{ marginBottom: 14 }}
                                >
                                    <TouchableOpacity
                                        style={[
                                            styles.careerCard,
                                            { borderLeftColor: colors.bg },
                                            isSelected && styles.careerCardSelected,
                                        ]}
                                        onPress={() => setSelectedIndex(isSelected ? null : index)}
                                        activeOpacity={0.8}
                                    >
                                        <View style={styles.careerCardHeader}>
                                            <View style={styles.careerCardLeft}>
                                                <View style={[styles.rankBadge, { backgroundColor: colors.badge }]}>
                                                    <Text style={[styles.rankBadgeText, { color: colors.badgeText }]}>{colors.label}</Text>
                                                </View>
                                                <Text style={styles.careerRole}>{result.target_role}</Text>
                                            </View>
                                            <Ionicons
                                                name={isSelected ? "chevron-up" : "chevron-down"}
                                                size={20}
                                                color="#64748B"
                                            />
                                        </View>

                                        <View style={styles.careerCardStats}>
                                            <View style={styles.miniStat}>
                                                <Text style={styles.miniStatValue}>{result.market_readiness.toFixed(0)}%</Text>
                                                <Text style={styles.miniStatLabel}>Readiness</Text>
                                            </View>
                                            <View style={styles.miniStatDivider} />
                                            <View style={styles.miniStat}>
                                                <Text style={styles.miniStatValue}>{result.sgi_score.toFixed(0)}%</Text>
                                                <Text style={styles.miniStatLabel}>Skill Gap</Text>
                                            </View>
                                            <View style={styles.miniStatDivider} />
                                            <View style={styles.miniStat}>
                                                <Text style={[styles.miniStatValue, { color: colors.bg }]}>
                                                    {result.confidence_score.toFixed(0)}%
                                                </Text>
                                                <Text style={styles.miniStatLabel}>Confidence</Text>
                                            </View>
                                        </View>

                                        {/* Match bar */}
                                        <View style={styles.matchBarBg}>
                                            <View style={[styles.matchBarFill, { width: `${Math.min(result.market_readiness, 100)}%`, backgroundColor: colors.bg }]} />
                                        </View>
                                    </TouchableOpacity>

                                    {/* === INLINE DETAILED VIEW for selected career === */}
                                    {isSelected && (
                                        <Animated.View entering={FadeInDown.duration(300)} style={styles.detailContainer}>
                                            
                                            {/* Hero Card */}
                                            <View style={[styles.heroCard, { backgroundColor: colors.bg }]}>
                                                <Text style={styles.heroSubText}>DETAILED ANALYSIS</Text>
                                                <Text style={styles.heroTitle}>{result.target_role}</Text>

                                                <View style={styles.heroStatsRow}>
                                                    <View style={styles.heroStatBox}>
                                                        <Text style={styles.heroStatValue}>{result.market_readiness.toFixed(0)}%</Text>
                                                        <Text style={styles.heroStatLabel}>READINESS</Text>
                                                    </View>
                                                    <View style={styles.heroStatBox}>
                                                        <Text style={styles.heroStatValue}>{result.sgi_score.toFixed(0)}%</Text>
                                                        <Text style={styles.heroStatLabel}>SGI SCORE</Text>
                                                    </View>
                                                    <View style={styles.heroStatBox}>
                                                        <Text style={styles.heroStatValue}>{result.confidence_score.toFixed(0)}%</Text>
                                                        <Text style={styles.heroStatLabel}>CONFIDENCE</Text>
                                                    </View>
                                                </View>
                                            </View>

                                            {/* Recommended Degree */}
                                            <View style={styles.degreeCard}>
                                                <Ionicons name="school" size={24} color="#2E7D32" />
                                                <View style={styles.degreeCardText}>
                                                    <Text style={styles.degreeCardLabel}>Recommended Degree</Text>
                                                    <Text style={styles.degreeCardValue}>{result.recommended_degree}</Text>
                                                </View>
                                            </View>

                                            {/* Missing Requirements Roadmap */}
                                            {result.missing_requirements.length > 0 ? (
                                                <View>
                                                    <Text style={styles.roadmapHeader}>
                                                        Personalized Roadmap ({result.missing_requirements.length} items)
                                                    </Text>

                                                    {result.missing_requirements.map((req, reqIndex) => {
                                                        const isDegree = req.type === 'Degree';
                                                        const dotColor = isDegree ? '#2E7D32' : '#D93025';

                                                        return (
                                                            <Animated.View
                                                                key={reqIndex}
                                                                entering={FadeInUp.delay(100 * reqIndex).duration(300)}
                                                                style={styles.roadmapCardWrapper}
                                                            >
                                                                {/* Timeline */}
                                                                <View style={styles.timelineColumn}>
                                                                    <View style={[styles.timelineDot, { backgroundColor: dotColor }]}>
                                                                        <Ionicons name={isDegree ? "school" : "alert"} size={12} color="#FFF" />
                                                                    </View>
                                                                    {reqIndex !== result.missing_requirements.length - 1 && (
                                                                        <View style={styles.timelineLine} />
                                                                    )}
                                                                </View>

                                                                {/* Card */}
                                                                <View style={[styles.roadmapCard, { borderLeftColor: dotColor }]}>
                                                                    <View style={styles.roadmapCardHeader}>
                                                                        <Text style={styles.roadmapReqTitle}>{req.req}</Text>
                                                                        <View style={[styles.badge, { backgroundColor: isDegree ? '#E8F5E9' : '#FCE8E6' }]}>
                                                                            <Text style={[styles.badgeText, { color: isDegree ? '#2E7D32' : '#D93025' }]}>
                                                                                {isDegree ? 'DEGREE' : 'SKILL GAP'}
                                                                            </Text>
                                                                        </View>
                                                                    </View>
                                                                    <Text style={styles.roadmapReqDesc}>
                                                                        Market Weight: {req.weight} — {isDegree ? 'Academic requirement for this role' : 'Critical skill needed to close the gap'}
                                                                    </Text>
                                                                </View>
                                                            </Animated.View>
                                                        );
                                                    })}
                                                </View>
                                            ) : (
                                                <View style={styles.perfectMatchCard}>
                                                    <Ionicons name="checkmark-circle" size={48} color="#4CAF50" />
                                                    <Text style={styles.perfectMatchTitle}>Perfect Match!</Text>
                                                    <Text style={styles.perfectMatchSub}>Your profile is fully optimized for this role. Start applying!</Text>
                                                </View>
                                            )}

                                            {/* Save Pathway Button */}
                                            <TouchableOpacity 
                                                style={styles.savePathwayBtn}
                                                onPress={() => {
                                                    saveNewPathway({
                                                        role: result.target_role,
                                                        matchScore: result.sgi_score,
                                                        market_readiness: result.market_readiness,
                                                    });
                                                    alert("Pathway Saved to Profile!");
                                                }}
                                            >
                                                <Ionicons name="bookmark" size={18} color="#FFFFFF" />
                                                <Text style={styles.savePathwayBtnText}>Save Pathway to Profile</Text>
                                            </TouchableOpacity>
                                        </Animated.View>
                                    )}
                                </Animated.View>
                            );
                        })}
                    </Animated.View>
                )}

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    scrollContent: { padding: 20, paddingTop: 50, paddingBottom: 120 },

    // Header
    header: { marginBottom: 20 },
    headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#1E293B' },
    subtitle: { fontSize: 15, color: '#64748B', marginTop: 5 },

    // Input Card
    inputCard: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 20, elevation: 2, zIndex: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8 },
    label: { fontSize: 14, fontWeight: '700', color: '#1E293B', marginBottom: 10 },
    generateBtn: { backgroundColor: '#2E7D32', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 20 },
    btnDisabled: { backgroundColor: '#94A3B8' },
    btnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
    btnLoading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },

    // Loading
    loadingContainer: { alignItems: 'center', marginTop: 40, marginBottom: 20 },
    loadingText: { color: '#1E293B', fontSize: 16, fontWeight: '600', marginTop: 15 },
    loadingSub: { color: '#64748B', fontSize: 13, marginTop: 5 },

    // Section Headers
    sectionHeader: { fontSize: 22, fontWeight: 'bold', color: '#1E293B', marginTop: 30, marginBottom: 4 },
    sectionSub: { fontSize: 14, color: '#64748B', marginBottom: 18 },

    // Top 3 Career Cards
    careerCard: {
        backgroundColor: '#FFFFFF', borderRadius: 16, padding: 18,
        borderLeftWidth: 4,
        shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    },
    careerCardSelected: { backgroundColor: '#F0FDF4', borderLeftWidth: 5, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
    careerCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
    careerCardLeft: { flex: 1 },
    rankBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, alignSelf: 'flex-start', marginBottom: 8 },
    rankBadgeText: { fontSize: 10, fontWeight: 'bold', letterSpacing: 0.5 },
    careerRole: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
    careerCardStats: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginBottom: 12 },
    miniStat: { alignItems: 'center' },
    miniStatValue: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
    miniStatLabel: { fontSize: 11, color: '#64748B', marginTop: 2 },
    miniStatDivider: { width: 1, height: 30, backgroundColor: '#E2E8F0' },
    matchBarBg: { height: 6, backgroundColor: '#F1F5F9', borderRadius: 3, overflow: 'hidden' },
    matchBarFill: { height: '100%', borderRadius: 3 },

    // Detail Container (Accordion Expansion)
    detailContainer: { 
        backgroundColor: '#F8FAFC',
        padding: 15,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderTopWidth: 0,
        shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 5, elevation: 1
    },

    // Hero Card
    heroCard: { borderRadius: 16, padding: 20, marginBottom: 15, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
    heroSubText: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 6 },
    heroTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: 'bold', marginBottom: 15 },
    heroStatsRow: { flexDirection: 'row', justifyContent: 'space-between' },
    heroStatBox: { alignItems: 'center', flex: 1 },
    heroStatValue: { color: '#FFFFFF', fontSize: 24, fontWeight: 'bold' },
    heroStatLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 9, fontWeight: '700', letterSpacing: 0.5, marginTop: 4 },

    // Degree Card
    degreeCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: '#E2E8F0' },
    degreeCardText: { marginLeft: 15, flex: 1 },
    degreeCardLabel: { fontSize: 11, color: '#64748B', fontWeight: '600' },
    degreeCardValue: { fontSize: 15, fontWeight: 'bold', color: '#1E293B', marginTop: 2 },

    // Roadmap
    roadmapHeader: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', marginBottom: 12, marginTop: 5 },
    roadmapCardWrapper: { flexDirection: 'row', marginBottom: 12 },
    timelineColumn: { width: 30, alignItems: 'center' },
    timelineDot: { width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center', zIndex: 2 },
    timelineLine: { width: 2, flex: 1, backgroundColor: '#E2E8F0', position: 'absolute', top: 22, bottom: -12, zIndex: 1 },
    roadmapCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 15, borderLeftWidth: 4, borderWidth: 1, borderColor: '#E2E8F0' },
    roadmapCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
    roadmapReqTitle: { fontSize: 14, fontWeight: 'bold', color: '#1E293B', flex: 1, marginRight: 10 },
    badge: { paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6 },
    badgeText: { fontSize: 9, fontWeight: 'bold' },
    roadmapReqDesc: { fontSize: 12, color: '#64748B', lineHeight: 18 },

    // Perfect Match
    perfectMatchCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 30, alignItems: 'center', marginTop: 10, borderWidth: 1, borderColor: '#C8E6C9' },
    perfectMatchTitle: { fontSize: 20, fontWeight: 'bold', color: '#1E293B', marginTop: 10 },
    perfectMatchSub: { fontSize: 13, color: '#64748B', textAlign: 'center', marginTop: 6 },

    // Save Pathway Button
    savePathwayBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#2E7D32', padding: 14, borderRadius: 12, marginTop: 20, elevation: 2, shadowColor: '#2E7D32', shadowOpacity: 0.3, shadowRadius: 5 },
    savePathwayBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold', marginLeft: 8 },
});