import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../services/api';
import { UseAdminCountdownReturn, CountdownDay, CountdownDayUpdate } from '../types';
import toast from 'react-hot-toast';

export const useAdminCountdown = (): UseAdminCountdownReturn => {
  const [days, setDays] = useState<CountdownDay[] | undefined>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | undefined>();

  const fetchDays = useCallback(async () => {
    setLoading(true);
    setError(undefined);

    try {
      const data = await adminApi.getCountdownDays();
      setDays(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load countdown days';
      setError(errorMessage);
      console.error('Error fetching admin countdown days:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDays();
  }, [fetchDays]);

  const updateDay = useCallback(async (dayNumber: number, data: CountdownDayUpdate): Promise<void> => {
    try {
      const updatedDay = await adminApi.updateCountdownDay(dayNumber, data);
      
      // Update local state
      setDays(prev => prev?.map(day => 
        day.day_number === dayNumber ? updatedDay : day
      ));
      
      toast.success(`Day ${dayNumber} updated successfully!`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update day';
      toast.error(errorMessage);
      throw err; // Re-throw for component handling
    }
  }, []);

  const refetch = useCallback(() => {
    fetchDays();
  }, [fetchDays]);

  return {
    days,
    loading,
    error,
    updateDay,
    refetch,
  };
};

// Hook for fetching a specific admin countdown day
export const useAdminCountdownDay = (dayNumber: number) => {
  const [day, setDay] = useState<CountdownDay | undefined>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | undefined>();

  const fetchDay = useCallback(async () => {
    setLoading(true);
    setError(undefined);

    try {
      const data = await adminApi.getCountdownDay(dayNumber);
      setDay(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load day';
      setError(errorMessage);
      console.error('Error fetching admin countdown day:', err);
    } finally {
      setLoading(false);
    }
  }, [dayNumber]);

  useEffect(() => {
    fetchDay();
  }, [fetchDay]);

  const updateDay = useCallback(async (data: CountdownDayUpdate): Promise<void> => {
    try {
      const updatedDay = await adminApi.updateCountdownDay(dayNumber, data);
      setDay(updatedDay);
      toast.success(`Day ${dayNumber} updated successfully!`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update day';
      toast.error(errorMessage);
      throw err;
    }
  }, [dayNumber]);

  const refetch = useCallback(() => {
    fetchDay();
  }, [fetchDay]);

  return {
    day,
    loading,
    error,
    updateDay,
    refetch,
  };
}; 