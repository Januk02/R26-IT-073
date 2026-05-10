import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useCareerData } from './CareerContext';
import XAIRoadmapModal from '../../components/XAIRoadmapModal';

const { width } = Dimensions.get('window');

export default function CareerDashboard() {
    const router = useRouter();
    const { latestSGI, readiness, recentPathways, selectedPathway, setSelectedPathway } = useCareerData();
    const [isRoadmapVisible, setIsRoadmapVisible] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        // Simulate a network request to give a modern, responsive feel
        setTimeout(() => {
            setRefreshing(false);
        }, 1500);
    }, []);

    // Determine readiness level
    const readinessLevel = readiness >= 80 ? 'Excellent' : readiness >= 50 ? 'Moderate' : 'Needs Work';
    const readinessColor = readiness >= 80 ? '#1E3A8A' : readiness >= 50 ? '#F59E0B' : '#DC2626';

    const hasData = recentPathways.length > 0;

    return (
        <ScrollView 
            contentContainerStyle={styles.container} 
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl 
                    refreshing={refreshing} 
                    onRefresh={onRefresh} 
                    tintColor="#1E3A8A" 
                    colors={['#1E3A8A', '#0284C7', '#9333EA']} 
                    progressBackgroundColor="#FFFFFF"
                />
            }
        >
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Career Hub</Text>
                    <Text style={styles.subtitle}>Your AI-powered career navigator.</Text>
                </View>
                <TouchableOpacity style={styles.profileBtn}>
                    <Ionicons name="person-circle-outline" size={36} color="#1E293B" />
                </TouchableOpacity>
            </View>

            {/* Top Overview Cards */}
            <View style={styles.statsContainer}>
                <View style={styles.statBox}>
                    <View style={[styles.iconBg, { backgroundColor: '#DBEAFE' }]}>
                        <Ionicons name="analytics-outline" size={24} color="#1E3A8A" />
                    </View>
                    <Text style={styles.statValue}>{latestSGI ? `${latestSGI.toFixed(0)}%` : '--'}</Text>
                    <Text style={styles.statLabel}>Latest SGI</Text>
                </View>
                <View style={styles.statBox}>
                    <View style={[styles.iconBg, { backgroundColor: '#F0F9FF' }]}>
                        <Ionicons name="briefcase-outline" size={24} color="#0284C7" />
                    </View>
                    <Text style={styles.statValue}>{recentPathways.length}</Text>
                    <Text style={styles.statLabel}>Saved Paths</Text>
                </View>
            </View>

            {/* Advanced Progress Widget (Only show if data exists) */}
            {hasData && (
                <Animated.View entering={FadeInUp.delay(100)} style={styles.progressWidget}>
                    <View style={styles.progressHeader}>
                        <Text style={styles.progressTitle}>
                            {selectedPathway ? selectedPathway.role : "Market Readiness"}
                        </Text>
                        <View style={[styles.badge, { backgroundColor: readinessColor + '20' }]}>
                            <Text style={[styles.badgeText, { color: readinessColor }]}>{readinessLevel}</Text>
                        </View>
                    </View>
                    
                    <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: `${readiness}%`, backgroundColor: readinessColor }]} />
                    </View>
                    <View style={styles.progressFooter}>
                        <Text style={styles.progressFooterText}>0%</Text>
                        <Text style={[styles.progressFooterText, { color: '#1E293B', fontWeight: 'bold' }]}>{readiness.toFixed(0)}%</Text>
                        <Text style={styles.progressFooterText}>100%</Text>
                    </View>
                </Animated.View>
            )}

            {/* Main Action Card */}
            <TouchableOpacity
                style={styles.actionCard}
                onPress={() => router.push('/(career-module)/analyzer')}
                activeOpacity={0.8}
            >
                <View style={styles.actionIcon}>
                    <Ionicons name="sparkles" size={32} color="#fff" />
                </View>
                <View style={styles.actionTextContainer}>
                    <Text style={styles.actionTitle}>Run New AI Scan</Text>
                    <Text style={styles.actionDesc}>Calculate your Skill-Gap Index using the Knowledge Graph.</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#fff" />
            </TouchableOpacity>

            {/* Quick Actions Panel */}
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActionsRow}>
                <TouchableOpacity style={styles.quickActionBtn}>
                    <View style={[styles.qaIcon, { backgroundColor: '#FFF7ED' }]}>
                        <Ionicons name="document-text" size={22} color="#EA580C" />
                    </View>
                    <Text style={styles.qaText}>Export PDF</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickActionBtn} onPress={() => setIsRoadmapVisible(true)}>
                    <View style={[styles.qaIcon, { backgroundColor: '#F3E8FF' }]}>
                        <Ionicons name="map" size={22} color="#9333EA" />
                    </View>
                    <Text style={styles.qaText}>View Roadmap</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickActionBtn}>
                    <View style={[styles.qaIcon, { backgroundColor: '#ECFEFF' }]}>
                        <Ionicons name="school" size={22} color="#0891B2" />
                    </View>
                    <Text style={styles.qaText}>Upskill</Text>
                </TouchableOpacity>
            </View>

            {/* History Section */}
            <View style={styles.historySection}>
                <View style={styles.historyHeader}>
                    <Text style={styles.sectionTitle}>Recent Pathways</Text>
                    {hasData && (
                        <TouchableOpacity>
                            <Text style={styles.viewAllText}>View All</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {hasData ? (
                    recentPathways.map((pathway: any, index: number) => {
                        const dateStr = pathway.date ? new Date(pathway.date).toLocaleDateString() : 'Today';
                        const isSelected = selectedPathway && selectedPathway.id === pathway.id;
                        return (
                            <Animated.View key={index} entering={FadeInUp.delay(200 + (index * 100))}>
                                <TouchableOpacity 
                                    style={[styles.historyCard, isSelected && { borderColor: '#1E3A8A', borderWidth: 2 }]}
                                    onPress={() => setSelectedPathway(pathway)}
                                >
                                    <View style={styles.historyCardIcon}>
                                        <Ionicons name="trending-up" size={20} color="#1E3A8A" />
                                    </View>
                                    <View style={styles.historyCardContent}>
                                        <Text style={styles.historyRole}>{pathway.role}</Text>
                                        <Text style={styles.historyDate}>{dateStr} • {pathway.market_readiness?.toFixed(0)}% Readiness</Text>
                                    </View>
                                    <View style={styles.historyScoreBox}>
                                        <Text style={styles.historyScore}>{pathway.matchScore?.toFixed(0)}%</Text>
                                        <Text style={styles.historyScoreLabel}>SGI</Text>
                                    </View>
                                </TouchableOpacity>
                            </Animated.View>
                        );
                    })
                ) : (
                    <View style={styles.emptyState}>
                        <Ionicons name="compass-outline" size={48} color="#CBD5E1" />
                        <Text style={styles.emptyText}>No pathways generated yet.</Text>
                        <Text style={styles.emptySubText}>Run an AI scan to build your career roadmap.</Text>
                    </View>
                )}
            </View>

            <XAIRoadmapModal 
                visible={isRoadmapVisible} 
                onClose={() => setIsRoadmapVisible(false)} 
                pathway={selectedPathway}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, backgroundColor: '#F8FAFC', padding: 20, paddingBottom: 40 },
    
    // Header
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 25 },
    greeting: { fontSize: 28, fontWeight: 'bold', color: '#1E293B' },
    subtitle: { fontSize: 15, color: '#64748B', marginTop: 4 },
    profileBtn: { padding: 4 },

    // Stats Row
    statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    statBox: { backgroundColor: '#FFFFFF', padding: 18, borderRadius: 16, width: '48%', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
    iconBg: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    statValue: { fontSize: 24, fontWeight: 'bold', color: '#1E293B' },
    statLabel: { fontSize: 13, color: '#64748B', marginTop: 4, fontWeight: '500' },

    // Progress Widget
    progressWidget: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 16, marginBottom: 20, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
    progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    progressTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    badgeText: { fontSize: 11, fontWeight: 'bold' },
    progressBarBg: { height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden' },
    progressBarFill: { height: '100%', borderRadius: 4 },
    progressFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
    progressFooterText: { fontSize: 11, color: '#94A3B8' },

    // Action Card
    actionCard: { flexDirection: 'row', backgroundColor: '#1E3A8A', padding: 20, borderRadius: 16, alignItems: 'center', marginBottom: 25, elevation: 4, shadowColor: '#1E3A8A', shadowOpacity: 0.3, shadowRadius: 6 },
    actionIcon: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 12, borderRadius: 12, marginRight: 15 },
    actionTextContainer: { flex: 1 },
    actionTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
    actionDesc: { color: '#DBEAFE', fontSize: 13, lineHeight: 18, paddingRight: 10 },

    // Quick Actions
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B', marginBottom: 15 },
    quickActionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
    quickActionBtn: { backgroundColor: '#FFFFFF', width: (width - 60) / 3, padding: 15, borderRadius: 16, alignItems: 'center', elevation: 1, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 3 },
    qaIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
    qaText: { fontSize: 12, fontWeight: '600', color: '#1E293B' },

    // History Section
    historySection: { flex: 1 },
    historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    viewAllText: { color: '#1E3A8A', fontSize: 13, fontWeight: '600' },
    
    historyCard: { flexDirection: 'row', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 16, alignItems: 'center', marginBottom: 12, elevation: 1, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 3 },
    historyCardIcon: { backgroundColor: '#DBEAFE', padding: 12, borderRadius: 12, marginRight: 15 },
    historyCardContent: { flex: 1 },
    historyRole: { fontSize: 15, fontWeight: 'bold', color: '#1E293B', marginBottom: 4 },
    historyDate: { fontSize: 12, color: '#64748B' },
    historyScoreBox: { alignItems: 'flex-end', marginLeft: 10 },
    historyScore: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
    historyScoreLabel: { fontSize: 10, color: '#64748B', fontWeight: 'bold', marginTop: 2 },

    emptyState: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 40, alignItems: 'center', justifyContent: 'center', borderStyle: 'dashed', borderWidth: 2, borderColor: '#E2E8F0', marginTop: 10 },
    emptyText: { fontSize: 16, fontWeight: 'bold', color: '#64748B', marginTop: 15 },
    emptySubText: { fontSize: 13, color: '#94A3B8', marginTop: 6, textAlign: 'center' }
});