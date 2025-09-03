import { useState, useEffect } from 'react';
import { ApiResponse } from '@/lib/api';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T>(
  apiCall: (() => Promise<ApiResponse<T>>) | null,
  dependencies: unknown[] = []
): UseApiState<T> & { refetch: () => Promise<void> } {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const fetchData = async () => {
    if (!apiCall) {
      setState({
        data: null,
        loading: false,
        error: null,
      });
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const response = await apiCall();
      setState({
        data: response.data,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, dependencies);

  return {
    ...state,
    refetch: fetchData,
  };
}

export function useApiMutation<T>() {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const mutate = async (apiCall: () => Promise<ApiResponse<T>>) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const response = await apiCall();
      setState({
        data: response.data,
        loading: false,
        error: null,
      });
      return response;
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      });
      throw error;
    }
  };

  return {
    ...state,
    mutate,
  };
}
