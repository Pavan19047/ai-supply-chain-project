import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
`;

const LoginCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 3rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
`;

const Logo = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const LogoIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const LogoText = styled.h1`
  font-size: 1.8rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0;
`;

const LogoSubtext = styled.p`
  color: #718096;
  margin: 0.5rem 0 0 0;
  font-size: 0.9rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 0.9rem;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &:focus {
    outline: none;
    border-color: #3182ce;
    box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
  }

  &:disabled {
    background: #f7fafc;
    cursor: not-allowed;
  }
`;

const Button = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ErrorMessage = styled.div`
  background: #fed7d7;
  color: #c53030;
  padding: 1rem;
  border-radius: 12px;
  font-size: 0.9rem;
  text-align: center;
`;

const DemoCredentials = styled.div`
  background: #e6fffa;
  border: 1px solid #81e6d9;
  padding: 1rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
`;

const DemoTitle = styled.h4`
  color: #234e52;
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
`;

const DemoInfo = styled.p`
  color: #2d3748;
  margin: 0;
  font-size: 0.85rem;
  line-height: 1.4;
`;

const LinkContainer = styled.div`
  text-align: center;
  margin-top: 1.5rem;
`;

const StyledLink = styled(Link)`
  color: #3182ce;
  text-decoration: none;
  font-weight: 600;

  &:hover {
    text-decoration: underline;
  }
`;

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    const result = await login(email, password);
    if (!result.success) {
      setError(result.error || 'Login failed. Please check your credentials.');
    } else {
      // Login successful, navigation will happen via useEffect
      navigate('/dashboard');
    }
  };

  const fillDemoCredentials = () => {
    setEmail('admin@supply.com');
    setPassword('admin123');
  };

  return (
    <Container>
      <LoginCard>
        <Logo>
          <LogoIcon>🏭</LogoIcon>
          <LogoText>Supply Chain AI</LogoText>
          <LogoSubtext>Intelligent Supply Management</LogoSubtext>
        </Logo>

        <DemoCredentials>
          <DemoTitle>Demo Access</DemoTitle>
          <DemoInfo>
            Email: admin@supply.com<br />
            Password: admin123<br />
            <button
              type="button"
              onClick={fillDemoCredentials}
              style={{
                background: 'none',
                border: 'none',
                color: '#3182ce',
                textDecoration: 'underline',
                cursor: 'pointer',
                fontSize: '0.85rem',
                marginTop: '0.5rem'
              }}
            >
              Click to fill demo credentials
            </button>
          </DemoInfo>
        </DemoCredentials>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="email">Email Address</Label>
            <Input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={isLoading}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="password">Password</Label>
            <Input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={isLoading}
            />
          </FormGroup>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? '🔄 Signing in...' : '🚀 Sign In'}
          </Button>
        </Form>

        <LinkContainer>
          <StyledLink to="/register">
            Don't have an account? Sign up
          </StyledLink>
        </LinkContainer>
      </LoginCard>
    </Container>
  );
};

export default Login;