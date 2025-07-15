import { useState, useEffect, useCallback } from 'react';
import { publicApi } from '../services/api';
import { UseCountdownReturn, CountdownOverview, PublicCountdownDay } from '../types';

export const useCountdown = (): UseCountdownReturn => {
  const [overview, setOverview] = useState<CountdownOverview | undefined>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | undefined>();

  const fetchCountdown = useCallback(async () => {
    setLoading(true);
    setError(undefined);

    try {
      const data = await publicApi.getCountdownOverview();
      setOverview(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load countdown';
      setError(errorMessage);
      console.error('Error fetching countdown:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCountdown();
  }, [fetchCountdown]);

  const refetch = useCallback(() => {
    fetchCountdown();
  }, [fetchCountdown]);

  return {
    overview,
    loading,
    error,
    refetch,
  };
};

// Hook for fetching a specific countdown day
export const useCountdownDay = (dayNumber: number, previewToken?: string) => {
  const [day, setDay] = useState<PublicCountdownDay | undefined>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | undefined>();

  const fetchDay = useCallback(async () => {
    setLoading(true);
    setError(undefined);

    try {
      const data = await publicApi.getCountdownDay(dayNumber, previewToken);
      setDay(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load day';
      setError(errorMessage);
      console.error('Error fetching countdown day:', err);
    } finally {
      setLoading(false);
    }
  }, [dayNumber, previewToken]);

  useEffect(() => {
    fetchDay();
  }, [fetchDay]);

  const refetch = useCallback(() => {
    fetchDay();
  }, [fetchDay]);

  return {
    day,
    loading,
    error,
    refetch,
  };
}; 