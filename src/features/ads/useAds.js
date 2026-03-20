import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAds, saveAd } from '../../services/localStorageService';

const ADS_KEY = ['ads'];

export function useAdsQuery() {
  return useQuery({
    queryKey: ADS_KEY,
    queryFn: getAds,
    staleTime: Infinity,
  });
}

export function usePurchaseAd() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveAd,
    onSuccess: (updatedAds) => {
      queryClient.setQueryData(ADS_KEY, updatedAds);
    },
  });
}
