import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CareerProvider } from './CareerContext'; // <-- Import it here

export default function CareerModuleLayout() {
    return (
        <CareerProvider>  {/* <-- Wrap everything inside this */}
            <Tabs screenOptions={{ tabBarActiveTintColor: '#2563EB', headerShown: false }}>
                <Tabs.Screen
                    name="index"
                    options={{ title: 'Dashboard', tabBarIcon: ({ color }) => <Ionicons name="home-outline" size={24} color={color} /> }}
                />
                <Tabs.Screen
                    name="analyzer"
                    options={{ title: 'AI Analyzer', tabBarIcon: ({ color }) => <Ionicons name="analytics-outline" size={24} color={color} /> }}
                />
            </Tabs>
        </CareerProvider>
    );
}