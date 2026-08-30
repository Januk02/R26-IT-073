import { useState, useEffect } from 'react';
import { mentorshipApi } from '../services/mentorshipApi';

export function useApiHealth() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const result = await mentorshipApi.healthCheck();
        setHealth(result);
        setError(null);
      } catch (err) {
        setError(err.message);
        setHealth({ status: 'unhealthy' });
      } finally {
        setLoading(false);
      }
    };

    checkHealth();
  }, []);

  return { health, loading, error };
}

export function useMentors() {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const result = await mentorshipApi.getMentors();
        setMentors(result.mentors || []);
        setError(null);
      } catch (err) {
        setError(err.message);
        setMentors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMentors();
  }, []);

  return { mentors, loading, error };
}

export function useMentees() {
  const [mentees, setMentees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMentees = async () => {
      try {
        const result = await mentorshipApi.getMentees();
        setMentees(result.mentees || []);
        setError(null);
      } catch (err) {
        setError(err.message);
        setMentees([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMentees();
  }, []);

  return { mentees, loading, error };
}

export function useMatchPrediction(mentorId, menteeId) {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const predict = async () => {
    setLoading(true);
    try {
      const result = await mentorshipApi.predictMatch(mentorId, menteeId);
      setPrediction(result);
      setError(null);
    } catch (err) {
      setError(err.message);
      setPrediction(null);
    } finally {
      setLoading(false);
    }
  };

  return { prediction, loading, error, predict };
}

export function useFindMentors() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const findMentors = async (menteeId, topN = 5) => {
    setLoading(true);
    try {
      const result = await mentorshipApi.findMentorsForMentee(menteeId, topN);
      setResults(result.matches || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return { results, loading, error, findMentors };
}

export function useMentorshipStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const result = await mentorshipApi.getStats();
        setStats(result);
        setError(null);
      } catch (err) {
        setError(err.message);
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading, error };
}
