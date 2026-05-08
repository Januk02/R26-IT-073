import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function Member2Screen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Member 2</ThemedText>
      <ThemedText>Member 2 content goes here</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
});
