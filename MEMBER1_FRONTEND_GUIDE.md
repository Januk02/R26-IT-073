# FutureDream - Member1 Frontend Documentation

## Overview
The Member1 module is the core user-facing component of the FutureDream career guidance system. It provides a complete student profile management, AI-powered degree recommendations, and career guidance interface.

## File Structure

```
React-Native-App/app/(tabs)/member1/
├── _layout.tsx                    # Stack navigation configuration
├── index.tsx                       # Member1 landing/home screen
├── dashboard.tsx                   # Main dashboard with feature navigation
├── member1-recommendation.tsx      # AI recommendation form & results
├── future-dream-advisor.tsx        # Dream job analysis & backward planning
├── profile.tsx                     # User profile display
├── analytics.tsx                   # Career analytics (placeholder)
├── insights.tsx                    # Career insights explorer
├── journey.tsx                     # Academic journey timeline
├── materials.tsx                   # Study materials resource
├── roadmap.tsx                     # Academic roadmap planner
└── resources.tsx                   # Learning resources directory
```

## Technology Stack

### Core Framework
- **React Native 0.81.5** - Cross-platform mobile framework
- **Expo SDK 52** - Development platform and build tools
- **Expo Router 4** - File-based routing system
- **TypeScript** - Type-safe development

### State Management & Data
- **React Hooks** - useState, useEffect for local state
- **Firebase Firestore** - NoSQL database for student profiles
- **Firebase Auth** - User authentication
- **AsyncStorage** - Local persistence

### UI Components
- **React Native built-ins** - View, Text, ScrollView, TouchableOpacity, etc.
- **Expo Vector Icons** - Ionicons for iconography
- **Linear Gradient** - Background gradients
- **Custom Themed Components** - ThemedText, ThemedView

### External Services
- **Custom API Service** (`@/services/apiService.js`) - Backend communication
- **AI Backend** - Flask server with ML model (port 8006)

## Architecture

### Navigation Flow
```
Member1 Dashboard
├── My Recommendations → member1-recommendation.tsx
├── Future Dream Advisor → future-dream-advisor.tsx
├── Career Analytics → analytics.tsx
├── My Profile → profile.tsx
├── Career Insights → insights.tsx
├── Academic Journey → journey.tsx
├── Study Materials → materials.tsx
├── Academic Roadmap → roadmap.tsx
└── Learning Resources → resources.tsx
```

### Data Flow
```
User Input → Local State → Firebase Auth UID
     ↓              ↓
Form Validation  Firestore (students/{uid})
     ↓              ↓
API Service → Backend AI Model
     ↓
Recommendations Display
```

## Core Components Explained

### 1. Dashboard (`dashboard.tsx`)
**Purpose:** Main entry point for Member1 features

**Key Features:**
- Animated feature cards with staggered entrance
- Quick stats display
- Navigation to all sub-features
- Visual progress indicators

**State Management:**
```typescript
const [animatedValue] = useState(new Animated.Value(0));
const [scaleValues] = useState(features.map(() => new Animated.Value(0)));
```

**Navigation Pattern:**
```typescript
const router = useRouter();
router.push('/member1/member1-recommendation');
```

### 2. Recommendation Form (`member1-recommendation.tsx`)
**Purpose:** Primary AI recommendation interface

**Sections:**
1. **Student Information** - Name, Z-Score, District
2. **A/L Stream Selection** - Dropdown with 4 streams
3. **A/L Subject Results** - Dynamic based on stream
4. **O/L Results** - Legacy qualification data
5. **Personality Assessment** - 5-point scale ratings
6. **Interest Selection** - Multi-select tags
7. **Lifestyle Preferences** - Location, travel, stress tolerance
8. **Recommendations Display** - AI results with university matches

**Key State Structure:**
```typescript
const [studentData, setStudentData] = useState({
  name: '',
  district: '',
  zScore: '',
  alResults: { stream: '', /* subject grades */ },
  olResults: { english: '', mathematics: '', science: '', total: '' },
  interests: [],
  personalityTraits: {
    leadership: 3,
    creativity: 3,
    analyticalThinking: 3,
    riskTaking: 3,
    entrepreneurialMindset: 3
  },
  locationPreference: '',
  travelTolerance: '',
  workEnvironment: '',
  stressTolerance: '3',
  socialInteraction: '',
  dreamJob: '',
  personalityDescription: '',
  detectedTraits: []
});
```

**Firestore Integration:**
```typescript
// Load existing data on mount
const loadExistingStudentData = async () => {
  const user = auth.currentUser;
  const studentRef = doc(db, 'students', user.uid);
  const docSnap = await getDoc(studentRef);
  if (docSnap.exists()) {
    setStudentData(docSnap.data());
  }
};

// Save/update data
const saveStudentDataToFirestore = async () => {
  const user = auth.currentUser;
  const studentRef = doc(db, 'students', user.uid);
  await setDoc(studentRef, dataToSave, { merge: true });
};
```

**API Integration:**
```typescript
const generateRecommendations = async () => {
  // Format data for backend
  const formattedData = apiService.formatStudentData(studentData);
  
  // Call AI backend
  const aiResponse = await apiService.getRecommendations(formattedData);
  
  // Convert and display
  setRecommendations(convertedRecommendations);
  
  // Save to Firestore
  await saveStudentDataToFirestore(studentData, convertedRecommendations);
};
```

### 3. Future Dream Advisor (`future-dream-advisor.tsx`)
**Purpose:** Career goal reverse-engineering

**Flow:**
1. **Step 1** - Select dream job from categorized list
2. **Step 2** - AI Backward Analysis (education path, skills needed)
3. **Step 3** - Roadmap generation with timeline

**Key Features:**
- Job categorization (STEM, Healthcare, Business, etc.)
- Province/District selection for Sri Lankan context
- AI-powered backward analysis
- Interactive skill development suggestions

**Data Passing:**
```typescript
// Pass data to recommendation form
router.push({
  pathname: '/member1/member1-recommendation',
  params: { studentData: JSON.stringify(enrichedData) }
});
```

### 4. Profile (`profile.tsx`)
**Purpose:** Display saved student data

**Features:**
- Read from Firestore using user's UID
- Profile completion percentage
- Visual trait bars for personality
- Recent recommendations list
- Edit button to return to form

**Data Fetching:**
```typescript
const fetchStudentData = async () => {
  const user = auth.currentUser;
  const studentRef = doc(db, 'students', user.uid);
  const docSnap = await getDoc(studentRef);
  if (docSnap.exists()) {
    setStudentData(docSnap.data());
  }
};
```

## Algorithms & Logic

### 1. Profile Completion Calculator
```typescript
const calculateProfileCompletion = (data: any) => {
  let completedFields = 0;
  let totalFields = 8;
  
  if (data.name) completedFields++;
  if (data.alResults?.stream) completedFields++;
  if (data.zScore) completedFields++;
  if (data.interests?.length > 0) completedFields++;
  if (data.personalityTraits) completedFields++;
  if (data.locationPreference) completedFields++;
  if (data.travelTolerance) completedFields++;
  if (data.workEnvironment) completedFields++;
  
  return Math.round((completedFields / totalFields) * 100);
};
```

### 2. Stream-Based Subject Filtering
```typescript
const getSubjectsForStream = (stream: string) => {
  switch(stream) {
    case 'Physical Science':
      return ['combinedMathematics', 'physics', 'chemistry', ...];
    case 'Biological Science':
      return ['biology', 'chemistry', 'physics', ...];
    case 'Commerce':
      return ['accounting', 'businessStudies', 'economics', ...];
    case 'Arts':
      return ['sinhala', 'tamil', 'english', 'history', ...];
  }
};
```

### 3. Personality Trait Visualization
```typescript
// 5-point scale to percentage bar
<View style={styles.traitBar}>
  <View style={[styles.traitFill, { 
    width: `${(personalityTraits.leadership / 5) * 100}%` 
  }]} />
</View>
```

## API Service Integration (`@/services/apiService.js`)

### Methods
```typescript
class ApiService {
  // Health check
  async healthCheck()
  
  // Get AI recommendations
  async getRecommendations(studentData)
  
  // Get backward analysis for dream job
  async getBackwardAnalysis(dreamJob)
  
  // Simple prediction (fallback)
  async getSimplePrediction(studentData)
  
  // Format student data for backend
  formatStudentData(studentProfile)
}
```

### Data Transformation
```typescript
formatStudentData(studentProfile) {
  return {
    dream_job: studentProfile.dreamJob,
    district: studentProfile.district,
    stream: studentProfile.alResults?.stream,
    z_score: parseFloat(studentProfile.zScore),
    personality_description: studentProfile.personalityDescription,
    detected_traits: studentProfile.detectedTraits,
    analytical_skill: parseInt(studentProfile.personalityTraits?.analyticalThinking),
    creativity: parseInt(studentProfile.personalityTraits?.creativity),
    leadership: parseInt(studentProfile.personalityTraits?.leadership),
    risk_taking: parseInt(studentProfile.personalityTraits?.riskTaking),
    // ... lifestyle preferences
  };
}
```

## Firebase Integration

### Configuration (`firebase.ts`)
```typescript
const firebaseConfig = {
  apiKey: "AIzaSyA_H3i_IgScKtmLwCUf8Gcd5tjJeke61nk",
  projectId: "edusoul-baeb2",
  // ... other config
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
```

### Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /students/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Future Development Tasks

### High Priority
1. **Interest Integration**
   - Currently collected but NOT sent to backend
   - Add to `formatStudentData()` in apiService.js
   - Backend needs interest-to-career mapping

2. **Personality Data Usage**
   - Currently sent but not used in ML model
   - Implement personality scoring in backend algorithm
   - Weight personality in recommendation ranking

3. **Lifestyle Preferences**
   - Currently sent but ignored
   - Add stress tolerance, location preference to algorithm
   - Filter universities by work environment match

### Medium Priority
4. **Offline Support**
   - Cache student data locally
   - Queue API calls when offline
   - Sync when connection restored

5. **Form Validation**
   - Real-time field validation
   - Better error messages
   - Z-Score range validation (0-4)

6. **Progressive Web App**
   - Add service workers
   - Enable offline access to recommendations
   - Push notifications for deadlines

### Low Priority
7. **Analytics Dashboard**
   - Track popular dream jobs
   - Stream popularity analytics
   - Career path success rates

8. **Social Features**
   - Share recommendations
   - Compare with friends
   - Mentor matching

9. **Multi-language Support**
   - Sinhala and Tamil translations
   - RTL support
   - Cultural customization

10. **Advanced UI**
    - Dark mode
    - Animation improvements
    - Accessibility enhancements

## Known Issues & Limitations

### Current Limitations
1. **No Interest Processing** - Interests collected but not used in algorithm
2. **Personality Decorative** - Scores displayed but don't affect recommendations
3. **Single User Per Device** - No multi-account support
4. **No Data Export** - Can't export recommendations as PDF
5. **Limited Offline** - Requires internet for AI recommendations

### Technical Debt
1. **Type Safety** - Many `any` types, should use strict interfaces
2. **Error Handling** - Generic error messages need improvement
3. **Code Duplication** - Some styles repeated across files
4. **Hardcoded Strings** - Text should be in translation files

## Testing Strategy

### Unit Tests Needed
- Form validation logic
- Data transformation functions
- Profile completion calculator
- Stream-based subject filtering

### Integration Tests Needed
- API service communication
- Firestore read/write operations
- Navigation flow testing

### E2E Tests Needed
- Complete recommendation flow
- Profile update flow
- Future dream advisor journey

## Performance Considerations

### Optimizations
1. **Lazy Loading** - Load recommendation results on demand
2. **Image Optimization** - Compress university logos
3. **Memoization** - Cache expensive calculations
4. **List Virtualization** - For long university lists

### Bundle Size
- Current: ~15MB (includes ML model data)
- Target: <10MB for faster download
- Consider code splitting for unused screens

## Deployment Checklist

### Pre-deployment
- [ ] Firestore rules deployed
- [ ] Backend server running
- [ ] API_BASE_URL correct in apiService.js
- [ ] Firebase config validated
- [ ] Test on iOS and Android

### Post-deployment
- [ ] Monitor crash reports
- [ ] Track API response times
- [ ] Check Firestore usage quotas
- [ ] Collect user feedback

## Support & Maintenance

### Debugging Tools
- React Native Debugger
- Firebase Console logs
- Backend server logs
- Expo CLI for builds

### Common Issues
1. **Permission Denied** - Firestore rules not deployed
2. **API Timeout** - Backend server not running
3. **Network Error** - Wrong IP in API_BASE_URL
4. **Blank Screen** - JavaScript bundle error

---

**Last Updated:** May 2026  
**Maintained By:** FutureDream Development Team  
**Contact:** support@futuredream.edu
