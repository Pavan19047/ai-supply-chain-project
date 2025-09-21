import React, { useState } from 'react';
import styled from 'styled-components';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Container = styled.div`
  padding: 2rem;
  background: #f8fafc;
  min-height: 100vh;
`;

const PageHeader = styled.div`
  margin-bottom: 2rem;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 0.5rem;
`;

const PageDescription = styled.p`
  color: #718096;
  font-size: 1rem;
`;

const ControlPanel = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ControlGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  align-items: end;
`;

const ControlGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 0.9rem;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 0.5rem;
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  background: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #3182ce;
  }
`;

const Button = styled.button`
  background: #3182ce;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: #2c5282;
  }

  &:disabled {
    background: #cbd5e0;
    cursor: not-allowed;
  }
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const MetricCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-left: 4px solid ${props => props.color || '#3182ce'};
`;

const MetricLabel = styled.div`
  font-size: 0.9rem;
  color: #718096;
  margin-bottom: 0.5rem;
`;

const MetricValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 0.25rem;
`;

const MetricChange = styled.div`
  font-size: 0.85rem;
  color: ${props => props.positive ? '#38a169' : '#e53e3e'};
  font-weight: 600;
`;

const ChartGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

const ChartContainer = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ChartTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 1rem;
`;

const ForecastTable = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.th`
  background: #f7fafc;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #4a5568;
  border-bottom: 1px solid #e2e8f0;
`;

const TableRow = styled.tr`
  &:hover {
    background: #f7fafc;
  }
`;

const TableCell = styled.td`
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
  color: #2d3748;
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  
  ${props => {
    if (props.status === 'high') return 'background: #fed7d7; color: #c53030;';
    if (props.status === 'medium') return 'background: #fefcbf; color: #d69e2e;';
    return 'background: #c6f6d5; color: #2f855a;';
  }}
`;

const ForecastingDashboard = () => {
  const [selectedProduct, setSelectedProduct] = useState('milk-cartons');
  const [forecastPeriod, setForecastPeriod] = useState('30');
  const [forecastModel, setForecastModel] = useState('lstm');
  const [isLoading, setIsLoading] = useState(false);
  const [forecastData, setForecastData] = useState(null);

  const products = [
    { value: 'milk-cartons', label: 'Milk Cartons' },
    { value: 'bread-loaves', label: 'Bread Loaves' },
    { value: 'chicken-breast', label: 'Chicken Breast' },
    { value: 'bananas', label: 'Bananas' },
    { value: 'canned-tomatoes', label: 'Canned Tomatoes' }
  ];

  const models = [
    { value: 'lstm', label: 'LSTM Neural Network' },
    { value: 'arima', label: 'ARIMA' },
    { value: 'linear', label: 'Linear Regression' },
    { value: 'prophet', label: 'Facebook Prophet' }
  ];

  const generateForecast = async () => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate mock forecast data
    const days = parseInt(forecastPeriod);
    const labels = Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() + i + 1);
      return date.toLocaleDateString();
    });

    const baseValue = 100;
    const trend = 0.5; // slight upward trend
    const noise = () => (Math.random() - 0.5) * 20;
    
    const historicalData = Array.from({ length: 30 }, (_, i) => {
      return baseValue + (trend * i) + noise();
    });

    const forecastValues = Array.from({ length: days }, (_, i) => {
      return baseValue + (trend * (30 + i)) + noise();
    });

    const confidenceUpper = forecastValues.map(val => val + 15 + Math.random() * 10);
    const confidenceLower = forecastValues.map(val => val - 15 - Math.random() * 10);

    setForecastData({
      labels,
      historical: historicalData,
      forecast: forecastValues,
      confidenceUpper,
      confidenceLower,
      accuracy: 85 + Math.random() * 10,
      mape: 5 + Math.random() * 5
    });

    setIsLoading(false);
  };

  const chartData = {
    labels: forecastData?.labels || [],
    datasets: [
      {
        label: 'Demand Forecast',
        data: forecastData?.forecast || [],
        borderColor: '#3182ce',
        backgroundColor: 'rgba(49, 130, 206, 0.1)',
        borderWidth: 2,
        fill: false,
      },
      {
        label: 'Upper Confidence',
        data: forecastData?.confidenceUpper || [],
        borderColor: '#e2e8f0',
        backgroundColor: 'rgba(226, 232, 240, 0.3)',
        borderWidth: 1,
        fill: '+1',
      },
      {
        label: 'Lower Confidence',
        data: forecastData?.confidenceLower || [],
        borderColor: '#e2e8f0',
        backgroundColor: 'rgba(226, 232, 240, 0.3)',
        borderWidth: 1,
        fill: false,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const getAlertLevel = (demand) => {
    if (demand > 120) return 'high';
    if (demand > 80) return 'medium';
    return 'low';
  };

  const upcomingDemand = forecastData?.forecast.slice(0, 7).map((demand, index) => ({
    date: forecastData.labels[index],
    demand: Math.round(demand),
    alert: getAlertLevel(demand)
  })) || [];

  return (
    <Container>
      <PageHeader>
        <PageTitle>Demand Forecasting</PageTitle>
        <PageDescription>
          Predict future demand using advanced AI models to optimize inventory and supply planning.
        </PageDescription>
      </PageHeader>

      <ControlPanel>
        <ControlGrid>
          <ControlGroup>
            <Label>Product</Label>
            <Select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
            >
              {products.map(product => (
                <option key={product.value} value={product.value}>
                  {product.label}
                </option>
              ))}
            </Select>
          </ControlGroup>
          <ControlGroup>
            <Label>Forecast Period</Label>
            <Select
              value={forecastPeriod}
              onChange={(e) => setForecastPeriod(e.target.value)}
            >
              <option value="7">7 Days</option>
              <option value="14">14 Days</option>
              <option value="30">30 Days</option>
              <option value="90">90 Days</option>
            </Select>
          </ControlGroup>
          <ControlGroup>
            <Label>Model</Label>
            <Select
              value={forecastModel}
              onChange={(e) => setForecastModel(e.target.value)}
            >
              {models.map(model => (
                <option key={model.value} value={model.value}>
                  {model.label}
                </option>
              ))}
            </Select>
          </ControlGroup>
          <ControlGroup>
            <Button onClick={generateForecast} disabled={isLoading}>
              {isLoading ? '⏳ Generating...' : '🔮 Generate Forecast'}
            </Button>
          </ControlGroup>
        </ControlGrid>
      </ControlPanel>

      <MetricsGrid>
        <MetricCard color="#3182ce">
          <MetricLabel>Model Accuracy</MetricLabel>
          <MetricValue>{forecastData?.accuracy.toFixed(1) || 0}%</MetricValue>
          <MetricChange positive>+2.3% from last model</MetricChange>
        </MetricCard>
        <MetricCard color="#38a169">
          <MetricLabel>Mean Absolute Error</MetricLabel>
          <MetricValue>{forecastData?.mape.toFixed(1) || 0}%</MetricValue>
          <MetricChange positive>-0.8% from last forecast</MetricChange>
        </MetricCard>
        <MetricCard color="#ed8936">
          <MetricLabel>Avg Daily Demand</MetricLabel>
          <MetricValue>{forecastData?.forecast ? Math.round(forecastData.forecast.reduce((a, b) => a + b, 0) / forecastData.forecast.length) : 0}</MetricValue>
          <MetricChange positive>+5.2% predicted growth</MetricChange>
        </MetricCard>
        <MetricCard color="#9f7aea">
          <MetricLabel>Peak Demand Day</MetricLabel>
          <MetricValue>{forecastData?.labels[forecastData?.forecast.indexOf(Math.max(...forecastData.forecast))] || 'N/A'}</MetricValue>
          <MetricChange>High demand expected</MetricChange>
        </MetricCard>
      </MetricsGrid>

      <ChartGrid>
        <ChartContainer>
          <ChartTitle>Demand Forecast - {products.find(p => p.value === selectedProduct)?.label}</ChartTitle>
          {forecastData && <Line data={chartData} options={chartOptions} />}
        </ChartContainer>

        <ChartContainer>
          <ChartTitle>7-Day Demand Outlook</ChartTitle>
          <div style={{ maxHeight: '300px', overflow: 'auto' }}>
            {upcomingDemand.map((item, index) => (
              <div key={index} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem 0',
                borderBottom: '1px solid #e2e8f0'
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                    {item.date}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontWeight: 600 }}>{item.demand}</span>
                  <StatusBadge status={item.alert}>
                    {item.alert.toUpperCase()}
                  </StatusBadge>
                </div>
              </div>
            ))}
          </div>
        </ChartContainer>
      </ChartGrid>

      <ForecastTable>
        <Table>
          <thead>
            <tr>
              <TableHeader>Date</TableHeader>
              <TableHeader>Predicted Demand</TableHeader>
              <TableHeader>Confidence Range</TableHeader>
              <TableHeader>Alert Level</TableHeader>
              <TableHeader>Recommended Action</TableHeader>
            </tr>
          </thead>
          <tbody>
            {upcomingDemand.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.date}</TableCell>
                <TableCell><strong>{item.demand} units</strong></TableCell>
                <TableCell>
                  {Math.round(forecastData?.confidenceLower[index] || 0)} - {Math.round(forecastData?.confidenceUpper[index] || 0)}
                </TableCell>
                <TableCell>
                  <StatusBadge status={item.alert}>
                    {item.alert.toUpperCase()}
                  </StatusBadge>
                </TableCell>
                <TableCell>
                  {item.alert === 'high' ? '📈 Increase stock levels' :
                   item.alert === 'medium' ? '⚖️ Monitor closely' :
                   '✅ Current levels sufficient'}
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </ForecastTable>
    </Container>
  );
};

export default ForecastingDashboard;