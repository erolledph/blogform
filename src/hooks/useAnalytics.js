import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { analyticsService } from '@/services/analyticsService';

export function useContentAnalytics(contentId, days = 30) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!contentId || !currentUser?.uid) {
      setAnalytics(null);
      setLoading(false);
      return;
    }

    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await analyticsService.getContentAnalytics(currentUser.uid, contentId, currentUser.uid, days);
        setAnalytics(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [contentId, days, currentUser?.uid]);

  return { analytics, loading, error };
}

export function useSiteAnalytics(days = 30) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!currentUser?.uid) {
        setAnalytics(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await analyticsService.getSiteAnalytics(currentUser.uid, currentUser.uid, days);
        setAnalytics(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [days, currentUser?.uid]);

  const refetch = () => {
    fetchAnalytics();
  };

  return { analytics, loading, error, refetch };
}

export function useBackendUsage() {
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchUsage = async () => {
      if (!currentUser?.uid) {
        setUsage(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await analyticsService.getBackendUsage(currentUser.uid);
        setUsage(data);
      } catch (err) {
        console.error('Backend usage error:', err);
        // Don't set error state for permission issues, let the service handle it
        setUsage({
          documentCounts: { content: 0, pageViews: 0, interactions: 0 },
          error: 'Permission denied or service unavailable',
          note: 'Check admin console for exact usage statistics'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUsage();
  }, [currentUser?.uid]);

  const refetch = async () => {
    fetchUsage();
  };

  return { usage, loading, error, refetch };
}