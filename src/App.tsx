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
import FloatingDiv from './components/FloatingDiv';
import { Products } from './pages/Products';
import { ProductAdmin } from './pages/ProductAdmin';
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

export function AppContent() {
  const [auth, setAuth] = useState<AuthState>({ loading: true, authenticated: false });
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const { setColorScheme } = useMantineColorScheme();
  const navigate = useNavigate();

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await api.get<UserSettings>('/api/settings');
        const settings = response.data;

        // Apply color mode
        setColorScheme(settings.colormode);

        // Find and apply theme
        const selectedTheme = themes.find(t => t.label === settings.colortheme);
        if (selectedTheme) {
          window.dispatchEvent(new CustomEvent('theme-change', { detail: selectedTheme }));
        }

        // Apply style theme
        window.dispatchEvent(new CustomEvent('style-change', { 
          detail: settings.styletheme as 'default' | 'compact' 
        }));

        setSettingsLoaded(true);
      } catch (error) {
        console.error('Error loading settings:', error);
        setSettingsLoaded(true); // Continue with defaults if settings fail to load
      }
    };

    const checkAuthStatus = async () => {
      try {
        const response = await checkAuth();
        setAuth({ authenticated: response.authenticated, loading: false });
        if (response.authenticated) {
          await loadSettings();
        } else if (window.location.pathname !== '/login') {
          navigate('/login');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setAuth({ authenticated: false, loading: false });
        navigate('/login');
      }
    };

    checkAuthStatus();
  }, [navigate]);

  if (auth.loading || (auth.authenticated && !settingsLoaded)) {
    return (
      <Center style={{ height: '100vh' }}>
        <Loader size="xl" />
      </Center>
    );
  }

  if (!auth.authenticated) {
    return <Login onLogin={() => setAuth({ loading: false, authenticated: true })} />;
  }

  return (
    <AuthenticatedLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/product-admin" element={<ProductAdmin />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <FloatingDiv />
    </AuthenticatedLayout>
  );
}

// Create a client
const queryClient = new QueryClient();

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
              },
            },
          },
        },
      }}
      defaultColorScheme="dark"
    >
      <QueryClientProvider client={queryClient}>
        <Notifications />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </QueryClientProvider>
    </MantineProvider>
  );
}
