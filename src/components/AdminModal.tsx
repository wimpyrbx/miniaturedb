import { Modal, Title, Group, Box, useMantineTheme, useMantineColorScheme, Text } from '@mantine/core';
import { ReactNode } from 'react';

interface AdminModalProps {
  opened: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: string | number;
  icon?: ReactNode;
  fullScreen?: boolean;
  rightHeaderText?: ReactNode;
}

export function AdminModal({ 
  opened, 
  onClose, 
  title, 
  children, 
  size = 'lg',
  icon,
  fullScreen = false,
  rightHeaderText
}: AdminModalProps) {
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size={size}
      fullScreen={fullScreen}
      padding={0}
      radius="md"
      styles={{
        header: {
          margin: 0,
          padding: 0,
          display: 'none'
        },
        body: {
          padding: 0,
        },
        content: {
          backgroundColor: isDark ? theme.colors.dark[6] : theme.white,
          color: isDark ? theme.colors.green[5] : theme.colors.green[5],
          border: `1px solid ${isDark ? theme.colors.dark[5] : theme.colors.dark[2]}`
        }
      }}
    >
      <Box>
        <Group 
          p="md" 
          justify="space-between"
          style={{
            backgroundColor: isDark ? theme.colors.green[9] : theme.colors.green[9],
            borderTopLeftRadius: theme.radius.md,
            borderTopRightRadius: theme.radius.md,
          }}
        >
          <Group gap="sm">
            {icon}
            <Title order={3} c="white">{title}</Title>
          </Group>
          {rightHeaderText && (
            <Text c="white" size="sm" style={{ whiteSpace: 'pre-line' }}>{rightHeaderText}</Text>
          )}
        </Group>
        <Box p="md">
          {children}
        </Box>
      </Box>
    </Modal>
  );
} 