import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const Resources: React.FC = () => {
  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <ThemedText type="title" style={styles.title}>Learning Resources</ThemedText>
        <ThemedText style={styles.subtitle}>Access study materials and preparation resources</ThemedText>
        
        <View style={styles.card}>
          <ThemedText type="subtitle" style={styles.cardTitle}>A/L Preparation</ThemedText>
          <View style={styles.resourceList}>
            <TouchableOpacity style={styles.resourceItem}>
              <ThemedText style={styles.resourceTitle}>Mathematics Past Papers</ThemedText>
              <ThemedText style={styles.resourceDescription}>2019-2024 A/L Mathematics Papers</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.resourceItem}>
              <ThemedText style={styles.resourceTitle}>Physics Tutorial Videos</ThemedText>
              <ThemedText style={styles.resourceDescription}>Comprehensive video lessons</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.resourceItem}>
              <ThemedText style={styles.resourceTitle}>Chemistry Lab Guides</ThemedText>
              <ThemedText style={styles.resourceDescription}>Practical experiment guides</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <ThemedText type="subtitle" style={styles.cardTitle}>Programming Skills</ThemedText>
          <View style={styles.resourceList}>
            <TouchableOpacity style={styles.resourceItem}>
              <ThemedText style={styles.resourceTitle}>Python for Beginners</ThemedText>
              <ThemedText style={styles.resourceDescription}>Start your coding journey</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.resourceItem}>
              <ThemedText style={styles.resourceTitle}>Web Development</ThemedText>
              <ThemedText style={styles.resourceDescription}>HTML, CSS, JavaScript basics</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.resourceItem}>
              <ThemedText style={styles.resourceTitle}>Data Science Fundamentals</ThemedText>
              <ThemedText style={styles.resourceDescription}>Introduction to data analysis</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <ThemedText type="subtitle" style={styles.cardTitle}>University Preparation</ThemedText>
          <View style={styles.resourceList}>
            <TouchableOpacity style={styles.resourceItem}>
              <ThemedText style={styles.resourceTitle}>University Entrance Guide</ThemedText>
              <ThemedText style={styles.resourceDescription}>Application process and requirements</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.resourceItem}>
              <ThemedText style={styles.resourceTitle}>Scholarship Opportunities</ThemedText>
              <ThemedText style={styles.resourceDescription}>Financial aid information</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.resourceItem}>
              <ThemedText style={styles.resourceTitle}>Campus Life Guide</ThemedText>
              <ThemedText style={styles.resourceDescription}>What to expect at university</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <ThemedText type="subtitle" style={styles.cardTitle}>Career Development</ThemedText>
          <View style={styles.resourceList}>
            <TouchableOpacity style={styles.resourceItem}>
              <ThemedText style={styles.resourceTitle}>Resume Building</ThemedText>
              <ThemedText style={styles.resourceDescription}>Create professional resumes</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.resourceItem}>
              <ThemedText style={styles.resourceTitle}>Interview Skills</ThemedText>
              <ThemedText style={styles.resourceDescription}>Prepare for job interviews</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.resourceItem}>
              <ThemedText style={styles.resourceTitle}>Internship Guide</ThemedText>
              <ThemedText style={styles.resourceDescription}>Find and secure internships</ThemedText>
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
  resourceList: {
    gap: 12,
  },
  resourceItem: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#000033',
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#010066',
  },
  resourceDescription: {
    fontSize: 14,
    opacity: 0.7,
    color: '#010066',
  },
});

export default Resources;
