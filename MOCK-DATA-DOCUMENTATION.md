# Mock Data Management System Documentation

This document provides comprehensive information about the mock data management system used in the Service Provider Dashboard prototype.

## Overview

The mock data management system provides a complete, API-like interface for managing realistic sample data. It simulates a real backend with proper error handling, referential integrity, realistic delays, and comprehensive CRUD operations for all entities in the gaming services marketplace.

## Architecture

### Core Components

1. **MockDataManager**: Core data management with CRUD operations and referential integrity
2. **MockDataAPI**: RESTful API layer with proper HTTP status codes and error handling
3. **MockImages**: Image and icon management system
4. **MockDataTest**: Comprehensive testing suite

### Key Features

- **API Simulation**: Realistic delays (200-800ms) for all operations
- **Referential Integrity**: Validates relationships between entities
- **Error Handling**: Proper error messages and status codes
- **Batch Operations**: Efficient bulk operations
- **File Upload Simulation**: Mock file handling for evidence uploads
- **Currency Conversion**: Multi-currency support with exchange rates
- **Activity Logging**: Comprehensive audit trails

## Data Structure

### Users
```javascript
{
  id: 'user_001',
  discordId: '123456789012345678',
  discordUsername: 'ProBooster#1234',
  discordAvatarUrl: 'https://cdn.discordapp.com/avatars/...',
  email: 'probooster@example.com',
  roles: ['advertiser', 'team_advertiser', 'booster'],
  createdAt: '2024-01-15T10:30:00Z',
  isActive: true,
  stats: {
    completedOrders: 156,
    rating: 4.9,
    totalEarnings: 15600
  }
}
```

### Services
```javascript
{
  id: 'service_001',
  title: 'Mythic+20 Dungeon Boost - Timed Run Guaranteed',
  description: 'Professional M+20 completion...',
  serviceType: 'mythic_plus', // mythic_plus, leveling, delves, custom_boost
  workspaceType: 'personal', // personal, team
  workspaceOwnerId: 'user_001',
  createdBy: 'user_001',
  priceGold: 500,
  priceUsd: 25.00,
  priceToman: 1250000,
  estimatedTime: '45-60 minutes',
  requirements: 'Level 80, Item Level 580+',
  status: 'active', // active, inactive, deleted
  imageUrl: 'https://via.placeholder.com/400x200/...',
  tags: ['mythic+', 'timed', 'loot', 'weekly']
}
```

### Orders
```javascript
{
  id: 'order_001',
  serviceId: 'service_001',
  buyerId: 'buyer_001',
  boosterId: 'user_001',
  advertiserId: 'user_001',
  status: 'completed', // pending, assigned, in_progress, evidence_submitted, under_review, completed, rejected
  pricePaid: 500,
  currencyUsed: 'gold',
  gameCredentials: {
    username: 'BuyerChar',
    realm: 'Stormrage',
    characterClass: 'Death Knight',
    characterLevel: 80
  },
  specialInstructions: 'Please be careful with my character...',
  evidence: {
    imageUrl: '/mock-images/evidence_001.png',
    notes: 'Completed M+20 Necrotic Wake in time...',
    uploadedAt: '2024-03-15T14:30:00Z'
  },
  timeline: [
    { status: 'pending', timestamp: '2024-03-15T10:00:00Z', note: 'Order created' },
    { status: 'assigned', timestamp: '2024-03-15T10:15:00Z', note: 'Assigned to ProBooster#1234' }
  ]
}
```

## API Interface

### Authentication
```javascript
// Authenticate user
const authResult = await mockAPI.authenticate({ discordId: '123456789012345678' });
// Returns: { success: true, data: { user, token, expiresIn }, statusCode: 200 }
```

### User Operations
```javascript
// Get user
const userResult = await mockAPI.getUser('user_001');

// Get users with filters
const usersResult = await mockAPI.getUsers({ role: 'booster', isActive: true });

// Create user
const createResult = await mockAPI.createUser(userData);

// Update user
const updateResult = await mockAPI.updateUser('user_001', { isActive: false });
```

### Service Operations
```javascript
// Get service
const serviceResult = await mockAPI.getService('service_001');

// Get services with filters
const servicesResult = await mockAPI.getServices('user_001', 'personal', { 
  status: 'active', 
  serviceType: 'mythic_plus' 
});

// Create service
const createResult = await mockAPI.createService({
  title: 'New Service',
  description: 'Service description',
  serviceType: 'mythic_plus',
  workspaceType: 'personal',
  workspaceOwnerId: 'user_001',
  createdBy: 'user_001',
  priceGold: 500,
  priceUsd: 25.00,
  priceToman: 1250000,
  status: 'active'
});

// Update service
const updateResult = await mockAPI.updateService('service_001', { status: 'inactive' });

// Delete service
const deleteResult = await mockAPI.deleteService('service_001');
```

### Order Operations
```javascript
// Get order
const orderResult = await mockAPI.getOrder('order_001');

// Get orders by advertiser
const ordersResult = await mockAPI.getOrdersByAdvertiser('user_001', {
  status: 'pending',
  dateFrom: '2024-01-01',
  dateTo: '2024-12-31'
});

// Get orders by booster
const boosterOrdersResult = await mockAPI.getOrdersByBooster('user_001');

// Create order
const createResult = await mockAPI.createOrder(orderData);

// Assign booster
const assignResult = await mockAPI.assignBooster('order_001', 'user_002');

// Update order status
const statusResult = await mockAPI.updateOrderStatus('order_001', 'in_progress', 'Started work');

// Submit evidence
const evidenceResult = await mockAPI.submitEvidence('order_001', {
  imageUrl: '/path/to/evidence.png',
  notes: 'Service completed successfully'
});
```

### Team Operations
```javascript
// Get team
const teamResult = await mockAPI.getTeam('team_001');

// Get user's teams
const teamsResult = await mockAPI.getTeamsByUser('user_001');

// Create team
const createResult = await mockAPI.createTeam({
  name: 'Elite Boosters',
  description: 'Professional boosting team',
  leaderId: 'user_001'
});

// Invite team member
const inviteResult = await mockAPI.inviteTeamMember('team_001', 'user_001', {
  email: 'newmember@example.com',
  role: 'member'
});

// Get activity logs
const logsResult = await mockAPI.getTeamActivityLogs('team_001', 50);
```

### Wallet Operations
```javascript
// Get wallet
const walletResult = await mockAPI.getWallet('user_001');

// Process deposit
const depositResult = await mockAPI.deposit('user_001', 100, 'usd', 'pm_001');

// Request withdrawal
const withdrawResult = await mockAPI.withdraw('user_001', 50, 'usd', 'pm_001');

// Convert currency
const convertResult = await mockAPI.convertCurrency('user_001', 100, 'usd', 'gold');
```

### File Upload
```javascript
// Upload evidence file
const file = document.getElementById('fileInput').files[0];
const uploadResult = await mockAPI.uploadFile(file);
// Returns: { success: true, data: { url, filename, size, type }, statusCode: 201 }
```

## Advanced Features

### Referential Integrity
The system automatically validates relationships between entities:

```javascript
// This will fail - invalid user reference
const result = await mockAPI.createService({
  title: 'Invalid Service',
  workspaceOwnerId: 'invalid_user_id', // Non-existent user
  createdBy: 'invalid_user_id'
});
// Returns: { success: false, error: 'Referential integrity violation: Referenced workspaceOwnerId \'invalid_user_id\' does not exist' }
```

### Batch Operations
```javascript
// Batch get orders
const batchResult = await mockAPI.batchGetOrders(['order_001', 'order_002', 'order_003']);

// Batch update orders
const batchUpdateResult = await mockAPI.batchUpdateOrders([
  { orderId: 'order_001', status: 'assigned', note: 'Batch assignment' },
  { orderId: 'order_002', status: 'in_progress', note: 'Work started' }
]);
```

### Search Functionality
```javascript
// Global search across entities
const searchResult = await mockAPI.search('mythic', ['services', 'orders']);
// Returns results from services and orders matching 'mythic'
```

### Analytics and Statistics
```javascript
// Get comprehensive dashboard statistics
const statsResult = await mockAPI.getDashboardStats('user_001', 'personal');
// Returns detailed analytics including earnings, completion rates, etc.

// Get exchange rates
const ratesResult = await mockAPI.getExchangeRates();
```

## Error Handling

### API Response Format
All API responses follow a consistent format:
```javascript
{
  success: boolean,
  data: any,
  message: string,
  error: string | null,
  statusCode: number,
  timestamp: string,
  version: string
}
```

### Common Status Codes
- `200`: Success
- `201`: Created
- `204`: No Content (for deletions)
- `400`: Bad Request (validation errors)
- `401`: Unauthorized
- `404`: Not Found
- `500`: Internal Server Error

### Error Handling Helper
```javascript
// Use the built-in response handler
MockDataAPI.handleResponse(
  await mockAPI.getUser('user_001'),
  (userData, message) => {
    console.log('Success:', userData);
  },
  (error, message) => {
    console.error('Error:', error);
  }
);
```

## Testing

### Comprehensive Test Suite
```javascript
// Run all tests
const tester = new MockDataTest();
await tester.runAllTests();

// Test results include:
// - Mock Data Initialization
// - User Operations
// - Service Operations  
// - Order Operations
// - Wallet Operations
// - Team Operations
// - Currency Conversion
// - Dashboard Statistics
// - API Layer
// - File Upload
// - Referential Integrity
// - Batch Operations
```

### Manual Testing
```javascript
// Individual test functions available
window.mockDataTests.runAllTests();
window.mockDataTests.TEST_CONFIG.runTests = false; // Disable auto-run
```

## Performance Optimization

### API Delay Simulation
```javascript
// Configurable delay ranges
mockDataManager.apiDelay = {
  min: 100,  // Minimum delay in ms
  max: 500   // Maximum delay in ms
};
```

### Caching and Persistence
- Data persists in localStorage
- Efficient in-memory operations
- Lazy loading for large datasets
- Optimized batch operations

## Integration Examples

### React Component Integration
```javascript
const ServiceList = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadServices = async () => {
      const result = await mockAPI.getServices(userId, 'personal');
      if (result.success) {
        setServices(result.data);
      }
      setLoading(false);
    };
    loadServices();
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      {services.map(service => (
        <ServiceCard key={service.id} service={service} />
      ))}
    </div>
  );
};
```

### Order Management Integration
```javascript
const OrderManager = {
  async assignOrder(orderId, boosterId) {
    const result = await mockAPI.assignBooster(orderId, boosterId);
    MockDataAPI.handleResponse(result, 
      (order) => {
        showNotification(`Order assigned to ${order.boosterId}`, 'success');
        this.refreshOrders();
      },
      (error) => {
        showNotification(`Failed to assign order: ${error}`, 'error');
      }
    );
  },

  async submitEvidence(orderId, file, notes) {
    // Upload file first
    const uploadResult = await mockAPI.uploadFile(file);
    if (!uploadResult.success) {
      showNotification('Failed to upload evidence file', 'error');
      return;
    }

    // Submit evidence
    const evidenceResult = await mockAPI.submitEvidence(orderId, {
      imageUrl: uploadResult.data.url,
      notes: notes
    });

    MockDataAPI.handleResponse(evidenceResult,
      () => {
        showNotification('Evidence submitted successfully', 'success');
        this.refreshOrders();
      }
    );
  }
};
```

## System Health and Monitoring

### Health Check
```javascript
// Check system health
const healthResult = await mockAPI.healthCheck();
console.log('System Status:', healthResult.data.status);
console.log('Entity Counts:', healthResult.data.entities);
```

### Data Reset
```javascript
// Reset all data to original state
const resetResult = await mockAPI.resetData();
if (resetResult.success) {
  console.log('Data reset successfully');
}
```

This mock data management system provides a complete, production-like experience for developing and testing the Service Provider Dashboard without requiring a real backend infrastructure.