import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSiteConfig, subscribeToSiteConfig, subscribeToRecentPurchases } from '../../services/firebaseService';

export function useSiteConfig() {
  const query = useQuery({
    queryKey: ['siteConfig'],
    queryFn: getSiteConfig,
    staleTime: 5 * 60_000,
  });

  return query;
}

export function useRecentPurchases(count = 8) {
  const [purchases, setPurchases] = useState([]);

  useEffect(() => {
    const unsub = subscribeToRecentPurchases(setPurchases, count);
    return unsub;
  }, [count]);

  return purchases;
}
