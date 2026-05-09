import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface Verification {
  id: string;
  type: 'interview' | 'cv';
  score: number;
  date: string;
  tier: string;
}

// Medal images mapping - using emojis as fallback if images don't exist
const medalImages: { [key: string]: any } = {
  // Add your medal images here when available:
  // platinum: require('../assets/images/platinum.png'),
  // gold: require('../assets/images/gold.png'),
  // silver: require('../assets/images/silver.png'),
  // bronze: require('../assets/images/bronze.png'),
};

export default function MentorDashboardScreen() {
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalVerifications: 0,
    averageScore: 0,
    interviewCount: 0,
    cvCount: 0,
    highestTier: '',
    // Additional stats from edusoul-app
    totalCourses: 0,
    totalStudents: 0,
    pendingReviews: 0,
    avgRating: 0,
  });
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await fetchUserData(currentUser.uid);
        await fetchVerifications(currentUser.uid);
        await fetchMentorStats(currentUser.uid);
      } else {
        setUser(null);
        router.replace('/mentor-login');
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const fetchUserData = async (uid: string) => {
    try {
      const userDoc = await getDocs(query(collection(db, 'users'), where('uid', '==', uid)));
      if (!userDoc.empty) {
        setUserData(userDoc.docs[0].data());
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchVerifications = async (uid: string) => {
    try {
      // Fetch interview verifications
      const interviewQuery = query(
        collection(db, 'verifications'),
        where('mentorId', '==', uid),
        orderBy('createdAt', 'desc')
      );
      const interviewSnapshot = await getDocs(interviewQuery);
      const interviews = interviewSnapshot.docs.map(doc => ({
        id: doc.id,
        type: 'interview' as const,
        score: doc.data().overallScore,
        date: doc.data().createdAt,
        tier: getMedalTier(doc.data().overallScore),
      }));

      // Fetch CV verifications
      const cvQuery = query(
        collection(db, 'cvVerifications'),
        where('mentorId', '==', uid),
        orderBy('uploadedAt', 'desc')
      );
      const cvSnapshot = await getDocs(cvQuery);
      const cvs = cvSnapshot.docs.map(doc => ({
        id: doc.id,
        type: 'cv' as const,
        score: doc.data().overallScore,
        date: doc.data().uploadedAt,
        tier: getMedalTier(doc.data().overallScore),
      }));

      const allVerifications = [...interviews, ...cvs].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setVerifications(allVerifications);

      // Calculate stats
      const interviewCount = interviews.length;
      const cvCount = cvs.length;
      const totalScore = allVerifications.reduce((sum, v) => sum + v.score, 0);
      const averageScore = allVerifications.length > 0 ? totalScore / allVerifications.length : 0;

      // Get highest tier
      const tierOrder = ['platinum', 'gold', 'silver', 'bronze', 'rising', 'participant'];
      const highestTier = allVerifications.reduce((highest, v) => {
        return tierOrder.indexOf(v.tier) < tierOrder.indexOf(highest) ? v.tier : highest;
      }, 'participant');

      setStats(prev => ({
        ...prev,
        totalVerifications: allVerifications.length,
        averageScore: Math.round(averageScore),
        interviewCount,
        cvCount,
        highestTier,
      }));
    } catch (error) {
      console.error('Error fetching verifications:', error);
    }
  };

  const fetchMentorStats = async (uid: string) => {
    try {
      // Fetch courses count
      const coursesQuery = query(collection(db, 'courses'), where('mentorId', '==', uid));
      const coursesSnapshot = await getDocs(coursesQuery);
      const totalCourses = coursesSnapshot.size;

      // Fetch students count (enrollments)
      const enrollmentsQuery = query(collection(db, 'enrollments'), where('mentorId', '==', uid));
      const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
      const totalStudents = enrollmentsSnapshot.size;

      // Fetch pending reviews
      const reviewsQuery = query(
        collection(db, 'reviews'),
        where('mentorId', '==', uid),
        where('status', '==', 'pending')
      );
      const reviewsSnapshot = await getDocs(reviewsQuery);
      const pendingReviews = reviewsSnapshot.size;

      // Calculate average rating
      const ratingsQuery = query(collection(db, 'ratings'), where('mentorId', '==', uid));
      const ratingsSnapshot = await getDocs(ratingsQuery);
      let avgRating = 0;
      if (ratingsSnapshot.size > 0) {
        const totalRating = ratingsSnapshot.docs.reduce((sum, doc) => sum + (doc.data().rating || 0), 0);
        avgRating = totalRating / ratingsSnapshot.size;
      }

      setStats(prev => ({
        ...prev,
        totalCourses,
        totalStudents,
        pendingReviews,
        avgRating: Math.round(avgRating * 10) / 10,
      }));
    } catch (error) {
      console.error('Error fetching mentor stats:', error);
    }
  };

  const getMedalTier = (score: number): string => {
    if (score >= 95) return 'platinum';
    if (score >= 80) return 'gold';
    if (score >= 65) return 'silver';
    if (score >= 50) return 'bronze';
    if (score >= 35) return 'rising';
    return 'participant';
  };

  const getMedalEmoji = (tier: string): string => {
    const emojis: { [key: string]: string } = {
      platinum: '🥈',
      gold: '🥇',
      silver: '🥈',
      bronze: '🥉',
      rising: '⭐',
      participant: '✅',
    };
    return emojis[tier] || '🏅';
  };

  const getMedalName = (tier: string): string => {
    const names: { [key: string]: string } = {
      platinum: 'Platinum Mentor',
      gold: 'Gold Mentor',
      silver: 'Silver Mentor',
      bronze: 'Bronze Mentor',
      rising: 'Rising Star',
      participant: 'Verified Mentor',
    };
    return names[tier] || 'Mentor';
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      Alert.alert('Logged Out', 'You have been successfully logged out.');
      router.replace('/mentor-login');
    } catch (error) {
      Alert.alert('Error', 'Failed to log out. Please try again.');
    }
  };

  // Navigation handlers
  const handleStartVerification = () => {
    router.push('/mentor-verification');
  };

  const handleUploadCV = () => {
    router.push('/cv-verification');
  };

  const handleViewHistory = () => {
    router.push('/verification-history');
  };

  const handleCreateCourse = () => {
    router.push('/create-course');
  };

  const handleViewMessages = () => {
    router.push('/messages');
  };

  const handleViewAssignments = () => {
    router.push('/assignments');
  };

  const handleViewStudents = () => {
    router.push('/my-students');
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#7c3aed" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Please login first</Text>
        <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/mentor-login')}>
          <Text style={styles.loginButtonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header with Logo */}
        <View style={styles.header}>
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <Ionicons name="bulb-outline" size={24} color="#ffffff" />
            </View>
            <Text style={styles.logoText}>EduSoul</Text>
          </View>
          <View style={styles.userSection}>
            <View style={styles.userInfo}>
              <Text style={styles.userEmail}>{userData?.email || user.email}</Text>
              <Text style={styles.userRole}>Mentor</Text>
            </View>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome, Mentor!</Text>
          <Text style={styles.welcomeSubtitle}>Manage your courses and guide students on their learning journey</Text>
        </View>

        {/* Stats Cards - 4 columns like edusoul-app */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: '#ffffff' }]}>
            <View style={styles.statIconContainer}>
              <Ionicons name="book-outline" size={24} color="#7c3aed" />
            </View>
            <Text style={styles.statLabel}>Total Courses</Text>
            <Text style={styles.statNumber}>{stats.totalCourses}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#ffffff' }]}>
            <View style={[styles.statIconContainer, { backgroundColor: '#dbeafe' }]}>
              <Ionicons name="people-outline" size={24} color="#3b82f6" />
            </View>
            <Text style={styles.statLabel}>Total Students</Text>
            <Text style={styles.statNumber}>{stats.totalStudents}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#ffffff' }]}>
            <View style={[styles.statIconContainer, { backgroundColor: '#fef3c7' }]}>
              <Ionicons name="time-outline" size={24} color="#f59e0b" />
            </View>
            <Text style={styles.statLabel}>Pending Reviews</Text>
            <Text style={styles.statNumber}>{stats.pendingReviews}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#ffffff' }]}>
            <View style={[styles.statIconContainer, { backgroundColor: '#d1fae5' }]}>
              <Ionicons name="star-outline" size={24} color="#10b981" />
            </View>
            <Text style={styles.statLabel}>Avg. Rating</Text>
            <Text style={styles.statNumber}>{stats.avgRating.toFixed(1)}</Text>
          </View>
        </View>

        {/* Achievements & Medals Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="sparkles-outline" size={24} color="#f59e0b" />
              <Text style={styles.sectionTitle}>My Achievements</Text>
            </View>
            <TouchableOpacity onPress={handleViewHistory}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {/* Medals Display */}
          <View style={styles.medalsContainer}>
            {stats.highestTier && stats.highestTier !== 'participant' ? (
              <View style={styles.bestMedalContainer}>
                {/* Show medal image if available, otherwise show emoji */}
                {medalImages[stats.highestTier] ? (
                  <Image 
                    source={medalImages[stats.highestTier]} 
                    style={styles.medalImage}
                    resizeMode="contain"
                  />
                ) : (
                  <Text style={styles.medalEmoji}>{getMedalEmoji(stats.highestTier)}</Text>
                )}
                <Text style={styles.bestMedalText}>{getMedalName(stats.highestTier)}</Text>
                <Text style={styles.medalCountText}>
                  {stats.totalVerifications} verifications completed
                </Text>
              </View>
            ) : (
              <View style={styles.noMedalsContainer}>
                <Ionicons name="trophy-outline" size={48} color="#d1d5db" />
                <Text style={styles.noMedalsText}>No medals yet</Text>
                <Text style={styles.noMedalsSubtext}>Complete verifications to earn medals</Text>
              </View>
            )}
          </View>

          {/* Verification Stats */}
          <View style={styles.verificationStatsRow}>
            <View style={styles.verificationStat}>
              <Text style={styles.verificationStatNumber}>{stats.totalVerifications}</Text>
              <Text style={styles.verificationStatLabel}>Verifications</Text>
            </View>
            <View style={styles.verificationStat}>
              <Text style={styles.verificationStatNumber}>{stats.averageScore}%</Text>
              <Text style={styles.verificationStatLabel}>Avg Score</Text>
            </View>
            <View style={styles.verificationStat}>
              <Text style={styles.verificationStatNumber}>{stats.interviewCount}</Text>
              <Text style={styles.verificationStatLabel}>Interviews</Text>
            </View>
            <View style={styles.verificationStat}>
              <Text style={styles.verificationStatNumber}>{stats.cvCount}</Text>
              <Text style={styles.verificationStatLabel}>CVs</Text>
            </View>
          </View>
        </View>

        {/* Main Content Area - Courses & Students */}
        <View style={styles.mainContentGrid}>
          {/* My Courses Section */}
          <View style={styles.contentCard}>
            <View style={styles.contentCardHeader}>
              <Text style={styles.contentCardTitle}>My Courses</Text>
              <TouchableOpacity style={styles.createButton} onPress={handleCreateCourse}>
                <Text style={styles.createButtonText}>Create New Course</Text>
              </TouchableOpacity>
            </View>
            {stats.totalCourses === 0 ? (
              <View style={styles.emptyContentCard}>
                <View style={styles.emptyIconContainer}>
                  <Ionicons name="desktop-outline" size={32} color="#ffffff" />
                </View>
                <Text style={styles.emptyContentTitle}>No courses created yet</Text>
                <Text style={styles.emptyContentText}>Start by creating your first course</Text>
                <View style={styles.emptyContentStats}>
                  <Text style={styles.emptyContentStat}>0 students</Text>
                  <Text style={styles.emptyContentStat}>0 lessons</Text>
                </View>
              </View>
            ) : (
              <View style={styles.coursesList}>
                {/* Courses will be listed here when available */}
                <Text style={styles.comingSoonText}>Your courses will appear here</Text>
              </View>
            )}
          </View>

          {/* My Students Section */}
          <View style={styles.contentCard}>
            <View style={styles.contentCardHeader}>
              <Text style={styles.contentCardTitle}>My Students</Text>
              <TouchableOpacity onPress={handleViewStudents}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            {stats.totalStudents === 0 ? (
              <View style={styles.emptyStudentsCard}>
                <View style={styles.emptyStudentsIcon}>
                  <Ionicons name="people-outline" size={24} color="#7c3aed" />
                </View>
                <Text style={styles.emptyStudentsText}>No students yet</Text>
                <Text style={styles.emptyStudentsSubtext}>Students will appear here when they enroll</Text>
              </View>
            ) : (
              <View style={styles.studentsList}>
                <Text style={styles.comingSoonText}>Your students will appear here</Text>
              </View>
            )}

            {/* Quick Actions */}
            <View style={styles.quickActionsSection}>
              <Text style={styles.quickActionsTitle}>Quick Actions</Text>
              
              <TouchableOpacity style={styles.quickActionButton} onPress={handleStartVerification}>
                <View style={[styles.quickActionIcon, { backgroundColor: '#ede9fe' }]}>
                  <Ionicons name="shield-checkmark-outline" size={20} color="#7c3aed" />
                </View>
                <Text style={styles.quickActionText}>Start Verification Interview</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.quickActionButton} onPress={handleViewHistory}>
                <View style={[styles.quickActionIcon, { backgroundColor: '#f3f4f6' }]}>
                  <Ionicons name="time-outline" size={20} color="#6b7280" />
                </View>
                <Text style={[styles.quickActionText, { color: '#374151' }]}>View Verification History</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.quickActionButton} onPress={handleUploadCV}>
                <View style={[styles.quickActionIcon, { backgroundColor: '#dbeafe' }]}>
                  <Ionicons name="document-text-outline" size={20} color="#3b82f6" />
                </View>
                <Text style={[styles.quickActionText, { color: '#1d4ed8' }]}>Upload CV for Analysis</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.quickActionButton} onPress={handleCreateCourse}>
                <View style={[styles.quickActionIcon, { backgroundColor: '#f3f4f6' }]}>
                  <Ionicons name="add-outline" size={20} color="#6b7280" />
                </View>
                <Text style={[styles.quickActionText, { color: '#374151' }]}>Create Course</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.quickActionButton} onPress={handleViewMessages}>
                <View style={[styles.quickActionIcon, { backgroundColor: '#f3f4f6' }]}>
                  <Ionicons name="chatbubble-outline" size={20} color="#6b7280" />
                </View>
                <Text style={[styles.quickActionText, { color: '#374151' }]}>View Messages</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.quickActionButton} onPress={handleViewAssignments}>
                <View style={[styles.quickActionIcon, { backgroundColor: '#f3f4f6' }]}>
                  <Ionicons name="clipboard-outline" size={20} color="#6b7280" />
                </View>
                <Text style={[styles.quickActionText, { color: '#374151' }]}>View Assignments</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Recent Verifications */}
        {verifications.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Recent Verifications</Text>
            {verifications.slice(0, 5).map((verification) => (
              <View key={verification.id} style={styles.verificationItem}>
                <View style={styles.verificationIcon}>
                  <Text style={styles.verificationEmoji}>
                    {getMedalEmoji(verification.tier)}
                  </Text>
                </View>
                <View style={styles.verificationContent}>
                  <Text style={styles.verificationTitle}>
                    {getMedalName(verification.tier)}
                  </Text>
                  <View style={styles.verificationMeta}>
                    <View style={[
                      styles.typeBadge,
                      verification.type === 'cv' ? styles.cvBadge : styles.interviewBadge
                    ]}>
                      <Text style={[
                        styles.typeText,
                        verification.type === 'cv' ? styles.cvText : styles.interviewText
                      ]}>
                        {verification.type === 'cv' ? 'CV' : 'Interview'}
                      </Text>
                    </View>
                    <Text style={styles.verificationDate}>
                      {new Date(verification.date).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
                <View style={styles.verificationScore}>
                  <Text style={styles.scoreText}>{verification.score}%</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* No Verifications Message */}
        {verifications.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="trophy-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No Medals Yet</Text>
            <Text style={styles.emptyText}>
              Complete verifications to earn achievement medals
            </Text>
            <TouchableOpacity style={styles.startButton} onPress={handleStartVerification}>
              <Text style={styles.startButtonText}>Start First Verification</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Header styles
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoContainer: {
    width: 36,
    height: 36,
    backgroundColor: '#7c3aed',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userInfo: {
    alignItems: 'flex-end',
  },
  userEmail: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1f2937',
  },
  userRole: {
    fontSize: 11,
    color: '#7c3aed',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  logoutButton: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  logoutText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  // Welcome section
  welcomeSection: {
    padding: 16,
    backgroundColor: '#ffffff',
    marginBottom: 8,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  // Stats grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
    backgroundColor: '#f8fafc',
  },
  statCard: {
    flex: 1,
    minWidth: '22%',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#ede9fe',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 4,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  // Section container
  sectionContainer: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  viewAllText: {
    fontSize: 13,
    color: '#7c3aed',
    fontWeight: '500',
  },
  // Medals
  medalsContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  bestMedalContainer: {
    alignItems: 'center',
  },
  medalImage: {
    width: 80,
    height: 80,
    marginBottom: 12,
  },
  medalEmoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  bestMedalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  medalCountText: {
    fontSize: 13,
    color: '#6b7280',
  },
  noMedalsContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noMedalsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 12,
  },
  noMedalsSubtext: {
    fontSize: 13,
    color: '#9ca3af',
    marginTop: 4,
  },
  // Verification stats row
  verificationStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
  },
  verificationStat: {
    alignItems: 'center',
  },
  verificationStatNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  verificationStatLabel: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
  },
  // Main content grid
  mainContentGrid: {
    paddingHorizontal: 16,
    gap: 16,
    marginBottom: 16,
  },
  contentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  contentCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  contentCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  createButton: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  // Empty states
  emptyContentCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    backgroundColor: '#7c3aed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyContentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  emptyContentText: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 12,
  },
  emptyContentStats: {
    flexDirection: 'row',
    gap: 16,
  },
  emptyContentStat: {
    fontSize: 12,
    color: '#9ca3af',
  },
  emptyStudentsCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  emptyStudentsIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#ede9fe',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyStudentsText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 4,
  },
  emptyStudentsSubtext: {
    fontSize: 12,
    color: '#9ca3af',
  },
  // Quick actions
  quickActionsSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  quickActionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  quickActionIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#7c3aed',
    flex: 1,
  },
  // Verifications list
  verificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  verificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  verificationEmoji: {
    fontSize: 20,
  },
  verificationContent: {
    flex: 1,
  },
  verificationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  verificationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  interviewBadge: {
    backgroundColor: '#ede9fe',
  },
  cvBadge: {
    backgroundColor: '#dbeafe',
  },
  typeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  interviewText: {
    color: '#7c3aed',
  },
  cvText: {
    color: '#3b82f6',
  },
  verificationDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  verificationScore: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  scoreText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  // Empty container
  emptyContainer: {
    backgroundColor: '#ffffff',
    padding: 40,
    margin: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  startButton: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
  },
  errorText: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  // Misc
  coursesList: {
    paddingVertical: 10,
  },
  studentsList: {
    paddingVertical: 10,
  },
  comingSoonText: {
    fontSize: 13,
    color: '#9ca3af',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
