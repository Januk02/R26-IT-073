import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function MaterialsScreen() {
  const [selectedCategory, setSelectedCategory] = useState('study');

  const categories = [
    { id: 'study', name: 'Study Resources', icon: '📚' },
    { id: 'university', name: 'University Guides', icon: '🎓' },
    { id: 'career', name: 'Career Resources', icon: '💼' },
    { id: 'videos', name: 'Video Tutorials', icon: '🎥' },
    { id: 'downloads', name: 'Downloads', icon: '📥' },
  ];

  const materials = {
    study: [
      {
        title: 'A/L Mathematics Past Papers',
        description: 'Complete collection of past papers from 2015-2023',
        type: 'PDF',
        size: '45 MB',
        subject: 'Mathematics',
        downloadUrl: '#',
      },
      {
        title: 'Physics Formula Sheet',
        description: 'Essential formulas and equations for A/L Physics',
        type: 'PDF',
        size: '2 MB',
        subject: 'Physics',
        downloadUrl: '#',
      },
      {
        title: 'Chemistry Practical Guide',
        description: 'Step-by-step guide for A/L Chemistry practicals',
        type: 'PDF',
        size: '8 MB',
        subject: 'Chemistry',
        downloadUrl: '#',
      },
      {
        title: 'Biology Notes & Diagrams',
        description: 'Comprehensive notes with detailed diagrams',
        type: 'PDF',
        size: '25 MB',
        subject: 'Biology',
        downloadUrl: '#',
      },
    ],
    university: [
      {
        title: 'University Application Guide 2024',
        description: 'Complete guide for Sri Lankan university applications',
        type: 'PDF',
        size: '12 MB',
        subject: 'General',
        downloadUrl: '#',
      },
      {
        title: 'Z-Score Calculation Methods',
        description: 'How to calculate and understand Z-scores',
        type: 'PDF',
        size: '3 MB',
        subject: 'General',
        downloadUrl: '#',
      },
      {
        title: 'University Selection Criteria',
        description: 'Requirements for all major universities',
        type: 'PDF',
        size: '6 MB',
        subject: 'General',
        downloadUrl: '#',
      },
    ],
    career: [
      {
        title: 'Interview Preparation Guide',
        description: 'Tips and tricks for job interviews',
        type: 'PDF',
        size: '4 MB',
        subject: 'Career',
        downloadUrl: '#',
      },
      {
        title: 'Resume Building Templates',
        description: 'Professional resume templates for fresh graduates',
        type: 'DOCX',
        size: '1 MB',
        subject: 'Career',
        downloadUrl: '#',
      },
      {
        title: 'Skills Development Roadmap',
        description: 'Guide to developing in-demand skills',
        type: 'PDF',
        size: '5 MB',
        subject: 'Career',
        downloadUrl: '#',
      },
    ],
    videos: [
      {
        title: 'A/L Mathematics - Advanced Calculus',
        description: 'Complete calculus course for A/L students',
        type: 'Video',
        duration: '2h 30m',
        subject: 'Mathematics',
        videoUrl: '#',
      },
      {
        title: 'Physics Lab Experiments',
        description: 'Step-by-step physics practical demonstrations',
        type: 'Video',
        duration: '1h 45m',
        subject: 'Physics',
        videoUrl: '#',
      },
      {
        title: 'Chemistry Organic Reactions',
        description: 'Visual guide to organic chemistry reactions',
        type: 'Video',
        duration: '3h 15m',
        subject: 'Chemistry',
        videoUrl: '#',
      },
    ],
    downloads: [
      {
        title: 'Study Planner Template',
        description: ' Printable study planner for A/L preparation',
        type: 'PDF',
        size: '1 MB',
        subject: 'Tools',
        downloadUrl: '#',
      },
      {
        title: 'Goal Setting Worksheet',
        description: 'Worksheet for academic and career goals',
        type: 'PDF',
        size: '500 KB',
        subject: 'Tools',
        downloadUrl: '#',
      },
      {
        title: 'Progress Tracker Template',
        description: 'Track your academic progress effectively',
        type: 'Excel',
        size: '2 MB',
        subject: 'Tools',
        downloadUrl: '#',
      },
    ],
  };

  const renderMaterialCard = (material: any) => (
    <TouchableOpacity key={material.title} style={styles.materialCard}>
      <View style={styles.materialHeader}>
        <View style={styles.materialInfo}>
          <ThemedText style={styles.materialTitle}>{material.title}</ThemedText>
          <ThemedText style={styles.materialDescription}>{material.description}</ThemedText>
        </View>
        <View style={styles.materialMeta}>
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>{material.type}</Text>
          </View>
          <Text style={styles.sizeText}>
            {material.type === 'Video' ? material.duration : material.size}
          </Text>
        </View>
      </View>
      <View style={styles.materialFooter}>
        <View style={styles.subjectBadge}>
          <Text style={styles.subjectText}>{material.subject}</Text>
        </View>
        <TouchableOpacity style={styles.downloadButton}>
          <Text style={styles.downloadButtonText}>
            {material.type === 'Video' ? 'Watch' : 'Download'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const currentMaterials = materials[selectedCategory as keyof typeof materials] || [];

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>📚 Study Materials & Resources</ThemedText>
          <ThemedText style={styles.subtitle}>Access comprehensive learning materials for your academic journey</ThemedText>
        </View>

        <View style={styles.categoryContainer}>
          {categories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[styles.categoryButton, selectedCategory === category.id && styles.categoryButtonSelected]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <ThemedText style={[styles.categoryText, selectedCategory === category.id && styles.categoryTextSelected]}>
                {category.name}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.contentSection}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>
              {categories.find(c => c.id === selectedCategory)?.name}
            </ThemedText>
            <Text style={styles.materialCount}>{currentMaterials.length} items</Text>
          </View>
          
          {currentMaterials.map(renderMaterialCard)}
        </View>

        <View style={styles.contentSection}>
          <ThemedText style={styles.sectionTitle}>📖 Recommended Resources</ThemedText>
          <View style={styles.recommendationCard}>
            <ThemedText style={styles.recommendationTitle}>A/L Preparation Bundle</ThemedText>
            <ThemedText style={styles.recommendationDescription}>
              Complete package including past papers, notes, and practice tests for all A/L subjects
            </ThemedText>
            <View style={styles.recommendationMeta}>
              <Text style={styles.recommendationPrice}>Free</Text>
              <TouchableOpacity style={styles.recommendationButton}>
                <Text style={styles.recommendationButtonText}>Get Bundle</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.contentSection}>
          <ThemedText style={styles.sectionTitle}>📊 Your Learning Progress</ThemedText>
          <View style={styles.progressGrid}>
            <View style={styles.progressCard}>
              <Text style={styles.progressNumber}>12</Text>
              <ThemedText style={styles.progressLabel}>Materials Downloaded</ThemedText>
            </View>
            <View style={styles.progressCard}>
              <Text style={styles.progressNumber}>8</Text>
              <ThemedText style={styles.progressLabel}>Videos Watched</ThemedText>
            </View>
            <View style={styles.progressCard}>
              <Text style={styles.progressNumber}>45h</Text>
              <ThemedText style={styles.progressLabel}>Study Time</ThemedText>
            </View>
            <View style={styles.progressCard}>
              <Text style={styles.progressNumber}>85%</Text>
              <ThemedText style={styles.progressLabel}>Completion Rate</ThemedText>
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
  contentSection: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  materialCount: {
    fontSize: 14,
    color: '#64748b',
  },
  materialCard: {
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
  materialHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  materialInfo: {
    flex: 1,
  },
  materialTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  materialDescription: {
    fontSize: 14,
    color: '#64748b',
  },
  materialMeta: {
    alignItems: 'flex-end',
  },
  typeBadge: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 4,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e293b',
  },
  sizeText: {
    fontSize: 12,
    color: '#64748b',
  },
  materialFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subjectBadge: {
    backgroundColor: '#f0f9ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  subjectText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0369a1',
  },
  downloadButton: {
    backgroundColor: '#010066',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  downloadButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  recommendationCard: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#f59e0b',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  recommendationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  recommendationDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
  },
  recommendationMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recommendationPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10b981',
  },
  recommendationButton: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  recommendationButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  progressGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  progressCard: {
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
  progressNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#010066',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
});
