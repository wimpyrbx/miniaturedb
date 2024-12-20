import { UnstyledButton, Group, Text, AppShell, Stack, Button, rem } from '@mantine/core';
import { IconLogout, IconPalette } from '@tabler/icons-react';
import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { sidebarLinks } from '../../../config/sidebar';

interface MenuItemProps {
  label: string;
  icon: React.ElementType;
  onClick?: () => void;
  color?: string;
}

interface MenuGroupProps {
  label: string;
  icon?: ReactNode;
  children: ReactNode;
  color?: string;
}

const styles = {
  menuItem: {
    display: 'block',
    width: '100%',
    padding: 'var(--mantine-spacing-xs) var(--mantine-spacing-sm)',
    borderRadius: 'var(--mantine-radius-sm)',
    color: 'inherit',
    backgroundColor: 'transparent',
    fontSize: rem(13),
    '&:hover': {
      backgroundColor: 'var(--mantine-color-dark-6)',
    }
  },
  menuItemActive: {
    backgroundColor: 'var(--mantine-color-dark-5)',
    '&:hover': {
      backgroundColor: 'var(--mantine-color-dark-4)',
    }
  },
  menuGroup: {
    padding: 'var(--mantine-spacing-sm)',
  },
  menuGroupHeader: {
    padding: 'var(--mantine-spacing-xs)',
    marginBottom: rem(12),
    borderRadius: 'var(--mantine-radius-sm)',
    backgroundColor: 'var(--mantine-color-dark-6)',
  },
  menuGroupLabel: {
    textTransform: 'uppercase' as const,
    fontWeight: 700,
    fontSize: rem(12),
    letterSpacing: rem(0.8),
    color: 'var(--mantine-color-white)',
  },
  sidebarContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100%',
  },
  mainContent: {
    flex: 1,
  },
  logoutButton: {
    padding: 'var(--mantine-spacing-xs)',
  }
};

export function MenuItem({ label, icon: Icon, onClick, isActive, color = 'blue' }: MenuItemProps & { isActive?: boolean }) {
  return (
    <UnstyledButton 
      onClick={onClick} 
      style={{
        ...styles.menuItem,
        ...(isActive ? styles.menuItemActive : {})
      }}
    >
      <Group gap="xs">
        {Icon && <Icon size={16} style={{ 
          color: isActive 
            ? `var(--mantine-color-${color}-4)`
            : 'var(--mantine-color-dimmed)'
        }} />}
        <Text size="sm" c={isActive ? 'white' : 'dimmed'} inherit>{label}</Text>
      </Group>
    </UnstyledButton>
  );
}

export function MenuGroup({ label, icon, children, color = 'blue' }: MenuGroupProps) {
  return (
    <div style={styles.menuGroup}>
      <Group gap="xs" style={styles.menuGroupHeader}>
        {icon}
        <Text style={styles.menuGroupLabel}>{label}</Text>
      </Group>
      <Stack gap="xs">
        {children}
      </Stack>
    </div>
  );
}

export function SideBar({ onLogout, onToggleThemeSettings }: { 
  onLogout?: () => void;
  onToggleThemeSettings: () => void;
}) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <AppShell.Navbar 
      style={{ 
        borderRight: '1px solid var(--mantine-color-dark-4)',
        background: 'var(--mantine-color-dark-7)',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <div style={styles.sidebarContainer}>
        <div style={styles.mainContent}>
          <MenuGroup 
            label="Navigation"
          >
            {sidebarLinks.map((item) => (
              <MenuItem 
                key={item.link} 
                label={item.label} 
                icon={item.icon}
                color={item.color}
                onClick={() => navigate(item.link)}
                isActive={location.pathname === item.link}
              />
            ))}
          </MenuGroup>
        </div>

        <Stack gap="xs" style={styles.logoutButton}>
          <Button 
            fullWidth 
            variant="subtle" 
            color="blue" 
            onClick={onToggleThemeSettings}
            leftSection={<IconPalette size={16} />}
            size="sm"
          >
            Theme Settings
          </Button>
          <Button 
            fullWidth 
            variant="subtle" 
            color="red" 
            onClick={onLogout}
            leftSection={<IconLogout size={16} />}
            size="sm"
          >
            Logout
          </Button>
        </Stack>
      </div>
    </AppShell.Navbar>
  );
} 