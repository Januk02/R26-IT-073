import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../firebase';

interface AnalysisResult {
  score: number;
  tier: string;
  strengths: string[];
  improvements: string[];
  summary: string;
}

export default function CVVerificationScreen() {
  const router = useRouter();
  const [cvText, setCvText] = useState('');
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [user, setUser] = useState<any>(null);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const analyzeCV = async () => {
    if (!cvText.trim()) {
      Alert.alert('Error', 'Please paste your CV content first');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'Please login first');
      return;
    }

    setAnalyzing(true);

    // Simulate AI analysis (replace with actual AI API call)
    setTimeout(() => {
      const wordCount = cvText.split(/\s+/).length;
      const hasEducation = /education|degree|university|college|bachelor|master|phd/i.test(cvText);
      const hasExperience = /experience|work|job|position|role|company/i.test(cvText);
      const hasSkills = /skills|proficient|expert|knowledge|technologies/i.test(cvText);

      let score = 50;
      if (wordCount > 200) score += 10;
      if (wordCount > 400) score += 10;
      if (hasEducation) score += 15;
      if (hasExperience) score += 15;
      if (hasSkills) score += 15;
      if (/projects|achievements|certifications|awards/i.test(cvText)) score += 10;

      score = Math.min(score, 100);

      let tier = 'participant';
      if (score >= 90) tier = 'platinum';
      else if (score >= 80) tier = 'gold';
      else if (score >= 70) tier = 'silver';
      else if (score >= 60) tier = 'bronze';

      const strengths = [];
      const improvements = [];

      if (hasEducation) strengths.push('Education section well documented');
      else improvements.push('Add detailed education background');

      if (hasExperience) strengths.push('Work experience included');
      else improvements.push('Include relevant work experience');

      if (hasSkills) strengths.push('Skills section present');
      else improvements.push('Add a dedicated skills section');

      if (wordCount > 300) strengths.push('Comprehensive CV length');
      else improvements.push('Expand CV content (aim for 300+ words)');

      const analysis: AnalysisResult = {
        score,
        tier,
        strengths,
        improvements,
        summary: `Your CV scored ${score}% and achieved ${tier} tier. ${strengths.length > 0 ? 'Strengths include: ' + strengths.join(', ') + '.' : ''}`,
      };

      setResult(analysis);
      setAnalyzing(false);
    }, 3000);
  };

  const saveResult = async () => {
    if (!result || !user) return;

    setLoading(true);
    try {
      await addDoc(collection(db, 'cvVerifications'), {
        mentorId: user.uid,
        score: result.score,
        tier: result.tier,
        strengths: result.strengths,
        improvements: result.improvements,
        summary: result.summary,
        uploadedAt: serverTimestamp(),
        status: 'completed',
      });

      Alert.alert(
        'Success!',
        `Your CV has been analyzed and saved. You achieved ${result.tier} tier with ${result.score}% score.`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Error saving CV verification:', error);
      Alert.alert('Error', 'Failed to save results. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'platinum': return '#6366f1';
      case 'gold': return '#fbbf24';
      case 'silver': return '#9ca3af';
      case 'bronze': return '#b45309';
      default: return '#6b7280';
    }
  };

  const getTierEmoji = (tier: string) => {
    switch (tier) {
      case 'platinum': return '🏆';
      case 'gold': return '🥇';
      case 'silver': return '🥈';
      case 'bronze': return '🥉';
      default: return '📋';
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>CV Analysis</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        {!result ? (
          <View style={styles.inputSection}>
            <View style={styles.infoCard}>
              <Ionicons name="information-circle-outline" size={24} color="#3b82f6" />
              <Text style={styles.infoText}>
                Paste your CV content below. Our AI will analyze it and provide feedback on structure, content, and professionalism.
              </Text>
            </View>

            <Text style={styles.label}>Your CV Content</Text>
            <TextInput
              style={styles.textInput}
              multiline
              numberOfLines={15}
              placeholder="Paste your CV text here...\n\nInclude:\n- Education\n- Work Experience\n- Skills\n- Projects\n- Certifications"
              placeholderTextColor="#9ca3af"
              value={cvText}
              onChangeText={setCvText}
              textAlignVertical="top"
            />

            <Text style={styles.characterCount}>
              {cvText.length} characters
            </Text>

            <TouchableOpacity
              style={[styles.analyzeButton, (!cvText.trim() || analyzing) && styles.buttonDisabled]}
              onPress={analyzeCV}
              disabled={!cvText.trim() || analyzing}
            >
              {analyzing ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Ionicons name="scan-outline" size={20} color="#ffffff" style={styles.buttonIcon} />
                  <Text style={styles.buttonText}>Analyze CV</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.resultSection}>
            {/* Score Card */}
            <View style={styles.scoreCard}>
              <Text style={styles.resultEmoji}>{getTierEmoji(result.tier)}</Text>
              <Text style={[styles.tierText, { color: getTierColor(result.tier) }]}>
                {result.tier.toUpperCase()} TIER
              </Text>
              <View style={styles.scoreCircle}>
                <Text style={styles.scoreNumber}>{result.score}%</Text>
              </View>
              <Text style={styles.scoreLabel}>CV Score</Text>
            </View>

            {/* Strengths */}
            {result.strengths.length > 0 && (
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                  <Text style={styles.sectionTitle}>Strengths</Text>
                </View>
                {result.strengths.map((strength, index) => (
                  <View key={index} style={styles.listItem}>
                    <Ionicons name="checkmark" size={16} color="#10b981" />
                    <Text style={styles.listItemText}>{strength}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Improvements */}
            {result.improvements.length > 0 && (
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="construct" size={20} color="#f59e0b" />
                  <Text style={styles.sectionTitle}>Areas for Improvement</Text>
                </View>
                {result.improvements.map((improvement, index) => (
                  <View key={index} style={styles.listItem}>
                    <Ionicons name="arrow-forward" size={16} color="#f59e0b" />
                    <Text style={styles.listItemText}>{improvement}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Summary */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Ionicons name="document-text" size={20} color="#7c3aed" />
                <Text style={styles.sectionTitle}>Summary</Text>
              </View>
              <Text style={styles.summaryText}>{result.summary}</Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.retestButton}
                onPress={() => setResult(null)}
              >
                <Ionicons name="refresh" size={20} color="#6b7280" style={styles.buttonIcon} />
                <Text style={styles.retestButtonText}>Analyze Again</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveButton, loading && styles.buttonDisabled]}
                onPress={saveResult}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <>
                    <Ionicons name="save-outline" size={20} color="#ffffff" style={styles.buttonIcon} />
                    <Text style={styles.buttonText}>Save Result</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  inputSection: {
    padding: 16,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: '#1f2937',
    minHeight: 300,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'right',
    marginTop: 8,
    marginBottom: 20,
  },
  analyzeButton: {
    backgroundColor: '#7c3aed',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultSection: {
    padding: 16,
  },
  scoreCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  tierText: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 16,
    letterSpacing: 1,
  },
  scoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  scoreNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#7c3aed',
  },
  scoreLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  listItemText: {
    fontSize: 14,
    color: '#4b5563',
    flex: 1,
  },
  summaryText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  retestButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  retestButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7c3aed',
    paddingVertical: 14,
    borderRadius: 12,
  },
});
