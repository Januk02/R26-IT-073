import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { db } from '@/firebase';

const Profile: React.FC = () => {
  const [studentData, setStudentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch student data from Firestore
  const fetchStudentData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Starting to fetch student data...');
      
      // Query students collection to get most recent record
      const studentsRef = collection(db, 'students');
      
      // First try without ordering to see if we can access the collection
      const querySnapshot = await getDocs(studentsRef);
      
      console.log('Query snapshot size:', querySnapshot.size);
      console.log('Query snapshot empty:', querySnapshot.empty);
      
      if (!querySnapshot.empty) {
        // Sort manually if orderBy doesn't work
        const sortedDocs = querySnapshot.docs.sort((a, b) => {
          const aData = a.data();
          const bData = b.data();
          
          console.log('Document A data:', aData);
          console.log('Document B data:', bData);
          
          // Handle Firestore Timestamp properly
          const aTime = aData.createdAt && typeof aData.createdAt.toMillis === 'function' 
            ? aData.createdAt.toMillis() 
            : 0;
          const bTime = bData.createdAt && typeof bData.createdAt.toMillis === 'function' 
            ? bData.createdAt.toMillis() 
            : 0;
            
          console.log('A time:', aTime, 'B time:', bTime);
          
          return bTime - aTime;
        });
        
        const latestStudent = sortedDocs[0].data();
        console.log('Latest student data:', latestStudent);
        setStudentData(latestStudent);
      } else {
        console.log('No student data found in collection');
        setError('No student data found. Please complete the recommendation form first.');
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching student data:', err);
      setError('Failed to load student data. Please try again.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, []);

  const calculateProfileCompletion = (data: any) => {
    if (!data) return 0;
    
    let completedFields = 0;
    let totalFields = 8;
    
    if (data.name) completedFields++;
    if (data.alResults?.stream) completedFields++;
    if (data.zScore) completedFields++;
    if (data.interests && data.interests.length > 0) completedFields++;
    if (data.personalityTraits) completedFields++;
    if (data.locationPreference) completedFields++;
    if (data.travelTolerance) completedFields++;
    if (data.workEnvironment) completedFields++;
    
    return Math.round((completedFields / totalFields) * 100);
  };
  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <ThemedText style={styles.loadingText}>Loading your profile...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <TouchableOpacity style={styles.retryButton} onPress={fetchStudentData}>
            <ThemedText style={styles.retryText}>Try Again</ThemedText>
          </TouchableOpacity>
          <View style={styles.helpSection}>
            <ThemedText style={styles.helpText}>
              Possible solutions:
            </ThemedText>
            <ThemedText style={styles.helpItem}>• Complete the recommendation form first</ThemedText>
            <ThemedText style={styles.helpItem}>• Check Firestore permissions are deployed</ThemedText>
            <ThemedText style={styles.helpItem}>• Check internet connection</ThemedText>
          </View>
        </View>
      </ThemedView>
    );
  }

  const completionPercentage = calculateProfileCompletion(studentData);

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <ThemedText type="title" style={styles.title}>FutureDream Profile</ThemedText>
          <ThemedText style={styles.subtitle}>Your personalized academic journey & career guidance</ThemedText>
          <View style={styles.profileAvatar}>
            <Text style={styles.avatarText}>👨‍🎓</Text>
          </View>
        </View>
        
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>👤</Text>
            <ThemedText type="subtitle" style={styles.cardTitle}>Personal Information</ThemedText>
          </View>
          <View style={styles.infoRow}>
            <ThemedText style={styles.label}>Full Name:</ThemedText>
            <ThemedText style={styles.value}>{studentData?.name || 'Not Set'}</ThemedText>
          </View>
          <View style={styles.infoRow}>
            <ThemedText style={styles.label}>A/L Stream:</ThemedText>
            <View style={styles.streamBadge}>
              <ThemedText style={styles.streamText}>{studentData?.alResults?.stream || 'Not Set'}</ThemedText>
            </View>
          </View>
          <View style={styles.infoRow}>
            <ThemedText style={styles.label}>Interests:</ThemedText>
            <View style={styles.interestsContainer}>
              {studentData?.interests && studentData.interests.length > 0 ? (
                studentData.interests.slice(0, 3).map((interest: string, index: number) => (
                  <View key={index} style={styles.interestBadge}>
                    <ThemedText style={styles.interestText}>{interest}</ThemedText>
                  </View>
                ))
              ) : (
                <ThemedText style={styles.value}>Not Set</ThemedText>
              )}
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>📚</Text>
            <ThemedText type="subtitle" style={styles.cardTitle}>Academic Information</ThemedText>
          </View>
          <View style={styles.infoRow}>
            <ThemedText style={styles.label}>Z-Score:</ThemedText>
            <View style={styles.scoreContainer}>
              <ThemedText style={styles.scoreValue}>{studentData?.zScore || 'Not Set'}</ThemedText>
              {studentData?.zScore && parseFloat(studentData.zScore) >= 3.0 && (
                <Text style={styles.scoreBadge}>High</Text>
              )}
            </View>
          </View>
          <View style={styles.infoRow}>
            <ThemedText style={styles.label}>Location Preference:</ThemedText>
            <ThemedText style={styles.value}>{studentData?.locationPreference || 'Not Set'}</ThemedText>
          </View>
          <View style={styles.infoRow}>
            <ThemedText style={styles.label}>Work Environment:</ThemedText>
            <ThemedText style={styles.value}>{studentData?.workEnvironment || 'Not Set'}</ThemedText>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>🧠</Text>
            <ThemedText type="subtitle" style={styles.cardTitle}>Personality Traits</ThemedText>
          </View>
          <View style={styles.personalityGrid}>
            {studentData?.personalityTraits && (
              <>
                <View style={styles.personalityItem}>
                  <ThemedText style={styles.personalityLabel}>Leadership</ThemedText>
                  <View style={styles.traitBar}>
                    <View style={[styles.traitFill, { width: `${(studentData.personalityTraits.leadership / 5) * 100}%` }]} />
                    <Text style={styles.traitValue}>{studentData.personalityTraits.leadership}/5</Text>
                  </View>
                </View>
                <View style={styles.personalityItem}>
                  <ThemedText style={styles.personalityLabel}>Creativity</ThemedText>
                  <View style={styles.traitBar}>
                    <View style={[styles.traitFill, { width: `${(studentData.personalityTraits.creativity / 5) * 100}%` }]} />
                    <Text style={styles.traitValue}>{studentData.personalityTraits.creativity}/5</Text>
                  </View>
                </View>
                <View style={styles.personalityItem}>
                  <ThemedText style={styles.personalityLabel}>Risk Taking</ThemedText>
                  <View style={styles.traitBar}>
                    <View style={[styles.traitFill, { width: `${(studentData.personalityTraits.riskTaking / 5) * 100}%` }]} />
                    <Text style={styles.traitValue}>{studentData.personalityTraits.riskTaking}/5</Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>

        <View style={styles.card}>
          <ThemedText type="subtitle" style={styles.cardTitle}>Profile Completion</ThemedText>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${completionPercentage}%` }]} />
          </View>
          <ThemedText style={styles.progressText}>{completionPercentage}% Complete</ThemedText>
        </View>

        {studentData?.recommendations && studentData.recommendations.length > 0 && (
          <View style={styles.card}>
            <ThemedText type="subtitle" style={styles.cardTitle}>Recent Recommendations</ThemedText>
            {studentData.recommendations.slice(0, 3).map((rec: any, index: number) => (
              <View key={index} style={styles.recommendationItem}>
                <ThemedText style={styles.university}>{rec.university}</ThemedText>
                <ThemedText style={styles.matchScore}>Match: {rec.matchScore}%</ThemedText>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    color: '#010066',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 30,
    opacity: 0.7,
    color: '#010066',
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#2563EB',
  },
  cardTitle: {
    marginBottom: 16,
    fontWeight: '600',
    color: '#010066',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: {
    fontWeight: '600',
    color: '#010066',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#2563EB',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#F7931E',
    borderRadius: 4,
  },
  progressText: {
    textAlign: 'center',
    fontWeight: '600',
    color: '#010066',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#010066',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#F7931E',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryText: {
    fontSize: 16,
    color: '#2563EB',
    textAlign: 'center',
    fontWeight: '600',
  },
  recommendationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 8,
  },
  university: {
    fontSize: 14,
    fontWeight: '600',
    color: '#010066',
  },
  matchScore: {
    fontSize: 12,
    color: '#F7931E',
    fontWeight: '600',
  },
  retryButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 20,
  },
  helpSection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  helpText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#010066',
    marginBottom: 10,
  },
  helpItem: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 5,
    marginLeft: 10,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 30,
    position: 'relative',
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarText: {
    fontSize: 32,
    color: '#FFFFFF',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  value: {
    fontSize: 14,
    color: '#010066',
    fontWeight: '500',
  },
  streamBadge: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  streamText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestBadge: {
    backgroundColor: '#F7931E',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  interestText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '500',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#010066',
  },
  scoreBadge: {
    backgroundColor: '#10B981',
    color: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 8,
  },
  personalityGrid: {
    gap: 15,
  },
  personalityItem: {
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 10,
  },
  personalityLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 8,
    fontWeight: '500',
  },
  traitBar: {
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    flex: 1,
    overflow: 'hidden',
  },
  traitFill: {
    height: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 4,
  },
  traitValue: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
    position: 'absolute',
    left: 10,
    top: 0,
  },
});

export default Profile;
