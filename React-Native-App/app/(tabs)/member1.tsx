import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  PermissionsAndroid,
  Platform,
  Linking,
  Dimensions,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

// Interface for university with distance
interface UniversityWithDistance {
  id: number;
  name: string;
  shortName: string;
  type: string;
  location: { lat: number; lng: number };
  address: string;
  faculties: string[];
  website: string;
  phone: string;
  distance: number;
}

// Sri Lankan Universities Data
const SRI_LANKA_UNIVERSITIES = [
  // GOVERNMENT UNIVERSITIES
  {
    id: 1,
    name: "University of Colombo",
    shortName: "UOC",
    type: "Government",
    location: { lat: 6.9271, lng: 79.8612 },
    address: "Colombo 03, Sri Lanka",
    faculties: ["Medicine", "Science", "Engineering", "Arts", "Management"],
    website: "https://cmb.ac.lk",
    phone: "+94 11 2 581111"
  },
  {
    id: 2,
    name: "University of Peradeniya",
    shortName: "UOP",
    type: "Government", 
    location: { lat: 7.2565, lng: 80.5949 },
    address: "Peradeniya, Sri Lanka",
    faculties: ["Agriculture", "Arts", "Dental", "Engineering", "Medicine", "Science", "Veterinary"],
    website: "https://pdn.ac.lk",
    phone: "+94 81 2 385201"
  },
  {
    id: 3,
    name: "University of Kelaniya",
    shortName: "UOK",
    type: "Government",
    location: { lat: 6.9767, lng: 79.9169 },
    address: "Kelaniya, Sri Lanka", 
    faculties: ["Science", "Medicine", "Agriculture", "Social Sciences"],
    website: "https://kln.ac.lk",
    phone: "+94 11 2 904001"
  },
  {
    id: 4,
    name: "University of Sri Jayewardenepura",
    shortName: "USJ",
    type: "Government",
    location: { lat: 6.8512, lng: 79.9212 },
    address: "Gangodawila, Nugegoda, Sri Lanka",
    faculties: ["Applied Sciences", "Management Studies", "Social Sciences"],
    website: "https://sjp.ac.lk",
    phone: "+94 11 2 751448"
  },
  {
    id: 5,
    name: "University of Moratuwa",
    shortName: "UOM",
    type: "Government",
    location: { lat: 6.7951, lng: 79.9009 },
    address: "Moratuwa, Sri Lanka",
    faculties: ["Architecture", "Engineering", "Information Technology", "Town & Country Planning"],
    website: "https://moratuwa.ac.lk",
    phone: "+94 11 2 650654"
  },
  {
    id: 6,
    name: "University of Ruhuna",
    shortName: "UOR",
    type: "Government",
    location: { lat: 5.9449, lng: 80.5354 },
    address: "Matara, Sri Lanka",
    faculties: ["Agriculture", "Fisheries", "Humanities", "Medicine", "Science"],
    website: "https://ruhuna.ac.lk",
    phone: "+94 41 2 222651"
  },
  {
    id: 7,
    name: "Eastern University",
    shortName: "EUSL",
    type: "Government",
    location: { lat: 7.3167, lng: 81.7167 },
    address: "Chenkalady, Sri Lanka",
    faculties: ["Agriculture", "Arts", "Commerce", "Science"],
    website: "https://esn.ac.lk",
    phone: "+94 65 2 252001"
  },
  {
    id: 8,
    name: "South Eastern University",
    shortName: "SEUSL", 
    type: "Government",
    location: { lat: 6.6167, lng: 81.8500 },
    address: "Oluvil, Sri Lanka",
    faculties: ["Arts & Culture", "Management", "Science"],
    website: "https://seu.ac.lk",
    phone: "+94 67 2 265001"
  },
  {
    id: 9,
    name: "Rajarata University",
    shortName: "RUSL",
    type: "Government",
    location: { lat: 8.3667, lng: 80.5167 },
    address: "Mihintale, Sri Lanka",
    faculties: ["Agriculture", "Applied Sciences", "Management Studies"],
    website: "https://ruh.ac.lk",
    phone: "+94 55 2 250001"
  },
  {
    id: 10,
    name: "Sabaragamuwa University",
    shortName: "SUSL",
    type: "Government",
    location: { lat: 6.7167, lng: 80.7833 },
    address: "Belihuloya, Sri Lanka",
    faculties: ["Agricultural Sciences", "Applied Sciences", "Management Studies"],
    website: "https://sab.ac.lk",
    phone: "+94 45 3 452000"
  },
  {
    id: 11,
    name: "Wayamba University",
    shortName: "WUSL",
    type: "Government",
    location: { lat: 7.9500, lng: 80.0333 },
    address: "Kuliyapitiya, Sri Lanka",
    faculties: ["Agriculture", "Animal Science", "Applied Sciences"],
    website: "https://wyb.ac.lk",
    phone: "+94 37 2 271000"
  },
  {
    id: 12,
    name: "Uva Wellassa University",
    shortName: "UWU",
    type: "Government",
    location: { lat: 6.7000, lng: 81.1167 },
    address: "Badulla, Sri Lanka",
    faculties: ["Agriculture", "Management", "Science"],
    website: "https://uwu.ac.lk",
    phone: "+94 55 2 255000"
  },
  {
    id: 13,
    name: "University of Jaffna",
    shortName: "UOJ",
    type: "Government",
    location: { lat: 9.6833, lng: 80.0167 },
    address: "Jaffna, Sri Lanka",
    faculties: ["Agriculture", "Arts", "Management", "Medicine", "Science"],
    website: "https://jfn.ac.lk",
    phone: "+94 21 2 222736"
  },
  {
    id: 14,
    name: "University of Visual and Performing Arts",
    shortName: "UVPA",
    type: "Government",
    location: { lat: 6.8833, lng: 79.8833 },
    address: "Colombo 07, Sri Lanka",
    faculties: ["Dance & Drama", "Fine Arts", "Music"],
    website: "https://vpa.ac.lk",
    phone: "+94 11 2 585421"
  },
  {
    id: 15,
    name: "General Sir John Kotelawala Defence University",
    shortName: "KDU",
    type: "Government",
    location: { lat: 6.9500, lng: 79.9167 },
    address: "Ratmalana, Sri Lanka",
    faculties: ["Engineering", "Medicine", "Management", "Social Sciences"],
    website: "https://kdu.ac.lk",
    phone: "+94 11 2 635600"
  },
  {
    id: 16,
    name: "Open University of Sri Lanka",
    shortName: "OUSL",
    type: "Government",
    location: { lat: 6.9167, lng: 79.8833 },
    address: "Nawala, Sri Lanka",
    faculties: ["Education", "Engineering", "Health Sciences", "Management", "Natural Sciences"],
    website: "https://ou.ac.lk",
    phone: "+94 11 2 881001"
  },
  {
    id: 17,
    name: "Buddhist and Pali University",
    shortName: "BPU",
    type: "Government",
    location: { lat: 7.9500, lng: 80.4333 },
    address: "Homagama, Sri Lanka",
    faculties: ["Buddhist Studies", "Pali & Buddhist Civilization"],
    website: "https://bpu.ac.lk",
    phone: "+94 11 2 649000"
  },
  {
    id: 18,
    name: "Sri Lanka Institute of Advanced Technology",
    shortName: "SLIATE",
    type: "Government",
    location: { lat: 7.0833, lng: 79.9667 },
    address: "Dehiwala, Sri Lanka",
    faculties: ["Technology", "Engineering", "Management"],
    website: "https://sliate.ac.lk",
    phone: "+94 11 2 712824"
  },

  // PRIVATE UNIVERSITIES
  {
    id: 19,
    name: "American College",
    shortName: "AC",
    type: "Private",
    location: { lat: 6.9167, lng: 79.8833 },
    address: "Colombo 03, Sri Lanka",
    faculties: ["Business Administration", "Computer Science", "Psychology"],
    website: "https://americancollege.edu.lk",
    phone: "+94 11 2 334896"
  },
  {
    id: 20,
    name: "Asian Institute of Business & Science",
    shortName: "AIBS",
    type: "Private",
    location: { lat: 6.9167, lng: 79.8833 },
    address: "Colombo 04, Sri Lanka",
    faculties: ["Business Management", "IT", "Engineering"],
    website: "https://aibsedu.lk",
    phone: "+94 11 2 506500"
  },
  {
    id: 21,
    name: "Ceylon University College",
    shortName: "CUC",
    type: "Private",
    location: { lat: 6.9333, lng: 79.8500 },
    address: "Marine Drive, Colombo 06, Sri Lanka",
    faculties: ["Business", "IT", "Hospitality Management"],
    website: "https://cuc.edu.lk",
    phone: "+94 11 2 345678"
  },
  {
    id: 22,
    name: "Esoft Metro Campus",
    shortName: "EMC",
    type: "Private",
    location: { lat: 6.8833, lng: 79.8833 },
    address: "Colombo 07, Sri Lanka",
    faculties: ["Computing", "Business", "Engineering"],
    website: "https://esoft.lk",
    phone: "+94 11 2 545555"
  },
  {
    id: 23,
    name: "ICBT Campus",
    shortName: "ICBT",
    type: "Private",
    location: { lat: 6.9167, lng: 79.8833 },
    address: "Colombo 04, Sri Lanka",
    faculties: ["Business", "IT", "Hospitality", "Engineering"],
    website: "https://icbtcampus.edu.lk",
    phone: "+94 11 2 506500"
  },
  {
    id: 24,
    name: "Informatics Institute of Technology",
    shortName: "IIT",
    type: "Private",
    location: { lat: 6.9333, lng: 79.8500 },
    address: "Colombo 06, Sri Lanka",
    faculties: ["Computing", "Business Management", "Software Engineering"],
    website: "https://iit.ac.lk",
    phone: "+94 11 2 506500"
  },
  {
    id: 25,
    name: "Lanka Education & Research Network",
    shortName: "LEARN",
    type: "Private",
    location: { lat: 6.9167, lng: 79.8833 },
    address: "Colombo 07, Sri Lanka",
    faculties: ["Network Technology", "IT", "Cyber Security"],
    website: "https://learn.ac.lk",
    phone: "+94 11 2 345678"
  },
  {
    id: 26,
    name: "London Metropolitan University (Sri Lanka)",
    shortName: "LMU",
    type: "Private",
    location: { lat: 6.9333, lng: 79.8500 },
    address: "Colombo 03, Sri Lanka",
    faculties: ["Business", "IT", "Law", "Psychology"],
    website: "https://londonmet.lk",
    phone: "+94 11 2 345678"
  },
  {
    id: 27,
    name: "NIBM",
    shortName: "NIBM",
    type: "Private",
    location: { lat: 6.9167, lng: 79.8833 },
    address: "Colombo 07, Sri Lanka",
    faculties: ["Business Management", "Computing", "HR Management"],
    website: "https://nibm.lk",
    phone: "+94 11 2 688000"
  },
  {
    id: 28,
    name: "NSBM Green University",
    shortName: "NSBM",
    type: "Private",
    location: { lat: 6.8167, lng: 79.9500 },
    address: "Pitipana, Homagama, Sri Lanka",
    faculties: ["Business", "Computing", "Engineering", "Science"],
    website: "https://nsbm.lk",
    phone: "+94 11 2 445000"
  },
  {
    id: 29,
    name: "Royal Institute",
    shortName: "RI",
    type: "Private",
    location: { lat: 6.9167, lng: 79.8833 },
    address: "Colombo 07, Sri Lanka",
    faculties: ["Business", "IT", "Engineering"],
    website: "https://royalinstitute.edu",
    phone: "+94 11 2 345678"
  },
  {
    id: 30,
    name: "Saegis Campus",
    shortName: "SC",
    type: "Private",
    location: { lat: 6.9333, lng: 79.8500 },
    address: "Nugegoda, Sri Lanka",
    faculties: ["Business", "IT", "Hospitality Management"],
    website: "https://saegis.edu.lk",
    phone: "+94 11 2 345678"
  },
  {
    id: 31,
    name: "Sri Lanka Institute of Information Technology",
    shortName: "SLIIT",
    type: "Private",
    location: { lat: 6.9167, lng: 79.8833 },
    address: "Malabe, Sri Lanka",
    faculties: ["Computing", "Business", "Engineering"],
    website: "https://sliit.lk",
    phone: "+94 11 2 345678"
  },
  {
    id: 32,
    name: "Wisdom Business School",
    shortName: "WBS",
    type: "Private",
    location: { lat: 6.9167, lng: 79.8833 },
    address: "Colombo 03, Sri Lanka",
    faculties: ["Business Administration", "Management", "Finance"],
    website: "https://wisdombs.lk",
    phone: "+94 11 2 345678"
  }
];

export default function Member1Screen() {
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [nearestUniversities, setNearestUniversities] = useState<UniversityWithDistance[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [selectedUniversity, setSelectedUniversity] = useState<typeof SRI_LANKA_UNIVERSITIES[0] | null>(null);
  const [filterType, setFilterType] = useState<'All' | 'Government' | 'Private'>('All');

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    setLoadingLocation(true);
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission Denied', 'Location permission is required to show nearby universities');
          setLoadingLocation(false);
          return;
        }
      }
      
      // Get current location (simplified for demo)
      // In real app, you'd use expo-location or react-native-geolocation
      const mockLocation = { lat: 6.9271, lng: 79.8612 }; // Colombo
      setUserLocation(mockLocation);
      findNearestUniversities(mockLocation);
      
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert('Error', 'Failed to get your location');
    } finally {
      setLoadingLocation(false);
    }
  };

  const findNearestUniversities = (location: {lat: number, lng: number}) => {
    const universitiesWithDistance: UniversityWithDistance[] = SRI_LANKA_UNIVERSITIES.map(uni => {
      const distance = calculateDistance(location, uni.location);
      return { ...uni, distance };
    });
    
    const sorted = universitiesWithDistance.sort((a, b) => a.distance - b.distance);
    setNearestUniversities(sorted.slice(0, 5)); // Show nearest 5
  };

  const calculateDistance = (loc1: {lat: number, lng: number}, loc2: {lat: number, lng: number}): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
    const dLon = (loc2.lng - loc1.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const filteredUniversities = SRI_LANKA_UNIVERSITIES.filter(uni => {
    const matchesSearch = uni.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        uni.shortName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'All' || uni.type === filterType;
    return matchesSearch && matchesType;
  });

  const openMaps = (university: typeof SRI_LANKA_UNIVERSITIES[0]) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(university.name + ', ' + university.address)}`;
    Linking.openURL(url).catch(err => 
      Alert.alert('Error', 'Could not open maps')
    );
  };

  const callUniversity = (university: typeof SRI_LANKA_UNIVERSITIES[0]) => {
    Linking.openURL(`tel:${university.phone}`).catch(err => 
      Alert.alert('Error', 'Could not make phone call')
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <ThemedView style={styles.header}>
          <ThemedText style={styles.title}>🎓 Sri Lankan Universities</ThemedText>
          <ThemedText style={styles.subtitle}>Find universities near your location</ThemedText>
        </ThemedView>

        {/* Location Status */}
        <ThemedView style={styles.locationSection}>
          <ThemedText style={styles.sectionTitle}>📍 Your Location</ThemedText>
          {loadingLocation ? (
            <ThemedText style={styles.loadingText}>Getting your location...</ThemedText>
          ) : userLocation ? (
            <ThemedText style={styles.locationText}>
              Lat: {userLocation.lat.toFixed(4)}, Lng: {userLocation.lng.toFixed(4)}
            </ThemedText>
          ) : (
            <TouchableOpacity style={styles.locationButton} onPress={requestLocationPermission}>
              <ThemedText style={styles.locationButtonText}>🔍 Get Location</ThemedText>
            </TouchableOpacity>
          )}
        </ThemedView>

        {/* Filter */}
        <ThemedView style={styles.filterSection}>
          <ThemedText style={styles.sectionTitle}>🏛️ Filter by Type</ThemedText>
          <ThemedView style={styles.filterButtons}>
            <TouchableOpacity
              style={[styles.filterButton, filterType === 'All' && styles.activeFilter]}
              onPress={() => setFilterType('All')}
            >
              <ThemedText style={[styles.filterButtonText, filterType === 'All' && styles.activeFilterText]}>
                All ({SRI_LANKA_UNIVERSITIES.length})
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, filterType === 'Government' && styles.activeFilter]}
              onPress={() => setFilterType('Government')}
            >
              <ThemedText style={[styles.filterButtonText, filterType === 'Government' && styles.activeFilterText]}>
                Government ({SRI_LANKA_UNIVERSITIES.filter(u => u.type === 'Government').length})
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, filterType === 'Private' && styles.activeFilter]}
              onPress={() => setFilterType('Private')}
            >
              <ThemedText style={[styles.filterButtonText, filterType === 'Private' && styles.activeFilterText]}>
                Private ({SRI_LANKA_UNIVERSITIES.filter(u => u.type === 'Private').length})
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>

        {/* Search */}
        <ThemedView style={styles.searchSection}>
          <ThemedText style={styles.sectionTitle}>🔍 Search Universities</ThemedText>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by name or short code..."
            placeholderTextColor="#64748b"
          />
        </ThemedView>

        {/* Nearest Universities */}
        {nearestUniversities.length > 0 && (
          <ThemedView style={styles.nearestSection}>
            <ThemedText style={styles.sectionTitle}>🎯 Nearest Universities</ThemedText>
            {nearestUniversities.map((uni, index) => (
              <TouchableOpacity 
                key={uni.id} 
                style={styles.universityCard}
                onPress={() => setSelectedUniversity(uni)}
              >
                <ThemedView style={styles.universityHeader}>
                  <ThemedView>
                    <ThemedText style={styles.universityName}>{uni.name}</ThemedText>
                    <ThemedText style={styles.universityType}>{uni.type} • {uni.shortName}</ThemedText>
                  </ThemedView>
                  <ThemedText style={styles.distance}>{uni.distance.toFixed(1)} km</ThemedText>
                </ThemedView>
                <ThemedText style={styles.address}>{uni.address}</ThemedText>
                <ThemedView style={styles.facultyContainer}>
                  <ThemedText style={styles.facultyLabel}>Faculties:</ThemedText>
                  <ThemedText style={styles.faculties}>{uni.faculties.slice(0, 3).join(', ')}...</ThemedText>
                </ThemedView>
                <ThemedView style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={styles.actionButton} 
                    onPress={() => openMaps(uni)}
                  >
                    <ThemedText style={styles.actionButtonText}>📍 Map</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionButton} 
                    onPress={() => callUniversity(uni)}
                  >
                    <ThemedText style={styles.actionButtonText}>📞 Call</ThemedText>
                  </TouchableOpacity>
                </ThemedView>
              </TouchableOpacity>
            ))}
          </ThemedView>
        )}

        {/* All Universities */}
        <ThemedView style={styles.allSection}>
          <ThemedText style={styles.sectionTitle}>📚 All Universities</ThemedText>
          {(searchQuery ? filteredUniversities : SRI_LANKA_UNIVERSITIES).map((uni, index) => (
            <TouchableOpacity 
              key={uni.id} 
              style={styles.universityCard}
              onPress={() => setSelectedUniversity(uni)}
            >
              <ThemedView style={styles.universityHeader}>
                <ThemedView>
                  <ThemedText style={styles.universityName}>{uni.name}</ThemedText>
                  <ThemedText style={styles.universityType}>{uni.type} • {uni.shortName}</ThemedText>
                </ThemedView>
                {userLocation && (
                  <ThemedText style={styles.distance}>
                    {calculateDistance(userLocation, uni.location).toFixed(1)} km
                  </ThemedText>
                )}
              </ThemedView>
              <ThemedText style={styles.address}>{uni.address}</ThemedText>
              <ThemedView style={styles.facultyContainer}>
                <ThemedText style={styles.facultyLabel}>Faculties:</ThemedText>
                <ThemedText style={styles.faculties}>{uni.faculties.slice(0, 3).join(', ')}...</ThemedText>
              </ThemedView>
              <ThemedView style={styles.actionButtons}>
                <TouchableOpacity 
                  style={styles.actionButton} 
                  onPress={() => openMaps(uni)}
                >
                  <ThemedText style={styles.actionButtonText}>📍 Map</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.actionButton} 
                  onPress={() => callUniversity(uni)}
                >
                  <ThemedText style={styles.actionButtonText}>📞 Call</ThemedText>
                </TouchableOpacity>
              </ThemedView>
            </TouchableOpacity>
          ))}
        </ThemedView>

        {/* University Detail Modal */}
        {selectedUniversity && (
          <ThemedView style={styles.modalOverlay}>
            <ThemedView style={styles.modal}>
              <ThemedView style={styles.modalHeader}>
                <ThemedText style={styles.modalTitle}>{selectedUniversity.name}</ThemedText>
                <TouchableOpacity onPress={() => setSelectedUniversity(null)}>
                  <ThemedText style={styles.closeButton}>✕</ThemedText>
                </TouchableOpacity>
              </ThemedView>
              <ScrollView style={styles.modalContent}>
                <ThemedText style={styles.detailLabel}>Type: {selectedUniversity.type}</ThemedText>
                <ThemedText style={styles.detailLabel}>Short Name: {selectedUniversity.shortName}</ThemedText>
                <ThemedText style={styles.detailLabel}>Address: {selectedUniversity.address}</ThemedText>
                <ThemedText style={styles.detailLabel}>Phone: {selectedUniversity.phone}</ThemedText>
                <ThemedText style={styles.detailLabel}>Website: {selectedUniversity.website}</ThemedText>
                <ThemedText style={styles.detailLabel}>Faculties:</ThemedText>
                {selectedUniversity.faculties.map((faculty, index) => (
                  <ThemedText key={index} style={styles.facultyItem}>• {faculty}</ThemedText>
                ))}
              </ScrollView>
              <ThemedView style={styles.modalActions}>
                <TouchableOpacity 
                  style={styles.modalButton} 
                  onPress={() => openMaps(selectedUniversity)}
                >
                  <ThemedText style={styles.modalButtonText}>📍 Open in Maps</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.modalButton} 
                  onPress={() => callUniversity(selectedUniversity)}
                >
                  <ThemedText style={styles.modalButtonText}>📞 Call University</ThemedText>
                </TouchableOpacity>
              </ThemedView>
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
  locationSection: {
    padding: 20,
    backgroundColor: '#ffffff',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  locationText: {
    fontSize: 16,
    color: '#059669',
    textAlign: 'center',
    fontWeight: '600',
  },
  locationButton: {
    backgroundColor: '#3b82f6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  locationButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  searchSection: {
    padding: 20,
    backgroundColor: '#ffffff',
    marginBottom: 20,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9fafb',
  },
  filterSection: {
    padding: 20,
    backgroundColor: '#ffffff',
    marginBottom: 20,
  },
  filterButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  filterButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  activeFilter: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  activeFilterText: {
    color: '#ffffff',
  },
  nearestSection: {
    padding: 20,
    backgroundColor: '#ffffff',
    marginBottom: 20,
  },
  universityCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  universityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  universityName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
  },
  universityType: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  distance: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059669',
    backgroundColor: '#ecfdf5',
    padding: 4,
    borderRadius: 4,
  },
  address: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  facultyContainer: {
    marginBottom: 12,
  },
  facultyLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  faculties: {
    fontSize: 14,
    color: '#64748b',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: '#3b82f6',
    padding: 8,
    borderRadius: 6,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  allSection: {
    padding: 20,
    backgroundColor: '#ffffff',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
  },
  closeButton: {
    fontSize: 24,
    color: '#64748b',
  },
  modalContent: {
    maxHeight: 400,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  facultyItem: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalButton: {
    backgroundColor: '#3b82f6',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
