import '@mantine/core/styles.css';
import { AppShell, MantineProvider, Loader, Center } from '@mantine/core';
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { SideBar, MenuItem, MenuGroup } from './components/layout/sidebar/SideBar';
import { UIShowcase } from './pages/UIShowcase';
import { Login } from './pages/Login';
import { IconHome, IconPalette, IconLogout } from '@tabler/icons-react';
import { themes } from './components/themes/themeselect';
import { useEffect, useState } from 'react';
import { Theme } from './lib/theme';
import api from './api/client';

interface AuthState {
  authenticated: boolean;
  loading: boolean;
}

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AppShell
      padding="md"
      navbar={{ width: 150, breakpoint: 'sm' }}
    >
      <SideBar>
        <MenuGroup label="Navigation" icon={<IconHome size={16} />}>
          <MenuItem 
            label="Home" 
            onClick={() => navigate('/')} 
          />
          <MenuItem 
            label="UI Showcase" 
            icon={<IconPalette size={16} />}
            onClick={() => navigate('/ui-showcase')} 
          />
          <MenuItem 
            label="Logout" 
            icon={<IconLogout size={16} />}
            onClick={handleLogout} 
          />
        </MenuGroup>
      </SideBar>

      <AppShell.Main>
        {children}
      </AppShell.Main>
    </AppShell>
  );
}

function AppContent() {
  const [auth, setAuth] = useState<AuthState>({ authenticated: false, loading: true });
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get('/auth/status');
        setAuth({ authenticated: response.data.authenticated, loading: false });
        if (!response.data.authenticated && window.location.pathname !== '/login') {
          navigate('/login');
        }
      } catch (error) {
        setAuth({ authenticated: false, loading: false });
        navigate('/login');
      }
    };
    checkAuth();
  }, [navigate]);

  if (auth.loading) {
    return (
      <Center h="100vh">
        <Loader size="xl" />
      </Center>
    );
  }

  if (!auth.authenticated) {
    return <Login />;
  }

  return (
    <AuthenticatedLayout>
      <Routes>
        <Route path="/" element={<div>Welcome to MiniatureDB</div>} />
        <Route path="/ui-showcase" element={<UIShowcase />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthenticatedLayout>
  );
}

export default function App() {
  const [currentTheme, setCurrentTheme] = useState(themes[0]);

  useEffect(() => {
    const handleThemeChange = (event: CustomEvent<Theme>) => {
      setCurrentTheme(event.detail);
    };

    window.addEventListener('theme-change', handleThemeChange as EventListener);
    return () => {
      window.removeEventListener('theme-change', handleThemeChange as EventListener);
    };
  }, []);

  return (
    <MantineProvider theme={currentTheme.mantineTheme} defaultColorScheme="dark">
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </MantineProvider>
  );
}
