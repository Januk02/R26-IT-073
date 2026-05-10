import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Dimensions, RefreshControl, KeyboardAvoidingView, Platform } from 'react-native';
import Animated, { FadeInUp, FadeInDown, Layout } from 'react-native-reanimated';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import AdvancedSkillInput from '../../components/AdvancedSkillInput';
import SmartDegreeInput from '../../components/SmartDegreeInput';
import { useCareerData } from './CareerContext';


//const PYTHON_API_BASE = 'http://192.168.1.4:8000';
const PYTHON_API_BASE = 'http://192.168.1.2:8000';

//const PYTHON_API_BASE = 'https://polo-brittle-magma.ngrok-free.dev';

// Blue-Navy professional palette inspired by prototype
const COLORS = {
    primary: '#1A2B4A',
    accent: '#1E3A8A', // Darker premium blue
    accentLight: '#DBEAFE',
    accentDark: '#1E40AF',
    success: '#16A34A',
    successLight: '#DCFCE7',
    danger: '#DC2626',
    dangerLight: '#FEE2E2',
    bg: '#F0F4FA',
    card: '#FFFFFF',
    text: '#1E293B',
    textSub: '#64748B',
    border: '#E2E8F0',
};

const CARD_COLORS = [
    { bg: '#1A2B4A', accent: '#3B82F6', badge: '#DBEAFE', badgeText: '#1E40AF', label: 'BEST FIT' },
    { bg: '#1E3A5F', accent: '#60A5FA', badge: '#DBEAFE', badgeText: '#1E40AF', label: '2ND MATCH' },
    { bg: '#2563EB', accent: '#93C5FD', badge: '#DBEAFE', badgeText: '#1E40AF', label: '3RD MATCH' },
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
    const [refreshing, setRefreshing] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        // Reset the form and results to provide a fresh start
        setTimeout(() => {
            setCurrentSkills([]);
            setDegreeInput('');
            setTop3Results(null);
            setSelectedIndex(null);
            setRefreshKey(prev => prev + 1); // This key forces child components to fully reset their internal state
            setRefreshing(false);
        }, 1200); // Wait a bit for the animation
    }, []);

    const generatePathways = async () => {
        if (currentSkills.length === 0) return;

        setIsSearching(true);
        setTop3Results(null);
        setSelectedIndex(null);

        try {
            const apiCall = axios.post(`${PYTHON_API_BASE}/api/generate-top3`, {
                skills: currentSkills,
                current_degree: degreeInput || "None",
            }, {
                headers: {
                    'ngrok-skip-browser-warning': 'true'
                }
            });

            const minimumDelay = new Promise(resolve => setTimeout(resolve, 2000));
            const [response] = await Promise.all([apiCall, minimumDelay]);

            const results = response.data.data;
            setTop3Results(results);

            // Don't auto-select — let the user tap to expand
            // setSelectedIndex(0);

        } catch (error) {
            console.error("Analysis Failed:", error);
            alert("Network Error. Is the Python server running?");
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={20}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={COLORS.accent}
                        colors={[COLORS.accent, COLORS.primary, COLORS.success]}
                        progressBackgroundColor={COLORS.card}
                    />
                }
            >

                {/* === PROFESSIONAL HEADER === */}
                <View style={styles.header}>
                    <Text style={styles.stepLabel}>AI CAREER MATCH</Text>
                    <Text style={styles.headerTitle}>
                        Design Your{'\n'}
                        <Text style={styles.headerAccent}>Career Identity.</Text>
                    </Text>
                    <Text style={styles.subtitle}>
                        Our AI maps your current skills against real-time industry demands to identify your highest-potential career trajectories.
                    </Text>
                </View>

                {/* === FEATURE HIGHLIGHT === */}
                <View style={styles.featureCard}>
                    <View style={styles.featureIconBg}>
                        <Ionicons name="sparkles" size={20} color={COLORS.accent} />
                    </View>
                    <View style={styles.featureTextContainer}>
                        <Text style={styles.featureTitle}>Precision Matching</Text>
                        <Text style={styles.featureDesc}>We analyze your profile against 500+ industry role blueprints using ML ensemble models.</Text>
                    </View>
                </View>

                {/* === INPUT FORM === */}
                <View style={styles.inputCard}>
                    <View style={styles.labelRow}>
                        <Text style={styles.label}>TECHNICAL SKILLS</Text>
                        <Text style={styles.labelRequired}>REQUIRED</Text>
                    </View>
                    <AdvancedSkillInput key={`skills-${refreshKey}`} onSkillsChange={setCurrentSkills} apiBaseUrl={PYTHON_API_BASE} />

                    <View style={[styles.labelRow, { marginTop: 18 }]}>
                        <Text style={styles.label}>DEGREE PROGRAM</Text>
                        <Text style={styles.labelOptional}>OPTIONAL</Text>
                    </View>
                    <SmartDegreeInput key={`degree-${refreshKey}`} onDegreeChange={setDegreeInput} apiBaseUrl={PYTHON_API_BASE} />

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
                            <View style={styles.btnInner}>
                                <Text style={styles.btnText}>
                                    {top3Results ? 'Recalculate Pathways' : 'Initialize My Journey'}
                                </Text>
                                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                            </View>
                        )}
                    </TouchableOpacity>

                    {/* Engine Status */}
                    <View style={styles.engineStatus}>
                        <View style={[styles.statusDot, { backgroundColor: COLORS.success }]} />
                        <Text style={styles.statusText}>AI Engine Ready for Computation</Text>
                    </View>
                </View>

                {/* === LOADING STATE === */}
                {isSearching && (
                    <View style={styles.loadingContainer}>
                        <View style={styles.loadingSpinnerBg}>
                            <ActivityIndicator size="large" color={COLORS.accent} />
                        </View>
                        <Text style={styles.loadingText}>Mapping Career Trajectories...</Text>
                        <Text style={styles.loadingSub}>Running ML ensemble + Knowledge Graph analysis</Text>
                    </View>
                )}

                {/* === TOP 3 CAREER CARDS (ACCORDION) === */}
                {!isSearching && top3Results && (
                    <Animated.View entering={FadeInUp.delay(100).duration(400)}>
                        <Text style={styles.sectionHeader}>Your Career Matches</Text>
                        <Text style={styles.sectionSub}>Tap a career path to explore your detailed analysis</Text>

                        {top3Results.map((result, index) => {
                            const colors = CARD_COLORS[index];
                            const isSelected = selectedIndex === index;

                            return (
                                <Animated.View
                                    key={index}
                                    entering={FadeInUp.delay(150 * (index + 1)).duration(400)}
                                    layout={Layout.springify()}
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
                                                color={COLORS.textSub}
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

                                            {/* Save Pathway Button — at the top */}
                                            <TouchableOpacity
                                                style={styles.savePathwayBtn}
                                                onPress={() => {
                                                    saveNewPathway({
                                                        role: result.target_role,
                                                        matchScore: result.sgi_score,
                                                        market_readiness: result.market_readiness,
                                                        missing_requirements: result.missing_requirements,
                                                        recommended_degree: result.recommended_degree,
                                                        initial_skills_count: currentSkills.length,
                                                        current_skills: currentSkills
                                                    });
                                                    alert("Pathway Saved to Profile!");
                                                }}
                                            >
                                                <Ionicons name="bookmark" size={18} color="#FFFFFF" />
                                                <Text style={styles.savePathwayBtnText}>Save Pathway to Profile</Text>
                                            </TouchableOpacity>

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
                                                <Ionicons name="school" size={24} color={COLORS.accent} />
                                                <View style={styles.degreeCardText}>
                                                    <Text style={styles.degreeCardLabel}>Recommended Degree</Text>
                                                    <Text style={styles.degreeCardValue}>{result.recommended_degree}</Text>
                                                </View>
                                            </View>

                                            {/* Missing Requirements Roadmap */}
                                            {result.missing_requirements.length > 0 ? (
                                                <View>
                                                    <Text style={styles.roadmapHeader}>
                                                        Your Personalized Roadmap ({result.missing_requirements.length} phases)
                                                    </Text>

                                                    {result.missing_requirements.map((req, reqIndex) => {
                                                        const isDegree = req.type === 'Degree';
                                                        const dotColor = isDegree ? COLORS.success : COLORS.danger;

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
                                                                        <View style={[styles.badge, { backgroundColor: isDegree ? COLORS.successLight : COLORS.dangerLight }]}>
                                                                            <Text style={[styles.badgeText, { color: isDegree ? COLORS.success : COLORS.danger }]}>
                                                                                {isDegree ? 'COMPLETE' : 'CRITICAL GAP'}
                                                                            </Text>
                                                                        </View>
                                                                    </View>
                                                                    <Text style={styles.roadmapReqDesc}>
                                                                        Market Weight: {req.weight} — {isDegree ? 'Core academic foundation for this role' : 'High-impact skill needed to close the gap'}
                                                                    </Text>
                                                                </View>
                                                            </Animated.View>
                                                        );
                                                    })}
                                                </View>
                                            ) : (
                                                <View style={styles.perfectMatchCard}>
                                                    <Ionicons name="checkmark-circle" size={48} color={COLORS.success} />
                                                    <Text style={styles.perfectMatchTitle}>Perfect Match!</Text>
                                                    <Text style={styles.perfectMatchSub}>Your profile is fully optimized for this role. Start applying!</Text>
                                                </View>
                                            )}
                                        </Animated.View>
                                    )}
                                </Animated.View>
                            );
                        })}
                    </Animated.View>
                )}

            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    scrollContent: { padding: 20, paddingTop: 50, paddingBottom: 120 },

    // Header
    header: { marginBottom: 24 },
    stepLabel: { fontSize: 12, fontWeight: '700', color: COLORS.accent, letterSpacing: 1.5, marginBottom: 12 },
    headerTitle: { fontSize: 32, fontWeight: 'bold', color: COLORS.text, lineHeight: 40 },
    headerAccent: { color: COLORS.accent },
    subtitle: { fontSize: 15, color: COLORS.textSub, marginTop: 12, lineHeight: 22 },

    // Feature Card
    featureCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: COLORS.border, elevation: 1, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 6 },
    featureIconBg: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.accentLight, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
    featureTextContainer: { flex: 1 },
    featureTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 3 },
    featureDesc: { fontSize: 13, color: COLORS.textSub, lineHeight: 18 },

    // Input Card
    inputCard: { backgroundColor: COLORS.card, padding: 22, borderRadius: 24, elevation: 3, zIndex: 10, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, borderWidth: 1, borderColor: COLORS.border },
    labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    label: { fontSize: 12, fontWeight: '700', color: COLORS.textSub, letterSpacing: 0.8 },
    labelRequired: { fontSize: 10, fontWeight: '700', color: COLORS.accent, letterSpacing: 0.5 },
    labelOptional: { fontSize: 10, fontWeight: '700', color: COLORS.textSub, letterSpacing: 0.5 },
    generateBtn: { backgroundColor: COLORS.accent, padding: 17, borderRadius: 14, alignItems: 'center', marginTop: 22 },
    btnDisabled: { backgroundColor: '#94A3B8' },
    btnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
    btnInner: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    btnLoading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },

    // Engine Status
    engineStatus: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 14 },
    statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
    statusText: { fontSize: 12, color: COLORS.textSub, fontWeight: '500' },

    // Loading
    loadingContainer: { alignItems: 'center', marginTop: 40, marginBottom: 20 },
    loadingSpinnerBg: { width: 64, height: 64, borderRadius: 32, backgroundColor: COLORS.accentLight, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    loadingText: { color: COLORS.text, fontSize: 16, fontWeight: '600' },
    loadingSub: { color: COLORS.textSub, fontSize: 13, marginTop: 5 },

    // Section Headers
    sectionHeader: { fontSize: 22, fontWeight: 'bold', color: COLORS.text, marginTop: 30, marginBottom: 4 },
    sectionSub: { fontSize: 14, color: COLORS.textSub, marginBottom: 18 },

    // Top 3 Career Cards
    careerCard: {
        backgroundColor: COLORS.card, borderRadius: 16, padding: 18,
        borderLeftWidth: 4,
        shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, borderWidth: 1, borderColor: COLORS.border,
    },
    careerCardSelected: { backgroundColor: '#EFF6FF', borderLeftWidth: 5, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
    careerCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
    careerCardLeft: { flex: 1 },
    rankBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, alignSelf: 'flex-start', marginBottom: 8 },
    rankBadgeText: { fontSize: 10, fontWeight: 'bold', letterSpacing: 0.5 },
    careerRole: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
    careerCardStats: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginBottom: 12 },
    miniStat: { alignItems: 'center' },
    miniStatValue: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
    miniStatLabel: { fontSize: 11, color: COLORS.textSub, marginTop: 2 },
    miniStatDivider: { width: 1, height: 30, backgroundColor: COLORS.border },
    matchBarBg: { height: 6, backgroundColor: '#F1F5F9', borderRadius: 3, overflow: 'hidden' },
    matchBarFill: { height: '100%', borderRadius: 3 },

    // Detail Container (Accordion Expansion)
    detailContainer: {
        backgroundColor: '#F8FAFC',
        padding: 15,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
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
    degreeCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 12, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: COLORS.border },
    degreeCardText: { marginLeft: 15, flex: 1 },
    degreeCardLabel: { fontSize: 11, color: COLORS.textSub, fontWeight: '600' },
    degreeCardValue: { fontSize: 15, fontWeight: 'bold', color: COLORS.text, marginTop: 2 },

    // Roadmap
    roadmapHeader: { fontSize: 16, fontWeight: 'bold', color: COLORS.text, marginBottom: 12, marginTop: 5 },
    roadmapCardWrapper: { flexDirection: 'row', marginBottom: 12 },
    timelineColumn: { width: 30, alignItems: 'center' },
    timelineDot: { width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center', zIndex: 2 },
    timelineLine: { width: 2, flex: 1, backgroundColor: COLORS.border, position: 'absolute', top: 22, bottom: -12, zIndex: 1 },
    roadmapCard: { flex: 1, backgroundColor: COLORS.card, borderRadius: 12, padding: 15, borderLeftWidth: 4, borderWidth: 1, borderColor: COLORS.border },
    roadmapCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
    roadmapReqTitle: { fontSize: 14, fontWeight: 'bold', color: COLORS.text, flex: 1, marginRight: 10 },
    badge: { paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6 },
    badgeText: { fontSize: 9, fontWeight: 'bold' },
    roadmapReqDesc: { fontSize: 12, color: COLORS.textSub, lineHeight: 18 },

    // Perfect Match
    perfectMatchCard: { backgroundColor: COLORS.card, borderRadius: 16, padding: 30, alignItems: 'center', marginTop: 10, borderWidth: 1, borderColor: '#BBD6FE' },
    perfectMatchTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text, marginTop: 10 },
    perfectMatchSub: { fontSize: 13, color: COLORS.textSub, textAlign: 'center', marginTop: 6 },

    // Save Pathway Button — now at top
    savePathwayBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.accent, padding: 14, borderRadius: 12, marginBottom: 15, elevation: 2, shadowColor: COLORS.accent, shadowOpacity: 0.3, shadowRadius: 5 },
    savePathwayBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold', marginLeft: 8 },
});