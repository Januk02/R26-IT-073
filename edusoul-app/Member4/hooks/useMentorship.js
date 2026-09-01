import { useState, useEffect, useCallback } from 'react';
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

  const isConnected = health?.status === 'healthy' || health?.status === 'ok';

  return { health, status: health, isConnected, loading, error };
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

export function useMatchPrediction(initialMentorId, initialMenteeId) {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const predictMatch = useCallback(async (mentorId = initialMentorId, menteeId = initialMenteeId, menteeData = null) => {
    if (!mentorId || !menteeId) return;
    setLoading(true);
    try {
      const result = await mentorshipApi.predictMatch(mentorId, menteeId, menteeData);
      setPrediction(result);
      setError(null);
      return result;
    } catch (err) {
      setError(err.message);
      setPrediction(null);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [initialMentorId, initialMenteeId]);

  return { prediction, result: prediction, loading, matchLoading: loading, error, predictMatch, predict: predictMatch };
}

export function useFindMentors() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const findMentors = useCallback(async (menteeId, topN = 5, menteeData = null) => {
    if (!menteeId) return;
    setLoading(true);
    try {
      const result = await mentorshipApi.findMentorsForMentee(menteeId, topN, menteeData);
      const matches = result.matches || result.top_matches || [];
      setResults(matches);
      setError(null);
      return matches;
    } catch (err) {
      setError(err.message);
      setResults([]);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { results, matches: results, loading, findLoading: loading, error, findMentors };
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

  return { stats, loading, statsLoading: loading, error };
}
