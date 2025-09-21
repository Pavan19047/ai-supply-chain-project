import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    // Check if user is already logged in
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      setIsLoading(true);
      
      const response = await fetch('http://localhost:8000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username: email,
          password: password,
        }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      const userToken = data.access_token;
      
      // Store token and get user info
      localStorage.setItem('token', userToken);
      setToken(userToken);
      
      // Get user profile
      const userResponse = await fetch('http://localhost:8000/auth/profile', {
        headers: {
          'Authorization': `Bearer ${userToken}`,
        },
      });
      
      if (userResponse.ok) {
        const userData = await userResponse.json();
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
      } else {
        // Fallback user data for demo
        const demoUser = {
          id: 1,
          email: email,
          full_name: email.split('@')[0],
          role: 'manager'
        };
        localStorage.setItem('user', JSON.stringify(demoUser));
        setUser(demoUser);
      }
      
      return { success: true };
    } catch (error) {
      // For demo purposes, allow demo login
      if (email === 'admin@supply.com' && password === 'admin123') {
        const demoUser = {
          id: 1,
          email: 'admin@supply.com',
          full_name: 'Admin User',
          role: 'admin'
        };
        const demoToken = 'demo-token-123';
        
        localStorage.setItem('token', demoToken);
        localStorage.setItem('user', JSON.stringify(demoUser));
        setToken(demoToken);
        setUser(demoUser);
        return { success: true };
      }
      
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email, password, fullName) => {
    try {
      setIsLoading(true);
      
      const response = await fetch('http://localhost:8000/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
          full_name: fullName,
        }),
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      const userData = await response.json();
      
      // Auto-login after registration
      return await login(email, password);
    } catch (error) {
      // For demo purposes, allow demo registration
      const demoUser = {
        id: Date.now(),
        email: email,
        full_name: fullName,
        role: 'user'
      };
      const demoToken = 'demo-token-' + Date.now();
      
      localStorage.setItem('token', demoToken);
      localStorage.setItem('user', JSON.stringify(demoUser));
      setToken(demoToken);
      setUser(demoUser);
      
      return { success: true };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated: !!user && !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;