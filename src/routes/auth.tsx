import { RouteObject } from 'react-router-dom';
import { Login } from '../pages/Login';
import { useCallback } from 'react';

// We need to wrap the Login component to handle the onLogin prop
const LoginWrapper = () => {
  const handleLogin = useCallback(() => {
    window.location.href = '/';  // Force a full reload to update auth state
  }, []);

  return <Login onLogin={handleLogin} />;
};

export const authRoutes: RouteObject[] = [
  {
    path: '/login',
    element: <LoginWrapper />
  }
]; 