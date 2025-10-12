# Admin Dashboard Specification

## Purpose
Comprehensive management interface for platform operations, including game/service management, user administration, financial approvals, and role-based access control.

## User Roles
- **Admin**: Full system access
- **Advertiser**: Create and manage service listings
- **Team Advertiser**: Advertiser + team management
- **Booster**: Fulfill services
- **Support**: Customer support

## Features by Role

---

## ADMIN ROLE

### 1. Game Management (Admin Only)

#### Games List
**Display:**
- Game name
- Icon/logo
- Number of services
- Active status
- Actions (Edit, Delete, Toggle Active)

**Features:**
- Add new game
- Edit game details
- Delete game (with confirmation)
- Activate/deactivate game
- Reorder games (drag & drop)

#### Add/Edit Game Form
**Fields:**
- Game name (required)
- Slug (auto-generated, editable)
- Description
- Icon/logo upload
- Active status
- Sort order

### 2. Service Type Management (Admin Only)

#### Service Types per Game
**Display:**
- Service type name (Mythic+, Leveling, Raid, Delve, Custom)
- Game association
- Active status
- Requires admin flag (for raids)

**Features:**
- Add service type to game
- Edit service type
- Delete service type
- Mark service type as "requires admin" (raids)

#### Add/Edit Service Type Form
**Fields:**
- Game selection
- Service type name
- Slug
- Description
- Active status
- Requires admin (checkbox - for raids)

### 3. User & Role Management (Admin Only)

#### Users List
**Display:**
- User ID
- Name
- Email
- Role
- Status (Active/Inactive/Suspended)
- Created date
- Last login
- Actions (Edit, Delete, View Details)

**Filters:**
- Role
- Status
- Registration date range
- Search by name/email

#### Create/Edit User
**Fields:**
- First name, Last name
- Email
- Password (create only)
- Role selection
- Status
- Phone, Country

#### Role Assignment
- Assign role to user
- View role permissions
- Override permissions for specific users (flexible RBAC)

### 4. Permission Management (Admin Only)

#### Roles & Permissions Matrix
**Display:**
- Roles (columns)
- Permissions (rows)
- Checkboxes for role-permission assignments

**Permission Categories:**
- Game Management (create_game, edit_game, delete_game)
- Service Management (create_service, edit_service, delete_service, create_raid)
- User Management (create_user, edit_user, delete_user)
- Financial (approve_deposit, approve_withdrawal, set_exchange_rate)
- Order Management (view_all_orders, assign_booster)
- Support (view_tickets, respond_tickets)

#### User-Specific Permissions
**Purpose:** Override role permissions for individual advertisers

**Features:**
- Select user (advertiser)
- View their role permissions
- Grant additional permissions
- Revoke specific permissions
- Save custom permission set

**Example:**
- Advertiser A: Can create raids (exception)
- Advertiser B: Cannot create custom boosts (restriction)

### 5. Financial Management (Admin Only)

#### Pending Transactions
**Display:**
- Transaction number
- User name
- Type (Deposit/Withdrawal)
- Amount and currency
- Payment method
- Status (Pending)
- Requested date
- Actions (Approve, Reject)

**Approve Workflow:**
1. Review transaction details
2. Verify payment method
3. Add admin notes (optional)
4. Click "Approve"
5. User balance updated
6. User notified

**Reject Workflow:**
1. Review transaction
2. Add rejection reason (required)
3. Click "Reject"
4. User notified with reason

#### Exchange Rate Management
**Display:**
- Currency pairs (Gold↔USD, USD↔Toman, Gold↔Toman)
- Current rate
- Last updated
- Actions (Edit)

**Edit Exchange Rate:**
- Select currency pair
- Enter new rate
- Save (applies immediately)

#### Financial Reports
- Total deposits (by currency)
- Total withdrawals (by currency)
- Platform revenue
- Pending transactions count
- Transaction volume over time (charts)

### 6. Service Management (Admin)

#### All Services List
**Display:**
- Service ID
- Game
- Service type
- Title
- Created by (advertiser/admin)
- Price (all currencies)
- Status
- Created date
- Actions (Edit, Delete, View)

**Admin Capabilities:**
- Create any service type (including raids)
- Edit any service
- Delete any service
- View service analytics

#### Create Raid Service (Admin Only)
**Form:**
- Game selection
- Service type: Raid
- Title
- Description
- Price (Gold, USD, Toman)
- Requirements (JSON)
- Estimated completion time
- Status (Active/Inactive)

---

## ADVERTISER ROLE

### 1. My Services

#### Services List
**Display:**
- Own services only
- Service details
- Order count
- Revenue
- Status
- Actions (Edit, Delete)

**Create Service:**
- Can create: Mythic+, Leveling, Delves, Custom boosts
- **Cannot create raids** (only book buyers for existing raids)

#### Create Service Form
**Fields:**
- Game selection
- Service type (excluding Raid)
- Title
- Description
- Price (Gold, USD, Toman)
- Requirements
- Estimated completion time
- Status

### 2. Raid Booking (Advertiser)

**Purpose:** Advertisers can book buyers for admin-created raid services

**Features:**
- View available raid services
- Book buyer for raid slot
- Manage raid bookings
- Cannot create new raid services

**Booking Form:**
- Select raid service (admin-created)
- Buyer information
- Slot/time selection
- Special requirements

### 3. My Orders

**Display:**
- Orders for advertiser's services
- Order details
- Buyer information
- Booster assigned
- Status
- Revenue

**Actions:**
- View order details
- Assign booster (if team advertiser)
- Update order status
- Contact buyer

### 4. Earnings

**Display:**
- Total earnings (by currency)
- Pending payouts
- Completed payouts
- Earnings chart (over time)

---

## TEAM ADVERTISER ROLE

### All Advertiser Features +

### 1. Team Management

#### My Team
**Display:**
- Team name
- Team members (boosters)
- Member status
- Performance metrics

**Features:**
- Create team
- Invite boosters
- Remove team members
- View team performance

#### Assign Boosters to Orders
- View team members
- Assign booster to order
- Track booster workload

---

## BOOSTER ROLE

### 1. Assigned Orders

**Display:**
- Orders assigned to booster
- Service details
- Buyer information
- Status
- Deadline

**Actions:**
- View order details
- Update progress
- Mark as complete
- Contact buyer (optional)

### 2. My Earnings

**Display:**
- Total earnings
- Pending payments
- Completed orders count
- Earnings history

**Booster Permissions (Predefined):**
- View assigned orders only
- Update order progress
- Mark orders complete
- View own earnings
- Update own profile

**Restrictions:**
- Cannot create services
- Cannot view other boosters' orders
- Cannot access admin features
- Cannot assign orders

---

## SUPPORT ROLE

### 1. Support Tickets

**Display:**
- Ticket ID
- User name
- Subject
- Status (Open, In Progress, Resolved)
- Priority
- Created date
- Actions (View, Respond)

**Features:**
- View all tickets
- Respond to tickets
- Update ticket status
- Escalate to admin

### 2. User Lookup

**Features:**
- Search users by email/name
- View user profile (read-only)
- View user orders
- View user transactions
- Cannot modify user data

### 3. Order Support

**Features:**
- View order details
- View order history
- Contact buyer/booster
- Cannot modify orders (escalate to admin)

---

## Common Features (All Roles)

### Dashboard Home
**Displays (role-specific):**
- Key metrics
- Recent activity
- Quick actions
- Notifications

### Profile Management
- Update personal information
- Change password
- View login history

### Notifications
- System notifications
- Order updates
- Transaction updates
- Mark as read

---

## Pages/Views

### Admin Pages
1. Dashboard Home
2. Games Management
3. Service Types Management
4. Users & Roles
5. Permissions Management
6. Financial Approvals
7. Exchange Rates
8. All Services
9. All Orders
10. Reports & Analytics

### Advertiser Pages
1. Dashboard Home
2. My Services
3. Create Service
4. Raid Booking
5. My Orders
6. Earnings

### Team Advertiser Pages
1. All Advertiser pages +
2. Team Management
3. Assign Boosters

### Booster Pages
1. Dashboard Home
2. Assigned Orders
3. My Earnings
4. Profile

### Support Pages
1. Dashboard Home
2. Support Tickets
3. User Lookup
4. Order Support

---

## Data Flow

### Admin → Backend
```
Admin Dashboard → API Gateway → JWT + Permission Check → Business Logic → Database
```

### Backend → Admin
```
Database → Business Logic → Permission Filter → API Response → Admin Dashboard
```

---

## Permissions Summary

### Admin Permissions
- Full CRUD on games, service types, users, roles
- Approve/reject financial transactions
- Set exchange rates
- Create raids
- View all data
- Configure permissions

### Advertiser Permissions (Flexible)
- Create services (except raids)
- Book buyers for raids
- Edit/delete own services
- View own orders
- View own earnings
- Custom permissions (admin-configurable)

### Team Advertiser Permissions
- All advertiser permissions
- Create/manage team
- Assign boosters to orders
- View team performance

### Booster Permissions (Predefined)
- View assigned orders
- Update order progress
- Mark orders complete
- View own earnings

### Support Permissions
- View support tickets
- Respond to tickets
- View user profiles (read-only)
- View order details (read-only)

---

## Integration Points

### APIs Consumed
- `GET /api/admin/games` - Manage games
- `POST /api/admin/games` - Create game
- `GET /api/admin/service-types` - Manage service types
- `GET /api/admin/users` - User management
- `POST /api/admin/users` - Create user
- `GET /api/admin/roles` - Role management
- `GET /api/admin/permissions` - Permission management
- `PUT /api/admin/user-permissions/:userId` - Set user permissions
- `GET /api/admin/transactions/pending` - Pending transactions
- `PUT /api/admin/transactions/:id/approve` - Approve transaction
- `PUT /api/admin/transactions/:id/reject` - Reject transaction
- `GET /api/admin/exchange-rates` - Exchange rates
- `PUT /api/admin/exchange-rates` - Update rates
- `GET /api/advertiser/services` - Advertiser services
- `POST /api/advertiser/services` - Create service
- `POST /api/advertiser/raid-booking` - Book raid
- `GET /api/booster/orders` - Booster orders
- `PUT /api/booster/orders/:id/progress` - Update progress
- `GET /api/support/tickets` - Support tickets

---

## UI/UX Considerations
- Role-based navigation (show only accessible features)
- Permission-based button visibility
- Clear status indicators
- Bulk actions for admin
- Responsive tables with filters
- Real-time notifications
- Confirmation dialogs for critical actions
- Audit logs for admin actions
