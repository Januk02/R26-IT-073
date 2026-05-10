import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image, TouchableOpacity } from 'react-native';
import { CareerProvider } from './CareerContext'; // <-- Import it here

export default function CareerModuleLayout() {
    const router = useRouter();

    return (
        <CareerProvider>
            <Tabs screenOptions={{ 
                tabBarActiveTintColor: '#2563EB', 
                headerShown: true,
                headerStyle: { backgroundColor: '#1A2B4A' },
                headerTintColor: '#fff',
                headerTitleAlign: 'left',
                headerTitle: () => <Image source={require('../../assets/logos/main logo white.png')} style={{width: 120, height: 40, resizeMode: 'contain'}} />,
                headerLeft: () => (
                    <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 15 }}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                )
            }}>
                <Tabs.Screen
                    name="index"
                    options={{ title: 'Dashboard', tabBarIcon: ({ color }) => <Ionicons name="home-outline" size={24} color={color} /> }}
                />
                <Tabs.Screen
                    name="analyzer"
                    options={{ title: 'AI Analyzer', tabBarIcon: ({ color }) => <Ionicons name="analytics-outline" size={24} color={color} /> }}
                />
                <Tabs.Screen
                    name="CareerContext"
                    options={{ href: null }}
                />
            </Tabs>
        </CareerProvider>
    );
}