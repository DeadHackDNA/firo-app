import { useQuery } from '@tanstack/react-query';
import { fetchFires, type FireResponse } from '../services/fire-service';

export const useFires = () => {
  const result = useQuery<FireResponse[], Error>({
    queryKey: ['fires'],
    queryFn: async () => {
      const data = await fetchFires();
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 min
    retry: 2,
  });

  return {
    fires: result.data,
    isLoading: result.isLoading,
    error: result.error,
    refetch: result.refetch,
  };
};
