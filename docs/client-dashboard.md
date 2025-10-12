# Client Dashboard Specification

## Purpose
Allow buyers to browse and purchase game boosting services, manage their multi-currency wallet, and track orders.

## User Roles
- **Client/Buyer**: End users who purchase game services

## Features

### 1. Service Marketplace

#### Browse Services
- View all available services across all games
- Filter by:
  - Game (World of Warcraft, etc.)
  - Service type (Mythic+, Leveling, Raids, Delves)
  - Price range
  - Estimated completion time
- Search functionality
- Sort by: Price, popularity, newest

#### Service Details
- Service title and description
- Price in all currencies (Gold, USD, Toman)
- Estimated completion time
- Requirements (level, gear, etc.)
- Seller rating/reviews
- Purchase button

#### Purchase Flow
1. Select service
2. Choose payment currency (Gold/USD/Toman)
3. Confirm sufficient wallet balance
4. Enter game credentials (if required)
5. Add special instructions/notes
6. Confirm purchase
7. Order created

### 2. Wallet Management

#### Wallet Overview
**Display:**
- Current balance in each currency:
  - Gold balance
  - USD balance
  - Toman balance
- Total value (converted to preferred currency)
- Recent transactions (last 10)

#### Currency Conversion
**Features:**
- Convert between Gold ↔ USD ↔ Toman
- Real-time conversion rate display
- Conversion calculator
- Conversion history

**Workflow:**
1. Select source currency and amount
2. Select target currency
3. View conversion rate and final amount
4. Confirm conversion
5. Balances updated instantly

#### Deposit Funds

**Payment Methods:**
- Credit Card (international)
- Crypto Wallet (Bitcoin, Ethereum, etc.)
- Iranian Bank Card (local)

**Deposit Workflow:**
1. Click "Deposit"
2. Select payment method
3. Enter amount and currency
4. Complete payment via payment gateway
5. Payment processed instantly
6. Balance updated immediately
7. User notified via email/notification

**Deposit Status:**
- Processing (payment gateway processing)
- Completed (balance updated)
- Failed (payment failed - try again)

#### Withdraw Funds

**Withdrawal Workflow:**
1. Click "Withdraw"
2. Select currency and amount
3. Select registered payment method
4. Submit withdrawal request
5. Status: "Pending Admin Approval"
6. Admin approves/rejects
7. Upon approval: Funds transferred
8. User notified

**Withdrawal Limits:**
- Minimum withdrawal amount (configurable)
- Maximum daily withdrawal (configurable)
- Verification requirements

#### Payment Methods Management
- Add new payment method
- View saved payment methods
- Set default payment method
- Remove payment method
- Verify payment method

**Payment Method Types:**
1. **Credit Card**
   - Card number (last 4 digits shown)
   - Expiry date
   - Cardholder name

2. **Crypto Wallet**
   - Wallet address
   - Cryptocurrency type
   - QR code

3. **Iranian Bank Card**
   - Card number (last 4 digits shown)
   - Bank name
   - Account holder name

### 3. Order Management

#### My Orders
**Display:**
- Order number
- Service name and game
- Price paid and currency
- Order status
- Booster assigned (if any)
- Created date
- Estimated completion

**Order Statuses:**
- Pending (awaiting booster assignment)
- In Progress (booster working)
- Completed (service delivered)
- Cancelled (refunded)
- Disputed (issue reported)

#### Order Details
- Full service information
- Booster details (name, rating)
- Progress updates
- Chat with booster (optional)
- Mark as complete button
- Report issue button

### 4. Transaction History

**Display:**
- Transaction number
- Type (Deposit, Withdrawal, Purchase, Conversion, Refund)
- Amount and currency
- Status
- Date
- Admin notes (if any)

**Filters:**
- Date range
- Transaction type
- Currency
- Status

### 5. Profile Management

#### Personal Information
- First name, Last name
- Email (verified)
- Phone number
- Country
- Change password

#### Preferences
- Preferred currency for display
- Email notifications settings
- Language preference

#### Security
- Two-factor authentication (optional)
- Login history
- Active sessions

## Pages/Views

### 1. Dashboard Home
**Purpose:** Overview of account status

**Components:**
- Wallet balance cards (Gold, USD, Toman)
- Quick actions (Deposit, Withdraw, Convert)
- Recent orders (last 5)
- Recent transactions (last 5)
- Featured services

### 2. Marketplace
**Purpose:** Browse and purchase services

**Components:**
- Game filter sidebar
- Service type filter
- Price range slider
- Search bar
- Service cards grid
- Pagination

### 3. Service Detail Page
**Purpose:** View service details and purchase

**Components:**
- Service information
- Price display (all currencies)
- Purchase form
- Seller information
- Reviews/ratings

### 4. Wallet Page
**Purpose:** Manage wallet and finances

**Tabs:**
- Overview (balances)
- Deposit
- Withdraw
- Convert
- Payment Methods
- Transaction History

### 5. Orders Page
**Purpose:** Track and manage orders

**Components:**
- Orders list with filters
- Order status badges
- Quick actions (view details, contact support)

### 6. Profile Page
**Purpose:** Manage account settings

**Tabs:**
- Personal Information
- Security
- Preferences
- Notifications

## Data Flow

### Client → Backend
```
Client Dashboard → API Gateway → JWT Validation → Business Logic → Database
```

### Backend → Client
```
Database → Business Logic → API Response → Client Dashboard
```

## Permissions
**Clients Can:**
- Browse all active services
- Purchase services (with sufficient balance)
- View own orders
- Manage own wallet
- Request deposits/withdrawals
- Convert currencies
- Update own profile

**Clients Cannot:**
- View other users' data
- Access admin features
- Create services
- Approve transactions
- View system-wide analytics

## Integration Points

### APIs Consumed
- `GET /api/games` - List all games
- `GET /api/services` - List services with filters
- `GET /api/services/:id` - Service details
- `POST /api/orders` - Create order
- `GET /api/orders` - User's orders
- `GET /api/wallet` - Wallet balance
- `POST /api/wallet/deposit` - Request deposit
- `POST /api/wallet/withdraw` - Request withdrawal
- `POST /api/wallet/convert` - Convert currency
- `GET /api/transactions` - Transaction history
- `GET /api/exchange-rates` - Current conversion rates
- `POST /api/payment-methods` - Add payment method
- `GET /api/payment-methods` - List payment methods

### External Services
- Payment gateway (credit card processing)
- Crypto payment processor
- Email service (notifications)
- SMS service (2FA, optional)

## UI/UX Considerations
- Responsive design (mobile-friendly)
- Real-time balance updates
- Clear transaction status indicators
- Easy currency conversion
- Secure payment method handling
- Intuitive navigation
- Loading states for async operations
- Error handling with user-friendly messages
