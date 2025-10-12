# Data Models and Relationships

## Entity Relationship Overview

```
┌──────────┐       ┌──────────┐       ┌──────────┐
│   User   │──────▶│   Role   │       │   Game   │
└────┬─────┘       └──────────┘       └────┬─────┘
     │                                      │
     │             ┌──────────┐             │
     └────────────▶│  Wallet  │             │
     │             └──────────┘             │
     │                                      │
     │             ┌──────────┐             │
     └────────────▶│Transaction            │
                   └──────────┘             │
                                            │
     ┌──────────────────────────────────────┘
     │
     ▼
┌──────────┐       ┌──────────┐       ┌──────────┐
│ Service  │──────▶│  Order   │──────▶│  Booster │
└──────────┘       └──────────┘       └──────────┘
     │
     ▼
┌──────────┐
│ServiceType
└──────────┘
```

## Core Entities

### User
**Description:** All platform users - authenticated via Discord OAuth

**Fields:**
- `id` (Primary Key, UUID)
- `email` (Unique, Indexed)
- `discord_id` (String, Unique, NOT NULL) - Discord user ID
- `discord_username` (String) - Discord username#discriminator
- `discord_avatar` (String) - Discord avatar hash
- `password` (String, Nullable) - Hashed with bcrypt (NULL for Discord-only)
- `first_name` (String, 100)
- `last_name` (String, 100)
- `status` (Enum: active, pending, suspended)
- `phone` (String, optional)
- `country` (String, optional)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)
- `last_login` (Timestamp)

**Indexes:**
- email (unique)
- discord_id (unique)
- status

**Notes:**
- Users MUST authenticate with Discord
- One Discord account = One platform account
- Users can have multiple roles (many-to-many)

### Role
**Description:** Defines available roles in the system

**Fields:**
- `id` (Primary Key)
- `name` (String: admin, advertiser, team_advertiser, booster, support, client)
- `display_name` (String)
- `description` (Text)
- `requires_approval` (Boolean) - Whether role requires admin approval
- `is_system_role` (Boolean) - Cannot be deleted
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

**System Roles:**
- client (requires_approval: false) - Auto-assigned on registration
- booster (requires_approval: true) - Requires admin approval or manual assignment
- advertiser (requires_approval: true) - Requires admin approval or manual assignment
- team_advertiser (requires_approval: true) - Requires admin approval or manual assignment
- support (requires_approval: true) - Requires admin approval or manual assignment
- admin (requires_approval: true) - Requires admin approval or manual assignment

### UserRole
**Description:** Many-to-many relationship between users and roles (users can have multiple roles)

**Fields:**
- `id` (Primary Key)
- `user_id` (Foreign Key → User)
- `role_id` (Foreign Key → Role)
- `status` (Enum: active, pending_approval, rejected)
- `approved_by` (Foreign Key → User, Nullable) - Admin who approved
- `approved_at` (Timestamp, Nullable)
- `requested_at` (Timestamp)
- `rejection_reason` (Text, Nullable)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

**Indexes:**
- user_id, role_id (composite unique)
- status

**Notes:**
- Users can have multiple active roles
- Each role assignment can be pending, active, or rejected
- Auto-approved roles (client, booster) immediately get status='active'
- Other roles start with status='pending_approval'

### Permission
**Description:** Granular permissions for flexible RBAC

**Fields:**
- `id` (Primary Key)
- `name` (String: e.g., "create_service", "approve_transaction")
- `resource` (String: e.g., "service", "transaction", "user")
- `action` (String: e.g., "create", "read", "update", "delete")
- `description` (Text)

### RolePermission
**Description:** Many-to-many relationship between roles and permissions

**Fields:**
- `id` (Primary Key)
- `role_id` (Foreign Key → Role)
- `permission_id` (Foreign Key → Permission)
- `created_at` (Timestamp)

### UserPermission
**Description:** Override permissions for specific users (flexible advertiser permissions)

**Fields:**
- `id` (Primary Key)
- `user_id` (Foreign Key → User)
- `permission_id` (Foreign Key → Permission)
- `granted` (Boolean - true for grant, false for revoke)
- `created_at` (Timestamp)

### Game
**Description:** Games available on the platform

**Fields:**
- `id` (Primary Key)
- `name` (String: e.g., "World of Warcraft")
- `slug` (String, Unique: e.g., "world-of-warcraft")
- `description` (Text)
- `icon_url` (String)
- `is_active` (Boolean)
- `sort_order` (Integer)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

**Indexes:**
- slug (unique)
- is_active

### ServiceType
**Description:** Types of services available per game

**Fields:**
- `id` (Primary Key)
- `game_id` (Foreign Key → Game)
- `name` (String: e.g., "Mythic+ Dungeon", "Leveling", "Raid", "Delve")
- `slug` (String: e.g., "mythic-plus")
- `description` (Text)
- `is_active` (Boolean)
- `requires_admin` (Boolean - true for raids)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

**Indexes:**
- game_id
- slug

### Service
**Description:** Actual service listings created by advertisers/admins (can be personal or team-owned)

**Fields:**
- `id` (Primary Key, UUID)
- `game_id` (Foreign Key → Game)
- `service_type_id` (Foreign Key → ServiceType)
- `workspace_type` (Enum: personal, team) - Ownership type
- `workspace_owner_id` (Integer) - user_id (if personal) or team_id (if team)
- `created_by` (Foreign Key → User) - User who actually created it
- `title` (String, 200)
- `description` (Text)
- `price_gold` (Decimal, nullable)
- `price_usd` (Decimal, nullable)
- `price_toman` (Decimal, nullable)
- `estimated_completion_time` (Integer - hours)
- `requirements` (JSON - game-specific requirements)
- `status` (Enum: active, inactive, sold_out)
- `is_featured` (Boolean)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

**Indexes:**
- game_id
- service_type_id
- workspace_type, workspace_owner_id (composite)
- created_by
- status

**Notes:**
- Personal services: workspace_type='personal', workspace_owner_id=user_id
- Team services: workspace_type='team', workspace_owner_id=team_id
- created_by tracks which user created it (for activity logging)

### Order
**Description:** Service purchases by clients

**Fields:**
- `id` (Primary Key, UUID)
- `order_number` (String, Unique - auto-generated)
- `service_id` (Foreign Key → Service)
- `buyer_id` (Foreign Key → User - client)
- `booster_id` (Foreign Key → User - booster, nullable)
- `earnings_recipient_id` (Foreign Key → User) - Who receives payment
- `price_paid` (Decimal)
- `currency_used` (Enum: gold, usd, toman)
- `status` (Enum: pending, assigned, in_progress, evidence_submitted, under_review, completed, rejected, cancelled, disputed)
- `game_credentials` (Encrypted JSON - optional)
- `notes` (Text)
- `started_at` (Timestamp, nullable)
- `evidence_submitted_at` (Timestamp, nullable)
- `reviewed_at` (Timestamp, nullable)
- `reviewed_by` (Foreign Key → User, nullable) - Admin/Support/Advertiser who approved
- `completed_at` (Timestamp, nullable)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

**Indexes:**
- order_number (unique)
- buyer_id
- booster_id
- earnings_recipient_id
- status
- created_at

**Status Flow:**
- `pending` - Order created, awaiting booster assignment
- `assigned` - Booster assigned to order
- `in_progress` - Booster working on order
- `evidence_submitted` - Booster uploaded proof, awaiting review
- `under_review` - Being reviewed by Admin/Support/Advertiser
- `completed` - Approved and payment released
- `rejected` - Evidence rejected, booster must resubmit
- `cancelled` - Order cancelled
- `disputed` - Dispute raised

**Notes:**
- earnings_recipient_id: For personal services = service creator, For team services = team leader
- Payment released only when status = 'completed'

### OrderEvidence
**Description:** Evidence/proof uploaded by boosters for order completion

**Fields:**
- `id` (Primary Key)
- `order_id` (Foreign Key → Order)
- `uploaded_by` (Foreign Key → User) - Booster who uploaded
- `image_url` (String, 500) - Path to uploaded image/screenshot
- `notes` (Text) - Booster's completion notes
- `uploaded_at` (Timestamp)
- `reviewed_by` (Foreign Key → User, Nullable) - Who reviewed
- `review_status` (Enum: pending, approved, rejected)
- `review_notes` (Text, Nullable) - Rejection reason or approval notes
- `reviewed_at` (Timestamp, Nullable)

**Indexes:**
- order_id
- uploaded_by
- review_status

**Notes:**
- Multiple evidence submissions allowed (if rejected and resubmitted)
- Images stored in S3 or local storage
- Only latest evidence considered for review

### Wallet
**Description:** User wallet for multi-currency support

**Fields:**
- `id` (Primary Key)
- `user_id` (Foreign Key → User, Unique)
- `balance_gold` (Decimal, default 0)
- `balance_usd` (Decimal, default 0)
- `balance_toman` (Decimal, default 0)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

**Indexes:**
- user_id (unique)

### Transaction
**Description:** All wallet transactions (deposits, withdrawals, conversions, purchases)

**Fields:**
- `id` (Primary Key, UUID)
- `transaction_number` (String, Unique)
- `wallet_id` (Foreign Key → Wallet)
- `type` (Enum: deposit, withdrawal, conversion, purchase, refund)
- `amount` (Decimal)
- `currency` (Enum: gold, usd, toman)
- `status` (Enum: pending, approved, rejected, completed)
- `payment_method` (Enum: credit_card, crypto, iranian_bank, null)
- `payment_details` (JSON - encrypted)
- `admin_notes` (Text, nullable)
- `approved_by` (Foreign Key → User - admin, nullable)
- `approved_at` (Timestamp, nullable)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

**Indexes:**
- transaction_number (unique)
- wallet_id
- type
- status
- created_at

### CurrencyConversion
**Description:** Currency conversion transactions

**Fields:**
- `id` (Primary Key)
- `transaction_id` (Foreign Key → Transaction)
- `from_currency` (Enum: gold, usd, toman)
- `to_currency` (Enum: gold, usd, toman)
- `from_amount` (Decimal)
- `to_amount` (Decimal)
- `exchange_rate` (Decimal)
- `created_at` (Timestamp)

### PaymentMethod
**Description:** User payment methods

**Fields:**
- `id` (Primary Key)
- `user_id` (Foreign Key → User)
- `type` (Enum: credit_card, crypto_wallet, iranian_bank)
- `details` (Encrypted JSON)
- `is_verified` (Boolean)
- `is_default` (Boolean)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

**Indexes:**
- user_id

### ExchangeRate
**Description:** Admin-defined currency exchange rates

**Fields:**
- `id` (Primary Key)
- `from_currency` (Enum: gold, usd, toman)
- `to_currency` (Enum: gold, usd, toman)
- `rate` (Decimal)
- `is_active` (Boolean)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

**Indexes:**
- from_currency, to_currency (composite unique)

### Team
**Description:** Teams managed by team advertisers for collaborative service management

**Fields:**
- `id` (Primary Key)
- `name` (String, 200)
- `leader_id` (Foreign Key → User) - Team advertiser who created the team
- `description` (Text)
- `is_active` (Boolean)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

**Indexes:**
- leader_id
- is_active

**Notes:**
- Only users with 'team_advertiser' role can create teams
- Team leader receives all earnings from team services

### TeamMember
**Description:** Members of teams (can be any user invited to the team)

**Fields:**
- `id` (Primary Key)
- `team_id` (Foreign Key → Team)
- `user_id` (Foreign Key → User)
- `role` (Enum: leader, member)
- `status` (Enum: active, invited, left)
- `invited_by` (Foreign Key → User)
- `joined_at` (Timestamp)
- `left_at` (Timestamp, Nullable)
- `created_at` (Timestamp)

**Indexes:**
- team_id, user_id (composite unique)
- user_id
- status

**Notes:**
- Team leader is automatically added as member with role='leader'
- Invited users can accept to become active members
- All active team members can access team workspace

### ServiceActivityLog
**Description:** Tracks all actions performed on services (especially important for team services)

**Fields:**
- `id` (Primary Key)
- `service_id` (Foreign Key → Service)
- `user_id` (Foreign Key → User) - Who performed the action
- `action` (String, 50) - created, updated_price, updated_description, activated, deactivated, deleted
- `changes` (JSONB) - What changed: {"field": "price_gold", "old_value": 100, "new_value": 150}
- `ip_address` (String, 45)
- `created_at` (Timestamp)

**Indexes:**
- service_id
- user_id
- created_at

**Notes:**
- Critical for team workspace to track who did what
- Logs all modifications to services
- Provides audit trail for collaborative editing

## Key Relationships

### User ↔ Role (Many-to-Many via UserRole)
- Users can have multiple roles simultaneously
- Each role assignment has approval status
- Example: User can be both Advertiser and Booster

### User ↔ Permission (Many-to-Many via UserPermission)
- Users can have custom permissions beyond their roles
- Enables flexible advertiser permissions

### Role ↔ Permission (Many-to-Many via RolePermission)
- Roles have base permissions
- Permissions can be shared across roles

### User ↔ Discord (One-to-One)
- Each user has one Discord account
- Discord ID is unique and required
- Primary authentication method

### User ↔ Wallet (One-to-One)
- Each user has exactly one wallet
- Wallet tracks balances in all currencies

### Game ↔ ServiceType (One-to-Many)
- Each game has multiple service types
- Service types belong to one game

### Service ↔ Game (Many-to-One)
- Services belong to one game
- Games have many services

### Service ↔ User/Team (Polymorphic)
- Services can be owned by individual users (personal) or teams (team)
- workspace_type and workspace_owner_id determine ownership
- created_by tracks which user created it

### Team ↔ User (One-to-Many for leader, Many-to-Many for members)
- Each team has one leader (team advertiser)
- Teams can have many members
- Members can be in multiple teams

### Service ↔ ActivityLog (One-to-Many)
- Each service has many activity log entries
- Tracks all changes with user attribution

### ShopProduct ↔ Game (Many-to-One)
- Shop products belong to one game
- Games can have many shop products

### ShopOrder ↔ User (Many-to-One)
- Shop orders belong to one user
- Users can have many shop orders

### ShopOrder ↔ ShopProduct (Many-to-One)
- Shop orders reference one product
- Products can have many orders

### Order ↔ Service (Many-to-One)
- Orders reference one service
- Services can have many orders

### Order ↔ User (Many-to-One for buyer and booster)
- Each order has one buyer (client)
- Each order has one booster (assigned)

### Transaction ↔ Wallet (Many-to-One)
- Transactions belong to one wallet
- Wallets have many transactions

### Team ↔ User (One-to-Many)
- Teams owned by team advertisers
- Teams have many booster members

---

## Shop System Entities

### ShopProduct
**Description:** Products available in shop (game time, subscriptions)

**Fields:**
- `id` (Primary Key)
- `game_id` (Foreign Key → Game)
- `product_type` (String: game_time, subscription)
- `name` (String, 200)
- `description` (Text)
- `duration_days` (Integer) - For game time products
- `price_gold` (Decimal, nullable)
- `price_usd` (Decimal, nullable)
- `price_toman` (Decimal, nullable)
- `stock_type` (Enum: unlimited, limited)
- `stock_quantity` (Integer, nullable)
- `stock_available` (Integer, nullable)
- `is_active` (Boolean)
- `sort_order` (Integer)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)
- `created_by` (Foreign Key → User)

**Indexes:**
- game_id
- is_active
- sort_order

### ShopOrder
**Description:** Shop purchases by users

**Fields:**
- `id` (Primary Key)
- `order_number` (String, Unique) - SH-12345
- `user_id` (Foreign Key → User)
- `product_id` (Foreign Key → ShopProduct)
- `price_paid` (Decimal)
- `currency_used` (Enum: gold, usd, toman)
- `payment_method` (Enum: wallet, credit_card, crypto, bank_card)
- `payment_gateway_id` (String, nullable) - Transaction ID from gateway
- `game_time_code` (String, nullable) - Generated code
- `delivery_status` (Enum: pending, delivered, failed)
- `delivered_at` (Timestamp, nullable)
- `status` (Enum: pending, completed, failed, refunded)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

**Indexes:**
- order_number (unique)
- user_id
- product_id
- status
- created_at
