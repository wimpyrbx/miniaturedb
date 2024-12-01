import '@mantine/core/styles.css';
import './styles/global.css';
import { AppShell, MantineProvider, Loader, Center } from '@mantine/core';
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { SideBar } from './components/layout/sidebar/SideBar';
import { Login } from './pages/Login';
import { Home } from './pages/Home';
import { themes } from './components/themes/themeselect';
import { useEffect, useState, useMemo } from 'react';
import { Theme } from './lib/theme';
import api from './api/client';
import { defaultStyle } from './components/themes/styleselect/default';
import { compactStyle } from './components/themes/styleselect/compact';
import { FormShowcase } from './pages/showcases/FormShowcase';
import { DataShowcase } from './pages/showcases/DataShowcase';
import { ModalShowcase } from './pages/showcases/ModalShowcase';
import { MediaShowcase } from './pages/showcases/MediaShowcase';
import FloatingDiv from './components/FloatingDiv';

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
      <SideBar onLogout={handleLogout} />
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
        <Route path="/" element={<Home />} />
        <Route path="/showcases/forms" element={<FormShowcase />} />
        <Route path="/showcases/data" element={<DataShowcase />} />
        <Route path="/showcases/modals" element={<ModalShowcase />} />
        <Route path="/showcases/media" element={<MediaShowcase />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <FloatingDiv />
    </AuthenticatedLayout>
  );
}

export default function App() {
  const [currentTheme, setCurrentTheme] = useState(themes[0]);
  const [currentStyle, setCurrentStyle] = useState<'default' | 'compact'>('default');

  useEffect(() => {
    const handleThemeChange = (event: CustomEvent<Theme>) => {
      setCurrentTheme(event.detail);
    };

    const handleStyleChange = (event: CustomEvent<'default' | 'compact'>) => {
      setCurrentStyle(event.detail);
    };

    window.addEventListener('theme-change', handleThemeChange as EventListener);
    window.addEventListener('style-change', handleStyleChange as EventListener);
    return () => {
      window.removeEventListener('theme-change', handleThemeChange as EventListener);
      window.removeEventListener('style-change', handleStyleChange as EventListener);
    };
  }, []);

  const combinedTheme = useMemo(() => {
    const style = currentStyle === 'compact' ? compactStyle : defaultStyle;
    return {
      ...currentTheme.mantineTheme,
      components: {
        ...currentTheme.mantineTheme.components,
        ...style.components,
      },
      spacing: {
        ...currentTheme.mantineTheme.spacing,
        ...style.spacing,
      },
      radius: {
        ...currentTheme.mantineTheme.radius,
        ...style.radius,
      },
      shadows: {
        ...currentTheme.mantineTheme.shadows,
        ...style.shadows,
      }
    };
  }, [currentTheme, currentStyle]);

  return (
    <MantineProvider
      theme={{
        ...combinedTheme,
        components: {
          ...combinedTheme.components,
          Button: {
            styles: {
              root: {
                '&:focus, &:focus-visible': {
                  outline: 'none !important',
                  '-webkit-focus-ring-color': 'transparent !important',
                  boxShadow: 'none !important',
                },
              },
            },
          },
        },
      }}
      defaultColorScheme="dark"
    >
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </MantineProvider>
  );
}
