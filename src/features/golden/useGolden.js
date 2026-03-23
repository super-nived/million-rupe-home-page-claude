import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getGoldenConfig, subscribeToGoldenConfig } from '../../services/goldenService';

export function useGoldenConfig() {
  const [config, setConfig] = useState(null);

  // Initial fetch
  const q = useQuery({
    queryKey: ['goldenConfig'],
    queryFn: getGoldenConfig,
    staleTime: 30_000,
  });

  // Real-time subscription
  useEffect(() => {
    const unsub = subscribeToGoldenConfig((data) => {
      setConfig(data);
    });
    return unsub;
  }, []);

  // Prefer real-time data, fall back to query
  return {
    data: config || q.data,
    isLoading: !config && q.isLoading,
  };
}
