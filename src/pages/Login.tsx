import { useState } from 'react';
import { TextInput, Button, Paper, Title, Container, Stack, Box } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await api.post('/auth/login', { username, password });
      if (response.data.success) {
        navigate('/');
      }
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <Box w="100%" h="100vh" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Container size={420} m={0} p={0}>
        <Stack gap="lg">
          <Title ta="center">Welcome to MiniatureDB</Title>
          
          <Paper withBorder shadow="md" p={30} radius="md">
            <form onSubmit={handleSubmit}>
              <TextInput
                label="Username"
                placeholder="Your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              
              <TextInput
                label="Password"
                type="password"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                mt="md"
              />

              {error && (
                <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>
              )}
              
              <Button type="submit" fullWidth mt="xl">
                Sign in
              </Button>
            </form>
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
} 