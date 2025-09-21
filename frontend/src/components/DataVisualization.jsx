import React, { useState } from 'react';
import styled from 'styled-components';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
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
  height: fit-content;
`;

const ChartTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 1rem;
`;

const MetricsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
`;

const InsightsPanel = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const InsightItem = styled.div`
  padding: 1rem;
  border-left: 4px solid ${props => props.color || '#3182ce'};
  background: ${props => props.color ? `${props.color}10` : '#f7fafc'};
  margin-bottom: 1rem;
  border-radius: 0 8px 8px 0;
`;

const InsightTitle = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 0.5rem;
`;

const InsightDescription = styled.p`
  font-size: 0.9rem;
  color: #4a5568;
  margin: 0;
`;

const DataVisualization = () => {
  const [selectedMetric, setSelectedMetric] = useState('sales');
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedProduct, setSelectedProduct] = useState('all');

  const metrics = [
    { value: 'sales', label: 'Sales Performance' },
    { value: 'inventory', label: 'Inventory Levels' },
    { value: 'demand', label: 'Demand Patterns' },
    { value: 'supplier', label: 'Supplier Performance' },
    { value: 'quality', label: 'Quality Metrics' }
  ];

  const periods = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: '1y', label: 'Last Year' }
  ];

  const products = [
    { value: 'all', label: 'All Products' },
    { value: 'milk-cartons', label: 'Milk Cartons' },
    { value: 'bread-loaves', label: 'Bread Loaves' },
    { value: 'chicken-breast', label: 'Chicken Breast' },
    { value: 'bananas', label: 'Bananas' },
    { value: 'canned-tomatoes', label: 'Canned Tomatoes' }
  ];

  // Generate sample data based on selections
  const generateSalesData = () => {
    const labels = [];
    const salesData = [];
    const days = selectedPeriod === '7d' ? 7 : selectedPeriod === '30d' ? 30 : 90;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      labels.push(date.toLocaleDateString());
      
      // Generate realistic sales data with trends
      const baseValue = 1000;
      const trend = Math.sin((i / days) * Math.PI) * 200;
      const randomVariation = (Math.random() - 0.5) * 300;
      salesData.push(Math.max(0, baseValue + trend + randomVariation));
    }
    
    return { labels, salesData };
  };

  const salesData = generateSalesData();

  const lineChartData = {
    labels: salesData.labels,
    datasets: [
      {
        label: 'Daily Sales ($)',
        data: salesData.salesData,
        borderColor: '#3182ce',
        backgroundColor: 'rgba(49, 130, 206, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      },
      {
        label: 'Moving Average',
        data: salesData.salesData.map((_, index, arr) => {
          const start = Math.max(0, index - 6);
          const subset = arr.slice(start, index + 1);
          return subset.reduce((sum, val) => sum + val, 0) / subset.length;
        }),
        borderColor: '#fd7f33',
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: [5, 5],
        fill: false
      }
    ]
  };

  const categoryData = {
    labels: ['Dairy', 'Bakery', 'Meat', 'Produce', 'Pantry'],
    datasets: [
      {
        data: [300, 150, 200, 100, 250],
        backgroundColor: [
          '#3182ce',
          '#38a169',
          '#ed8936',
          '#9f7aea',
          '#e53e3e'
        ],
        borderWidth: 0
      }
    ]
  };

  const inventoryData = {
    labels: ['Milk Cartons', 'Bread Loaves', 'Chicken Breast', 'Bananas', 'Canned Tomatoes'],
    datasets: [
      {
        label: 'Current Stock',
        data: [150, 25, 0, 75, 200],
        backgroundColor: '#3182ce',
        borderColor: '#2c5282',
        borderWidth: 1
      },
      {
        label: 'Minimum Stock',
        data: [50, 30, 20, 25, 50],
        backgroundColor: '#e53e3e',
        borderColor: '#c53030',
        borderWidth: 1
      }
    ]
  };

  const supplierData = {
    labels: ['On Time', 'Early', 'Late'],
    datasets: [
      {
        data: [75, 15, 10],
        backgroundColor: ['#38a169', '#3182ce', '#e53e3e'],
        borderWidth: 0
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      }
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      }
    }
  };

  const insights = [
    {
      title: 'Sales Growth',
      description: 'Sales have increased by 15.3% compared to the previous period. Dairy products showing strongest growth.',
      color: '#38a169'
    },
    {
      title: 'Inventory Alert',
      description: 'Chicken breast is out of stock. Bread loaves below minimum threshold. Immediate restocking required.',
      color: '#e53e3e'
    },
    {
      title: 'Supplier Performance',
      description: 'Fresh Fruits Co. delivery delays increasing. Consider backup supplier for critical items.',
      color: '#fd7f33'
    },
    {
      title: 'Demand Prediction',
      description: 'AI models predict 23% increase in milk demand next week. Recommend increasing stock levels.',
      color: '#3182ce'
    }
  ];

  return (
    <Container>
      <PageHeader>
        <PageTitle>Data Visualization & Analytics</PageTitle>
        <PageDescription>
          Comprehensive visual analytics dashboard for supply chain insights, trends, and performance metrics.
        </PageDescription>
      </PageHeader>

      <ControlPanel>
        <ControlGrid>
          <ControlGroup>
            <Label>Metric</Label>
            <Select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
            >
              {metrics.map(metric => (
                <option key={metric.value} value={metric.value}>
                  {metric.label}
                </option>
              ))}
            </Select>
          </ControlGroup>
          <ControlGroup>
            <Label>Time Period</Label>
            <Select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              {periods.map(period => (
                <option key={period.value} value={period.value}>
                  {period.label}
                </option>
              ))}
            </Select>
          </ControlGroup>
          <ControlGroup>
            <Label>Product Filter</Label>
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
            <Button>📊 Export Report</Button>
          </ControlGroup>
        </ControlGrid>
      </ControlPanel>

      <ChartGrid>
        <ChartContainer>
          <ChartTitle>Sales Performance Trend</ChartTitle>
          <Line data={lineChartData} options={chartOptions} />
        </ChartContainer>

        <ChartContainer>
          <ChartTitle>Sales by Category</ChartTitle>
          <Doughnut data={categoryData} options={doughnutOptions} />
        </ChartContainer>
      </ChartGrid>

      <MetricsRow>
        <ChartContainer>
          <ChartTitle>Inventory Levels vs Minimum Stock</ChartTitle>
          <Bar data={inventoryData} options={chartOptions} />
        </ChartContainer>

        <ChartContainer>
          <ChartTitle>Supplier Delivery Performance</ChartTitle>
          <Doughnut data={supplierData} options={doughnutOptions} />
        </ChartContainer>
      </MetricsRow>

      <InsightsPanel>
        <ChartTitle>AI-Generated Insights</ChartTitle>
        {insights.map((insight, index) => (
          <InsightItem key={index} color={insight.color}>
            <InsightTitle>{insight.title}</InsightTitle>
            <InsightDescription>{insight.description}</InsightDescription>
          </InsightItem>
        ))}
      </InsightsPanel>
    </Container>
  );
};

export default DataVisualization;