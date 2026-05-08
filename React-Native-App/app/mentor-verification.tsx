import React, { useState, useEffect } from 'react';
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

interface Question {
  id: number;
  domain: string;
  questions: string[];
}

const interviewQuestions: Question[] = [
  {
    id: 1,
    domain: 'Mentorship Skill',
    questions: [
      'How would you describe your mentoring approach?',
      'Can you give one example of supporting a student or junior?',
    ],
  },
  {
    id: 2,
    domain: 'Handling Challenges',
    questions: [
      'How do you support a mentee who is struggling or unmotivated?',
    ],
  },
  {
    id: 3,
    domain: 'Communication & Relationship',
    questions: [
      'How do you build trust with a mentee?',
      'How do you give difficult feedback?',
    ],
  },
  {
    id: 4,
    domain: 'Commitment & Boundaries',
    questions: [
      'How much time can you realistically commit per month?',
      'How do you maintain professional boundaries?',
    ],
  },
  {
    id: 5,
    domain: 'Motivation & Values',
    questions: [
      'Why do you want to mentor students?',
      'What do you think students need most from a mentor?',
    ],
  },
  {
    id: 6,
    domain: 'Expectations',
    questions: [
      'What do you expect from a mentee?',
    ],
  },
  {
    id: 7,
    domain: 'Adaptability',
    questions: [
      'How would you adjust your approach to different students?',
    ],
  },
  {
    id: 8,
    domain: 'Self-awareness / Limits',
    questions: [
      'What kind of mentoring situations would be challenging for you?',
    ],
  },
  {
    id: 9,
    domain: 'Conflict / Rupture Repair',
    questions: [
      'What would you do if a mentee disagreed with your advice?',
    ],
  },
];

interface Answer {
  questionId: number;
  answer: string;
}

export default function MentorVerificationScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const currentQuestion = interviewQuestions[currentStep];
  const totalQuestions = interviewQuestions.length;
  const progress = ((currentStep + 1) / totalQuestions) * 100;

  const handleNext = () => {
    if (!currentAnswer.trim()) {
      Alert.alert('Required', 'Please provide an answer before continuing');
      return;
    }

    const newAnswer: Answer = {
      questionId: currentQuestion.id,
      answer: currentAnswer,
    };

    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);

    if (currentStep < totalQuestions - 1) {
      setCurrentStep(currentStep + 1);
      setCurrentAnswer('');
    } else {
      submitInterview(updatedAnswers);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      const previousAnswer = answers.find(a => a.questionId === interviewQuestions[currentStep - 1].id);
      setCurrentAnswer(previousAnswer?.answer || '');
      setAnswers(answers.filter(a => a.questionId !== interviewQuestions[currentStep].id));
    }
  };

  const calculateScore = (allAnswers: Answer[]) => {
    // Simulate AI scoring based on answer length and content
    let totalScore = 0;
    const domainScores: { [key: string]: number } = {};

    allAnswers.forEach((ans) => {
      const question = interviewQuestions.find(q => q.id === ans.questionId);
      if (question) {
        const wordCount = ans.answer.split(/\s+/).length;
        let score = 50;

        // Length-based scoring
        if (wordCount > 20) score += 15;
        if (wordCount > 40) score += 15;
        if (wordCount > 60) score += 10;

        // Content analysis (basic keyword checks)
        const lowerAnswer = ans.answer.toLowerCase();

        // Mentorship keywords
        if (/support|help|guide|mentor|advice|feedback/i.test(lowerAnswer)) score += 5;
        if (/student|mentee|learner|junior|beginner/i.test(lowerAnswer)) score += 5;
        if (/experience|patience|communication|trust|respect/i.test(lowerAnswer)) score += 5;

        // Professional keywords
        if (/professional|boundary|respect|time|commitment/i.test(lowerAnswer)) score += 5;
        if (/adapt|adjust|flexible|different|individual/i.test(lowerAnswer)) score += 5;

        score = Math.min(score, 100);
        totalScore += score;
        domainScores[question.domain] = score;
      }
    });

    const averageScore = Math.round(totalScore / allAnswers.length);

    let tier = 'participant';
    if (averageScore >= 90) tier = 'platinum';
    else if (averageScore >= 80) tier = 'gold';
    else if (averageScore >= 70) tier = 'silver';
    else if (averageScore >= 60) tier = 'bronze';

    const strengths = [];
    const improvements = [];

    if (averageScore >= 80) {
      strengths.push('Comprehensive answers demonstrating experience');
    }
    if (averageScore >= 70) {
      strengths.push('Good understanding of mentorship principles');
    }
    if (domainScores['Communication & Relationship'] >= 75) {
      strengths.push('Strong communication and relationship-building skills');
    }
    if (domainScores['Handling Challenges'] >= 75) {
      strengths.push('Good problem-solving approach with struggling mentees');
    }

    if (averageScore < 80) {
      improvements.push('Provide more detailed examples from your experience');
    }
    if (averageScore < 70) {
      improvements.push('Expand on specific mentorship techniques you use');
    }
    if (!strengths.includes('Strong communication and relationship-building skills')) {
      improvements.push('Focus on developing trust-building strategies');
    }

    return {
      score: averageScore,
      tier,
      strengths,
      improvements,
      domainScores,
      summary: `Your interview scored ${averageScore}% and achieved ${tier} tier. You answered ${allAnswers.length} questions across 9 key mentorship domains.`,
    };
  };

  const submitInterview = async (allAnswers: Answer[]) => {
    if (!user) {
      Alert.alert('Error', 'Please login first');
      return;
    }

    setLoading(true);

    // Calculate results
    const calculatedResults = calculateScore(allAnswers);
    setResults(calculatedResults);

    try {
      await addDoc(collection(db, 'verifications'), {
        mentorId: user.uid,
        type: 'interview',
        score: calculatedResults.score,
        tier: calculatedResults.tier,
        answers: allAnswers,
        strengths: calculatedResults.strengths,
        improvements: calculatedResults.improvements,
        summary: calculatedResults.summary,
        createdAt: serverTimestamp(),
        status: 'completed',
      });

      setLoading(false);
    } catch (error) {
      console.error('Error saving verification:', error);
      Alert.alert('Error', 'Failed to save results. Please try again.');
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

  if (results) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Interview Complete</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView}>
          {/* Results Card */}
          <View style={styles.resultCard}>
            <Text style={styles.resultEmoji}>{getTierEmoji(results.tier)}</Text>
            <Text style={[styles.tierText, { color: getTierColor(results.tier) }]}>
              {results.tier.toUpperCase()} TIER
            </Text>
            <View style={styles.scoreCircle}>
              <Text style={styles.scoreNumber}>{results.score}%</Text>
            </View>
            <Text style={styles.scoreLabel}>Interview Score</Text>
          </View>

          {/* Summary */}
          <View style={styles.sectionCard}>
            <Text style={styles.summaryText}>{results.summary}</Text>
          </View>

          {/* Strengths */}
          {results.strengths.length > 0 && (
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                <Text style={styles.sectionTitle}>Strengths</Text>
              </View>
              {results.strengths.map((strength: string, index: number) => (
                <View key={index} style={styles.listItem}>
                  <Ionicons name="checkmark" size={16} color="#10b981" />
                  <Text style={styles.listItemText}>{strength}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Improvements */}
          {results.improvements.length > 0 && (
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Ionicons name="construct" size={20} color="#f59e0b" />
                <Text style={styles.sectionTitle}>Areas for Improvement</Text>
              </View>
              {results.improvements.map((improvement: string, index: number) => (
                <View key={index} style={styles.listItem}>
                  <Ionicons name="arrow-forward" size={16} color="#f59e0b" />
                  <Text style={styles.listItemText}>{improvement}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Your Answers */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="document-text" size={20} color="#7c3aed" />
              <Text style={styles.sectionTitle}>Your Responses</Text>
            </View>
            {answers.map((ans, index) => {
              const question = interviewQuestions.find(q => q.id === ans.questionId);
              return (
                <View key={ans.questionId} style={styles.answerItem}>
                  <Text style={styles.answerDomain}>{question?.domain}</Text>
                  <Text style={styles.answerText} numberOfLines={2}>
                    {ans.answer}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Done Button */}
          <TouchableOpacity
            style={styles.doneButton}
            onPress={() => router.back()}
          >
            <Text style={styles.doneButtonText}>Back to Dashboard</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="close" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verification Interview</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          Question {currentStep + 1} of {totalQuestions}
        </Text>
      </View>

      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        <View style={styles.questionContainer}>
          {/* Domain Badge */}
          <View style={styles.domainBadge}>
            <Text style={styles.domainText}>{currentQuestion.domain}</Text>
          </View>

          {/* Questions */}
          {currentQuestion.questions.map((q, index) => (
            <View key={index} style={styles.questionWrapper}>
              <Text style={styles.questionNumber}>
                {currentQuestion.questions.length > 1 ? `Q${index + 1}:` : 'Question:'}
              </Text>
              <Text style={styles.questionText}>{q}</Text>
            </View>
          ))}

          {/* Answer Input */}
          <Text style={styles.answerLabel}>Your Answer</Text>
          <TextInput
            style={styles.textInput}
            multiline
            numberOfLines={8}
            placeholder="Type your answer here... Be specific and provide examples where possible."
            placeholderTextColor="#9ca3af"
            value={currentAnswer}
            onChangeText={setCurrentAnswer}
            textAlignVertical="top"
          />

          <Text style={styles.characterCount}>
            {currentAnswer.length} characters
          </Text>
        </View>
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity
          style={[styles.navButton, styles.prevButton, currentStep === 0 && styles.buttonDisabled]}
          onPress={handlePrevious}
          disabled={currentStep === 0}
        >
          <Ionicons name="arrow-back" size={20} color={currentStep === 0 ? '#9ca3af' : '#374151'} />
          <Text style={[styles.prevButtonText, currentStep === 0 && styles.disabledText]}>
            Previous
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, styles.nextButton, !currentAnswer.trim() && styles.buttonDisabled]}
          onPress={handleNext}
          disabled={!currentAnswer.trim() || loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Text style={styles.nextButtonText}>
                {currentStep === totalQuestions - 1 ? 'Submit' : 'Next'}
              </Text>
              <Ionicons
                name={currentStep === totalQuestions - 1 ? 'checkmark' : 'arrow-forward'}
                size={20}
                color="#ffffff"
              />
            </>
          )}
        </TouchableOpacity>
      </View>
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
  progressContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#7c3aed',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  questionContainer: {
    padding: 20,
  },
  domainBadge: {
    backgroundColor: '#ede9fe',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  domainText: {
    color: '#7c3aed',
    fontSize: 14,
    fontWeight: '600',
  },
  questionWrapper: {
    marginBottom: 16,
  },
  questionNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7c3aed',
    marginBottom: 4,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1f2937',
    lineHeight: 26,
  },
  answerLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 24,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1f2937',
    minHeight: 150,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'right',
    marginTop: 8,
  },
  navigationContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  navButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  prevButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  prevButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: '#7c3aed',
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  disabledText: {
    color: '#9ca3af',
  },
  // Results styles
  resultCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    margin: 16,
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
    marginHorizontal: 16,
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
  summaryText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
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
  answerItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  answerDomain: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7c3aed',
    marginBottom: 4,
  },
  answerText: {
    fontSize: 14,
    color: '#6b7280',
  },
  doneButton: {
    backgroundColor: '#7c3aed',
    margin: 16,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
