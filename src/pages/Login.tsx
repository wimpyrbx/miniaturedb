/**
 * @file Login.tsx
 * @description Login page component with authentication handling
 */

import { useState, useEffect } from 'react';
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
  BackgroundImage,
  Overlay,
} from '@mantine/core';
import { IconAlertCircle, IconLock } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/client';

// Default backgrounds - will be shuffled
const defaultBackgrounds = [
  '/images/backgrounds/dnd1.webp',
  '/images/backgrounds/dnd2.webp',
  '/images/backgrounds/dnd3.webp',
  '/images/backgrounds/dnd4.webp',
  '/images/backgrounds/dnd5.webp'
];

// Ken Burns animations with slower movement
const kenBurnsAnimations = [
  {
    className: 'kenburns1',
    style: 'animation: kenburns1 60s ease-in-out infinite alternate'
  },
  {
    className: 'kenburns2',
    style: 'animation: kenburns2 55s ease-in-out infinite alternate'
  },
  {
    className: 'kenburns3',
    style: 'animation: kenburns3 65s ease-in-out infinite alternate'
  }
];

export function Login({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [backgrounds, setBackgrounds] = useState<string[]>([]);
  const [currentAnimation] = useState(() => 
    kenBurnsAnimations[Math.floor(Math.random() * kenBurnsAnimations.length)]
  );
  const navigate = useNavigate();

  useEffect(() => {
    const shuffled = [...defaultBackgrounds].sort(() => Math.random() - 0.5);
    setBackgrounds(shuffled);
    console.log('Initial backgrounds:', shuffled);
  }, []);

  useEffect(() => {
    if (backgrounds.length === 0) return;

    const interval = setInterval(() => {
      setCurrentBgIndex((prev) => {
        const newIndex = (prev + 1) % backgrounds.length;
        console.log('Changing background to:', backgrounds[newIndex]);
        return newIndex;
      });
    }, 8000);

    return () => clearInterval(interval);
  }, [backgrounds]);

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
    <>
      <style>
        {`
          @keyframes kenburns1 {
            0% { transform: scale(1) translate(0, 0); }
            100% { transform: scale(1.3) translate(5%, 5%); }
          }
          @keyframes kenburns2 {
            0% { transform: scale(1) translate(0, 0); }
            100% { transform: scale(1.4) translate(-8%, 3%); }
          }
          @keyframes kenburns3 {
            0% { transform: scale(1) translate(0, 0); }
            100% { transform: scale(1.5) translate(3%, -8%); }
          }
          .kenburns1 { animation: kenburns1 60s ease-in-out infinite alternate; }
          .kenburns2 { animation: kenburns2 55s ease-in-out infinite alternate; }
          .kenburns3 { animation: kenburns3 65s ease-in-out infinite alternate; }
        `}
      </style>
      <Box pos="relative" mih="100vh" style={{ display: 'flex', alignItems: 'center', background: '#1a1b1e', overflow: 'hidden' }}>
        {backgrounds.length > 0 && (
          <BackgroundImage 
            src={backgrounds[currentBgIndex]}
            className={currentAnimation.className}
            style={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              transition: 'background-image 3s ease-in-out',
              filter: 'brightness(0.2) blur(8px)',
              transformOrigin: 'center center',
              overflow: 'hidden'
            }}
          />
        )}
        <Overlay 
          gradient="linear-gradient(145deg, rgba(0, 0, 0, 0.22) 0%, rgba(0, 0, 0, 0.22) 100%)" 
          zIndex={1} 
        />
        <Container size={420} pos="relative" style={{ zIndex: 2 }}>
          <Center mb={40}>
            <ThemeIcon size={60} radius={60} variant="dark">
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
    </>
  );
} 