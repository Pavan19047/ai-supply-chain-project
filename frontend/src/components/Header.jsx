import React from 'react';
import styled from 'styled-components';

const HeaderContainer = styled.header`
  background: white;
  padding: 1rem 2rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const HeaderTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-left: auto;
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f0fff4;
  border: 1px solid #9ae6b4;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  color: #2f855a;
`;

const StatusDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #38a169;
  animation: pulse 2s infinite;

  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }
`;

const NotificationBell = styled.button`
  position: relative;
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: background 0.2s ease;

  &:hover {
    background: #f7fafc;
  }
`;

const NotificationBadge = styled.span`
  position: absolute;
  top: 0;
  right: 0;
  background: #e53e3e;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
`;

const Header = () => {
  return (
    <HeaderContainer>
      <HeaderTitle>Supply Chain Control Center</HeaderTitle>
      <HeaderActions>
        <StatusIndicator>
          <StatusDot />
          System Online
        </StatusIndicator>
        <NotificationBell>
          🔔
          <NotificationBadge>3</NotificationBadge>
        </NotificationBell>
      </HeaderActions>
    </HeaderContainer>
  );
};

export default Header;