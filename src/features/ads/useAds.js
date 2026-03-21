import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAds, saveAd, subscribeToAds } from '../../services/firebaseService';

const ADS_KEY = ['ads'];

export function useAdsQuery() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = subscribeToAds(
      (ads) => {
        queryClient.setQueryData(ADS_KEY, ads);
      },
      (err) => {
        console.error('Realtime listener failed, falling back to polling:', err.message);
      }
    );
    return unsubscribe;
  }, [queryClient]);

  return useQuery({
    queryKey: ADS_KEY,
    queryFn: getAds,
    staleTime: 60_000,
    retry: 2,
  });
}

export function usePurchaseAd() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ adData, imageFile }) => saveAd(adData, imageFile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADS_KEY });
    },
  });
}
