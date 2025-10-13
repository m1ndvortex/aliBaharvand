# Design Document

## Overview

The Service Provider Dashboard is a comprehensive web application prototype that serves users with multiple roles (Booster, Advertiser, Team Advertiser) in a gaming services marketplace. The design follows a Discord-inspired dark theme with role-based navigation tabs and workspace switching capabilities. The system manages complex workflows including service creation, order management, team collaboration, evidence submission, and multi-currency wallet operations.

## Architecture

### Frontend Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Service Provider Dashboard                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                 Navigation Layer                         │   │
│  │  ┌─────────────┬─────────────┬─────────────┐           │   │
│  │  │ Advertiser  │Team Advertiser│  Booster   │           │   │
│  │  │     Tab     │     Tab      │    Tab     │           │   │
│  │  └─────────────┴─────────────┴─────────────┘           │   │
│  │                                                         │   │
│  │  ┌─────────────────────────────────────────────────┐   │   │
│  │  │        Workspace Switcher                       │   │
│  │  │  [Personal Workspace] [Team Workspace]          │   │
│  │  └─────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                 Content Layer                            │   │
│  │  ┌─────────────┬─────────────────────────────────────┐  │   │
│  │  │   Sidebar   │         Main Content Area           │  │   │
│  │  │             │                                     │  │   │
│  │  │ - Dashboard │  ┌─────────────────────────────────┐ │  │   │
│  │  │ - Services  │  │                                 │ │  │   │
│  │  │ - Orders    │  │        Dynamic Content          │ │  │   │
│  │  │ - Earnings  │  │     (Based on selected tab      │ │  │   │
│  │  │ - Team Mgmt │  │      and sidebar item)          │ │  │   │
│  │  │ - Wallet    │  │                                 │ │  │   │
│  │  │             │  └─────────────────────────────────┘ │  │   │
│  │  └─────────────┴─────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                 Modal Layer                              │   │
│  │  - Service Creation/Edit Modals                         │   │
│  │  - Order Assignment Modals                              │   │
│  │  - Evidence Review Modals                               │   │
│  │  - Team Management Modals                               │   │
│  │  - Wallet Transaction Modals                            │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### State Management Architecture

```javascript
// Global Application State
const AppState = {
  user: {
    id: 'user123',
    roles: ['advertiser', 'team_advertiser', 'booster'],
    activeRole: 'advertiser',
    teams: [...]
  },
  workspace: {
    type: 'personal', // 'personal' or 'team'
    id: 'user123',    // user_id or team_id
    name: null        // team name if team workspace
  },
  services: [...],
  orders: [...],
  wallet: {
    gold: 1500,
    usd: 250.00,
    toman: 5000000
  },
  teams: [...],
  ui: {
    activeTab: 'advertiser',
    activeSidebarItem: 'dashboard',
    modals: {}
  }
};
```

## Components and Interfaces

### Core Components

#### 1. Dashboard Container
```html
<div class="dashboard-container">
  <header class="dashboard-header">
    <div class="role-tabs">
      <button class="role-tab active" data-role="advertiser">📊 Advertiser</button>
      <button class="role-tab" data-role="team_advertiser">👥 Team Advertiser</button>
      <button class="role-tab" data-role="booster">🎮 Booster</button>
    </div>
    <div class="workspace-switcher">
      <button class="workspace-btn active" data-workspace="personal">Personal Workspace</button>
      <button class="workspace-btn" data-workspace="team">Team Workspace</button>
    </div>
  </header>
  
  <div class="dashboard-content">
    <aside class="sidebar">
      <!-- Dynamic sidebar based on active role -->
    </aside>
    <main class="main-content">
      <!-- Dynamic content based on active role and sidebar selection -->
    </main>
  </div>
</div>
```

#### 2. Service Management Component
```html
<div class="services-section">
  <div class="services-header">
    <h2>My Services</h2>
    <button class="btn-primary" onclick="openCreateServiceModal()">
      + Create New Service
    </button>
  </div>
  
  <div class="services-grid">
    <!-- Service cards with edit/delete/activate controls -->
  </div>
  
  <div class="raid-booking-section">
    <h3>🏰 Raid Booking</h3>
    <div class="raid-list">
      <!-- Admin-created raids available for booking -->
    </div>
  </div>
</div>
```

#### 3. Order Management Component
```html
<div class="orders-section">
  <div class="orders-filters">
    <select class="status-filter">
      <option value="all">All Orders</option>
      <option value="pending">Pending</option>
      <option value="assigned">Assigned</option>
      <option value="in_progress">In Progress</option>
      <option value="evidence_submitted">Evidence Submitted</option>
      <option value="completed">Completed</option>
    </select>
  </div>
  
  <div class="orders-table">
    <!-- Orders table with status, actions, and details -->
  </div>
</div>
```

#### 4. Team Management Component
```html
<div class="team-management">
  <div class="team-info">
    <h2>Team Information</h2>
    <!-- Team details and settings -->
  </div>
  
  <div class="team-members">
    <h3>Team Members</h3>
    <button class="btn-primary" onclick="openInviteMemberModal()">
      Invite Member
    </button>
    <!-- Members table with roles and actions -->
  </div>
  
  <div class="team-analytics">
    <h3>Team Analytics</h3>
    <!-- Earnings, contributions, performance metrics -->
  </div>
  
  <div class="activity-log">
    <h3>Activity Log</h3>
    <!-- Timeline of team member actions -->
  </div>
</div>
```

#### 5. Wallet Component
```html
<div class="wallet-section">
  <div class="wallet-balances">
    <div class="balance-card gold">
      <span class="currency-icon">🪙</span>
      <span class="amount">1,500 G</span>
    </div>
    <div class="balance-card usd">
      <span class="currency-icon">💵</span>
      <span class="amount">$250.00</span>
    </div>
    <div class="balance-card toman">
      <span class="currency-icon">﷼</span>
      <span class="amount">5,000,000</span>
    </div>
  </div>
  
  <div class="wallet-actions">
    <button class="btn-success" onclick="openDepositModal()">💵 Deposit</button>
    <button class="btn-warning" onclick="openWithdrawModal()">💸 Withdraw</button>
    <button class="btn-info" onclick="openConvertModal()">🔄 Convert</button>
  </div>
  
  <div class="transaction-history">
    <!-- Transaction history table -->
  </div>
</div>
```

### Interface Specifications

#### Role-Based Navigation Interface
```javascript
const RoleNavigation = {
  advertiser: {
    sidebar: [
      { id: 'dashboard', label: '🏠 Dashboard Home', component: 'AdvertiserDashboard' },
      { id: 'services', label: '📝 My Services', component: 'ServiceManagement' },
      { id: 'raids', label: '🏰 Raid Booking', component: 'RaidBooking' },
      { id: 'orders', label: '📦 My Orders', component: 'OrderManagement' },
      { id: 'earnings', label: '💰 Earnings', component: 'EarningsView' },
      { id: 'wallet', label: '💳 Wallet', component: 'WalletManagement' }
    ]
  },
  team_advertiser: {
    sidebar: [
      // All advertiser items plus:
      { id: 'team', label: '🏢 Team Management', component: 'TeamManagement' },
      { id: 'analytics', label: '📊 Team Analytics', component: 'TeamAnalytics' }
    ]
  },
  booster: {
    sidebar: [
      { id: 'dashboard', label: '🏠 Dashboard Home', component: 'BoosterDashboard' },
      { id: 'orders', label: '📋 Assigned Orders', component: 'BoosterOrders' },
      { id: 'earnings', label: '💰 My Earnings', component: 'BoosterEarnings' },
      { id: 'profile', label: '👤 Profile', component: 'BoosterProfile' }
    ]
  }
};
```

## Data Models

### User Model
```javascript
const User = {
  id: 'user123',
  discordId: '123456789',
  discordUsername: 'PlayerName#1234',
  discordAvatarUrl: 'https://cdn.discordapp.com/avatars/...',
  email: 'player@example.com',
  roles: ['advertiser', 'team_advertiser', 'booster'],
  createdAt: '2024-01-15T10:30:00Z',
  isActive: true
};
```

### Service Model
```javascript
const Service = {
  id: 'service123',
  title: 'Mythic+20 Dungeon Boost',
  description: 'Professional M+20 completion with guaranteed loot',
  gameId: 'wow',
  serviceType: 'mythic_plus',
  workspaceType: 'personal', // 'personal' or 'team'
  workspaceOwnerId: 'user123',
  createdBy: 'user123',
  priceGold: 500,
  priceUsd: 15.00,
  priceToman: 750000,
  estimatedTime: '2-3 hours',
  requirements: 'Level 80, Item Level 580+',
  status: 'active', // 'active', 'inactive', 'deleted'
  createdAt: '2024-01-15T10:30:00Z',
  updatedAt: '2024-01-15T11:00:00Z'
};
```

### Order Model
```javascript
const Order = {
  id: 'order123',
  serviceId: 'service123',
  buyerId: 'buyer456',
  boosterId: 'booster789',
  advertiserId: 'user123',
  status: 'evidence_submitted', // pending, assigned, in_progress, evidence_submitted, under_review, completed, rejected
  pricePaid: 500,
  currencyUsed: 'gold',
  gameCredentials: { username: 'BuyerChar', realm: 'Stormrage' },
  specialInstructions: 'Please be careful with my character',
  evidence: {
    imageUrl: '/uploads/evidence_123.png',
    notes: 'Completed M+20 Necrotic Wake in time. Got 3 items.',
    uploadedAt: '2024-01-15T14:30:00Z'
  },
  reviewNotes: null,
  createdAt: '2024-01-15T10:00:00Z',
  completedAt: null
};
```

### Team Model
```javascript
const Team = {
  id: 'team123',
  name: 'Elite Boosters',
  description: 'Professional WoW boosting team',
  leaderId: 'user123',
  members: [
    {
      userId: 'user123',
      role: 'leader',
      status: 'active',
      joinedAt: '2024-01-01T00:00:00Z'
    },
    {
      userId: 'member456',
      role: 'member',
      status: 'active',
      joinedAt: '2024-01-10T12:00:00Z'
    }
  ],
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z'
};
```

### Wallet Model
```javascript
const Wallet = {
  userId: 'user123',
  balanceGold: 1500,
  balanceUsd: 250.00,
  balanceToman: 5000000,
  transactions: [
    {
      id: 'tx123',
      type: 'earning', // deposit, withdrawal, conversion, earning, purchase
      amount: 500,
      currency: 'gold',
      status: 'completed',
      description: 'Order #order123 completed',
      createdAt: '2024-01-15T15:00:00Z'
    }
  ],
  paymentMethods: [
    {
      id: 'pm123',
      type: 'credit_card',
      lastFour: '1234',
      isDefault: true,
      isVerified: true
    }
  ]
};
```

## Error Handling

### Client-Side Error Handling
```javascript
class ErrorHandler {
  static handleApiError(error, context) {
    const errorMessages = {
      400: 'Invalid request. Please check your input.',
      401: 'You are not authorized to perform this action.',
      403: 'You do not have permission to access this resource.',
      404: 'The requested resource was not found.',
      500: 'Server error. Please try again later.'
    };
    
    const message = errorMessages[error.status] || 'An unexpected error occurred.';
    this.showNotification(message, 'error');
    
    // Log error for debugging
    console.error(`Error in ${context}:`, error);
  }
  
  static showNotification(message, type = 'info') {
    // Discord-style notification system
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 5000);
  }
}
```

### Form Validation
```javascript
class FormValidator {
  static validateServiceForm(formData) {
    const errors = [];
    
    if (!formData.title || formData.title.length < 5) {
      errors.push('Service title must be at least 5 characters long');
    }
    
    if (!formData.description || formData.description.length < 20) {
      errors.push('Service description must be at least 20 characters long');
    }
    
    if (!formData.priceGold || formData.priceGold < 1) {
      errors.push('Gold price must be greater than 0');
    }
    
    return errors;
  }
  
  static validateEvidenceUpload(file, notes) {
    const errors = [];
    
    if (!file) {
      errors.push('Evidence image is required');
    } else {
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        errors.push('Only PNG and JPEG images are allowed');
      }
      
      if (file.size > 10 * 1024 * 1024) { // 10MB
        errors.push('Image size must be less than 10MB');
      }
    }
    
    if (!notes || notes.length < 10) {
      errors.push('Completion notes must be at least 10 characters long');
    }
    
    return errors;
  }
}
```

## Testing Strategy

### Unit Testing Approach
```javascript
// Example test structure for service management
describe('ServiceManagement', () => {
  describe('createService', () => {
    it('should create a new service with valid data', () => {
      const serviceData = {
        title: 'Test Service',
        description: 'Test description for service',
        serviceType: 'mythic_plus',
        priceGold: 500
      };
      
      const result = ServiceManager.createService(serviceData);
      expect(result.success).toBe(true);
      expect(result.service.title).toBe('Test Service');
    });
    
    it('should reject service creation with invalid data', () => {
      const invalidData = { title: 'Too short' };
      const result = ServiceManager.createService(invalidData);
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
  
  describe('assignBoosterToOrder', () => {
    it('should assign available booster to pending order', () => {
      const orderId = 'order123';
      const boosterId = 'booster456';
      
      const result = OrderManager.assignBooster(orderId, boosterId);
      expect(result.success).toBe(true);
      expect(result.order.boosterId).toBe(boosterId);
      expect(result.order.status).toBe('assigned');
    });
  });
});
```

### Integration Testing
```javascript
// Test complete order workflow
describe('OrderWorkflow', () => {
  it('should complete full order lifecycle', async () => {
    // 1. Create order
    const order = await OrderManager.createOrder({
      serviceId: 'service123',
      buyerId: 'buyer456'
    });
    expect(order.status).toBe('pending');
    
    // 2. Assign booster
    await OrderManager.assignBooster(order.id, 'booster789');
    const assignedOrder = await OrderManager.getOrder(order.id);
    expect(assignedOrder.status).toBe('assigned');
    
    // 3. Start work
    await OrderManager.startOrder(order.id);
    const inProgressOrder = await OrderManager.getOrder(order.id);
    expect(inProgressOrder.status).toBe('in_progress');
    
    // 4. Submit evidence
    await OrderManager.submitEvidence(order.id, {
      image: mockImageFile,
      notes: 'Completed successfully'
    });
    const evidenceOrder = await OrderManager.getOrder(order.id);
    expect(evidenceOrder.status).toBe('evidence_submitted');
    
    // 5. Approve order
    await OrderManager.approveOrder(order.id, 'admin123');
    const completedOrder = await OrderManager.getOrder(order.id);
    expect(completedOrder.status).toBe('completed');
  });
});
```

### User Acceptance Testing Scenarios
1. **Multi-Role Navigation**: User switches between Advertiser, Team Advertiser, and Booster tabs
2. **Service Creation**: Advertiser creates various service types with proper validation
3. **Team Workspace**: Team Advertiser switches workspaces and manages team services
4. **Order Management**: Complete order flow from assignment to evidence approval
5. **Wallet Operations**: Deposit, withdrawal, and currency conversion workflows
6. **Team Collaboration**: Multiple team members working on shared services
7. **Evidence Review**: Reviewing and approving/rejecting booster evidence
8. **Responsive Design**: Testing on different screen sizes and devices

### Mock Data Testing
```javascript
// Comprehensive mock data for testing all features
const MockData = {
  users: [
    {
      id: 'user1',
      discordUsername: 'ProBooster#1234',
      roles: ['advertiser', 'team_advertiser', 'booster'],
      // ... full user data
    }
  ],
  services: [
    {
      id: 'service1',
      title: 'Mythic+20 Dungeon Boost',
      serviceType: 'mythic_plus',
      // ... full service data
    }
  ],
  orders: [
    {
      id: 'order1',
      status: 'evidence_submitted',
      evidence: {
        imageUrl: '/mock-images/evidence1.png',
        notes: 'Completed M+20 successfully'
      }
      // ... full order data
    }
  ],
  teams: [
    {
      id: 'team1',
      name: 'Elite Boosters',
      members: [/* team members */]
    }
  ]
};
```

This design provides a comprehensive foundation for implementing the Service Provider Dashboard prototype with all the features specified in your documentation, including the Discord-inspired dark theme, multi-role support, team management, order workflows, and wallet functionality.