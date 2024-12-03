import '@mantine/core/styles.css';
import './styles/global.css';
import { AppShell, MantineProvider, Loader, Center } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
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
import FloatingDiv from './components/FloatingDiv';
import Products from './pages/Products';
import { ProductAdmin } from './pages/ProductAdmin';
import { ClassificationAdmin } from './pages/ClassificationAdmin';
import { UIExamples } from './pages/UIExamples';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Notifications } from '@mantine/notifications';
import { checkAuth } from './api/client';
import { useMantineColorScheme } from '@mantine/core';

interface AuthState {
  authenticated: boolean;
  loading: boolean;
}

interface UserSettings {
  colormode: 'light' | 'dark';
  colortheme: string;
  styletheme: string;
}

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

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
      <SideBar onLogout={handleLogout} />
      <AppShell.Main>
        {children}
      </AppShell.Main>
    </AppShell>
  );
}

export default function App() {
  const [theme, setTheme] = useState<Theme>(themes.find(t => t.label === '⚫ Graphite') || themes[0]);
  const [style, setStyle] = useState(defaultStyle);
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('dark');
  const [authState, setAuthState] = useState<AuthState>({
    authenticated: false,
    loading: true
  });

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const response = await checkAuth();
        setAuthState({
          authenticated: response.authenticated,
          loading: false
        });

        if (response.authenticated) {
          try {
            const settings = await getSettings();
            if (settings.colormode) {
              setColorScheme(settings.colormode);
            }
            if (settings.colortheme) {
              const selectedTheme = themes.find(t => 
                t.label.replace(/^[^\w\s]+ /, '').toLowerCase() === settings.colortheme
              );
              if (selectedTheme) {
                setTheme(selectedTheme);
              }
            }
            if (settings.styletheme) {
              setStyle(settings.styletheme === 'default' ? defaultStyle : compactStyle);
            }
          } catch (error) {
            console.error('Failed to load user settings:', error);
          }
        }
      } catch (error) {
        setAuthState({
          authenticated: false,
          loading: false
        });
      }
    };

    checkAuthentication();
  }, []);

  useEffect(() => {
    if (!authState.authenticated) return;

    const handleThemeChange = (event: Event) => {
      const customEvent = event as CustomEvent<Theme>;
      setTheme(customEvent.detail);
    };

    const handleStyleChange = (event: Event) => {
      const customEvent = event as CustomEvent<'default' | 'compact'>;
      setStyle(customEvent.detail === 'default' ? defaultStyle : compactStyle);
    };

    const handleColorSchemeChange = (event: Event) => {
      const customEvent = event as CustomEvent<'light' | 'dark'>;
      setColorScheme(customEvent.detail);
    };

    window.addEventListener('theme-change', handleThemeChange);
    window.addEventListener('style-change', handleStyleChange);
    window.addEventListener('color-scheme-change', handleColorSchemeChange);

    return () => {
      window.removeEventListener('theme-change', handleThemeChange);
      window.removeEventListener('style-change', handleStyleChange);
      window.removeEventListener('color-scheme-change', handleColorSchemeChange);
    };
  }, [authState.authenticated]);

  const queryClient = useMemo(() => new QueryClient(), []);

  const appContent = authState.loading ? (
    <Center style={{ width: '100vw', height: '100vh' }}>
      <Loader size="xl" />
    </Center>
  ) : (
    <ModalsProvider>
      <Notifications />
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route 
              path="/login" 
              element={
                authState.authenticated ? (
                  <Navigate to="/" replace />
                ) : (
                  <Login onLogin={() => setAuthState({ authenticated: true, loading: false })} />
                )
              } 
            />
            <Route 
              path="/" 
              element={
                authState.authenticated ? (
                  <AuthenticatedLayout><Home /></AuthenticatedLayout>
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            <Route 
              path="/products" 
              element={
                authState.authenticated ? (
                  <AuthenticatedLayout><Products /></AuthenticatedLayout>
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            <Route 
              path="/product-admin" 
              element={
                authState.authenticated ? (
                  <AuthenticatedLayout><ProductAdmin /></AuthenticatedLayout>
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            <Route 
              path="/classification-admin" 
              element={
                authState.authenticated ? (
                  <AuthenticatedLayout><ClassificationAdmin /></AuthenticatedLayout>
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            <Route 
              path="/ui-examples" 
              element={
                authState.authenticated ? (
                  <AuthenticatedLayout><UIExamples /></AuthenticatedLayout>
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
          </Routes>
          {authState.authenticated && <FloatingDiv />}
        </BrowserRouter>
      </QueryClientProvider>
    </ModalsProvider>
  );

  return (
    <MantineProvider
      theme={{
        ...theme.mantineTheme,
        ...style,
        colorScheme
      }}
    >
      {appContent}
    </MantineProvider>
  );
}
