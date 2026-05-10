// API Service for FutureDream Backend Integration
import { Alert } from 'react-native';
const API_BASE_URL = 'http://192.168.8.117:8005';

class ApiService {
  // Health check
  async healthCheck() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }

  // Get degree recommendations using backward-chaining AI
  async getRecommendations(studentData) {
    try {
      console.log('Sending data to backend:', JSON.stringify(studentData, null, 2));
      
      const response = await fetch(`${API_BASE_URL}/recommend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(studentData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Backend error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Recommendation error:', error);
      Alert.alert('Error', 'Failed to get recommendations. Please try again.');
      throw error;
    }
  }

  // Simple prediction endpoint for testing
  async getSimplePrediction(studentData) {
    try {
      const response = await fetch(`${API_BASE_URL}/predict-simple`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(studentData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Simple prediction error:', error);
      Alert.alert('Error', 'Failed to get prediction. Please try again.');
      throw error;
    }
  }

  // Format student data for API
  formatStudentData(studentProfile) {
    // Helper function to ensure proper type conversion
    const safeString = (value, defaultValue) => String(value || defaultValue);
    const safeInt = (value, defaultValue) => parseInt(value) || defaultValue;
    const safeFloat = (value, defaultValue) => parseFloat(value) || defaultValue;
    const safeArray = (value, defaultValue) => Array.isArray(value) ? value : defaultValue;
    
    return {
      dream_job: safeString(studentProfile.dreamJob, 'Software Engineer'),
      district: safeString(studentProfile.district, 'Colombo'),
      stream: safeString(studentProfile.alResults?.stream, 'Physical Science'),
      z_score: safeFloat(studentProfile.zScore, 1.5),
      // Text-based personality data
      personality_description: safeString(studentProfile.personalityDescription, ''),
      detected_traits: safeArray(studentProfile.detectedTraits, []),
      // Legacy personality scores (fallback)
      analytical_skill: safeInt(studentProfile.personalityTraits?.analyticalThinking, 3),
      creativity: safeInt(studentProfile.personalityTraits?.creativity, 3),
      leadership: safeInt(studentProfile.personalityTraits?.leadership, 3),
      risk_taking: safeInt(studentProfile.personalityTraits?.riskTaking, 3),
      communication_skill: safeInt(studentProfile.personalityTraits?.communication, 3),
      problem_solving: safeInt(studentProfile.personalityTraits?.problemSolving, 3),
      teamwork: safeInt(studentProfile.personalityTraits?.teamwork, 3),
      entrepreneural_mindset: safeInt(studentProfile.personalityTraits?.entrepreneurialMindset, 0),
      business_acumen: safeInt(studentProfile.personalityTraits?.businessAcumen, 3),
      preferred_location: safeString(studentProfile.locationPreference, 'Urban'),
      travel_tolerance: safeString(studentProfile.travelTolerance, 'Medium'),
      stress_tolerance: safeString(studentProfile.stressTolerance, 'Medium'),
      social_preference: safeString(studentProfile.socialPreference, 'Ambivert'),
      work_life_balance_priority: safeInt(studentProfile.workLifeBalance, 3),
      family_attachment_level: safeInt(studentProfile.familyAttachment, 3),
      financial_stability_need: safeInt(studentProfile.financialStability, 3),
      ol_results: safeString(studentProfile.olResults, 'A'),
      al_predicted: safeFloat(studentProfile.alPredicted, 1.6),
      subject_strength: safeString(studentProfile.subjectStrength, 'Mathematics'),
      career_sustainability_priority: safeInt(studentProfile.careerSustainability, 3),
      innovation_interest: safeInt(studentProfile.innovationInterest, 3),
      social_impact_priority: safeInt(studentProfile.socialImpact, 3),
    };
  }

  // Test connection to backend
  async testConnection() {
    try {
      const health = await this.healthCheck();
      console.log('Backend connection successful:', health);
      return true;
    } catch (error) {
      console.error('Backend connection failed:', error);
      return false;
    }
  }
}

export default new ApiService();
