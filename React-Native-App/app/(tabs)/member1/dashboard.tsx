import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';

const quickStats = [
    {
      label: 'Profile Completion',
      value: '75%',
      color: '#FFFFFF',
      bgColor: '#010066',
      borderColor: '#010066',
    },
    {
      label: 'Recommendations',
      value: '8',
      color: '#FFFFFF',
      bgColor: '#F7931E',
      borderColor: '#F7931E',
    },
    {
      label: 'Career Matches',
      value: '12',
      color: '#010066',
      bgColor: '#FFFFFF',
      borderColor: '#2563EB',
    },
    {
      label: 'Universities',
      value: '15',
      color: '#010066',
      bgColor: '#FFFFFF',
      borderColor: '#2563EB',
    },
  ];

const Member1Dashboard: React.FC = () => {
  const router = useRouter();
  const [animatedValues] = useState(
    quickStats.map(() => new Animated.Value(0))
  );

  useEffect(() => {
    const startAnimations = () => {
      animatedValues.forEach((animValue, index) => {
        setTimeout(() => {
          Animated.spring(animValue, {
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }).start();
        }, index * 200);
      });
    };

    // Start initial animations
    startAnimations();

    // Set up looping animations
    const interval = setInterval(() => {
      animatedValues.forEach((animValue) => {
        Animated.sequence([
          Animated.spring(animValue, {
            toValue: 0.8,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.spring(animValue, {
            toValue: 1.1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.spring(animValue, {
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }, 5000); // Loop every 5 seconds

    return () => {
      clearInterval(interval);
    };
  }, []);

  const features = [
    {
      id: 'recommendations',
      name: 'Choose Degree',
      description: 'Find your perfect university & degree',
      icon: '🎓',
      bgColor: '#2563EB',
      textColor: '#000000',
      borderColor: '#2563EB',
      route: '/member1/member1-recommendation',
    },
    {
      id: 'future-dream-advisor',
      name: 'Dream Path',
      description: 'AI-powered degree pathway recommendation',
      icon: '🎯',
      bgColor: '#010066',
      textColor: '#000000',
      borderColor: '#010066',
      route: '/member1/future-dream-advisor',
    },
    {
      id: 'profile',
      name: 'My Info',
      description: 'Manage your profile details',
      icon: '👤',
      bgColor: '#F7931E',
      textColor: '#000000',
      borderColor: '#F7931E',
      route: '/member1/profile',
    },
    {
      id: 'analytics',
      name: 'Insights',
      description: 'Career prospects and trends',
      icon: '📈',
      bgColor: '#FFFFFF',
      textColor: '#000000',
      borderColor: '#2563EB',
      route: '/member1/analytics',
    },
    {
      id: 'roadmap',
      name: 'Journey',
      description: 'Your learning development path',
      icon: '🗺️',
      bgColor: '#010066',
      textColor: '#000000',
      borderColor: '#010066',
      route: '/member1/roadmap',
    },
    {
      id: 'resources',
      name: 'Materials',
      description: 'Access study resources',
      icon: '📚',
      bgColor: '#2563EB',
      textColor: '#000000',
      borderColor: '#2563EB',
      route: '/member1/resources',
    },
  ];

  const handleFeaturePress = (route: string) => {
    router.push(route as any);
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>FutureDream Degree Advisor</ThemedText>
          <ThemedText style={styles.subtitle}>
            Your personalized career guidance platform
          </ThemedText>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Quick Stats</ThemedText>
          <View style={styles.statsGrid}>
            {quickStats.map((stat, index) => (
              <Animated.View 
                key={index} 
                style={[
                  styles.statCard, 
                  { 
                    backgroundColor: stat.bgColor,
                    borderColor: stat.borderColor,
                    borderLeftColor: stat.borderColor,
                    transform: [
                      {
                        scale: animatedValues[index].interpolate({
                          inputRange: [0, 0.5, 1],
                          outputRange: [0.8, 1.1, 1],
                        })
                      },
                      {
                        translateY: animatedValues[index].interpolate({
                          inputRange: [0, 1],
                          outputRange: [20, 0],
                        })
                      }
                    ]
                  }
                ]}
              >
                <ThemedText style={[styles.statValue, { color: stat.color }]}>{stat.value}</ThemedText>
                <ThemedText style={[styles.statLabel, { color: stat.color }]}>{stat.label}</ThemedText>
              </Animated.View>
            ))}
          </View>
        </View>

        {/* Features Grid */}
        <View style={styles.featuresContainer}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Features</ThemedText>
          <View style={styles.featuresGrid}>
            {[0, 2, 4].map((startIndex) => (
              <View key={startIndex} style={styles.featureRow}>
                {features.slice(startIndex, startIndex + 2).map((feature) => (
                  <TouchableOpacity
                    key={feature.id}
                    style={styles.featureItem}
                    onPress={() => handleFeaturePress(feature.route)}
                  >
                    <View style={styles.featureIconContainer}>
                      <Text style={styles.featureIconLarge}>{feature.icon}</Text>
                    </View>
                    <ThemedText style={styles.featureTitle}>{feature.name}</ThemedText>
                    <ThemedText style={styles.featureDescription}>{feature.description}</ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.activityContainer}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Recent Activity</ThemedText>
          <View style={styles.activityList}>
            <View style={styles.activityItem}>
              <View style={[styles.activityDot, { backgroundColor: '#28a745' }]} />
              <View style={styles.activityContent}>
                <ThemedText style={styles.activityTitle}>Profile Updated</ThemedText>
                <ThemedText style={styles.activityTime}>2 hours ago</ThemedText>
              </View>
            </View>
            <View style={styles.activityItem}>
              <View style={[styles.activityDot, { backgroundColor: '#007bff' }]} />
              <View style={styles.activityContent}>
                <ThemedText style={styles.activityTitle}>New Recommendations Available</ThemedText>
                <ThemedText style={styles.activityTime}>1 day ago</ThemedText>
              </View>
            </View>
            <View style={styles.activityItem}>
              <View style={[styles.activityDot, { backgroundColor: '#fd7e14' }]} />
              <View style={styles.activityContent}>
                <ThemedText style={styles.activityTitle}>Career Analysis Completed</ThemedText>
                <ThemedText style={styles.activityTime}>3 days ago</ThemedText>
              </View>
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
  header: {
    marginBottom: 30,
    alignItems: 'center',
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
  sectionTitle: {
    marginBottom: 16,
    fontWeight: '600',
    color: '#010066',
  },
  statsContainer: {
    marginBottom: 30,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 6,
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    opacity: 0.9,
  },
  featuresContainer: {
    marginBottom: 30,
  },
  featuresGrid: {
    gap: 20,
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  featureItem: {
    alignItems: 'center',
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#2563EB',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F7931E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  featureIconLarge: {
    fontSize: 36,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#010066',
    textAlign: 'center',
    marginBottom: 6,
  },
  featureDescription: {
    fontSize: 12,
    color: '#010066',
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 16,
  },
  featureFooter: {
    alignItems: 'flex-end',
  },
  featureArrow: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  activityContainer: {
    marginBottom: 30,
  },
  activityList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#000033',
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
    color: '#010066',
  },
  activityTime: {
    fontSize: 12,
    opacity: 0.6,
    color: '#010066',
  },
});

export default Member1Dashboard;
