/**
 * Mentorship Matching API Service
 * Connects edusoul-app frontend to Python Flask backend
 */

const API_BASE_URL = import.meta.env.VITE_MENTORSHIP_API_URL || 'http://localhost:5000/api';

class MentorshipApiService {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  async fetchWithError(url, options = {}) {
    try {
      const response = await fetch(`${this.baseUrl}${url}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Health check
  async healthCheck() {
    return this.fetchWithError('/health');
  }

  // Get all mentors
  async getMentors() {
    return this.fetchWithError('/mentors');
  }

  // Get all mentees
  async getMentees() {
    return this.fetchWithError('/mentees');
  }

  // Predict match between mentor and mentee
  async predictMatch(mentorId, menteeId, menteeData = null) {
    const payload = {
      mentor_id: mentorId,
      mentee_id: menteeId,
    };
    
    // If mentee data is provided (from Firestore), include it
    if (menteeData) {
      payload.mentee_data = menteeData;
    }
    
    return this.fetchWithError('/match', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Find best matching mentors for a mentee
  async findMentorsForMentee(menteeId, topN = 5, menteeData = null) {
    const payload = {
      mentee_id: menteeId,
      top_n: topN,
    };
    
    // If mentee data is provided (from Firestore), include it
    if (menteeData) {
      payload.mentee_data = menteeData;
    }
    
    return this.fetchWithError('/find-mentors', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Get platform statistics
  async getStats() {
    return this.fetchWithError('/stats');
  }

  // Batch match multiple mentors with a mentee
  async batchMatch(menteeId, mentorIds) {
    const promises = mentorIds.map(mentorId =>
      this.predictMatch(mentorId, menteeId).catch(err => ({
        mentor_id: mentorId,
        error: err.message,
        compatibility_score: 0,
      }))
    );

    return Promise.all(promises);
  }

  // Server-side interview answer scoring
  async analyzeInterview(questions, answers) {
    return this.fetchWithError('/analyze-interview', {
      method: 'POST',
      body: JSON.stringify({ questions, answers }),
    });
  }

  // MuseTalk Real-time AI Avatar Video Generator
  async generateMuseTalkVideo(text, avatarId = 'evelyn') {
    return this.fetchWithError('/avatar/generate-talk', {
      method: 'POST',
      body: JSON.stringify({ text, avatar_id: avatarId }),
    });
  }
}

// Export singleton instance
export const mentorshipApi = new MentorshipApiService();

// Also export the class for custom instances
export default MentorshipApiService;
