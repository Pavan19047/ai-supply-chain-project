import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

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

const ActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const SearchInput = styled.input`
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  width: 300px;
  background: white;

  &:focus {
    outline: none;
    border-color: #3182ce;
    box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
  }
`;

const FilterSelect = styled.select`
  padding: 0.75rem 1rem;
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

const AddButton = styled.button`
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

const InventoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const InventoryCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const ProductName = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
`;

const StockStatus = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  
  ${props => {
    if (props.status === 'low') return 'background: #fed7d7; color: #c53030;';
    if (props.status === 'out') return 'background: #feb2b2; color: #9b2c2c;';
    return 'background: #c6f6d5; color: #2f855a;';
  }}
`;

const CardContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
`;

const InfoLabel = styled.span`
  font-size: 0.8rem;
  color: #718096;
  margin-bottom: 0.25rem;
`;

const InfoValue = styled.span`
  font-size: 1rem;
  font-weight: 600;
  color: #2d3748;
`;

const CardActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 0.5rem;
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

const TableContainer = styled.div`
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

const InventoryManagement = () => {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'

  useEffect(() => {
    // Mock inventory data
    const mockInventory = [
      {
        id: 1,
        name: 'Milk Cartons',
        category: 'Dairy',
        currentStock: 150,
        minStock: 50,
        maxStock: 500,
        unit: 'cartons',
        supplier: 'Dairy Fresh Inc.',
        lastUpdated: '2024-01-15',
        price: 3.99
      },
      {
        id: 2,
        name: 'Bread Loaves',
        category: 'Bakery',
        currentStock: 25,
        minStock: 30,
        maxStock: 200,
        unit: 'loaves',
        supplier: 'Golden Bakery',
        lastUpdated: '2024-01-15',
        price: 2.49
      },
      {
        id: 3,
        name: 'Chicken Breast',
        category: 'Meat',
        currentStock: 0,
        minStock: 20,
        maxStock: 100,
        unit: 'lbs',
        supplier: 'Premium Meats',
        lastUpdated: '2024-01-14',
        price: 8.99
      },
      {
        id: 4,
        name: 'Bananas',
        category: 'Produce',
        currentStock: 75,
        minStock: 25,
        maxStock: 150,
        unit: 'bunches',
        supplier: 'Fresh Fruits Co.',
        lastUpdated: '2024-01-15',
        price: 1.29
      },
      {
        id: 5,
        name: 'Canned Tomatoes',
        category: 'Pantry',
        currentStock: 200,
        minStock: 50,
        maxStock: 300,
        unit: 'cans',
        supplier: 'Global Foods',
        lastUpdated: '2024-01-13',
        price: 1.99
      }
    ];
    setInventory(mockInventory);
    setFilteredInventory(mockInventory);
  }, []);

  useEffect(() => {
    let filtered = inventory.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filterCategory !== 'all') {
      filtered = filtered.filter(item => item.category === filterCategory);
    }

    setFilteredInventory(filtered);
  }, [searchTerm, filterCategory, inventory]);

  const getStockStatus = (item) => {
    if (item.currentStock === 0) return 'out';
    if (item.currentStock <= item.minStock) return 'low';
    return 'good';
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'out': return 'Out of Stock';
      case 'low': return 'Low Stock';
      default: return 'In Stock';
    }
  };

  const categories = ['all', ...new Set(inventory.map(item => item.category))];

  return (
    <Container>
      <PageHeader>
        <PageTitle>Inventory Management</PageTitle>
        <PageDescription>
          Monitor and manage your inventory levels, track stock movements, and ensure optimal supply levels.
        </PageDescription>
      </PageHeader>

      <ActionBar>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <SearchInput
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FilterSelect
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </FilterSelect>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button
            onClick={() => setViewMode(viewMode === 'cards' ? 'table' : 'cards')}
            style={{
              padding: '0.75rem 1rem',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              background: 'white',
              cursor: 'pointer'
            }}
          >
            {viewMode === 'cards' ? '📋 Table View' : '🗃️ Card View'}
          </button>
          <AddButton>+ Add Product</AddButton>
        </div>
      </ActionBar>

      {viewMode === 'cards' ? (
        <InventoryGrid>
          {filteredInventory.map(item => (
            <InventoryCard key={item.id}>
              <CardHeader>
                <ProductName>{item.name}</ProductName>
                <StockStatus status={getStockStatus(item)}>
                  {getStatusText(getStockStatus(item))}
                </StockStatus>
              </CardHeader>
              <CardContent>
                <InfoItem>
                  <InfoLabel>Current Stock</InfoLabel>
                  <InfoValue>{item.currentStock} {item.unit}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Min/Max Stock</InfoLabel>
                  <InfoValue>{item.minStock}/{item.maxStock} {item.unit}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Category</InfoLabel>
                  <InfoValue>{item.category}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Price</InfoLabel>
                  <InfoValue>${item.price}</InfoValue>
                </InfoItem>
              </CardContent>
              <InfoItem>
                <InfoLabel>Supplier</InfoLabel>
                <InfoValue>{item.supplier}</InfoValue>
              </InfoItem>
              <CardActions>
                <ActionButton>📊 View History</ActionButton>
                <ActionButton>📝 Edit</ActionButton>
                <ActionButton className="primary">📦 Reorder</ActionButton>
              </CardActions>
            </InventoryCard>
          ))}
        </InventoryGrid>
      ) : (
        <TableContainer>
          <Table>
            <thead>
              <tr>
                <TableHeader>Product</TableHeader>
                <TableHeader>Category</TableHeader>
                <TableHeader>Current Stock</TableHeader>
                <TableHeader>Min/Max</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Supplier</TableHeader>
                <TableHeader>Actions</TableHeader>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map(item => (
                <TableRow key={item.id}>
                  <TableCell>
                    <strong>{item.name}</strong><br />
                    <small style={{ color: '#718096' }}>${item.price}</small>
                  </TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{item.currentStock} {item.unit}</TableCell>
                  <TableCell>{item.minStock}/{item.maxStock}</TableCell>
                  <TableCell>
                    <StockStatus status={getStockStatus(item)}>
                      {getStatusText(getStockStatus(item))}
                    </StockStatus>
                  </TableCell>
                  <TableCell>{item.supplier}</TableCell>
                  <TableCell>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <ActionButton style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                        Edit
                      </ActionButton>
                      <ActionButton className="primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                        Reorder
                      </ActionButton>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default InventoryManagement;