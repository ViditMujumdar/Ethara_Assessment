import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@features/admin/adminApi';

export function useAdmin() {
  const query = useQuery({
    queryKey: ['admin-me'],
    queryFn: async () => {
      const { data } = await adminApi.me();
      return data.data;
    },
    staleTime: 5 * 60_000,
    retry: false,
  });

  return {
    isAdmin: query.data?.isAdmin ?? false,
    role: query.data?.role,
    permissions: query.data?.permissions ?? [],
    isLoading: query.isLoading,
  };
}

export default useAdmin;
