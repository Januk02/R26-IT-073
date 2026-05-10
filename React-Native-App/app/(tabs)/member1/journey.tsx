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

export default function JourneyScreen() {
  const [selectedPhase, setSelectedPhase] = useState('current');

  const journeyPhases = [
    { id: 'past', name: 'Past', icon: '📚', color: '#10b981' },
    { id: 'current', name: 'Current', icon: '🎯', color: '#f59e0b' },
    { id: 'future', name: 'Future', icon: '🚀', color: '#3b82f6' },
  ];

  const milestones = [
    {
      phase: 'past',
      title: 'O/L Completed',
      date: '2022',
      status: 'completed',
      description: 'Successfully completed O/L examination with 6A\'s, 3B\'s',
      progress: 100,
    },
    {
      phase: 'past',
      title: 'A/L Started',
      date: '2023',
      status: 'completed',
      description: 'Started A/L in Mathematics stream',
      progress: 100,
    },
    {
      phase: 'current',
      title: 'A/L Examination',
      date: '2024',
      status: 'in-progress',
      description: 'Preparing for A/L examination',
      progress: 75,
    },
    {
      phase: 'future',
      title: 'University Application',
      date: '2025',
      status: 'upcoming',
      description: 'Apply to universities based on A/L results',
      progress: 0,
    },
    {
      phase: 'future',
      title: 'University Enrollment',
      date: '2025-2026',
      status: 'upcoming',
      description: 'Start university journey',
      progress: 0,
    },
    {
      phase: 'future',
      title: 'Graduation',
      date: '2029',
      status: 'upcoming',
      description: 'Complete bachelor\'s degree',
      progress: 0,
    },
  ];

  const goals = [
    {
      category: 'Academic',
      title: 'Score 2.5+ Z-Score',
      target: 'A/L Results',
      deadline: '2024',
      progress: 70,
      priority: 'high',
    },
    {
      category: 'Career',
      title: 'Become Software Engineer',
      target: 'Long-term Goal',
      deadline: '2029',
      progress: 25,
      priority: 'high',
    },
    {
      category: 'Skills',
      title: 'Master Programming',
      target: 'Technical Skills',
      deadline: '2025',
      progress: 40,
      priority: 'medium',
    },
    {
      category: 'Personal',
      title: 'Improve Communication',
      target: 'Soft Skills',
      deadline: '2024',
      progress: 55,
      priority: 'medium',
    },
  ];

  const renderProgressBar = (progress: number) => (
    <View style={styles.progressBarContainer}>
      <View style={[styles.progressBar, { width: `${progress}%` }]} />
      <Text style={styles.progressText}>{progress}%</Text>
    </View>
  );

  const renderMilestoneCard = (milestone: any) => (
    <View key={milestone.title} style={styles.milestoneCard}>
      <View style={styles.milestoneHeader}>
        <ThemedText style={styles.milestoneTitle}>{milestone.title}</ThemedText>
        <Text style={styles.milestoneDate}>{milestone.date}</Text>
      </View>
      <ThemedText style={styles.milestoneDescription}>{milestone.description}</ThemedText>
      {renderProgressBar(milestone.progress)}
      <View style={styles.statusBadge}>
        <Text style={[
          styles.statusText,
          milestone.status === 'completed' && styles.statusCompleted,
          milestone.status === 'in-progress' && styles.statusInProgress,
          milestone.status === 'upcoming' && styles.statusUpcoming,
        ]}>
          {milestone.status.charAt(0).toUpperCase() + milestone.status.slice(1)}
        </Text>
      </View>
    </View>
  );

  const renderGoalCard = (goal: any) => (
    <View key={goal.title} style={styles.goalCard}>
      <View style={styles.goalHeader}>
        <View style={styles.goalCategory}>
          <Text style={styles.categoryText}>{goal.category}</Text>
        </View>
        <Text style={[
          styles.priorityBadge,
          goal.priority === 'high' && styles.priorityHigh,
          goal.priority === 'medium' && styles.priorityMedium,
        ]}>
          {goal.priority.toUpperCase()}
        </Text>
      </View>
      <ThemedText style={styles.goalTitle}>{goal.title}</ThemedText>
      <ThemedText style={styles.goalTarget}>Target: {goal.target}</ThemedText>
      <ThemedText style={styles.goalDeadline}>Deadline: {goal.deadline}</ThemedText>
      {renderProgressBar(goal.progress)}
    </View>
  );

  const filteredMilestones = milestones.filter(m => m.phase === selectedPhase);

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>🛤️ Academic Journey</ThemedText>
          <ThemedText style={styles.subtitle}>Track your progress from O/L to University</ThemedText>
        </View>

        <View style={styles.phaseContainer}>
          {journeyPhases.map(phase => (
            <TouchableOpacity
              key={phase.id}
              style={[styles.phaseButton, selectedPhase === phase.id && { backgroundColor: phase.color }]}
              onPress={() => setSelectedPhase(phase.id)}
            >
              <Text style={styles.phaseIcon}>{phase.icon}</Text>
              <ThemedText style={[styles.phaseText, selectedPhase === phase.id && styles.phaseTextSelected]}>
                {phase.name}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.contentSection}>
          <ThemedText style={styles.sectionTitle}>
            {selectedPhase === 'past' && '📚 Past Achievements'}
            {selectedPhase === 'current' && '🎯 Current Progress'}
            {selectedPhase === 'future' && '🚀 Future Goals'}
          </ThemedText>
          
          {filteredMilestones.map(renderMilestoneCard)}
        </View>

        <View style={styles.contentSection}>
          <ThemedText style={styles.sectionTitle}>🎯 Active Goals</ThemedText>
          {goals.map(renderGoalCard)}
        </View>

        <View style={styles.contentSection}>
          <ThemedText style={styles.sectionTitle}>📊 Journey Statistics</ThemedText>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>75%</Text>
              <ThemedText style={styles.statLabel}>Overall Progress</ThemedText>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>4</Text>
              <ThemedText style={styles.statLabel}>Completed Milestones</ThemedText>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>2</Text>
              <ThemedText style={styles.statLabel}>Years to University</ThemedText>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>12</Text>
              <ThemedText style={styles.statLabel}>Active Goals</ThemedText>
            </View>
          </View>
        </View>
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
  phaseContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 10,
  },
  phaseButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  phaseIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  phaseText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  phaseTextSelected: {
    color: '#ffffff',
  },
  contentSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  milestoneCard: {
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
  milestoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  milestoneTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  milestoneDate: {
    fontSize: 14,
    color: '#64748b',
  },
  milestoneDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusCompleted: {
    backgroundColor: '#10b981',
    color: '#ffffff',
  },
  statusInProgress: {
    backgroundColor: '#f59e0b',
    color: '#ffffff',
  },
  statusUpcoming: {
    backgroundColor: '#3b82f6',
    color: '#ffffff',
  },
  goalCard: {
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
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalCategory: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e293b',
  },
  priorityBadge: {
    fontSize: 10,
    fontWeight: '600',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityHigh: {
    backgroundColor: '#ef4444',
    color: '#ffffff',
  },
  priorityMedium: {
    backgroundColor: '#f59e0b',
    color: '#ffffff',
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  goalTarget: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 2,
  },
  goalDeadline: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    marginBottom: 8,
    position: 'relative',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#010066',
    borderRadius: 4,
  },
  progressText: {
    position: 'absolute',
    right: 8,
    top: -8,
    fontSize: 12,
    fontWeight: '600',
    color: '#1e293b',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#010066',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
});
