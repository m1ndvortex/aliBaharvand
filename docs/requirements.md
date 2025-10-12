# Requirements Document

## Business Overview
Gaming services marketplace platform where users can buy and sell game boosting services across multiple games (similar to G2G.com).

## Functional Requirements

### Client Dashboard
**Purpose:** Allow buyers to purchase game services and manage their multi-currency wallet

**Key Features:**
1. **Service Browsing & Purchase**
   - Browse available services across all games
   - Filter by game, service type, price
   - Purchase services using wallet balance
   - Track order status

2. **Wallet Management**
   - Multi-currency wallet (Gold, USD, Toman)
   - View balances for each currency
   - Convert between currencies using admin-defined rates
   - Transaction history

3. **Deposit & Withdrawal**
   - Add payment methods (Credit card, Crypto wallet, Iranian bank card)
   - Request deposits (pending admin approval)
   - Request withdrawals (pending admin approval)
   - View pending/approved/rejected transactions

4. **Profile Management**
   - Update personal information
   - Manage payment methods
   - View purchase history

**User Roles:**
- Client/Buyer

### Admin Dashboard
**Purpose:** Manage platform operations, users, games, services, and financial transactions

**Key Features:**

#### 1. Game & Service Management (Admin Only)
- Add/Remove/Edit games dynamically
- Configure services per game (Mythic+, Leveling, Raids, Delves, Custom)
- Set service parameters and pricing rules
- Manage service availability

#### 2. User & Role Management (Admin Only)
- Create/Edit/Delete users
- Assign roles: Admin, Advertiser, Team Advertiser, Booster, Support
- Configure flexible permissions per advertiser
- Manage booster predefined permissions
- View user activity logs

#### 3. Service Listing Management
- **Admin**: Can create all service types including Raids
- **Advertiser**: Can create services (Mythic+, Leveling, Delves, Custom) but ONLY book buyers for Raids (cannot create raids)
- **Team Advertiser**: Same as Advertiser + team management
- Edit/Delete own listings
- Manage service status (active/inactive)

#### 4. Financial Management (Admin Only)
- Approve/Reject deposit requests
- Approve/Reject withdrawal requests
- Set currency conversion rates
- View all transactions
- Generate financial reports

#### 5. Order Management
- **Admin/Support**: View all orders
- **Advertiser**: View own service orders
- **Booster**: View assigned orders
- Update order status
- Handle disputes

#### 6. Support Features (Support Role)
- View customer tickets
- Respond to inquiries
- Access user profiles (read-only)
- View order details

**User Roles:**
- **Admin**: Full system access
- **Advertiser**: Create/manage service listings (limited raid access)
- **Team Advertiser**: Advertiser + team management
- **Booster**: Fulfill services, basic permissions
- **Support**: Customer support access

## Role-Based Access Control (RBAC)

### Admin Role
**Permissions:**
- Full CRUD on games and services
- Full CRUD on users and roles
- Approve/reject financial transactions
- Create raids
- Access all system features
- Configure permissions for other roles

### Advertiser Role
**Permissions (Flexible - configurable per advertiser):**
- Create services: Mythic+, Leveling, Delves, Custom boosts
- Book buyers for Raids (cannot create raids)
- Edit/delete own listings
- View own orders and earnings
- Manage own profile

**Restrictions:**
- Cannot create raids (only booking)
- Cannot access other advertisers' data
- Cannot approve financial transactions
- Cannot manage users

### Team Advertiser Role
**Permissions:**
- All Advertiser permissions
- Create and manage team
- Assign boosters to team
- View team performance

### Booster Role
**Permissions (Predefined, standardized):**
- View assigned orders
- Update order progress
- Mark orders as complete
- View earnings
- Basic profile management

**Restrictions:**
- Cannot create services
- Cannot access admin features
- Cannot view other boosters' data

### Support Role
**Permissions:**
- View customer tickets
- Respond to inquiries
- View user profiles (read-only)
- View order details
- Access help documentation

**Restrictions:**
- Cannot modify user data
- Cannot approve transactions
- Cannot create services

## Wallet System Requirements

### Multi-Currency Support
- **Gold**: In-game currency
- **USD**: US Dollar
- **Toman**: Iranian Rial

### Currency Conversion
- Admin-defined conversion rates
- Real-time conversion calculation
- Conversion history tracking

### Payment Methods
1. **Credit Card**: International payments
2. **Crypto Wallet**: Cryptocurrency deposits
3. **Iranian Bank Card**: Local Iranian payments

### Transaction Workflow
1. User requests deposit/withdrawal
2. Transaction enters "Pending" state
3. Admin reviews and approves/rejects
4. Upon approval, balance updated
5. User notified of transaction status

### Security Requirements
- Withdrawals require admin approval
- Deposits processed instantly via secure payment gateway
- Payment method verification
- Transaction limits (configurable)
- Fraud detection mechanisms

## Non-Functional Requirements

### Performance
- Support 1000+ concurrent users
- Page load time < 2 seconds
- API response time < 500ms
- Real-time order status updates

### Security
- JWT-based authentication
- Role-based access control (RBAC)
- Encrypted password storage (bcrypt)
- HTTPS only in production
- Payment data encryption
- SQL injection prevention
- XSS/CSRF protection

### Scalability
- Docker-based deployment
- Horizontal scaling capability
- Database connection pooling
- Caching layer (Redis recommended)

### Reliability
- 99.9% uptime
- Automated backups (daily)
- Error logging and monitoring
- Graceful error handling

## User Stories

### Client Stories
1. As a client, I want to browse game services so I can find the boost I need
2. As a client, I want to deposit money using my preferred payment method
3. As a client, I want to convert currencies to pay in my preferred currency
4. As a client, I want to track my order status in real-time
5. As a client, I want to withdraw my earnings securely

### Advertiser Stories
1. As an advertiser, I want to create Mythic+ boost listings
2. As an advertiser, I want to book buyers for raid services
3. As an advertiser, I want to view my earnings and statistics
4. As an advertiser, I want to manage my active listings

### Admin Stories
1. As an admin, I want to add new games to the platform
2. As an admin, I want to approve deposit/withdrawal requests
3. As an admin, I want to configure permissions for specific advertisers
4. As an admin, I want to create raid services
5. As an admin, I want to view platform-wide analytics

### Booster Stories
1. As a booster, I want to view my assigned orders
2. As a booster, I want to update order progress
3. As a booster, I want to view my earnings
