import React, { useState } from 'react';
import styled from 'styled-components';
import Dashboard from './components/Dashboard';
import ChatInterface from './components/ChatInterface';

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background-color: var(--color-bg);
`;

const Nav = styled.nav`
  display: flex;
  justify-content: center;
  padding: 1.5rem;
  gap: 1.5rem;
`;

const NavButton = styled.button`
  background: var(--color-bg);
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 20px;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  box-shadow: ${props => props.active ? 'var(--shadow-pressed)' : 'var(--shadow-raised)'};

  &:hover {
    color: var(--color-text-primary);
  }

  &:active {
    box-shadow: var(--shadow-pressed);
  }
`;

const ContentArea = styled.main`
  flex-grow: 1;
  overflow-y: auto;
  padding: 0 2rem 2rem 2rem;
`;

function App() {
  const [activeView, setActiveView] = useState('dashboard');

  return (
    <AppContainer>
      <Nav>
        <NavButton active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')}>
          📦 Inventory Vision
        </NavButton>
        <NavButton active={activeView === 'chat'} onClick={() => setActiveView('chat')}>
          🤖 AI Chat Assistant
        </NavButton>
      </Nav>
      <ContentArea>
        {activeView === 'dashboard' && <Dashboard />}
        {activeView === 'chat' && <ChatInterface />}
      </ContentArea>
    </AppContainer>
  );
}

export default App;
