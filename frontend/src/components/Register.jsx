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

const RegisterCard = styled.div`
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

const SuccessMessage = styled.div`
  background: #c6f6d5;
  color: #2f855a;
  padding: 1rem;
  border-radius: 12px;
  font-size: 0.9rem;
  text-align: center;
`;

const PasswordRequirements = styled.div`
  background: #f7fafc;
  padding: 1rem;
  border-radius: 12px;
  margin-top: 0.5rem;
`;

const RequirementTitle = styled.h4`
  color: #4a5568;
  margin: 0 0 0.5rem 0;
  font-size: 0.85rem;
`;

const RequirementList = styled.ul`
  margin: 0;
  padding-left: 1.2rem;
  font-size: 0.8rem;
  color: #718096;
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

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { register, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validatePassword = (password) => {
    const requirements = [
      { test: password.length >= 8, message: 'At least 8 characters' },
      { test: /[A-Z]/.test(password), message: 'One uppercase letter' },
      { test: /[a-z]/.test(password), message: 'One lowercase letter' },
      { test: /\d/.test(password), message: 'One number' }
    ];

    return requirements;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const { fullName, email, password, confirmPassword } = formData;

    // Validation
    if (!fullName || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const passwordRequirements = validatePassword(password);
    const failedRequirements = passwordRequirements.filter(req => !req.test);
    
    if (failedRequirements.length > 0) {
      setError('Password does not meet requirements');
      return;
    }

    const result = await register(email, password, fullName);
    if (result.success) {
      setSuccess('Account created successfully! Redirecting...');
      setTimeout(() => navigate('/dashboard'), 1000);
    } else {
      setError(result.error || 'Registration failed. Please try again.');
    }
  };

  const passwordRequirements = validatePassword(formData.password);

  return (
    <Container>
      <RegisterCard>
        <Logo>
          <LogoIcon>🏭</LogoIcon>
          <LogoText>Supply Chain AI</LogoText>
          <LogoSubtext>Create Your Account</LogoSubtext>
        </Logo>

        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
              disabled={isLoading}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="email">Email Address</Label>
            <Input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              disabled={isLoading}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="password">Password</Label>
            <Input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              disabled={isLoading}
            />
            {formData.password && (
              <PasswordRequirements>
                <RequirementTitle>Password Requirements:</RequirementTitle>
                <RequirementList>
                  {passwordRequirements.map((req, index) => (
                    <li
                      key={index}
                      style={{
                        color: req.test ? '#38a169' : '#e53e3e',
                        fontWeight: req.test ? '600' : 'normal'
                      }}
                    >
                      {req.test ? '✓' : '✗'} {req.message}
                    </li>
                  ))}
                </RequirementList>
              </PasswordRequirements>
            )}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              disabled={isLoading}
            />
          </FormGroup>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? '🔄 Creating Account...' : '✨ Create Account'}
          </Button>
        </Form>

        <LinkContainer>
          <StyledLink to="/login">
            Already have an account? Sign in
          </StyledLink>
        </LinkContainer>
      </RegisterCard>
    </Container>
  );
};

export default Register;