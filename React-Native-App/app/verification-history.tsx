import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../firebase';

type FilterType = 'all' | 'interview' | 'cv';

interface Verification {
  id: string;
  type: 'interview' | 'cv';
  score: number;
  date: string;
  tier: string;
  status: string;
  details?: string;
  createdAt?: any;
}

export default function VerificationHistoryScreen() {
  const router = useRouter();
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [filteredVerifications, setFilteredVerifications] = useState<Verification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchVerifications(currentUser.uid);
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchVerifications = async (userId: string) => {
    try {
      const verificationsQuery = query(
        collection(db, 'verifications'),
        where('mentorId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const cvVerificationsQuery = query(
        collection(db, 'cvVerifications'),
        where('mentorId', '==', userId),
        orderBy('uploadedAt', 'desc')
      );

      const [verificationsSnapshot, cvVerificationsSnapshot] = await Promise.all([
        getDocs(verificationsQuery),
        getDocs(cvVerificationsQuery)
      ]);

      const verificationsList: Verification[] = [];

      verificationsSnapshot.forEach((doc) => {
        const data = doc.data();
        const dateValue = data.createdAt;
        let dateString = 'Unknown';
        if (dateValue) {
          if (typeof dateValue.toDate === 'function') {
            dateString = dateValue.toDate().toLocaleDateString();
          } else if (typeof dateValue === 'string') {
            dateString = new Date(dateValue).toLocaleDateString();
          } else if (typeof dateValue === 'number') {
            dateString = new Date(dateValue).toLocaleDateString();
          }
        }

        verificationsList.push({
          id: doc.id,
          type: 'interview',
          score: data.overallScore || 0,
          date: dateString,
          tier: data.verdict || data.tier || 'participant',
          status: data.status || 'completed',
          details: data.feedback ? data.feedback.join('. ') : '',
          createdAt: dateValue,
        });
      });

      cvVerificationsSnapshot.forEach((doc) => {
        const data = doc.data();
        const dateValue = data.uploadedAt || data.createdAt;
        let dateString = 'Unknown';
        if (dateValue) {
          if (typeof dateValue.toDate === 'function') {
            dateString = dateValue.toDate().toLocaleDateString();
          } else if (typeof dateValue === 'string') {
            dateString = new Date(dateValue).toLocaleDateString();
          } else if (typeof dateValue === 'number') {
            dateString = new Date(dateValue).toLocaleDateString();
          }
        }

        verificationsList.push({
          id: doc.id,
          type: 'cv',
          score: data.overallScore || 0,
          date: dateString,
          tier: data.verdict || data.tier || 'participant',
          status: data.status || 'completed',
          details: data.feedback ? data.feedback.join('. ') : '',
          createdAt: dateValue,
        });
      });

      verificationsList.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          const aTime = typeof a.createdAt.toDate === 'function'
            ? a.createdAt.toDate().getTime()
            : new Date(a.createdAt).getTime();
          const bTime = typeof b.createdAt.toDate === 'function'
            ? b.createdAt.toDate().getTime()
            : new Date(b.createdAt).getTime();
          return bTime - aTime;
        }
        return 0;
      });

      setVerifications(verificationsList);
      setFilteredVerifications(verificationsList);
    } catch (error) {
      console.error('Error fetching verifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (activeFilter === 'all') {
      setFilteredVerifications(verifications);
    } else {
      setFilteredVerifications(verifications.filter(v => v.type === activeFilter));
    }
  }, [activeFilter, verifications]);

  const onRefresh = () => {
    setRefreshing(true);
    if (user) {
      fetchVerifications(user.uid);
    }
  };

  const getTierConfig = (tier: string) => {
    const normalized = tier?.toLowerCase();
    switch (normalized) {
      case 'platinum':
        return { emoji: '🏆', color: '#6366f1', bgColor: '#ede9fe', label: 'Platinum' };
      case 'gold':
        return { emoji: '🥇', color: '#f59e0b', bgColor: '#fef3c7', label: 'Gold' };
      case 'silver':
        return { emoji: '🥈', color: '#6b7280', bgColor: '#f3f4f6', label: 'Silver' };
      case 'bronze':
        return { emoji: '🥉', color: '#b45309', bgColor: '#fef3c7', label: 'Bronze' };
      default:
        return { emoji: '📋', color: '#6b7280', bgColor: '#f3f4f6', label: 'Participant' };
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return { color: '#10b981', bgColor: '#d1fae5', label: 'Excellent' };
    if (score >= 75) return { color: '#3b82f6', bgColor: '#dbeafe', label: 'Good' };
    if (score >= 60) return { color: '#f59e0b', bgColor: '#fef3c7', label: 'Average' };
    return { color: '#ef4444', bgColor: '#fee2e2', label: 'Needs Work' };
  };

  const averageScore = verifications.length > 0
    ? Math.round(verifications.reduce((sum, v) => sum + v.score, 0) / verifications.length)
    : 0;

  const bestTier = verifications.length > 0
    ? verifications.reduce((best, v) => {
        const tierOrder = ['participant', 'bronze', 'silver', 'gold', 'platinum'];
        return tierOrder.indexOf(v.tier.toLowerCase()) > tierOrder.indexOf(best.toLowerCase()) ? v.tier : best;
      }, 'participant')
    : 'participant';

  const bestTierConfig = getTierConfig(bestTier);
  const avgScoreConfig = getScoreColor(averageScore);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Verification History</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#7c3aed" />
          <Text style={styles.loadingText}>Loading history...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verification History</Text>
        <TouchableOpacity onPress={onRefresh} style={styles.backButton}>
          <Ionicons name="refresh-outline" size={22} color="#7c3aed" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats Overview Cards */}
        {verifications.length > 0 && (
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, styles.bestTierCard]}>
              <View style={[styles.statIconBg, { backgroundColor: bestTierConfig.bgColor }]}>
                <Text style={styles.statEmoji}>{bestTierConfig.emoji}</Text>
              </View>
              <View style={styles.statInfo}>
                <Text style={[styles.statValue, { color: bestTierConfig.color }]}>{bestTierConfig.label}</Text>
                <Text style={styles.statLabel}>Best Tier</Text>
              </View>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIconBg, { backgroundColor: avgScoreConfig.bgColor }]}>
                <Text style={[styles.scoreIconText, { color: avgScoreConfig.color }]}>{averageScore}%</Text>
              </View>
              <View style={styles.statInfo}>
                <Text style={[styles.statValue, { color: avgScoreConfig.color }]}>{averageScore}%</Text>
                <Text style={styles.statLabel}>Average Score</Text>
              </View>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIconBg, { backgroundColor: '#ede9fe' }]}>
                <Ionicons name="checkmark-done" size={22} color="#7c3aed" />
              </View>
              <View style={styles.statInfo}>
                <Text style={styles.statValue}>{verifications.length}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIconBg, { backgroundColor: '#dbeafe' }]}>
                <Ionicons name="chatbubbles" size={22} color="#3b82f6" />
              </View>
              <View style={styles.statInfo}>
                <Text style={styles.statValue}>
                  {verifications.filter(v => v.type === 'interview').length}
                </Text>
                <Text style={styles.statLabel}>Interviews</Text>
              </View>
            </View>
          </View>
        )}

        {/* Filter Pills */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterPill, activeFilter === 'all' && styles.filterPillActive]}
            onPress={() => setActiveFilter('all')}
          >
            <Text style={[styles.filterPillText, activeFilter === 'all' && styles.filterPillTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterPill, activeFilter === 'interview' && styles.filterPillActive]}
            onPress={() => setActiveFilter('interview')}
          >
            <Ionicons name="videocam-outline" size={14} color={activeFilter === 'interview' ? '#7c3aed' : '#6b7280'} />
            <Text style={[styles.filterPillText, activeFilter === 'interview' && styles.filterPillTextActive]}>
              Interviews
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterPill, activeFilter === 'cv' && styles.filterPillActive]}
            onPress={() => setActiveFilter('cv')}
          >
            <Ionicons name="document-text-outline" size={14} color={activeFilter === 'cv' ? '#3b82f6' : '#6b7280'} />
            <Text style={[styles.filterPillText, activeFilter === 'cv' && styles.filterPillTextActive]}>
              CV Analysis
            </Text>
          </TouchableOpacity>
        </View>

        {/* Section Title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {activeFilter === 'all' ? 'Recent Verifications' :
             activeFilter === 'interview' ? 'Interview Results' : 'CV Analysis Results'}
          </Text>
          <Text style={styles.sectionCount}>{filteredVerifications.length} items</Text>
        </View>

        {/* Empty State */}
        {filteredVerifications.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconBg}>
              <Ionicons name="document-text-outline" size={40} color="#cbd5e1" />
            </View>
            <Text style={styles.emptyTitle}>
              {verifications.length === 0 ? 'No Verifications Yet' : 'No Items Found'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {verifications.length === 0
                ? 'Complete a verification interview or CV analysis to build your history.'
                : 'Try selecting a different filter to see more results.'}
            </Text>
            {verifications.length === 0 && (
              <View style={styles.emptyActions}>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() => router.push('/mentor-verification')}
                >
                  <Ionicons name="videocam-outline" size={18} color="#ffffff" />
                  <Text style={styles.primaryButtonText}>Start Interview</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => router.push('/cv-verification')}
                >
                  <Ionicons name="document-outline" size={18} color="#7c3aed" />
                  <Text style={styles.secondaryButtonText}>Upload CV</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : (
          /* Verification Cards */
          <View style={styles.cardsContainer}>
            {filteredVerifications.map((item) => {
              const tierConfig = getTierConfig(item.tier);
              const scoreConfig = getScoreColor(item.score);

              return (
                <View key={item.id} style={styles.verificationCard}>
                  {/* Card Header with Type and Date */}
                  <View style={styles.cardHeader}>
                    <View style={styles.typeRow}>
                      <View style={[styles.typeIcon, { backgroundColor: item.type === 'interview' ? '#ede9fe' : '#dbeafe' }]}>
                        <Ionicons
                          name={item.type === 'interview' ? 'videocam' : 'document-text'}
                          size={18}
                          color={item.type === 'interview' ? '#7c3aed' : '#3b82f6'}
                        />
                      </View>
                      <View>
                        <Text style={styles.typeText}>
                          {item.type === 'interview' ? 'Interview Verification' : 'CV Analysis'}
                        </Text>
                        <Text style={styles.dateText}>{item.date}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Score Display - Big and Prominent */}
                  <View style={styles.scoreSection}>
                    <View style={styles.scoreLeft}>
                      <Text style={styles.scoreLabel}>Score</Text>
                      <View style={styles.scoreValueRow}>
                        <Text style={[styles.scoreNumber, { color: scoreConfig.color }]}>{item.score}</Text>
                        <Text style={[styles.scorePercent, { color: scoreConfig.color }]}>%</Text>
                      </View>
                      <View style={[styles.scoreBadge, { backgroundColor: scoreConfig.bgColor }]}>
                        <Text style={[styles.scoreBadgeText, { color: scoreConfig.color }]}>
                          {scoreConfig.label}
                        </Text>
                      </View>
                    </View>

                    {/* Tier Badge */}
                    <View style={[styles.tierBadge, { backgroundColor: tierConfig.bgColor }]}>
                      <Text style={styles.tierEmoji}>{tierConfig.emoji}</Text>
                      <Text style={[styles.tierText, { color: tierConfig.color }]}>{tierConfig.label}</Text>
                    </View>
                  </View>

                  {/* Status */}
                  <View style={styles.statusRow}>
                    <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                    <Text style={styles.statusText}>{item.status}</Text>
                  </View>

                  {/* Details Summary */}
                  {item.details ? (
                    <View style={styles.detailsBox}>
                      <Text style={styles.detailsText} numberOfLines={2}>{item.details}</Text>
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
  },
  scrollView: {
    flex: 1,
  },
  // Stats Grid - 2x2 Layout like edusoul-app
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    width: '47%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  bestTierCard: {
    borderColor: '#c4b5fd',
  },
  statIconBg: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statEmoji: {
    fontSize: 24,
  },
  scoreIconText: {
    fontSize: 16,
    fontWeight: '700',
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  // Filter Pills
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 6,
  },
  filterPillActive: {
    backgroundColor: '#f5f3ff',
    borderColor: '#7c3aed',
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748b',
  },
  filterPillTextActive: {
    color: '#7c3aed',
    fontWeight: '600',
  },
  // Section
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  sectionCount: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  // Empty State
  emptyState: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 32,
    margin: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  emptyIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyActions: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7c3aed',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f3ff',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: '#ede9fe',
  },
  secondaryButtonText: {
    color: '#7c3aed',
    fontSize: 14,
    fontWeight: '600',
  },
  // Cards Container
  cardsContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  // Verification Card - Professional Style
  verificationCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    marginBottom: 12,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  typeIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  dateText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  // Score Section - Big and Prominent
  scoreSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  scoreLeft: {
    alignItems: 'flex-start',
  },
  scoreLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  scoreValueRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  scoreNumber: {
    fontSize: 36,
    fontWeight: '800',
  },
  scorePercent: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  scoreBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 6,
  },
  scoreBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  // Tier Badge
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  tierEmoji: {
    fontSize: 18,
  },
  tierText: {
    fontSize: 13,
    fontWeight: '700',
  },
  // Status
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 13,
    color: '#10b981',
    fontWeight: '600',
  },
  // Details
  detailsBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#7c3aed',
  },
  detailsText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },
});
