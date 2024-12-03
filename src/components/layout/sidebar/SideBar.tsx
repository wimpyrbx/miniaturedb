import { UnstyledButton, Group, Text, AppShell, Stack, Button } from '@mantine/core';
import { IconLogout, IconHome, IconPackage, IconSettings, IconPalette } from '@tabler/icons-react';
import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface MenuItemProps {
  label: string;
  icon: React.ElementType;
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
    backgroundColor: 'transparent',
    '&:hover': {
      backgroundColor: 'light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-6))',
    },
    '&[dataActive="true"]': {
      backgroundColor: 'var(--mantine-color-blue-light)',
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

export function MenuItem({ label, icon: Icon, onClick }: MenuItemProps) {
  return (
    <UnstyledButton 
      onClick={onClick} 
      style={styles.menuItem}
    >
      <Group>
        {Icon && <Icon size={16} />}
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

  const items = [
    { link: '/', label: 'Home', icon: IconHome },
    { link: '/products', label: 'Products', icon: IconPackage },
    { link: '/product-admin', label: 'Product Admin', icon: IconSettings },
  ];

  const testPages = [
    { link: '/ui-examples', label: 'UI Examples', icon: IconPalette },
  ];

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
            {items.map((item) => (
              <MenuItem 
                key={item.link} 
                label={item.label} 
                icon={item.icon}
                onClick={() => navigate(item.link)} 
              />
            ))}
          </MenuGroup>

          <MenuGroup label="Test Pages" icon={<IconPalette size={16} />}>
            {testPages.map((item) => (
              <MenuItem 
                key={item.link} 
                label={item.label} 
                icon={item.icon}
                onClick={() => navigate(item.link)} 
              />
            ))}
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