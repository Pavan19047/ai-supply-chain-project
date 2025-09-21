import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import components
import Login from './components/Login';
import Register from './components/Register';
import MainDashboard from './components/MainDashboard';
import InventoryManagement from './components/InventoryManagement';
import ForecastingDashboard from './components/ForecastingDashboard';
import AnomalyDetection from './components/AnomalyDetection';
import DataVisualization from './components/DataVisualization';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

// Styled components
import styled from 'styled-components';

const AppContainer = styled.div`
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ContentArea = styled.main`
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
  background: #f8fafc;
  margin: 1rem;
  border-radius: 1rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
`;

const AuthContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" />;
};

// Main App Layout
const AppLayout = () => {
  const [activeView, setActiveView] = useState('dashboard');
  
  return (
    <AppContainer>
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <MainContent>
        <Header />
        <ContentArea>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<MainDashboard />} />
            <Route path="/inventory" element={<InventoryManagement />} />
            <Route path="/forecasting" element={<ForecastingDashboard />} />
            <Route path="/anomalies" element={<AnomalyDetection />} />
            <Route path="/analytics" element={<DataVisualization />} />
          </Routes>
        </ContentArea>
      </MainContent>
    </AppContainer>
  );
};

// Main App Component
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/*" element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          } />
        </Routes>
        <ToastContainer 
          position="top-right" 
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </Router>
    </AuthProvider>
  );
}

export default App;
