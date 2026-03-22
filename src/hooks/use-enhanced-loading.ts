import { useState, useEffect, useCallback } from 'react';

interface ProgressiveLoadingOptions {
  criticalDelay?: number;
  secondaryDelay?: number;
  tertiaryDelay?: number;
}

interface LoadingState {
  isLoading: boolean;
  showCritical: boolean;
  showSecondary: boolean;
  showTertiary: boolean;
}

/**
 * Progressive loading hook for staged content appearance
 * Enhances perceived performance by showing content in phases
 */
export function useProgressiveLoading(
  isLoading: boolean,
  options: ProgressiveLoadingOptions = {}
): LoadingState {
  const {
    criticalDelay = 0,
    secondaryDelay = 300,
    tertiaryDelay = 600,
  } = options;

  const [showCritical, setShowCritical] = useState(false);
  const [showSecondary, setShowSecondary] = useState(false);
  const [showTertiary, setShowTertiary] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      // Reset all states when loading completes
      setShowCritical(false);
      setShowSecondary(false);
      setShowTertiary(false);
      return;
    }

    // Show critical content immediately
    setShowCritical(true);

    // Show secondary content after delay
    const secondaryTimer = setTimeout(() => {
      setShowSecondary(true);
    }, secondaryDelay);

    // Show tertiary content after longer delay
    const tertiaryTimer = setTimeout(() => {
      setShowTertiary(true);
    }, tertiaryDelay);

    return () => {
      clearTimeout(secondaryTimer);
      clearTimeout(tertiaryTimer);
    };
  }, [isLoading, criticalDelay, secondaryDelay, tertiaryDelay]);

  return {
    isLoading,
    showCritical,
    showSecondary,
    showTertiary,
  };
}

/**
 * Enhanced loading state with skeleton management
 */
export function useEnhancedLoading(initialLoading = false) {
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const progressive = useProgressiveLoading(isLoading);

  const startLoading = useCallback(() => {
    setIsLoading(true);
    setError(null);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  const setLoadingError = useCallback((errorMessage: string) => {
    setError(errorMessage);
    setIsLoading(false);
  }, []);

  const retry = useCallback(() => {
    setRetryCount(prev => prev + 1);
    setError(null);
    setIsLoading(true);
  }, []);

  return {
    isLoading,
    error,
    retryCount,
    startLoading,
    stopLoading,
    setLoadingError,
    retry,
    progressive,
  };
}

/**
 * Data fetching hook with loading states
 */
export function useDataFetch<T>(
  fetchFunction: () => Promise<T>,
  dependencies: any[] = []
) {
  const {
    isLoading,
    error,
    startLoading,
    stopLoading,
    setLoadingError,
    retry,
    progressive,
  } = useEnhancedLoading(true);

  const [data, setData] = useState<T | null>(null);

  const fetchData = useCallback(async () => {
    startLoading();
    try {
      const result = await fetchFunction();
      setData(result);
      stopLoading();
    } catch (err) {
      setLoadingError(err instanceof Error ? err.message : 'An error occurred');
    }
  }, [fetchFunction, startLoading, stopLoading, setLoadingError]);

  useEffect(() => {
    fetchData();
  }, dependencies);

  return {
    data,
    isLoading,
    error,
    retry: () => {
      fetchData();
      retry();
    },
    progressive,
  };
}