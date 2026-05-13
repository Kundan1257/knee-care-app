import { useContext } from 'react';
import { AuthContext } from '../App';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const usePremium = () => {
  const { user } = useAuth();
  const isPremiumLocal = typeof window !== 'undefined' ? localStorage.getItem('is_premium') === 'true' : false;
  return user?.isPremium || isPremiumLocal;
};
