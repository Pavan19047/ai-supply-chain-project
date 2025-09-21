import React, { useState } from 'react';
import styled from 'styled-components';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
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

const AlertPanel = styled.div`
  background: ${props => props.type === 'error' ? '#fed7d7' : props.type === 'warning' ? '#fefcbf' : '#c6f6d5'};
  border: 1px solid ${props => props.type === 'error' ? '#fc8181' : props.type === 'warning' ? '#f6e05e' : '#9ae6b4'};
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
`;

const AlertGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const AlertCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-left: 4px solid ${props => 
    props.severity === 'critical' ? '#e53e3e' :
    props.severity === 'high' ? '#fd7f33' :
    props.severity === 'medium' ? '#f6e05e' :
    '#48bb78'
  };
`;

const AlertHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const AlertTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
`;

const SeverityBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  
  ${props => {
    if (props.severity === 'critical') return 'background: #fed7d7; color: #c53030;';
    if (props.severity === 'high') return 'background: #fbd38d; color: #c05621;';
    if (props.severity === 'medium') return 'background: #fefcbf; color: #d69e2e;';
    return 'background: #c6f6d5; color: #2f855a;';
  }}
`;

const AlertDetails = styled.div`
  margin-bottom: 1rem;
`;

const AlertDescription = styled.p`
  color: #4a5568;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
`;

const AlertMetric = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: #718096;
`;

const AlertActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  padding: 0.5rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: white;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f7fafc;
    border-color: #cbd5e0;
  }

  &.primary {
    background: #3182ce;
    color: white;
    border-color: #3182ce;

    &:hover {
      background: #2c5282;
    }
  }
`;

const ChartContainer = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const ChartTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 1rem;
`;

const FilterPanel = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  align-items: end;
`;

const FilterGroup = styled.div`
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

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: ${props => props.color || '#1a202c'};
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: #718096;
`;

const AnomalyDetection = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSeverity, setSelectedSeverity] = useState('all');

  const timeRanges = [
    { value: '1d', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' }
  ];

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'inventory', label: 'Inventory' },
    { value: 'demand', label: 'Demand' },
    { value: 'supplier', label: 'Supplier' },
    { value: 'quality', label: 'Quality' }
  ];

  const severities = [
    { value: 'all', label: 'All Severities' },
    { value: 'critical', label: 'Critical' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' }
  ];

  const anomalies = [
    {
      id: 1,
      title: 'Sudden Demand Spike',
      description: 'Milk cartons demand increased by 340% compared to normal patterns',
      category: 'demand',
      severity: 'critical',
      timestamp: '2024-01-15 14:30',
      metric: 'Demand increase: +340%',
      confidence: '97.3%'
    },
    {
      id: 2,
      title: 'Supplier Delivery Delay',
      description: 'Fresh Fruits Co. showing unusual delivery pattern delays',
      category: 'supplier',
      severity: 'high',
      timestamp: '2024-01-15 09:15',
      metric: 'Delay: +2.5 days avg',
      confidence: '89.1%'
    },
    {
      id: 3,
      title: 'Inventory Depletion Rate',
      description: 'Bread loaves depleting 45% faster than forecasted',
      category: 'inventory',
      severity: 'medium',
      timestamp: '2024-01-14 16:45',
      metric: 'Depletion rate: +45%',
      confidence: '82.7%'
    },
    {
      id: 4,
      title: 'Quality Score Drop',
      description: 'Chicken breast quality ratings dropped below threshold',
      category: 'quality',
      severity: 'high',
      timestamp: '2024-01-14 11:20',
      metric: 'Quality score: 6.2/10',
      confidence: '94.8%'
    },
    {
      id: 5,
      title: 'Price Fluctuation',
      description: 'Canned tomatoes price variance exceeding normal range',
      category: 'inventory',
      severity: 'low',
      timestamp: '2024-01-13 08:30',
      metric: 'Price variance: ±18%',
      confidence: '76.4%'
    }
  ];

  // Generate mock time series data for anomaly visualization
  const generateTimeSeriesData = () => {
    const labels = [];
    const normalData = [];
    const anomalyData = [];
    const baseValue = 100;
    
    for (let i = 0; i < 168; i++) { // 7 days of hourly data
      const date = new Date();
      date.setHours(date.getHours() - (168 - i));
      labels.push(date.toISOString());
      
      // Normal pattern with some variation
      const hourOfDay = date.getHours();
      const dayPattern = Math.sin((hourOfDay / 24) * Math.PI * 2) * 20;
      const randomVariation = (Math.random() - 0.5) * 10;
      const normalValue = baseValue + dayPattern + randomVariation;
      
      normalData.push(normalValue);
      
      // Add anomalies at specific points
      if (i === 120 || i === 95 || i === 150) {
        anomalyData.push(normalValue + (Math.random() > 0.5 ? 80 : -60));
      } else {
        anomalyData.push(null);
      }
    }
    
    return { labels, normalData, anomalyData };
  };

  const timeSeriesData = generateTimeSeriesData();

  const chartData = {
    labels: timeSeriesData.labels,
    datasets: [
      {
        label: 'Normal Behavior',
        data: timeSeriesData.normalData,
        borderColor: '#3182ce',
        backgroundColor: 'rgba(49, 130, 206, 0.1)',
        borderWidth: 1,
        pointRadius: 0,
        pointHoverRadius: 5
      },
      {
        label: 'Anomalies',
        data: timeSeriesData.anomalyData,
        borderColor: '#e53e3e',
        backgroundColor: '#e53e3e',
        borderWidth: 0,
        pointRadius: 6,
        pointHoverRadius: 8,
        showLine: false
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
      x: {
        type: 'time',
        time: {
          unit: 'hour',
          displayFormats: {
            hour: 'MMM dd HH:mm'
          }
        }
      },
      y: {
        beginAtZero: false,
      },
    },
  };

  const filteredAnomalies = anomalies.filter(anomaly => {
    if (selectedCategory !== 'all' && anomaly.category !== selectedCategory) return false;
    if (selectedSeverity !== 'all' && anomaly.severity !== selectedSeverity) return false;
    return true;
  });

  const stats = {
    total: anomalies.length,
    critical: anomalies.filter(a => a.severity === 'critical').length,
    resolved: Math.floor(anomalies.length * 0.6),
    avgConfidence: (anomalies.reduce((sum, a) => sum + parseFloat(a.confidence), 0) / anomalies.length).toFixed(1)
  };

  return (
    <Container>
      <PageHeader>
        <PageTitle>Anomaly Detection</PageTitle>
        <PageDescription>
          AI-powered detection of unusual patterns in your supply chain operations with real-time monitoring and alerts.
        </PageDescription>
      </PageHeader>

      {stats.critical > 0 && (
        <AlertPanel type="error">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🚨</span>
            <div>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#c53030' }}>
                Critical Anomalies Detected
              </h3>
              <p style={{ margin: 0, color: '#744d47' }}>
                {stats.critical} critical anomalies require immediate attention. Review and take action below.
              </p>
            </div>
          </div>
        </AlertPanel>
      )}

      <StatsGrid>
        <StatCard>
          <StatValue color="#e53e3e">{stats.total}</StatValue>
          <StatLabel>Total Anomalies</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue color="#fd7f33">{stats.critical}</StatValue>
          <StatLabel>Critical Alerts</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue color="#38a169">{stats.resolved}</StatValue>
          <StatLabel>Resolved</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue color="#3182ce">{stats.avgConfidence}%</StatValue>
          <StatLabel>Avg Confidence</StatLabel>
        </StatCard>
      </StatsGrid>

      <FilterPanel>
        <FilterGrid>
          <FilterGroup>
            <Label>Time Range</Label>
            <Select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
            >
              {timeRanges.map(range => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </Select>
          </FilterGroup>
          <FilterGroup>
            <Label>Category</Label>
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </Select>
          </FilterGroup>
          <FilterGroup>
            <Label>Severity</Label>
            <Select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
            >
              {severities.map(severity => (
                <option key={severity.value} value={severity.value}>
                  {severity.label}
                </option>
              ))}
            </Select>
          </FilterGroup>
        </FilterGrid>
      </FilterPanel>

      <ChartContainer>
        <ChartTitle>Anomaly Timeline - Supply Chain Metrics</ChartTitle>
        <Line data={chartData} options={chartOptions} />
      </ChartContainer>

      <AlertGrid>
        {filteredAnomalies.map(anomaly => (
          <AlertCard key={anomaly.id} severity={anomaly.severity}>
            <AlertHeader>
              <AlertTitle>{anomaly.title}</AlertTitle>
              <SeverityBadge severity={anomaly.severity}>
                {anomaly.severity.toUpperCase()}
              </SeverityBadge>
            </AlertHeader>
            <AlertDetails>
              <AlertDescription>{anomaly.description}</AlertDescription>
              <AlertMetric>
                <span>{anomaly.metric}</span>
                <span>Confidence: {anomaly.confidence}</span>
              </AlertMetric>
              <AlertMetric>
                <span style={{ fontSize: '0.8rem' }}>🕒 {anomaly.timestamp}</span>
                <span style={{ fontSize: '0.8rem' }}>📂 {anomaly.category}</span>
              </AlertMetric>
            </AlertDetails>
            <AlertActions>
              <ActionButton>👁️ Investigate</ActionButton>
              <ActionButton className="primary">✓ Resolve</ActionButton>
            </AlertActions>
          </AlertCard>
        ))}
      </AlertGrid>
    </Container>
  );
};

export default AnomalyDetection;