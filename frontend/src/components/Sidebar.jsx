import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';

const SidebarContainer = styled.div`
  width: 280px;
  background: linear-gradient(180deg, #1a202c 0%, #2d3748 100%);
  color: white;
  display: flex;
  flex-direction: column;
  padding: 1.5rem 0;
  box-shadow: 4px 0 10px rgba(0, 0, 0, 0.1);
`;

const Logo = styled.div`
  padding: 0 1.5rem 2rem 1.5rem;
  border-bottom: 1px solid #4a5568;
  margin-bottom: 1rem;
`;

const LogoTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const LogoSubtitle = styled.p`
  font-size: 0.85rem;
  color: #a0aec0;
  margin: 0;
`;

const Navigation = styled.nav`
  flex: 1;
  padding: 1rem 0;
`;

const NavItem = styled(Link)`
  display: flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  color: ${props => props.$active ? '#667eea' : '#e2e8f0'};
  text-decoration: none;
  font-weight: ${props => props.$active ? '600' : '400'};
  background: ${props => props.$active ? 'rgba(102, 126, 234, 0.1)' : 'transparent'};
  border-right: ${props => props.$active ? '3px solid #667eea' : '3px solid transparent'};
  transition: all 0.2s ease;

  &:hover {
    background: rgba(102, 126, 234, 0.1);
    color: #667eea;
  }
`;

const NavIcon = styled.span`
  font-size: 1.2rem;
  margin-right: 0.75rem;
  width: 20px;
  text-align: center;
`;

const NavText = styled.span`
  font-size: 0.95rem;
`;

const UserSection = styled.div`
  padding: 1rem 1.5rem;
  border-top: 1px solid #4a5568;
  margin-top: auto;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-right: 0.75rem;
`;

const UserDetails = styled.div``;

const UserName = styled.div`
  font-weight: 600;
  font-size: 0.9rem;
  color: #e2e8f0;
`;

const UserRole = styled.div`
  font-size: 0.75rem;
  color: #a0aec0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const LogoutButton = styled.button`
  width: 100%;
  padding: 0.5rem;
  background: transparent;
  border: 1px solid #4a5568;
  color: #a0aec0;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #4a5568;
    color: white;
  }
`;

const menuItems = [
  { path: '/dashboard', icon: '🏠', label: 'Dashboard' },
  { path: '/inventory', icon: '📦', label: 'Inventory Management' },
  { path: '/forecasting', icon: '📈', label: 'Demand Forecasting' },
  { path: '/anomalies', icon: '🚨', label: 'Anomaly Detection' },
  { path: '/analytics', icon: '📊', label: 'Analytics & Reports' },
];

const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const getUserInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <SidebarContainer>
      <Logo>
        <LogoTitle>🚀 SupplyChain AI</LogoTitle>
        <LogoSubtitle>Intelligent Supply Management</LogoSubtitle>
      </Logo>

      <Navigation>
        {menuItems.map((item) => (
          <NavItem 
            key={item.path} 
            to={item.path}
            $active={location.pathname === item.path}
          >
            <NavIcon>{item.icon}</NavIcon>
            <NavText>{item.label}</NavText>
          </NavItem>
        ))}
      </Navigation>

      <UserSection>
        <UserInfo>
          <UserAvatar>{getUserInitials(user?.full_name || user?.email)}</UserAvatar>
          <UserDetails>
            <UserName>{user?.full_name || user?.email || 'User'}</UserName>
            <UserRole>{user?.role || 'User'}</UserRole>
          </UserDetails>
        </UserInfo>
        <LogoutButton onClick={handleLogout}>
          🚪 Logout
        </LogoutButton>
      </UserSection>
    </SidebarContainer>
  );
};

export default Sidebar;