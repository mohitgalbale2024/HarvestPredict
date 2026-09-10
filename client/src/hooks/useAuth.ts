import { useAuthContext } from '@/context/AuthContext';

export const useAuth = () => {
  const { user, token, isAuthenticated, isLoading, isGuest, login, register, guestLogin, logout, me } = useAuthContext();

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    isGuest,
    login,
    register,
    guestLogin,
    logout,
    me,
  };
};
