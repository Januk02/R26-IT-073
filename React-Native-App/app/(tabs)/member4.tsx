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

export default function Member4Screen() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!input.trim()) {
      Alert.alert('Error', 'Please enter some input');
      return;
    }

    setLoading(true);
    try {
      // TODO: Connect to your Colab-trained model here
      const response = await callMLModel(input);
      setOutput(response);
    } catch (error) {
      Alert.alert('Error', 'Failed to process input');
    } finally {
      setLoading(false);
    }
  };

  // Placeholder function for ML model integration
  const callMLModel = async (userInput: string): Promise<string> => {
    // This is where you'll integrate your Colab-trained model
    // For now, return a placeholder response
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`Model response to: "${userInput}"`);
      }, 1000);
    });
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <ThemedView style={styles.header}>
          <ThemedText style={styles.title}>Member 4 - AI Assistant</ThemedText>
          <ThemedText style={styles.subtitle}>Connect with your trained model</ThemedText>
        </ThemedView>

        <ThemedView style={styles.inputSection}>
          <ThemedText style={styles.label}>Enter your input:</ThemedText>
          <TextInput
            style={styles.textInput}
            value={input}
            onChangeText={setInput}
            placeholder="Type your question or input here..."
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </ThemedView>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <ThemedText style={styles.submitButtonText}>
            {loading ? 'Processing...' : 'Get Response'}
          </ThemedText>
        </TouchableOpacity>

        {output && (
          <ThemedView style={styles.outputSection}>
            <ThemedText style={styles.label}>Model Response:</ThemedText>
            <ThemedView style={styles.outputBox}>
              <ThemedText style={styles.outputText}>{output}</ThemedText>
            </ThemedView>
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
  inputSection: {
    padding: 20,
    backgroundColor: '#ffffff',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9fafb',
    minHeight: 100,
  },
  submitButton: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  outputSection: {
    padding: 20,
    backgroundColor: '#ffffff',
  },
  outputBox: {
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  outputText: {
    fontSize: 16,
    color: '#1f2937',
    lineHeight: 24,
  },
});
