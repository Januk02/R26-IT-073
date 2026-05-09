import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

// Degree programs data
const DEGREE_PROGRAMS = [
  'Computer Science',
  'Engineering',
  'Medicine',
  'Business Administration',
  'Agriculture',
  'Arts & Humanities',
  'Science',
  'Law',
  'Architecture',
  'Information Technology',
  'Psychology',
  'Hospitality Management',
  'Education',
  'Social Sciences',
  'Environmental Science'
];

// Sri Lankan AL Stream combinations
const AL_STREAMS = [
  'Mathematics',
  'Biology',
  'Commerce',
  'Arts',
  'Technology',
  'General'
];

export default function Member1RecommendationScreen() {
  const [studentData, setStudentData] = useState({
    name: '',
    email: '',
    phone: '',
    school: '',
    alStream: '',
    alResults: {
      maths: '',
      physics: '',
      chemistry: '',
      biology: '',
      commerce: '',
      economics: '',
      accounting: ''
    },
    zScore: '',
    preferredDegree: '',
    preferredLocation: '',
    budgetRange: '',
    interests: [] as string[],
    englishProficiency: '',
    extracurricular: '',
    careerGoals: '',
    additionalNotes: ''
  });

  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setStudentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleALResultChange = (subject: string, value: string) => {
    setStudentData(prev => ({
      ...prev,
      alResults: {
        ...prev.alResults,
        [subject]: value
      }
    }));
  };

  const toggleInterest = (interest: string) => {
    setStudentData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const generateRecommendations = async () => {
    // Validation
    if (!studentData.name || !studentData.alStream || !studentData.zScore) {
      Alert.alert('Error', 'Please fill in all required fields (Name, AL Stream, Z-Score)');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call to recommendation engine
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate mock recommendations based on student data
      const mockRecommendations = generateMockRecommendations(studentData);
      setRecommendations(mockRecommendations);
      setShowRecommendations(true);
      
    } catch (error) {
      Alert.alert('Error', 'Failed to generate recommendations');
    } finally {
      setLoading(false);
    }
  };

  const generateMockRecommendations = (data: any) => {
    const recommendations = [];
    
    // Government University Recommendations
    if (data.alStream === 'Mathematics' && parseFloat(data.zScore) >= 2.5) {
      recommendations.push({
        type: 'Government',
        universities: [
          {
            name: 'University of Colombo',
            programs: ['Computer Science', 'Statistics', 'Mathematics'],
            matchScore: 95,
            requirements: 'Z-Score: 2.5+ for Physical Science',
            deadline: '2024-12-15'
          },
          {
            name: 'University of Moratuwa',
            programs: ['Computer Engineering', 'Information Technology'],
            matchScore: 92,
            requirements: 'Z-Score: 2.8+ for Engineering',
            deadline: '2024-12-20'
          }
        ]
      });
    }

    if (data.alStream === 'Biology' && parseFloat(data.zScore) >= 2.8) {
      recommendations.push({
        type: 'Government',
        universities: [
          {
            name: 'University of Colombo',
            programs: ['Medicine', 'Nursing', 'Medical Laboratory Science'],
            matchScore: 98,
            requirements: 'Z-Score: 2.8+ for Biological Science',
            deadline: '2024-12-10'
          },
          {
            name: 'University of Peradeniya',
            programs: ['Veterinary Medicine', 'Agriculture', 'Food Science'],
            matchScore: 90,
            requirements: 'Z-Score: 2.5+ for Biological Science',
            deadline: '2024-12-18'
          }
        ]
      });
    }

    // Private University Recommendations
    recommendations.push({
      type: 'Private',
      universities: [
        {
          name: 'SLIIT',
          programs: ['Computer Science', 'Business Management', 'Engineering'],
          matchScore: 88,
          requirements: '3 A/L passes + English',
          deadline: 'Rolling Admissions',
          fees: 'LKR 500,000 - 800,000 per year'
        },
        {
          name: 'NSBM Green University',
          programs: ['Business Administration', 'Computing', 'Management'],
          matchScore: 85,
          requirements: '3 A/L passes',
          deadline: 'Rolling Admissions',
          fees: 'LKR 400,000 - 600,000 per year'
        },
        {
          name: 'American College',
          programs: ['Business Administration', 'Computer Science', 'Psychology'],
          matchScore: 82,
          requirements: '2 A/L passes + English',
          deadline: 'Rolling Admissions',
          fees: 'LKR 350,000 - 500,000 per year'
        }
      ]
    });

    return recommendations.sort((a, b) => {
      const avgScoreA = a.universities.reduce((sum: number, uni: any) => sum + uni.matchScore, 0) / a.universities.length;
      const avgScoreB = b.universities.reduce((sum: number, uni: any) => sum + uni.matchScore, 0) / b.universities.length;
      return avgScoreB - avgScoreA;
    });
  };

  const resetForm = () => {
    setStudentData({
      name: '',
      email: '',
      phone: '',
      school: '',
      alStream: '',
      alResults: {
        maths: '',
        physics: '',
        chemistry: '',
        biology: '',
        commerce: '',
        economics: '',
        accounting: ''
      },
      zScore: '',
      preferredDegree: '',
      preferredLocation: '',
      budgetRange: '',
      interests: [] as string[],
      englishProficiency: '',
      extracurricular: '',
      careerGoals: '',
      additionalNotes: ''
    });
    setShowRecommendations(false);
    setRecommendations([]);
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <ThemedView style={styles.header}>
          <ThemedText style={styles.title}>🎓 University Recommendations</ThemedText>
          <ThemedText style={styles.subtitle}>Get personalized university & program recommendations</ThemedText>
        </ThemedView>

        {!showRecommendations ? (
          <>
            {/* Personal Information */}
            <ThemedView style={styles.section}>
              <ThemedText style={styles.sectionTitle}>👤 Personal Information</ThemedText>
              <TextInput
                style={styles.input}
                value={studentData.name}
                onChangeText={(value) => handleInputChange('name', value)}
                placeholder="Full Name *"
                placeholderTextColor="#64748b"
              />
              <TextInput
                style={styles.input}
                value={studentData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                placeholder="Email Address"
                placeholderTextColor="#64748b"
                keyboardType="email-address"
              />
              <TextInput
                style={styles.input}
                value={studentData.phone}
                onChangeText={(value) => handleInputChange('phone', value)}
                placeholder="Phone Number"
                placeholderTextColor="#64748b"
                keyboardType="phone-pad"
              />
              <TextInput
                style={styles.input}
                value={studentData.school}
                onChangeText={(value) => handleInputChange('school', value)}
                placeholder="School Name"
                placeholderTextColor="#64748b"
              />
            </ThemedView>

            {/* Academic Information */}
            <ThemedView style={styles.section}>
              <ThemedText style={styles.sectionTitle}>📚 Academic Information</ThemedText>
              
              <View style={styles.pickerContainer}>
                <ThemedText style={styles.label}>AL Stream *</ThemedText>
                <TextInput
                  style={styles.input}
                  value={studentData.alStream}
                  onChangeText={(value: string) => handleInputChange('alStream', value)}
                  placeholder="Select AL Stream (Mathematics, Biology, Commerce, Arts, Technology, General)"
                  placeholderTextColor="#64748b"
                />
              </View>

              <TextInput
                style={styles.input}
                value={studentData.zScore}
                onChangeText={(value) => handleInputChange('zScore', value)}
                placeholder="Z-Score *"
                placeholderTextColor="#64748b"
                keyboardType="numeric"
              />

              {/* AL Results based on stream */}
              {(studentData.alStream === 'Mathematics' || studentData.alStream === 'Biology') && (
                <View style={styles.alResultsContainer}>
                  <ThemedText style={styles.label}>AL Subject Results</ThemedText>
                  <TextInput
                    style={styles.smallInput}
                    value={studentData.alResults.maths}
                    onChangeText={(value) => handleALResultChange('maths', value)}
                    placeholder="Mathematics"
                    placeholderTextColor="#64748b"
                  />
                  <TextInput
                    style={styles.smallInput}
                    value={studentData.alResults.physics}
                    onChangeText={(value) => handleALResultChange('physics', value)}
                    placeholder="Physics"
                    placeholderTextColor="#64748b"
                  />
                  <TextInput
                    style={styles.smallInput}
                    value={studentData.alResults.chemistry}
                    onChangeText={(value) => handleALResultChange('chemistry', value)}
                    placeholder="Chemistry"
                    placeholderTextColor="#64748b"
                  />
                  {studentData.alStream === 'Biology' && (
                    <TextInput
                      style={styles.smallInput}
                      value={studentData.alResults.biology}
                      onChangeText={(value) => handleALResultChange('biology', value)}
                      placeholder="Biology"
                      placeholderTextColor="#64748b"
                    />
                  )}
                </View>
              )}

              {studentData.alStream === 'Commerce' && (
                <View style={styles.alResultsContainer}>
                  <ThemedText style={styles.label}>AL Subject Results</ThemedText>
                  <TextInput
                    style={styles.smallInput}
                    value={studentData.alResults.commerce}
                    onChangeText={(value) => handleALResultChange('commerce', value)}
                    placeholder="Commerce"
                    placeholderTextColor="#64748b"
                  />
                  <TextInput
                    style={styles.smallInput}
                    value={studentData.alResults.economics}
                    onChangeText={(value) => handleALResultChange('economics', value)}
                    placeholder="Economics"
                    placeholderTextColor="#64748b"
                  />
                  <TextInput
                    style={styles.smallInput}
                    value={studentData.alResults.accounting}
                    onChangeText={(value) => handleALResultChange('accounting', value)}
                    placeholder="Accounting"
                    placeholderTextColor="#64748b"
                  />
                </View>
              )}

              <View style={styles.pickerContainer}>
                <ThemedText style={styles.label}>Preferred Degree Program</ThemedText>
                <TextInput
                  style={styles.input}
                  value={studentData.preferredDegree}
                  onChangeText={(value: string) => handleInputChange('preferredDegree', value)}
                  placeholder="Select Preferred Program (Computer Science, Engineering, Medicine, etc.)"
                  placeholderTextColor="#64748b"
                />
              </View>
            </ThemedView>

            {/* Preferences */}
            <ThemedView style={styles.section}>
              <ThemedText style={styles.sectionTitle}>⚙️ Preferences</ThemedText>
              
              <TextInput
                style={styles.input}
                value={studentData.preferredLocation}
                onChangeText={(value) => handleInputChange('preferredLocation', value)}
                placeholder="Preferred Location (e.g., Colombo, Kandy)"
                placeholderTextColor="#64748b"
              />

              <TextInput
                style={styles.input}
                value={studentData.budgetRange}
                onChangeText={(value) => handleInputChange('budgetRange', value)}
                placeholder="Annual Budget Range (LKR)"
                placeholderTextColor="#64748b"
              />

              <View style={styles.pickerContainer}>
                <ThemedText style={styles.label}>English Proficiency</ThemedText>
                <TextInput
                  style={styles.input}
                  value={studentData.englishProficiency}
                  onChangeText={(value: string) => handleInputChange('englishProficiency', value)}
                  placeholder="Select Proficiency (Beginner, Intermediate, Advanced, Native)"
                  placeholderTextColor="#64748b"
                />
              </View>
            </ThemedView>

            {/* Additional Information */}
            <ThemedView style={styles.section}>
              <ThemedText style={styles.sectionTitle}>📝 Additional Information</ThemedText>
              
              <ThemedText style={styles.label}>Areas of Interest</ThemedText>
              <View style={styles.interestsContainer}>
                {DEGREE_PROGRAMS.slice(0, 8).map(interest => (
                  <TouchableOpacity
                    key={interest}
                    style={[
                      styles.interestChip,
                      studentData.interests.includes(interest) && styles.selectedInterest
                    ]}
                    onPress={() => toggleInterest(interest)}
                  >
                    <ThemedText style={[
                      styles.interestText,
                      studentData.interests.includes(interest) && styles.selectedInterestText
                    ]}>
                      {interest}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                style={[styles.input, styles.textArea]}
                value={studentData.extracurricular}
                onChangeText={(value) => handleInputChange('extracurricular', value)}
                placeholder="Extracurricular Activities & Achievements"
                placeholderTextColor="#64748b"
                multiline
                numberOfLines={3}
              />

              <TextInput
                style={[styles.input, styles.textArea]}
                value={studentData.careerGoals}
                onChangeText={(value) => handleInputChange('careerGoals', value)}
                placeholder="Career Goals & Aspirations"
                placeholderTextColor="#64748b"
                multiline
                numberOfLines={3}
              />

              <TextInput
                style={[styles.input, styles.textArea]}
                value={studentData.additionalNotes}
                onChangeText={(value) => handleInputChange('additionalNotes', value)}
                placeholder="Additional Notes or Requirements"
                placeholderTextColor="#64748b"
                multiline
                numberOfLines={3}
              />
            </ThemedView>

            {/* Action Buttons */}
            <ThemedView style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.resetButton]}
                onPress={resetForm}
              >
                <ThemedText style={styles.resetButtonText}>Reset Form</ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, loading && styles.disabledButton]}
                onPress={generateRecommendations}
                disabled={loading}
              >
                <ThemedText style={styles.buttonText}>
                  {loading ? 'Generating...' : 'Get Recommendations'}
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </>
        ) : (
          /* Recommendations Display */
          <ThemedView style={styles.section}>
            <ThemedText style={styles.sectionTitle}>🎯 Your University Recommendations</ThemedText>
            
            {recommendations.map((category, index) => (
              <ThemedView key={index} style={styles.recommendationCategory}>
                <ThemedText style={styles.categoryTitle}>
                  {category.type === 'Government' ? '🏛️ Government Universities' : '🏫 Private Universities'}
                </ThemedText>
                
                {category.universities.map((uni: any, uniIndex: number) => (
                  <ThemedView key={uniIndex} style={styles.universityRecommendation}>
                    <ThemedView style={styles.uniHeader}>
                      <ThemedText style={styles.uniName}>{uni.name}</ThemedText>
                      <ThemedText style={styles.matchScore}>{uni.matchScore}% Match</ThemedText>
                    </ThemedView>
                    
                    <ThemedText style={styles.programs}>
                      <ThemedText style={styles.label}>Recommended Programs:</ThemedText>
                      {uni.programs.join(', ')}
                    </ThemedText>
                    
                    <ThemedText style={styles.requirements}>
                      <ThemedText style={styles.label}>Requirements:</ThemedText>
                      {uni.requirements}
                    </ThemedText>
                    
                    {uni.fees && (
                      <ThemedText style={styles.fees}>
                        <ThemedText style={styles.label}>Annual Fees:</ThemedText>
                        {uni.fees}
                      </ThemedText>
                    )}
                    
                    <ThemedText style={styles.deadline}>
                      <ThemedText style={styles.label}>Application Deadline:</ThemedText>
                      {uni.deadline}
                    </ThemedText>
                  </ThemedView>
                ))}
              </ThemedView>
            ))}
            
            <TouchableOpacity
              style={styles.newSearchButton}
              onPress={resetForm}
            >
              <ThemedText style={styles.newSearchButtonText}>🔄 New Search</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        )}
      </ScrollView>
    </ThemedView>
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
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  section: {
    padding: 20,
    backgroundColor: '#ffffff',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9fafb',
    marginBottom: 12,
  },
  smallInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9fafb',
    marginBottom: 8,
    flex: 1,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  pickerContainer: {
    marginBottom: 12,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#f9fafb',
  },
  alResultsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  interestChip: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedInterest: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  interestText: {
    fontSize: 12,
    color: '#64748b',
  },
  selectedInterestText: {
    color: '#ffffff',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 8,
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  resetButton: {
    backgroundColor: '#ef4444',
  },
  resetButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  recommendationCategory: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  universityRecommendation: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  uniHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  uniName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
  },
  matchScore: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059669',
    backgroundColor: '#ecfdf5',
    padding: 4,
    borderRadius: 4,
  },
  programs: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
  },
  requirements: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
  },
  fees: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
  },
  deadline: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
  },
  newSearchButton: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  newSearchButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
