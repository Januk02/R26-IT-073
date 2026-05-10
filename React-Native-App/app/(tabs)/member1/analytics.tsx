import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const Analytics: React.FC = () => {
  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <ThemedText type="title" style={styles.title}>Career Analytics</ThemedText>
        <ThemedText style={styles.subtitle}>Analyze career prospects and market trends</ThemedText>
        
        <View style={styles.card}>
          <ThemedText type="subtitle" style={styles.cardTitle}>Market Trends</ThemedText>
          <View style={styles.trendItem}>
            <ThemedText style={styles.trendTitle}>Software Engineering</ThemedText>
            <ThemedText style={styles.trendValue}>+15% Growth</ThemedText>
          </View>
          <View style={styles.trendItem}>
            <ThemedText style={styles.trendTitle}>Data Science</ThemedText>
            <ThemedText style={styles.trendValue}>+22% Growth</ThemedText>
          </View>
          <View style={styles.trendItem}>
            <ThemedText style={styles.trendTitle}>Healthcare</ThemedText>
            <ThemedText style={styles.trendValue}>+8% Growth</ThemedText>
          </View>
        </View>

        <View style={styles.card}>
          <ThemedText type="subtitle" style={styles.cardTitle}>Your Career Match Score</ThemedText>
          <View style={styles.scoreContainer}>
            <ThemedText style={styles.scoreValue}>85%</ThemedText>
            <ThemedText style={styles.scoreLabel}>Overall Match</ThemedText>
          </View>
          <View style={styles.scoreBreakdown}>
            <View style={styles.scoreItem}>
              <ThemedText style={styles.scoreItemLabel}>Academic Fit</ThemedText>
              <ThemedText style={styles.scoreItemValue}>90%</ThemedText>
            </View>
            <View style={styles.scoreItem}>
              <ThemedText style={styles.scoreItemLabel}>Personality Match</ThemedText>
              <ThemedText style={styles.scoreItemValue}>82%</ThemedText>
            </View>
            <View style={styles.scoreItem}>
              <ThemedText style={styles.scoreItemLabel}>Market Demand</ThemedText>
              <ThemedText style={styles.scoreItemValue}>88%</ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <ThemedText type="subtitle" style={styles.cardTitle}>Recommended Skills</ThemedText>
          <View style={styles.skillList}>
            <View style={styles.skillItem}>
              <ThemedText style={styles.skillName}>Programming</ThemedText>
              <ThemedText style={styles.skillLevel}>Advanced</ThemedText>
            </View>
            <View style={styles.skillItem}>
              <ThemedText style={styles.skillName}>Data Analysis</ThemedText>
              <ThemedText style={styles.skillLevel}>Intermediate</ThemedText>
            </View>
            <View style={styles.skillItem}>
              <ThemedText style={styles.skillName}>Communication</ThemedText>
              <ThemedText style={styles.skillLevel}>Advanced</ThemedText>
            </View>
          </View>
        </View>
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
  trendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2563EB',
  },
  trendTitle: {
    fontSize: 16,
    color: '#010066',
  },
  trendValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#28a745',
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#F7931E',
  },
  scoreLabel: {
    fontSize: 16,
    opacity: 0.7,
    color: '#010066',
  },
  scoreBreakdown: {
    gap: 12,
  },
  scoreItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreItemLabel: {
    fontSize: 14,
    color: '#010066',
  },
  scoreItemValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#010066',
  },
  skillList: {
    gap: 12,
  },
  skillItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  skillName: {
    fontSize: 16,
    color: '#010066',
  },
  skillLevel: {
    fontSize: 14,
    fontWeight: '600',
    backgroundColor: '#F7931E',
    color: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
});

export default Analytics;
