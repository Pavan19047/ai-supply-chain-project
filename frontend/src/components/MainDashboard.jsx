import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement } from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement);

const DashboardContainer = styled.div`
  padding: 2rem;
  background: #f8fafc;
  min-height: 100vh;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: #718096;
  font-size: 1.1rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border-left: 4px solid ${props => props.color || '#667eea'};
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: #718096;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ChartGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const ChartCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;

const ChartTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 1rem;
`;

const AlertsSection = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
`;

const AlertItem = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem;
  margin-bottom: 0.5rem;
  border-radius: 8px;
  background: ${props => {
    switch(props.severity) {
      case 'high': return '#fed7d7';
      case 'medium': return '#fefcbf';
      case 'low': return '#c6f6d5';
      default: return '#e2e8f0';
    }
  }};
  border-left: 4px solid ${props => {
    switch(props.severity) {
      case 'high': return '#e53e3e';
      case 'medium': return '#d69e2e';
      case 'low': return '#38a169';
      default: return '#718096';
    }
  }};
`;

const AlertIcon = styled.span`
  font-size: 1.2rem;
  margin-right: 1rem;
`;

const AlertContent = styled.div`
  flex: 1;
`;

const AlertTitle = styled.div`
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 0.25rem;
`;

const AlertTime = styled.div`
  font-size: 0.85rem;
  color: #718096;
`;

const QuickActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const ActionButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const MainDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalProducts: 0,
    totalInventory: 0,
    lowStockItems: 0,
    recentSales: 0,
    alerts: [],
    inventoryChart: {},
    salesChart: {},
    categoryChart: {}
  });

  useEffect(() => {
    // Simulate loading dashboard data
    const loadDashboardData = () => {
      // Sample data - in real app this would come from API
      setDashboardData({
        totalProducts: 156,
        totalInventory: 12847,
        lowStockItems: 23,
        recentSales: 1249,
        alerts: [
          {
            id: 1,
            title: 'Low Stock Alert: Product ABC-123',
            time: '2 minutes ago',
            severity: 'high',
            icon: '⚠️'
          },
          {
            id: 2,
            title: 'Demand Spike Detected for Electronics',
            time: '15 minutes ago',
            severity: 'medium',
            icon: '📈'
          },
          {
            id: 3,
            title: 'Supplier Delivery Confirmed',
            time: '1 hour ago',
            severity: 'low',
            icon: '✅'
          }
        ],
        inventoryChart: {
          labels: ['Electronics', 'Clothing', 'Food', 'Home & Garden', 'Books'],
          datasets: [{
            data: [30, 25, 20, 15, 10],
            backgroundColor: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe']
          }]
        },
        salesChart: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'Sales Revenue ($)',
            data: [12000, 19000, 3000, 5000, 20000, 30000],
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            borderColor: '#667eea',
            borderWidth: 2,
            fill: true
          }]
        },
        categoryChart: {
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
          datasets: [
            {
              label: 'Electronics',
              data: [400, 450, 380, 490],
              backgroundColor: '#667eea'
            },
            {
              label: 'Clothing',
              data: [300, 320, 280, 350],
              backgroundColor: '#764ba2'
            },
            {
              label: 'Food',
              data: [200, 180, 220, 190],
              backgroundColor: '#f093fb'
            }
          ]
        }
      });
    };

    loadDashboardData();
  }, []);

  return (
    <DashboardContainer>
      <Header>
        <Title>🏢 AI Supply Chain Dashboard</Title>
        <Subtitle>Real-time insights and analytics for your supply chain operations</Subtitle>
      </Header>

      <StatsGrid>
        <StatCard color="#667eea">
          <StatValue>{dashboardData.totalProducts.toLocaleString()}</StatValue>
          <StatLabel>Total Products</StatLabel>
        </StatCard>
        <StatCard color="#38a169">
          <StatValue>{dashboardData.totalInventory.toLocaleString()}</StatValue>
          <StatLabel>Total Inventory Items</StatLabel>
        </StatCard>
        <StatCard color="#e53e3e">
          <StatValue>{dashboardData.lowStockItems}</StatValue>
          <StatLabel>Low Stock Alerts</StatLabel>
        </StatCard>
        <StatCard color="#d69e2e">
          <StatValue>${dashboardData.recentSales.toLocaleString()}</StatValue>
          <StatLabel>Recent Sales (24h)</StatLabel>
        </StatCard>
      </StatsGrid>

      <ChartGrid>
        <ChartCard>
          <ChartTitle>📊 Inventory Distribution by Category</ChartTitle>
          {dashboardData.inventoryChart.labels && (
            <Doughnut 
              data={dashboardData.inventoryChart}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'bottom'
                  }
                }
              }}
            />
          )}
        </ChartCard>

        <ChartCard>
          <ChartTitle>📈 Sales Trend (6 Months)</ChartTitle>
          {dashboardData.salesChart.labels && (
            <Line 
              data={dashboardData.salesChart}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    display: false
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true
                  }
                }
              }}
            />
          )}
        </ChartCard>

        <ChartCard>
          <ChartTitle>📦 Weekly Sales by Category</ChartTitle>
          {dashboardData.categoryChart.labels && (
            <Bar 
              data={dashboardData.categoryChart}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'bottom'
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true
                  }
                }
              }}
            />
          )}
        </ChartCard>
      </ChartGrid>

      <AlertsSection>
        <ChartTitle>🚨 Recent Alerts & Notifications</ChartTitle>
        {dashboardData.alerts.map(alert => (
          <AlertItem key={alert.id} severity={alert.severity}>
            <AlertIcon>{alert.icon}</AlertIcon>
            <AlertContent>
              <AlertTitle>{alert.title}</AlertTitle>
              <AlertTime>{alert.time}</AlertTime>
            </AlertContent>
          </AlertItem>
        ))}
      </AlertsSection>

      <AlertsSection>
        <ChartTitle>⚡ Quick Actions</ChartTitle>
        <QuickActionsGrid>
          <ActionButton>📦 Add New Product</ActionButton>
          <ActionButton>📊 Generate Report</ActionButton>
          <ActionButton>🔄 Sync Inventory</ActionButton>
          <ActionButton>📈 Run Forecast</ActionButton>
          <ActionButton>🔍 Detect Anomalies</ActionButton>
          <ActionButton>📤 Export Data</ActionButton>
        </QuickActionsGrid>
      </AlertsSection>
    </DashboardContainer>
  );
};

export default MainDashboard;