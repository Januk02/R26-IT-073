import { Stack } from 'expo-router';
import React from 'react';

export default function Member1Layout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
          title: 'Member 1',
        }}
      />
      <Stack.Screen
        name="dashboard"
        options={{
          headerShown: true,
          title: 'Member 1 Dashboard',
        }}
      />
      <Stack.Screen
        name="future-dream-advisor"
        options={{
          headerShown: true,
          title: 'Future Dream Advisor',
        }}
      />
      <Stack.Screen
        name="member1-recommendation"
        options={{
          headerShown: true,
          title: 'My Recommendations',
        }}
      />
      <Stack.Screen
        name="profile"
        options={{
          headerShown: true,
          title: 'My Profile',
        }}
      />
      <Stack.Screen
        name="analytics"
        options={{
          headerShown: true,
          title: 'Career Analytics',
        }}
      />
      <Stack.Screen
        name="roadmap"
        options={{
          headerShown: true,
          title: 'Academic Roadmap',
        }}
      />
      <Stack.Screen
        name="resources"
        options={{
          headerShown: true,
          title: 'Learning Resources',
        }}
      />
    </Stack>
  );
}
