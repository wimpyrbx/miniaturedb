/**
 * @file Login.tsx
 * @description Login page component with authentication handling
 */

import { useState } from 'react';
import {
  TextInput,
  PasswordInput,
  Paper,
  Title,
  Container,
  Button,
  Stack,
  Text,
  Divider,
  Alert,
  Center,
  Box,
  ThemeIcon,
} from '@mantine/core';
import { IconAlertCircle, IconLock } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/client';

export function Login({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login({ username, password });
      onLogin();
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid username or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box 
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(145deg, #1a1b1e 0%, #25262b 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Container size={420} my={40}>
        <Center mb={40}>
          <ThemeIcon size={60} radius={60} variant="light" color="gray.6">
            <IconLock size={30} stroke={1.5} />
          </ThemeIcon>
        </Center>

        <Title
          order={1}
          ta="center"
          style={(theme) => ({
            fontFamily: theme.fontFamily,
            fontWeight: 900,
            color: theme.white
          })}
        >
          MiniatureDB
        </Title>
        <Text c="gray.4" size="sm" ta="center" mt={5} mb={30}>
          Enter your credentials to access the dashboard
        </Text>

        <Paper withBorder shadow="md" p={30} radius="md" bg="dark.6">
          <form onSubmit={handleSubmit}>
            <Stack gap="md">
              {error && (
                <Alert icon={<IconAlertCircle size={16} stroke={1.5} />} color="red" variant="light">
                  {error}
                </Alert>
              )}

              <TextInput
                required
                label="Username"
                placeholder="Your username"
                value={username}
                onChange={(event) => setUsername(event.currentTarget.value)}
                styles={(theme) => ({
                  label: {
                    color: theme.colors.gray[4]
                  },
                  input: {
                    backgroundColor: theme.colors.dark[7],
                    borderColor: theme.colors.dark[4],
                    color: theme.white,
                    '&::placeholder': {
                      color: theme.colors.gray[5]
                    },
                    '&:focus': {
                      borderColor: theme.colors.gray[5]
                    }
                  }
                })}
              />

              <PasswordInput
                required
                label="Password"
                placeholder="Your password"
                value={password}
                onChange={(event) => setPassword(event.currentTarget.value)}
                styles={(theme) => ({
                  label: {
                    color: theme.colors.gray[4]
                  },
                  input: {
                    backgroundColor: theme.colors.dark[7],
                    borderColor: theme.colors.dark[4],
                    color: theme.white,
                    '&::placeholder': {
                      color: theme.colors.gray[5]
                    },
                    '&:focus': {
                      borderColor: theme.colors.gray[5]
                    }
                  },
                  innerInput: {
                    color: theme.white
                  }
                })}
              />

              <Button 
                fullWidth 
                type="submit" 
                loading={isLoading}
                variant="filled"
                color="gray.6"
                size="md"
              >
                Sign in
              </Button>
            </Stack>
          </form>

          <Divider 
            label="Security Notice" 
            labelPosition="center" 
            my="lg"
            styles={(theme) => ({
              label: {
                color: theme.colors.gray[5],
                fontSize: theme.fontSizes.xs
              }
            })}
          />

          <Text size="xs" c="dimmed" ta="center">
            This is a secure login page. Your connection is encrypted and your credentials are protected.
          </Text>
        </Paper>
      </Container>
    </Box>
  );
} 