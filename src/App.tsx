import '@mantine/core/styles.css';
import { AppShell, MantineProvider } from '@mantine/core';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { SideBar, MenuGroup, MenuItem } from './components/ui/sidebar/SideBar';
import { UIShowcase } from './pages/UIShowcase';
import { IconHome, IconPalette } from '@tabler/icons-react';
import { themes } from './theme';
import { useEffect, useState } from 'react';
import { Theme } from './lib/theme';

function AppContent() {
  const navigate = useNavigate();

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
        </MenuGroup>
      </SideBar>

      <AppShell.Main>
        <Routes>
          <Route path="/" element={<div>Welcome to MiniatureDB</div>} />
          <Route path="/ui-showcase" element={<UIShowcase />} />
        </Routes>
      </AppShell.Main>
    </AppShell>
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
