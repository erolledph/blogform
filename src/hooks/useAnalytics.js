import { useState, useEffect } from 'react';
import { analyticsService } from '@/services/analyticsService';

export function useContentAnalytics(contentId, days = 30) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!contentId) return;

    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await analyticsService.getContentAnalytics(contentId, days);
        setAnalytics(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [contentId, days]);

  return { analytics, loading, error };
}

export function useSiteAnalytics(days = 30) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await analyticsService.getSiteAnalytics(days);
        setAnalytics(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [days]);

  const refetch = () => {
    fetchAnalytics();
  };

  return { analytics, loading, error, refetch };
}

export function useFirebaseUsage() {
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await analyticsService.getFirebaseUsage();
        setUsage(data);
      } catch (err) {
        console.error('Firebase usage error:', err);
        // Don't set error state for permission issues, let the service handle it
        setUsage({
          documentCounts: { content: 0, pageViews: 0, interactions: 0 },
          error: 'Permission denied or service unavailable',
          note: 'Check Firebase console for exact usage statistics'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUsage();
  }, []);

  const refetch = async () => {
    fetchUsage();
  };

  return { usage, loading, error, refetch };
}