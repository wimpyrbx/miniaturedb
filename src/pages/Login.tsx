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

export function Login({ onLogin }: { onLogin: () => void }) {
  // Create a unique ID for this component instance

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState<{ [key: number]: boolean }>({});
  const [currentAnimation, setCurrentAnimation] = useState<{ className: string }>({ className: 'kenburns1' });
  const navigate = useNavigate();

  useEffect(() => {
    const loadImage = (src: string) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          resolve(img);
        };
        img.onerror = reject;
        img.src = src;
      });
    };

    // Preload all background images
    Promise.all(defaultBackgrounds.map(src => loadImage(src)))
      .then(() => {
        setImagesLoaded(prev => ({
          ...prev,
          [currentBgIndex]: true
        }));
      })
      .catch(() => {
        // Silently handle error
      });

    // Background rotation interval
    const intervalId = setInterval(() => {
      setCurrentBgIndex(prevIndex => {
        const newIndex = (prevIndex + 1) % defaultBackgrounds.length;
        return newIndex;
      });
      setCurrentAnimation(prevAnimation => ({
        className: prevAnimation.className === 'kenburns1' ? 'kenburns2' : 
                  prevAnimation.className === 'kenburns2' ? 'kenburns3' : 'kenburns1'
      }));
    }, 10000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login({ username, password });
      onLogin();
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'An error occurred during login');
    } finally {
      setLoading(false);
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
        {Object.keys(imagesLoaded).length > 0 && (
          <BackgroundImage 
            src={defaultBackgrounds[currentBgIndex]}
            className={currentAnimation.className}
            style={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              transition: 'background-image 3s ease-in-out, opacity 1s ease-in-out',
              filter: 'brightness(0.2) blur(8px)',
              transformOrigin: 'center center',
              overflow: 'hidden',
              opacity: imagesLoaded[currentBgIndex] ? 1 : 0,
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
                  loading={loading}
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