import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { doc, setDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import { useRouter } from 'expo-router';
import apiService from '@/services/apiService';

// Sri Lankan Universities with Z-score cutoffs
const SRI_LANKAN_UNIVERSITIES = [
  {
    name: 'University of Colombo',
    zScoreCutoff: {
      medicine: 3.85,
      engineering: 3.70,
      biologicalScience: 3.65,
      physicalScience: 3.60,
      commerce: 3.55,
      arts: 3.50
    },
    faculties: ['Medicine', 'Engineering', 'Science', 'Commerce', 'Arts']
  },
  {
    name: 'University of Peradeniya',
    zScoreCutoff: {
      medicine: 3.80,
      engineering: 3.65,
      biologicalScience: 3.60,
      physicalScience: 3.55,
      commerce: 3.50,
      arts: 3.45
    },
    faculties: ['Medicine', 'Engineering', 'Agriculture', 'Science']
  },
  {
    name: 'University of Kelaniya',
    zScoreCutoff: {
      medicine: 3.75,
      engineering: 3.60,
      biologicalScience: 3.55,
      physicalScience: 3.50,
      commerce: 3.45,
      arts: 3.40
    },
    faculties: ['Medicine', 'Engineering', 'Science', 'Commerce', 'Management']
  },
  {
    name: 'University of Sri Jayewardenepura',
    zScoreCutoff: {
      medicine: 3.70,
      engineering: 3.55,
      biologicalScience: 3.50,
      physicalScience: 3.45,
      commerce: 3.40,
      arts: 3.35
    },
    faculties: ['Medicine', 'Engineering', 'Agriculture', 'Technology']
  },
  {
    name: 'University of Moratuwa',
    zScoreCutoff: {
      medicine: 3.65,
      engineering: 3.50,
      biologicalScience: 3.45,
      physicalScience: 3.40,
      commerce: 3.35,
      arts: 3.30
    },
    faculties: ['Engineering', 'Technology', 'Business Studies']
  }
];

// Degree programs with career pathways
const DEGREE_PROGRAMS = [
  {
    name: 'Computer Science',
    duration: '4 Years',
    careerPaths: ['Software Engineer', 'Data Scientist', 'AI Specialist', 'IT Manager', 'Cybersecurity Expert'],
    requiredSubjects: ['Combined Mathematics', 'Physics'],
    alternativePath: 'Technology Stream'
  },
  {
    name: 'Medicine',
    duration: '5 Years',
    careerPaths: ['Doctor', 'Surgeon', 'Medical Researcher', 'Public Health Specialist'],
    requiredSubjects: ['Biology', 'Chemistry', 'Physics'],
    alternativePath: 'Biology Stream'
  },
  {
    name: 'Engineering',
    duration: '4 Years',
    careerPaths: ['Civil Engineer', 'Mechanical Engineer', 'Electrical Engineer', 'Software Engineer'],
    requiredSubjects: ['Combined Mathematics', 'Physics'],
    alternativePath: 'Mathematics Stream'
  },
  {
    name: 'Business Administration',
    duration: '4 Years',
    careerPaths: ['Business Manager', 'Marketing Manager', 'Financial Analyst', 'Entrepreneur'],
    requiredSubjects: ['Combined Mathematics', 'Economics'],
    alternativePath: 'Commerce Stream'
  },
  {
    name: 'Biological Science',
    duration: '4 Years',
    careerPaths: ['Research Scientist', 'Lab Technician', 'Environmental Scientist', 'Biotechnologist'],
    requiredSubjects: ['Biology', 'Chemistry'],
    alternativePath: 'Biology Stream'
  }
];

// Personality traits descriptions
const PERSONALITY_DESCRIPTIONS = {
  leadership: {
    1: 'Prefers to follow instructions',
    2: 'Comfortable leading small groups',
    3: 'Natural leader, motivates others',
    4: 'Exceptional leader, inspires teams',
    5: 'Visionary leader, strategic thinker'
  },
  creativity: {
    1: 'Prefers structured tasks',
    2: 'Enjoys creative challenges',
    3: 'Innovative thinker, problem solver',
    4: 'Highly creative, original ideas',
    5: 'Exceptional creativity, breakthrough thinking'
  },
  analyticalThinking: {
    1: 'Focuses on practical aspects',
    2: 'Balanced practical and theoretical',
    3: 'Strong analytical skills, data-driven',
    4: 'Advanced analytical capabilities',
    5: 'Exceptional analytical mind, research-oriented'
  },
  riskTaking: {
    1: 'Risk-averse, prefers stability',
    2: 'Calculated risk-taker',
    3: 'Moderate risk tolerance',
    4: 'Bold risk-taker, innovator',
    5: 'High risk tolerance, strategic risk-taker'
  },
  entrepreneurialMindset: {
    1: 'Prefers employment',
    2: 'Interested in side projects',
    3: 'Natural entrepreneur, business-minded',
    4: 'Active entrepreneur, multiple ventures',
    5: 'Serial entrepreneur, business builder'
  }
};

export default function Member1RecommendationScreen() {
  const [studentData, setStudentData] = useState({
    name: '',
    alResults: {
      // Physical Science Stream
      combinedMathematics: '',
      physics: '',
      chemistry: '',
      informationCommunicationTechnology: '',
      
      // Biological Science Stream
      biology: '',
      agriculturalScience: '',
      
      // Commerce Stream
      accounting: '',
      businessStudies: '',
      economics: '',
      businessStatistics: '',
      
      // Arts Stream
      sinhala: '',
      tamil: '',
      english: '',
      history: '',
      politicalScience: '',
      geography: '',
      logic: '',
      buddhistCivilization: '',
      hinduCivilization: '',
      christianCivilization: '',
      media: '',
      drama: '',
      
      // Technology Stream
      scienceForTechnology: '',
      engineeringTechnology: '',
      bioSystemsTechnology: '',
      informationTechnology: '',
      
      // Vocational Stream
      childPsychologyAndCare: '',
      healthAndSocialCare: '',
      physicalEducation: '',
      performingArts: '',
      graphicDesign: '',
      tourismAndHospitality: '',
      
      // Common Subjects
      generalEnglish: '',
      generalTest: '',
      commonGeneralTest: '',
      stream: ''
    },
    zScore: '',
    interests: [] as string[],
    personalityTraits: {
      leadership: 3,
      creativity: 3,
      analyticalThinking: 3,
      riskTaking: 3,
      entrepreneurialMindset: 3
    },
    locationPreference: '',
    travelTolerance: '',
    workEnvironment: '',
    stressTolerance: 3,
    socialInteraction: ''
  });

  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string>('');

  // Handle student data passed from future-dream-advisor
  const router = useRouter();
  useEffect(() => {
    if (router.params?.studentData) {
      setStudentData(router.params.studentData);
    }
  }, [router.params?.studentData]);
  const [showStreamDropdown, setShowStreamDropdown] = useState(false);

  const openGoogleMaps = (universityName: string, location: string) => {
    const coords = UNIVERSITY_COORDINATES[universityName as keyof typeof UNIVERSITY_COORDINATES];
    if (coords) {
      const url = `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`;
      Linking.openURL(url).catch(err => console.error('Error opening maps:', err));
    } else {
      // Fallback to search by name and location
      const query = encodeURIComponent(`${universityName} ${location}`);
      const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
      Linking.openURL(url).catch(err => console.error('Error opening maps:', err));
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setStudentData((prev: any) => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        return {
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value
          }
        };
      }
      return {
        ...prev,
        [field]: value
      };
    });
  };

  const handleALResultChange = (subject: string, value: string) => {
    // Validate AL result - only allow A, B, C, S, F (case insensitive)
    const validGrades = ['A', 'B', 'C', 'S', 'F'];
    const upperValue = value.toUpperCase();
    
    // Only allow valid grade letters
    if (value === '' || validGrades.includes(upperValue)) {
      setStudentData((prev: any) => ({
        ...prev,
        alResults: {
          ...prev.alResults,
          [subject]: upperValue
        }
      }));
      // Clear validation error if input is valid
      setValidationError('');
    } else {
      // Show validation error for invalid input
      setValidationError('Invalid Grade');
      // Clear the error after 3 seconds
      setTimeout(() => setValidationError(''), 3000);
    }
  };

  const toggleInterest = (interest: string) => {
    setStudentData((prev: any) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i: string) => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  // Get relevant subjects based on selected stream
  const getStreamSubjects = () => {
    const stream = studentData.alResults.stream;
    
    switch(stream) {
      case 'Physical Science':
        return [
          { key: 'combinedMathematics', label: 'Combined Mathematics', required: true, basket: 'Main' },
          { key: 'physics', label: 'Physics', required: true, basket: 'Main' },
          { key: 'chemistry', label: 'Chemistry', required: false, basket: 'Main' },
          { key: 'informationCommunicationTechnology', label: 'Information & Communication Technology (ICT)', required: false, basket: 'Alternative' },
          { key: 'generalEnglish', label: 'General English', required: false, basket: 'Common' },
          { key: 'generalTest', label: 'General Test', required: false, basket: 'Common' }
        ];
      case 'Biological Science':
        return [
          { key: 'biology', label: 'Biology', required: true, basket: 'Main' },
          { key: 'chemistry', label: 'Chemistry', required: true, basket: 'Main' },
          { key: 'physics', label: 'Physics', required: false, basket: 'Main' },
          { key: 'agriculturalScience', label: 'Agricultural Science', required: false, basket: 'Alternative' },
          { key: 'generalEnglish', label: 'General English', required: false, basket: 'Common' },
          { key: 'generalTest', label: 'General Test', required: false, basket: 'Common' }
        ];
      case 'Commerce':
        return [
          { key: 'accounting', label: 'Accounting', required: true, basket: 'Main' },
          { key: 'businessStudies', label: 'Business Studies', required: true, basket: 'Main' },
          { key: 'economics', label: 'Economics', required: true, basket: 'Main' },
          { key: 'informationCommunicationTechnology', label: 'Information & Communication Technology (ICT)', required: false, basket: 'Optional' },
          { key: 'businessStatistics', label: 'Business Statistics', required: false, basket: 'Optional' },
          { key: 'generalEnglish', label: 'General English', required: false, basket: 'Common' },
          { key: 'generalTest', label: 'General Test', required: false, basket: 'Common' }
        ];
      case 'Arts':
        return [
          { key: 'sinhala', label: 'Sinhala', required: false, basket: 'Main' },
          { key: 'tamil', label: 'Tamil', required: false, basket: 'Main' },
          { key: 'english', label: 'English', required: false, basket: 'Main' },
          { key: 'history', label: 'History', required: false, basket: 'Main' },
          { key: 'politicalScience', label: 'Political Science', required: false, basket: 'Main' },
          { key: 'geography', label: 'Geography', required: false, basket: 'Main' },
          { key: 'logic', label: 'Logic', required: false, basket: 'Main' },
          { key: 'buddhistCivilization', label: 'Buddhist Civilization', required: false, basket: 'Main' },
          { key: 'hinduCivilization', label: 'Hindu Civilization', required: false, basket: 'Main' },
          { key: 'christianCivilization', label: 'Christian Civilization', required: false, basket: 'Main' },
          { key: 'economics', label: 'Economics', required: false, basket: 'Main' },
          { key: 'media', label: 'Media', required: false, basket: 'Main' },
          { key: 'drama', label: 'Drama', required: false, basket: 'Main' },
          { key: 'informationCommunicationTechnology', label: 'Information & Communication Technology (ICT)', required: false, basket: 'Main' },
          { key: 'generalEnglish', label: 'General English', required: false, basket: 'Common' },
          { key: 'generalTest', label: 'General Test', required: false, basket: 'Common' }
        ];
      case 'Technology':
        return [
          { key: 'scienceForTechnology', label: 'Science for Technology', required: true, basket: 'Mandatory' },
          { key: 'engineeringTechnology', label: 'Engineering Technology', required: false, basket: 'Optional' },
          { key: 'bioSystemsTechnology', label: 'Bio Systems Technology', required: false, basket: 'Optional' },
          { key: 'informationTechnology', label: 'Information Technology', required: false, basket: 'Optional' },
          { key: 'agriculturalScience', label: 'Agricultural Science', required: false, basket: 'Optional' },
          { key: 'generalEnglish', label: 'General English', required: false, basket: 'Common' },
          { key: 'generalTest', label: 'General Test', required: false, basket: 'Common' }
        ];
      case 'Vocational':
        return [
          { key: 'childPsychologyAndCare', label: 'Child Psychology & Care', required: false, basket: 'Main' },
          { key: 'healthAndSocialCare', label: 'Health & Social Care', required: false, basket: 'Main' },
          { key: 'physicalEducation', label: 'Physical Education', required: false, basket: 'Main' },
          { key: 'performingArts', label: 'Performing Arts', required: false, basket: 'Main' },
          { key: 'graphicDesign', label: 'Graphic Design', required: false, basket: 'Main' },
          { key: 'tourismAndHospitality', label: 'Tourism & Hospitality', required: false, basket: 'Main' },
          { key: 'generalEnglish', label: 'General English', required: false, basket: 'Common' },
          { key: 'generalTest', label: 'General Test', required: false, basket: 'Common' }
        ];
      case 'General':
        return [
          { key: 'generalEnglish', label: 'General English', required: false, basket: 'Common' },
          { key: 'commonGeneralTest', label: 'Common General Test', required: false, basket: 'Common' },
          { key: 'generalTest', label: 'General Test', required: false, basket: 'Common' }
        ];
      default:
        return [
          { key: 'generalEnglish', label: 'General English', required: false, basket: 'Common' }
        ];
    }
  };

  // University coordinates for Google Maps
const UNIVERSITY_COORDINATES = {
  "University of Colombo": { lat: 6.9271, lng: 79.8612 },
  "University of Peradeniya": { lat: 7.2906, lng: 80.6337 },
  "University of Moratuwa": { lat: 6.7959, lng: 79.9008 },
  "University of Sri Jayewardenepura": { lat: 6.8919, lng: 79.8649 },
  "SLIIT": { lat: 6.8422, lng: 80.0921 },
  "NSBM": { lat: 6.8422, lng: 80.0921 }
};

const generateRecommendations = async () => {
    // Validation
    if (!studentData.name || !studentData.alResults.stream || !studentData.zScore) {
      Alert.alert('Error', 'Please fill in all required fields (Name, AL Stream, Z-Score)');
      return;
    }

    setLoading(true);
    
    try {
      // Test backend connection first
      const isConnected = await apiService.testConnection();
      if (!isConnected) {
        Alert.alert('Connection Error', 'Unable to connect to the AI recommendation server. Please check your backend server.');
        setLoading(false);
        return;
      }

      // Format student data for API
      const formattedData = apiService.formatStudentData(studentData);
      
      // Get AI-powered recommendations from backend
      const aiResponse = await apiService.getRecommendations(formattedData);
      
      // Convert AI response to app format
      const aiRecommendations = aiResponse.recommendations || [];
      const universityRecommendations = aiResponse.university_recommendations || {};
      
      if (aiRecommendations && aiRecommendations.length > 0) {
        const formattedRecommendations = aiRecommendations.map((rec: any, index: number) => {
          // Get actual university recommendations for this degree
          const degreeUnis = universityRecommendations || { government: [], private: [] };
          const topGovUni = degreeUnis.government && degreeUnis.government[0]; // Best government university
          const topPrivateUni = degreeUnis.private && degreeUnis.private[0]; // Best private university
          const bestUniversity = topGovUni || topPrivateUni;
          
          return {
            university: rec.university || (bestUniversity ? bestUniversity.name : `University ${index + 1}`),
            universityLocation: rec.universityLocation || (bestUniversity ? bestUniversity.location : 'Location not available'),
            universityType: rec.universityType || (topGovUni ? 'Government' : 'Private'),
            admissionProbability: rec.admissionProbability || (bestUniversity ? `${Math.round(bestUniversity.admission_probability * 100)}%` : 'Unknown'),
            matchScore: Math.round((rec.probability || 0) * 100),
            distance_km: rec.distance_km || (bestUniversity ? bestUniversity.distance_km : null),
          recommendedDegrees: [{
            name: rec.degree || 'Unknown',
            duration: '4 years',
            careerPaths: rec.roadmap ? rec.roadmap.slice(0, 2) : ['Software Engineer', 'Data Scientist']
          }],
          careerOutlook: {
            leadershipPotential: rec.personality_match?.leadership ? 'Strong' : 'Developing',
            creativityScore: rec.personality_match?.creativity ? 'High' : 'Moderate',
            recommendedCareers: rec.roadmap ? rec.roadmap.slice(0, 3) : ['Software Engineer', 'Data Scientist'],
            skillDevelopment: 'Focus on communication and analytical skills'
          },
          studyPlan: {
            recommendedApproach: rec.skill_match?.analytical > 0.7 ? 'Research-Oriented' : 'Balanced Theory and Practice',
            riskTolerance: rec.personality_match?.risk_taking > 0.7 ? 'High-Risk' : 'Low-Risk',
            timeManagement: rec.personality_match?.leadership > 0.6 ? 'Group Study' : 'Individual Study',
            additionalCourses: rec.degree === 'IT' ? 'Advanced Mathematics' : 'English Communication'
          },
          financialAid: (rec.probability || 0) > 0.7 ? 'Available' : 'Limited',
          locationMatch: rec.lifestyle_compatibility?.location_match > 0.7 ? 'Good' : 'Neutral',
          aiExplanation: rec.explanation || 'AI recommendation generated successfully',
          skillMatch: rec.skill_match || {},
          personalityMatch: rec.personality_match || {},
          type: rec.type || 'ai_model'
          };
        });
        
        setRecommendations(formattedRecommendations);
        setShowRecommendations(true);
        setLoading(false);
        
        // Save data to Firestore (async operation)
        saveStudentDataToFirestore(studentData, formattedRecommendations)
          .then(saveSuccess => {
            if (saveSuccess) {
              Alert.alert('Success', 'AI recommendations generated and data saved successfully!');
            } else {
              Alert.alert('Warning', 'AI recommendations generated, but data could not be saved to database.');
            }
          })
          .catch(error => {
            console.error('Error saving data:', error);
            Alert.alert('Error', 'Failed to save data to database.');
          })
          .finally(() => {
            setLoading(false);
          });
      } else {
        Alert.alert('Error', 'No recommendations received from server.');
        setLoading(false);
      }
      
    } catch (error) {
      console.error('AI Recommendation Error:', error);
      Alert.alert('Error', 'Failed to generate AI recommendations. Please try again.');
      setLoading(false);
    }
  };

  const calculateMatchScore = (studentZScore: number, uniCutoffs: any, stream: string) => {
    let score = 0;
    
    if (stream === 'Mathematics') {
      score = Math.min((studentZScore / uniCutoffs.engineering) * 100, 100);
    } else if (stream === 'Biology') {
      score = Math.min((studentZScore / uniCutoffs.biologicalScience) * 100, 100);
    } else if (stream === 'Commerce') {
      score = Math.min((studentZScore / uniCutoffs.commerce) * 100, 100);
    } else if (stream === 'Arts') {
      score = Math.min((studentZScore / uniCutoffs.arts) * 100, 100);
    } else {
      score = Math.min((studentZScore / 2.5) * 100, 100);
    }
    
    return Math.round(score);
  };

  const calculateAdmissionProbability = (studentZScore: number, uniCutoffs: any, stream: string) => {
    if (stream === 'Mathematics') {
      return studentZScore >= uniCutoffs.engineering ? 'High' : studentZScore >= uniCutoffs.engineering - 0.2 ? 'Medium' : 'Low';
    } else if (stream === 'Biology') {
      return studentZScore >= uniCutoffs.biologicalScience ? 'High' : studentZScore >= uniCutoffs.biologicalScience - 0.2 ? 'Medium' : 'Low';
    } else if (stream === 'Commerce') {
      return studentZScore >= uniCutoffs.commerce ? 'High' : studentZScore >= uniCutoffs.commerce - 0.2 ? 'Medium' : 'Low';
    } else if (stream === 'Arts') {
      return studentZScore >= uniCutoffs.arts ? 'High' : studentZScore >= uniCutoffs.arts - 0.2 ? 'Medium' : 'Low';
    } else {
      return studentZScore >= 2.5 ? 'High' : studentZScore >= 2.3 ? 'Medium' : 'Low';
    }
  };

  const generateCareerOutlook = (personalityTraits: any, interests: string[]) => {
    const leadershipLevel = personalityTraits.leadership >= 4 ? 'Strong' : personalityTraits.leadership >= 3 ? 'Moderate' : 'Developing';
    const creativityLevel = personalityTraits.creativity >= 4 ? 'High' : personalityTraits.creativity >= 3 ? 'Moderate' : 'Basic';
    
    return {
      leadershipPotential: leadershipLevel,
      creativityScore: creativityLevel,
      recommendedCareers: interests.length > 0 ? interests.slice(0, 3) : ['Based on personality traits'],
      skillDevelopment: 'Focus on communication and analytical skills'
    };
  };

  const generateStudyPlan = (personalityTraits: any, stream: string) => {
    const riskLevel = personalityTraits.riskTaking >= 4 ? 'High-Risk' : personalityTraits.riskTaking >= 3 ? 'Moderate-Risk' : 'Low-Risk';
    const studyStyle = personalityTraits.analyticalThinking >= 4 ? 'Research-Oriented' : 'Balanced Theory and Practice';
    
    return {
      recommendedApproach: studyStyle,
      riskTolerance: riskLevel,
      timeManagement: personalityTraits.leadership >= 3 ? 'Group Study' : 'Individual Study',
      additionalCourses: stream === 'Mathematics' ? 'Advanced Mathematics' : 'English Communication'
    };
  };

  // Save student data to Firestore
  const saveStudentDataToFirestore = async (studentData: any, recommendations: any[]) => {
    try {
      // Create a unique document ID using timestamp and student name
      const docId = `${studentData.name.replace(/\s+/g, '_')}_${Date.now()}`;
      const studentRef = doc(collection(db, 'students'), docId);
      
      // Prepare the data to be saved
      const dataToSave = {
        ...studentData,
        recommendations: recommendations,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'completed'
      };
      
      // Save to Firestore
      await setDoc(studentRef, dataToSave);
      
      console.log('Student data saved successfully to Firestore');
      return true;
    } catch (error) {
      console.error('Error saving student data to Firestore:', error);
      
      // Check if it's a permission error
      if (error instanceof Error && error.message.includes('Missing or insufficient permissions')) {
        console.log('Firestore permissions need to be updated. Please deploy the firestore.rules file.');
        Alert.alert('Permission Error', 'Database permissions need to be configured. Please contact administrator.');
      }
      
      return false;
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <ThemedText type="title" style={styles.title}>University & Degree Recommendations</ThemedText>
        <ThemedText style={styles.subtitle}>AI-powered recommendations based on your academic profile</ThemedText>
        
        {/* Student Information Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>📋 Student Information</ThemedText>
          
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Full Name *</ThemedText>
            <TextInput
              style={styles.input}
              value={studentData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              placeholder="Enter your full name"
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>AL Stream *</ThemedText>
            <View style={styles.dropdownContainer}>
              <TouchableOpacity
                style={[styles.dropdownButton, studentData.alResults.stream && styles.dropdownButtonSelected]}
                onPress={() => setShowStreamDropdown(!showStreamDropdown)}
              >
                <Text style={styles.dropdownButtonText}>
                  {studentData.alResults.stream || 'Select your AL Stream'}
                </Text>
                <Text style={styles.dropdownArrow}>▼</Text>
              </TouchableOpacity>
              
              {showStreamDropdown && (
                <View style={styles.dropdownMenu}>
                  {[
                    { value: 'Physical Science', label: 'Physical Science Stream', description: 'Combined Mathematics, Physics, Chemistry/ICT - For Engineering, IT, Architecture' },
                    { value: 'Biological Science', label: 'Biological Science Stream', description: 'Biology, Chemistry, Physics/Agricultural Science - For Medical & Biological Fields' },
                    { value: 'Commerce', label: 'Commerce Stream', description: 'Accounting, Business Studies, Economics - For Business & Management' },
                    { value: 'Arts', label: 'Arts Stream', description: 'History, Geography, Political Science, Economics, Languages - Largest Subject Variety' },
                    { value: 'Technology', label: 'Technology Stream', description: 'Science for Technology + Engineering/Bio Systems/IT - Technical & Vocational Pathways' },
                    { value: 'Vocational', label: 'Vocational Stream', description: 'Child Psychology, Health Care, Performing Arts, Tourism - NVQ Connected' },
                    { value: 'General', label: 'General Stream', description: 'General English, Common General Test' }
                  ].map(stream => (
                    <TouchableOpacity
                      key={stream.value}
                      style={[styles.dropdownItem, studentData.alResults.stream === stream.value && styles.dropdownItemSelected]}
                      onPress={() => {
                        handleInputChange('alResults.stream', stream.value);
                        setShowStreamDropdown(false);
                      }}
                    >
                      <View style={styles.dropdownItemContent}>
                        <Text style={styles.dropdownItemLabel}>{stream.label}</Text>
                        <Text style={styles.dropdownItemDescription}>{stream.description}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>AL Results</ThemedText>
            
            {/* Validation Error Message */}
            {validationError ? (
              <View style={styles.validationErrorContainer}>
                <ThemedText style={styles.validationErrorText}>⚠️ {validationError}</ThemedText>
              </View>
            ) : null}
            
            {studentData.alResults.stream ? (
              <View>
                <View style={styles.subjectLegend}>
                  <ThemedText style={styles.legendTitle}>Subject Basket Categories:</ThemedText>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#ff6b6b' }]} />
                    <ThemedText style={styles.legendText}>Main Basket</ThemedText>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#ffa500' }]} />
                    <ThemedText style={styles.legendText}>Alternative Basket</ThemedText>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#4ecdc4' }]} />
                    <ThemedText style={styles.legendText}>Optional Basket</ThemedText>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#9c27b0' }]} />
                    <ThemedText style={styles.legendText}>Mandatory</ThemedText>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#607d8b' }]} />
                    <ThemedText style={styles.legendText}>Common</ThemedText>
                  </View>
                  <View style={styles.gradeInfo}>
                    <ThemedText style={styles.gradeInfoTitle}>Valid Grades:</ThemedText>
                    <ThemedText style={styles.gradeInfoText}>A - Distinction | B - Very Good | C - Good | S - Simple Pass | F - Fail</ThemedText>
                  </View>
                </View>
                <View style={styles.alResultsGrid}>
                  {getStreamSubjects().map((subject, index) => (
                    <View key={subject.key} style={[
                      styles.alResultItem,
                      subject.basket === 'Main' ? styles.mainBasketSubject :
                      subject.basket === 'Alternative' ? styles.alternativeBasketSubject :
                      subject.basket === 'Optional' ? styles.optionalBasketSubject :
                      subject.basket === 'Mandatory' ? styles.mandatorySubject :
                      styles.commonSubject
                    ]}>
                      <View style={styles.subjectHeader}>
                        <ThemedText style={styles.alResultLabel}>{subject.label}</ThemedText>
                        <View style={styles.basketBadges}>
                          <ThemedText style={[
                            styles.basketBadge,
                            subject.basket === 'Main' ? styles.mainBasketBadge :
                            subject.basket === 'Alternative' ? styles.alternativeBasketBadge :
                            subject.basket === 'Optional' ? styles.optionalBasketBadge :
                            subject.basket === 'Mandatory' ? styles.mandatoryBadge :
                            styles.commonBadge
                          ]}>
                            {subject.basket}
                          </ThemedText>
                        </View>
                      </View>
                      <TextInput
                        style={[
                          styles.alResultInput,
                          subject.basket === 'Main' ? styles.mainBasketInput :
                          subject.basket === 'Alternative' ? styles.alternativeBasketInput :
                          subject.basket === 'Optional' ? styles.optionalBasketInput :
                          subject.basket === 'Mandatory' ? styles.mandatoryInput :
                          styles.commonInput
                        ]}
                        value={studentData.alResults[subject.key as keyof typeof studentData.alResults] || ''}
                        onChangeText={(value) => handleALResultChange(subject.key, value)}
                        placeholder={`A, B, C, S, F (${subject.basket})`}
                      />
                    </View>
                  ))}
                </View>
              </View>
            ) : (
              <View style={styles.noStreamSelected}>
                <ThemedText style={styles.noStreamText}>Please select an AL stream first to see relevant subjects</ThemedText>
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Z-Score *</ThemedText>
            <TextInput
              style={styles.input}
              value={studentData.zScore}
              onChangeText={(value) => handleInputChange('zScore', value)}
              placeholder="Enter your predicted Z-Score (e.g., 2.5)"
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Personality Assessment Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>🧠 Personality Assessment</ThemedText>
          
          <View style={styles.personalityGrid}>
            <View style={styles.personalityItem}>
              <ThemedText style={styles.personalityLabel}>Leadership</ThemedText>
              <View style={styles.personalityButtons}>
                {[1, 2, 3, 4, 5].map(level => (
                  <TouchableOpacity
                    key={level}
                    style={[styles.personalityButton, studentData.personalityTraits.leadership === level && styles.personalityButtonSelected]}
                    onPress={() => handleInputChange('personalityTraits.leadership', level.toString())}
                  >
                    <Text style={styles.personalityButtonText}>{level}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.personalityDescription}>{PERSONALITY_DESCRIPTIONS.leadership[studentData.personalityTraits.leadership as keyof typeof PERSONALITY_DESCRIPTIONS.leadership]}</Text>
            </View>

            <View style={styles.personalityItem}>
              <ThemedText style={styles.personalityLabel}>Creativity</ThemedText>
              <View style={styles.personalityButtons}>
                {[1, 2, 3, 4, 5].map(level => (
                  <TouchableOpacity
                    key={level}
                    style={[styles.personalityButton, studentData.personalityTraits.creativity === level && styles.personalityButtonSelected]}
                    onPress={() => handleInputChange('personalityTraits.creativity', level.toString())}
                  >
                    <Text style={styles.personalityButtonText}>{level}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.personalityDescription}>{PERSONALITY_DESCRIPTIONS.creativity[studentData.personalityTraits.creativity as keyof typeof PERSONALITY_DESCRIPTIONS.creativity]}</Text>
            </View>
          </View>

          <View style={styles.personalityGrid}>
            <View style={styles.personalityItem}>
              <ThemedText style={styles.personalityLabel}>Analytical Thinking</ThemedText>
              <View style={styles.personalityButtons}>
                {[1, 2, 3, 4, 5].map(level => (
                  <TouchableOpacity
                    key={level}
                    style={[styles.personalityButton, studentData.personalityTraits.analyticalThinking === level && styles.personalityButtonSelected]}
                    onPress={() => handleInputChange('personalityTraits.analyticalThinking', level.toString())}
                  >
                    <Text style={styles.personalityButtonText}>{level}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.personalityDescription}>{PERSONALITY_DESCRIPTIONS.analyticalThinking[studentData.personalityTraits.analyticalThinking as keyof typeof PERSONALITY_DESCRIPTIONS.analyticalThinking]}</Text>
            </View>

            <View style={styles.personalityItem}>
              <ThemedText style={styles.personalityLabel}>Risk Taking</ThemedText>
              <View style={styles.personalityButtons}>
                {[1, 2, 3, 4, 5].map(level => (
                  <TouchableOpacity
                    key={level}
                    style={[styles.personalityButton, studentData.personalityTraits.riskTaking === level && styles.personalityButtonSelected]}
                    onPress={() => handleInputChange('personalityTraits.riskTaking', level.toString())}
                  >
                    <Text style={styles.personalityButtonText}>{level}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.personalityDescription}>{PERSONALITY_DESCRIPTIONS.riskTaking[studentData.personalityTraits.riskTaking as keyof typeof PERSONALITY_DESCRIPTIONS.riskTaking]}</Text>
            </View>
          </View>

          <View style={styles.personalityGrid}>
            <View style={styles.personalityItem}>
              <ThemedText style={styles.personalityLabel}>Entrepreneurial Mindset</ThemedText>
              <View style={styles.personalityButtons}>
                {[1, 2, 3, 4, 5].map(level => (
                  <TouchableOpacity
                    key={level}
                    style={[styles.personalityButton, studentData.personalityTraits.entrepreneurialMindset === level && styles.personalityButtonSelected]}
                    onPress={() => handleInputChange('personalityTraits.entrepreneurialMindset', level.toString())}
                  >
                    <Text style={styles.personalityButtonText}>{level}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.personalityDescription}>{PERSONALITY_DESCRIPTIONS.entrepreneurialMindset[studentData.personalityTraits.entrepreneurialMindset as keyof typeof PERSONALITY_DESCRIPTIONS.entrepreneurialMindset]}</Text>
            </View>
          </View>
        </View>

        {/* Interests Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>🎯 Interests</ThemedText>
          
          <View style={styles.interestsGrid}>
            {['Technology', 'Science', 'Business', 'Arts', 'Sports', 'Music', 'Reading', 'Travel', 'Photography', 'Cooking', 'Gaming'].map(interest => (
              <TouchableOpacity
                key={interest}
                style={[styles.interestButton, studentData.interests.includes(interest) && styles.interestButtonSelected]}
                onPress={() => toggleInterest(interest)}
              >
                <Text style={styles.interestButtonText}>{interest}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Lifestyle Preferences Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>🏠 Lifestyle Preferences</ThemedText>
          
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Location Preference</ThemedText>
            <View>
              <ThemedText style={styles.inputHint}>💡 Enter either:</ThemedText>
              <ThemedText style={styles.inputHint}>• District: "Colombo District", "Kandy District"</ThemedText>
              <ThemedText style={styles.inputHint}>• Province: "Western Province", "Central Province"</ThemedText>
              <TextInput
                style={styles.input}
                value={studentData.locationPreference}
                onChangeText={(value) => handleInputChange('locationPreference', value)}
                placeholder="Type district or province name..."
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Travel Tolerance</ThemedText>
            <ScrollView horizontal style={styles.streamScroll}>
              {['Less than 30 min', '30-60 min', '1-2 hours', 'More than 2 hours', 'Willing to relocate'].map(tolerance => (
                <TouchableOpacity
                  key={tolerance}
                  style={[styles.streamButton, studentData.travelTolerance === tolerance && styles.streamButtonSelected]}
                  onPress={() => handleInputChange('travelTolerance', tolerance)}
                >
                  <Text style={[styles.streamButtonText, studentData.travelTolerance === tolerance && styles.streamButtonTextSelected]}>{tolerance}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Work Environment</ThemedText>
            <ScrollView horizontal style={styles.streamScroll}>
              {['Office', 'Remote', 'Hybrid', 'Field Work', 'Laboratory', 'Hospital', 'School'].map(environment => (
                <TouchableOpacity
                  key={environment}
                  style={[styles.streamButton, studentData.workEnvironment === environment && styles.streamButtonSelected]}
                  onPress={() => handleInputChange('workEnvironment', environment)}
                >
                  <Text style={[styles.streamButtonText, studentData.workEnvironment === environment && styles.streamButtonTextSelected]}>{environment}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Social Interaction</ThemedText>
            <ScrollView horizontal style={styles.streamScroll}>
              {['Team-oriented', 'Individual', 'Mixed', 'Leadership', 'Support'].map(interaction => (
                <TouchableOpacity
                  key={interaction}
                  style={[styles.streamButton, studentData.socialInteraction === interaction && styles.streamButtonSelected]}
                  onPress={() => handleInputChange('socialInteraction', interaction)}
                >
                  <Text style={[styles.streamButtonText, studentData.socialInteraction === interaction && styles.streamButtonTextSelected]}>{interaction}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Generate Recommendations Button */}
        <TouchableOpacity style={styles.generateButton} onPress={generateRecommendations}>
          <Text style={styles.generateButtonText}>
            {loading ? '🔄 Analyzing...' : '🚀 Generate Recommendations'}
          </Text>
        </TouchableOpacity>

        {/* Recommendations Display */}
        {showRecommendations && (
          <View style={styles.recommendationsSection}>
            <ThemedText style={styles.sectionTitle}>🎓 Your Personalized Recommendations</ThemedText>
            
            {recommendations.map((rec, index) => (
              <View key={index} style={styles.recommendationCard}>
                <View style={styles.recommendationHeader}>
                  <View>
                    <ThemedText style={styles.universityName}>{rec.university}</ThemedText>
                    <Text style={styles.universityDetails}>{rec.universityLocation} • {rec.universityType} • {rec.distance_km ? `${rec.distance_km} km away` : ''}</Text>
                  </View>
                  <View style={styles.matchScoreContainer}>
                    <Text style={styles.matchScore}>{rec.matchScore}% Match</Text>
                    <Text style={styles.admissionProbability}>{rec.admissionProbability}</Text>
                  </View>
                </View>

                <TouchableOpacity 
                  style={styles.mapButton}
                  onPress={() => openGoogleMaps(rec.university, rec.universityLocation)}
                >
                  <Text style={styles.mapButtonText}>📍 View on Map</Text>
                </TouchableOpacity>
                
                <View style={styles.recommendationDetails}>
                  <View style={styles.detailRow}>
                    <ThemedText style={styles.detailLabel}>Financial Aid:</ThemedText>
                    <ThemedText style={styles.detailValue}>{rec.financialAid}</ThemedText>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <ThemedText style={styles.detailLabel}>Location Match:</ThemedText>
                    <ThemedText style={styles.detailValue}>{rec.locationMatch}</ThemedText>
                  </View>
                </View>

                <View style={styles.degreesSection}>
                  <ThemedText style={styles.degreesTitle}>Recommended Degrees:</ThemedText>
                  {rec.recommendedDegrees.map((degree: any, degIndex: number) => (
                    <View key={degIndex} style={styles.degreeItem}>
                      <Text style={styles.degreeName}>{degree.name}</Text>
                      <Text style={styles.degreeDuration}>{degree.duration}</Text>
                      <Text style={styles.careerPaths}>{degree.careerPaths.join(', ')}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.studyPlanSection}>
                  <ThemedText style={styles.studyPlanTitle}>Study Plan:</ThemedText>
                  <Text style={styles.studyPlanDetail}>{rec.studyPlan.recommendedApproach}</Text>
                  <Text style={styles.studyPlanDetail}>Risk Level: {rec.studyPlan.riskTolerance}</Text>
                  <Text style={styles.studyPlanDetail}>Additional: {rec.studyPlan.additionalCourses}</Text>
                </View>

                <View style={styles.careerOutlookSection}>
                  <ThemedText style={styles.careerOutlookTitle}>Career Outlook:</ThemedText>
                  <Text style={styles.careerOutlookDetail}>Leadership: {rec.careerOutlook.leadershipPotential}</Text>
                  <Text style={styles.careerOutlookDetail}>Creativity: {rec.careerOutlook.creativityScore}</Text>
                  <Text style={styles.careerOutlookDetail}>Recommended: {rec.careerOutlook.recommendedCareers?.join(', ') || 'No specific careers recommended'}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#010066',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#010066',
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 30,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#2563EB',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#010066',
    marginBottom: 15,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#010066',
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: '#2563EB',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: '#010066',
    backgroundColor: '#FFFFFF',
  },
  alResultsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  alResultItem: {
    width: '48%',
    marginBottom: 10,
  },
  alResultLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#010066',
    marginBottom: 5,
  },
  alResultInput: {
    borderWidth: 2,
    borderColor: '#2563EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#010066',
    backgroundColor: '#FFFFFF',
    textAlign: 'center',
  },
  streamScroll: {
    maxHeight: 50,
  },
  streamButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#2563EB',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 8,
    marginBottom: 8,
  },
  streamButtonSelected: {
    backgroundColor: '#F7931E',
    borderColor: '#F7931E',
  },
  streamButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#010066',
    textAlign: 'center',
  },
  streamButtonTextSelected: {
    color: '#FFFFFF',
  },
  personalityGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  personalityItem: {
    width: '48%',
    alignItems: 'center',
  },
  personalityLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#010066',
    marginBottom: 10,
    textAlign: 'center',
  },
  personalityButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  personalityButton: {
    width: 35,
    height: 35,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  personalityButtonSelected: {
    backgroundColor: '#F7931E',
    borderColor: '#F7931E',
  },
  personalityButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#010066',
  },
  personalityDescription: {
    fontSize: 12,
    color: '#010066',
    opacity: 0.7,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  interestButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#2563EB',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  interestButtonSelected: {
    backgroundColor: '#F7931E',
    borderColor: '#F7931E',
  },
  interestButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#010066',
    textAlign: 'center',
  },
  generateButton: {
    backgroundColor: '#F7931E',
    borderRadius: 15,
    padding: 18,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#F7931E',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  recommendationsSection: {
    marginTop: 20,
  },
  recommendationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#2563EB',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  universityName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#010066',
    flex: 1,
  },
  universityDetails: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  matchScoreContainer: {
    alignItems: 'flex-end',
  },
  matchScore: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F7931E',
    backgroundColor: '#FFF8F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 10,
  },
  admissionProbability: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F7931E',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 5,
  },
  recommendationDetails: {
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#010066',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F7931E',
    flex: 1,
    textAlign: 'right',
  },
  degreesSection: {
    marginBottom: 15,
  },
  degreesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#010066',
    marginBottom: 10,
  },
  degreeItem: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  degreeName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#010066',
    marginBottom: 4,
  },
  degreeDuration: {
    fontSize: 12,
    color: '#010066',
    opacity: 0.7,
    marginBottom: 4,
  },
  careerPaths: {
    fontSize: 12,
    color: '#010066',
    opacity: 0.7,
  },
  studyPlanSection: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  studyPlanTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#010066',
    marginBottom: 8,
  },
  studyPlanDetail: {
    fontSize: 12,
    color: '#010066',
    opacity: 0.7,
    marginBottom: 4,
  },
  careerOutlookSection: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
  },
  careerOutlookTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#010066',
    marginBottom: 8,
  },
  careerOutlookDetail: {
    fontSize: 12,
    color: '#010066',
    opacity: 0.7,
    marginBottom: 4,
  },
  noStreamSelected: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#2563EB',
    borderStyle: 'dashed',
  },
  noStreamText: {
    fontSize: 16,
    color: '#010066',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  mapButton: {
    backgroundColor: '#2563EB',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
    marginTop: 10,
  },
  mapButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  dropdownContainer: {
    position: 'relative',
  },
  dropdownButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownButtonSelected: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#666',
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginTop: 5,
    zIndex: 1000,
  },
  dropdownItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownItemSelected: {
    backgroundColor: '#F0F8FF',
  },
  dropdownItemContent: {
    flexDirection: 'column',
  },
  dropdownItemLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  dropdownItemDescription: {
    fontSize: 14,
    color: '#666',
  },
  // New styles for AL subjects enhancement
  subjectLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#010066',
    marginBottom: 5,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#010066',
  },
  requiredSubject: {
    backgroundColor: '#FFF5F5',
    borderColor: '#ff6b6b',
    borderWidth: 2,
  },
  optionalSubject: {
    backgroundColor: '#F0FFFF',
    borderColor: '#4ecdc4',
    borderWidth: 1,
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  requiredBadge: {
    backgroundColor: '#ff6b6b',
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  requiredInput: {
    backgroundColor: '#FFFFFF',
    borderColor: '#ff6b6b',
    borderWidth: 1,
  },
  optionalInput: {
    backgroundColor: '#FFFFFF',
    borderColor: '#4ecdc4',
    borderWidth: 1,
  },
  // New styles for basket categorization
  mainBasketSubject: {
    backgroundColor: '#FFF5F5',
    borderColor: '#ff6b6b',
    borderWidth: 2,
  },
  alternativeBasketSubject: {
    backgroundColor: '#FFF8E1',
    borderColor: '#ffa500',
    borderWidth: 2,
  },
  optionalBasketSubject: {
    backgroundColor: '#F0FFFF',
    borderColor: '#4ecdc4',
    borderWidth: 1,
  },
  mandatorySubject: {
    backgroundColor: '#F3E5F5',
    borderColor: '#9c27b0',
    borderWidth: 2,
  },
  commonSubject: {
    backgroundColor: '#F5F5F5',
    borderColor: '#607d8b',
    borderWidth: 1,
  },
  basketBadges: {
    flexDirection: 'row',
  },
  basketBadge: {
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  mainBasketBadge: {
    backgroundColor: '#ff6b6b',
    color: 'white',
  },
  alternativeBasketBadge: {
    backgroundColor: '#ffa500',
    color: 'white',
  },
  optionalBasketBadge: {
    backgroundColor: '#4ecdc4',
    color: 'white',
  },
  mandatoryBadge: {
    backgroundColor: '#9c27b0',
    color: 'white',
  },
  commonBadge: {
    backgroundColor: '#607d8b',
    color: 'white',
  },
  mainBasketInput: {
    backgroundColor: '#FFFFFF',
    borderColor: '#ff6b6b',
    borderWidth: 1,
  },
  alternativeBasketInput: {
    backgroundColor: '#FFFFFF',
    borderColor: '#ffa500',
    borderWidth: 1,
  },
  optionalBasketInput: {
    backgroundColor: '#FFFFFF',
    borderColor: '#4ecdc4',
    borderWidth: 1,
  },
  mandatoryInput: {
    backgroundColor: '#FFFFFF',
    borderColor: '#9c27b0',
    borderWidth: 1,
  },
  commonInput: {
    backgroundColor: '#FFFFFF',
    borderColor: '#607d8b',
    borderWidth: 1,
  },
  gradeInfo: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  gradeInfoTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 4,
  },
  gradeInfoText: {
    fontSize: 11,
    color: '#388E3C',
    textAlign: 'center',
  },
  validationErrorContainer: {
    backgroundColor: '#FFEBEE',
    borderColor: '#F44336',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  validationErrorText: {
    fontSize: 14,
    color: '#D32F2F',
    fontWeight: '600',
    flex: 1,
  },
  locationSuggestions: {
    marginTop: 10,
  },
  suggestionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#010066',
    marginBottom: 8,
  },
  suggestionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionButton: {
    backgroundColor: '#F0F8FF',
    borderColor: '#2563EB',
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  suggestionText: {
    fontSize: 11,
    color: '#010066',
    fontWeight: '500',
  },
  inputHint: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
    fontStyle: 'italic',
  },
});
