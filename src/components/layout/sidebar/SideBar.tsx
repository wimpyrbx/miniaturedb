import { Box, UnstyledButton, Group, Text, AppShell, Stack, Button } from '@mantine/core';
import { IconLogout, IconPalette, IconHome } from '@tabler/icons-react';
import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface MenuItemProps {
  label: string;
  icon?: ReactNode;
  onClick?: () => void;
}

interface MenuGroupProps {
  label: string;
  icon?: ReactNode;
  children: ReactNode;
}

const styles = {
  menuItem: {
    display: 'block',
    width: '100%',
    padding: 'var(--mantine-spacing-xs)',
    borderRadius: 'var(--mantine-radius-sm)',
    color: 'inherit',
    '&:hover': {
      backgroundColor: 'light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-6))',
    }
  },
  menuGroup: {
    padding: 'var(--mantine-spacing-xs)',
  },
  sidebarContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100%',
  },
  mainContent: {
    flex: 1,
    padding: 'var(--mantine-spacing-xs)',
  },
  logoutButton: {
    padding: 'var(--mantine-spacing-xs)',
  }
};

export function MenuItem({ label, icon, onClick }: MenuItemProps) {
  return (
    <UnstyledButton 
      onClick={onClick} 
      style={styles.menuItem}
      styles={(theme) => ({
        root: {

        }
      })}
    >
      <Group>
        {icon}
        <Text size="sm" inherit>{label}</Text>
      </Group>
    </UnstyledButton>
  );
}

export function MenuGroup({ label, icon, children }: MenuGroupProps) {
  return (
    <div style={styles.menuGroup}>
      <Group mb="xs" style={{ opacity: 0.65 }}>
        {icon}
        <Text size="sm" fw={500} inherit>{label}</Text>
      </Group>
      <Stack gap="xs">
        {children}
      </Stack>
    </div>
  );
}

export function SideBar({ onLogout }: { onLogout?: () => void }) {
  const navigate = useNavigate();

  return (
    <AppShell.Navbar 
      style={{ 
        borderRight: '1px solid var(--mantine-color-dark-4)',
        background: 'var(--mantine-color-body)',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <div style={styles.sidebarContainer}>
        <div style={styles.mainContent}>
          <MenuGroup label="Navigation" icon={<IconHome size={16} />}>
            <MenuItem 
              label="Home" 
              onClick={() => navigate('/')} 
            />
          </MenuGroup>
        </div>

        <div style={styles.logoutButton}>
          <Button 
            fullWidth 
            variant="subtle" 
            color="red" 
            onClick={onLogout}
            leftSection={<IconLogout size={16} />}
          >
            Logout
          </Button>
        </div>
      </div>
    </AppShell.Navbar>
  );
} 