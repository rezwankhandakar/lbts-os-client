import { useQuery } from '@tanstack/react-query';
import useAuth from './useAuth';
import useAxiosSecure from './useAxiosSecure';

const useRole = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();

  const {  data } = useQuery({
    queryKey: ['user-role', user?.email],
    enabled: !!user?.email,
    queryFn: async () => {
      const res = await axiosSecure.get(`/users/${user.email}/role`);
      return res.data;
    }
  });

  return {
    role: data?.role,
    status: data?.status,
  };
};

export default useRole;
