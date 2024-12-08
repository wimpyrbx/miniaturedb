import { AppShell } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AppContext } from '../../App';
import { SideBar } from './sidebar/SideBar';
import api from '../../api/client';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const navigate = useNavigate();
  const { setThemeSettingsVisible } = useContext(AppContext);

  const handleLogout = async () => {
    try {
      await api.post('/api/auth/logout');
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AppShell
      padding="md"
      navbar={{ width: 250, breakpoint: 'sm' }}
      styles={{
        main: {
          width: '100%',
          minHeight: '100vh',
          paddingRight: 'var(--mantine-spacing-md)',
          overflow: 'auto'
        }
      }}
    >
      <SideBar 
        onLogout={handleLogout} 
        onToggleThemeSettings={() => setThemeSettingsVisible(prev => !prev)} 
      />
      <AppShell.Main>
        {children}
      </AppShell.Main>
    </AppShell>
  );
} 