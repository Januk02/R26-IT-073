import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function InsightsScreen() {
  const [selectedInsight, setSelectedInsight] = useState('academic');

  const insightCategories = [
    { id: 'academic', name: 'Academic Performance', icon: '📚' },
    { id: 'career', name: 'Career Market', icon: '💼' },
    { id: 'skills', name: 'Skill Analysis', icon: '🔧' },
    { id: 'university', name: 'University Analysis', icon: '🎓' },
    { id: 'personal', name: 'Personal Growth', icon: '🌱' },
  ];

  const renderInsightContent = () => {
    switch (selectedInsight) {
      case 'academic':
        return (
          <View style={styles.insightContent}>
            <ThemedText style={styles.insightTitle}>📚 Academic Performance Insights</ThemedText>
            <View style={styles.insightCard}>
              <ThemedText style={styles.insightCardTitle}>A/L Performance Analysis</ThemedText>
              <ThemedText style={styles.insightText}>• Strong in Mathematics and Physics</ThemedText>
              <ThemedText style={styles.insightText}>• Improvement needed in Chemistry</ThemedText>
              <ThemedText style={styles.insightText}>• Overall Z-Score trend: Positive</ThemedText>
            </View>
            <View style={styles.insightCard}>
              <ThemedText style={styles.insightCardTitle}>Study Recommendations</ThemedText>
              <ThemedText style={styles.insightText}>• Focus on problem-solving practice</ThemedText>
              <ThemedText style={styles.insightText}>• Join study groups for weak subjects</ThemedText>
              <ThemedText style={styles.insightText}>• Allocate 2 hours daily for Chemistry</ThemedText>
            </View>
          </View>
        );
      case 'career':
        return (
          <View style={styles.insightContent}>
            <ThemedText style={styles.insightTitle}>💼 Career Market Insights</ThemedText>
            <View style={styles.insightCard}>
              <ThemedText style={styles.insightCardTitle}>Job Market Trends</ThemedText>
              <ThemedText style={styles.insightText}>• IT sector: 15% growth expected</ThemedText>
              <ThemedText style={styles.insightText}>• Engineering: Stable demand</ThemedText>
              <ThemedText style={styles.insightText}>• Healthcare: High growth potential</ThemedText>
            </View>
            <View style={styles.insightCard}>
              <ThemedText style={styles.insightCardTitle}>Salary Predictions</ThemedText>
              <ThemedText style={styles.insightText}>• Software Engineering: $60K-$120K</ThemedText>
              <ThemedText style={styles.insightText}>• Medicine: $80K-$200K</ThemedText>
              <ThemedText style={styles.insightText}>• Engineering: $50K-$100K</ThemedText>
            </View>
          </View>
        );
      case 'skills':
        return (
          <View style={styles.insightContent}>
            <ThemedText style={styles.insightTitle}>🔧 Skill Gap Analysis</ThemedText>
            <View style={styles.insightCard}>
              <ThemedText style={styles.insightCardTitle}>Current Skills vs Dream Job</ThemedText>
              <ThemedText style={styles.insightText}>• Programming: 70% match</ThemedText>
              <ThemedText style={styles.insightText}>• Mathematics: 85% match</ThemedText>
              <ThemedText style={styles.insightText}>• Communication: 60% match</ThemedText>
            </View>
            <View style={styles.insightCard}>
              <ThemedText style={styles.insightCardTitle}>Skill Development Plan</ThemedText>
              <ThemedText style={styles.insightText}>• Take online coding courses</ThemedText>
              <ThemedText style={styles.insightText}>• Join public speaking clubs</ThemedText>
              <ThemedText style={styles.insightText}>• Practice team projects</ThemedText>
            </View>
          </View>
        );
      case 'university':
        return (
          <View style={styles.insightContent}>
            <ThemedText style={styles.insightTitle}>🎓 University Competition Analysis</ThemedText>
            <View style={styles.insightCard}>
              <ThemedText style={styles.insightCardTitle}>Admission Probabilities</ThemedText>
              <ThemedText style={styles.insightText}>• University of Colombo: 75%</ThemedText>
              <ThemedText style={styles.insightText}>• University of Moratuwa: 68%</ThemedText>
              <ThemedText style={styles.insightText}>• University of Peradeniya: 82%</ThemedText>
            </View>
            <View style={styles.insightCard}>
              <ThemedText style={styles.insightCardTitle}>Cutoff Score Trends</ThemedText>
              <ThemedText style={styles.insightText}>• Engineering: 2.8+ Z-Score</ThemedText>
              <ThemedText style={styles.insightText}>• Medicine: 3.5+ Z-Score</ThemedText>
              <ThemedText style={styles.insightText}>• Computer Science: 2.5+ Z-Score</ThemedText>
            </View>
          </View>
        );
      case 'personal':
        return (
          <View style={styles.insightContent}>
            <ThemedText style={styles.insightTitle}>🌱 Personal Growth Insights</ThemedText>
            <View style={styles.insightCard}>
              <ThemedText style={styles.insightCardTitle}>Personality Traits Analysis</ThemedText>
              <ThemedText style={styles.insightText}>• Analytical Thinking: High</ThemedText>
              <ThemedText style={styles.insightText}>• Leadership: Medium</ThemedText>
              <ThemedText style={styles.insightText}>• Creativity: Medium-High</ThemedText>
            </View>
            <View style={styles.insightCard}>
              <ThemedText style={styles.insightCardTitle}>Learning Style</ThemedText>
              <ThemedText style={styles.insightText}>• Visual Learner: 60%</ThemedText>
              <ThemedText style={styles.insightText}>• Kinesthetic Learner: 30%</ThemedText>
              <ThemedText style={styles.insightText}>• Auditory Learner: 10%</ThemedText>
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>💡 Academic & Career Insights</ThemedText>
          <ThemedText style={styles.subtitle}>AI-powered analysis for your academic journey</ThemedText>
        </View>

        <View style={styles.categoryContainer}>
          {insightCategories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[styles.categoryButton, selectedInsight === category.id && styles.categoryButtonSelected]}
              onPress={() => setSelectedInsight(category.id)}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <ThemedText style={[styles.categoryText, selectedInsight === category.id && styles.categoryTextSelected]}>
                {category.name}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        {renderInsightContent()}
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
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    gap: 10,
  },
  categoryButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    minWidth: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryButtonSelected: {
    backgroundColor: '#010066',
    borderColor: '#010066',
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
  },
  categoryTextSelected: {
    color: '#ffffff',
  },
  insightContent: {
    padding: 20,
  },
  insightTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 20,
  },
  insightCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  insightCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  insightText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
});
