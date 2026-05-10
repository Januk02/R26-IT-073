import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const Roadmap: React.FC = () => {
  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <ThemedText type="title" style={styles.title}>Academic Roadmap</ThemedText>
        <ThemedText style={styles.subtitle}>Your personalized learning and development path</ThemedText>
        
        <View style={styles.timeline}>
          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, { backgroundColor: '#28a745' }]} />
            <View style={styles.timelineContent}>
              <ThemedText type="subtitle" style={styles.timelineTitle}>Current: A/L Preparation</ThemedText>
              <ThemedText style={styles.timelineDescription}>Focus on Mathematics, Physics, and Chemistry</ThemedText>
              <ThemedText style={styles.timelineDate}>2024 - Present</ThemedText>
            </View>
          </View>

          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, { backgroundColor: '#007bff' }]} />
            <View style={styles.timelineContent}>
              <ThemedText type="subtitle" style={styles.timelineTitle}>University: BSc Computer Science</ThemedText>
              <ThemedText style={styles.timelineDescription}>University of Colombo or University of Moratuwa</ThemedText>
              <ThemedText style={styles.timelineDate}>2025 - 2029</ThemedText>
            </View>
          </View>

          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, { backgroundColor: '#6f42c1' }]} />
            <View style={styles.timelineContent}>
              <ThemedText type="subtitle" style={styles.timelineTitle}>Graduate Studies: MSc AI/ML</ThemedText>
              <ThemedText style={styles.timelineDescription}>Specialization in Artificial Intelligence</ThemedText>
              <ThemedText style={styles.timelineDate}>2029 - 2031</ThemedText>
            </View>
          </View>

          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, { backgroundColor: '#fd7e14' }]} />
            <View style={styles.timelineContent}>
              <ThemedText type="subtitle" style={styles.timelineTitle}>Career: Senior Software Engineer</ThemedText>
              <ThemedText style={styles.timelineDescription}>Leading tech companies or startups</ThemedText>
              <ThemedText style={styles.timelineDate}>2031 - Present</ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <ThemedText type="subtitle" style={styles.cardTitle}>Milestones & Certifications</ThemedText>
          <View style={styles.milestoneList}>
            <View style={styles.milestoneItem}>
              <View style={[styles.milestoneDot, { backgroundColor: '#28a745' }]} />
              <View style={styles.milestoneContent}>
                <ThemedText style={styles.milestoneTitle}>Complete A/L with Z-Score &gt; 2.0</ThemedText>
                <ThemedText style={styles.milestoneStatus}>In Progress</ThemedText>
              </View>
            </View>
            <View style={styles.milestoneItem}>
              <View style={[styles.milestoneDot, { backgroundColor: '#6c757d' }]} />
              <View style={styles.milestoneContent}>
                <ThemedText style={styles.milestoneTitle}>Learn Python & JavaScript</ThemedText>
                <ThemedText style={styles.milestoneStatus}>Upcoming</ThemedText>
              </View>
            </View>
            <View style={styles.milestoneItem}>
              <View style={[styles.milestoneDot, { backgroundColor: '#6c757d' }]} />
              <View style={styles.milestoneContent}>
                <ThemedText style={styles.milestoneTitle}>Get AWS Certification</ThemedText>
                <ThemedText style={styles.milestoneStatus}>Upcoming</ThemedText>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <ThemedText type="subtitle" style={styles.cardTitle}>Recommended Courses</ThemedText>
          <View style={styles.courseList}>
            <TouchableOpacity style={styles.courseItem}>
              <ThemedText style={styles.courseTitle}>Introduction to Programming</ThemedText>
              <ThemedText style={styles.courseProvider}>Coursera</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.courseItem}>
              <ThemedText style={styles.courseTitle}>Data Structures & Algorithms</ThemedText>
              <ThemedText style={styles.courseProvider}>edX</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.courseItem}>
              <ThemedText style={styles.courseTitle}>Web Development Bootcamp</ThemedText>
              <ThemedText style={styles.courseProvider}>Udemy</ThemedText>
            </TouchableOpacity>
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
  timeline: {
    marginBottom: 30,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 30,
    alignItems: 'flex-start',
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 16,
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#2563EB',
  },
  timelineTitle: {
    marginBottom: 8,
    color: '#010066',
  },
  timelineDescription: {
    marginBottom: 8,
    opacity: 0.8,
    color: '#010066',
  },
  timelineDate: {
    fontSize: 12,
    opacity: 0.6,
    fontWeight: '600',
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
  milestoneList: {
    gap: 16,
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  milestoneDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  milestoneContent: {
    flex: 1,
  },
  milestoneTitle: {
    fontSize: 14,
    marginBottom: 4,
    color: '#010066',
  },
  milestoneStatus: {
    fontSize: 12,
    opacity: 0.7,
    fontStyle: 'italic',
    color: '#010066',
  },
  courseList: {
    gap: 12,
  },
  courseItem: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#2563EB',
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#010066',
  },
  courseProvider: {
    fontSize: 12,
    opacity: 0.7,
    color: '#010066',
  },
});

export default Roadmap;
