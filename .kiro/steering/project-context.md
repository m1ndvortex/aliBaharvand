# Project Context and Requirements

## Project Overview
Gaming services marketplace platform (similar to G2G.com) where users can buy and sell game boosting services across multiple games.

### Dashboard Architecture
1. **Admin Dashboard** - For Admin role ONLY
   - Game and service type management
   - User and role management
   - Role request approvals
   - Financial transaction approvals
   - System settings

2. **Service Provider Dashboard** - For Booster, Advertiser, Team Advertiser
   - Role-based tabs (users see only tabs for their active roles):
     - Advertiser Tab (requires Advertiser role)
     - Team Advertiser Tab (requires Team Advertiser role)
     - Booster Tab (requires Booster role)

## Business Model
- Multi-game platform (starting with World of Warcraft, expandable to any game)
- Services include: Mythic+ dungeons, leveling, raids, delves, custom boosts
- Advertisers create service listings
- Boosters fulfill the services
- Clients purchase services using multi-currency wallet system
- Team advertisers can create teams for collaborative service management

## Key Requirements

### Authentication
- **Mandatory Discord OAuth**: All users must register/login with Discord
- One Discord account = One platform account
- Store Discord ID, username, and avatar

### Multi-Role System
**Users can have MULTIPLE roles simultaneously** (e.g., Advertiser + Booster)

**Available Roles:**
- **Client**: Purchase services, manage wallet (auto-approved)
- **Booster**: Fulfill services (auto-approved)
- **Advertiser**: Create and manage service listings (requires admin approval)
- **Team Advertiser**: Advertiser with team management capabilities (requires admin approval)
- **Support**: Customer support access (requires admin approval)
- **Admin**: Full system access (requires admin approval)

**Role Approval Flow:**
- Auto-approved: Client (default for all new users)
- Requires admin approval: Booster, Advertiser, Team Advertiser, Support, Admin
- Admin can manually assign roles or approve/reject role requests

**Important:** 
- Users can request multiple roles
- Admin approves/rejects each role request individually
- Admin can create raids; Advertisers can only book buyers for raids

### Team Workspace System
**Team Advertiser Features:**
- Create team and invite members
- Team workspace button appears for team leader and all team members
- Context switching: Personal Workspace ↔ Team Workspace

**Team Workspace Behavior:**
- All team members can view and edit team services collaboratively
- All earnings from team services go to team leader's wallet
- Activity logging tracks which team member performed each action
- Team members can create/edit services, book raids, manage orders together

**Technical Implementation:**
- Services have `workspace_type` (personal/team) and `workspace_owner_id`
- Activity logs track all changes with user_id
- Team leader receives all team earnings

### Wallet System
**Multi-Currency Support:**
- Gold (in-game currency)
- USD (US Dollar)
- Toman (Iranian Rial)

**Features:**
- Currency conversion between Gold/USD/Toman (rule-based rates)
- Deposit methods: Credit card, Crypto wallet, Iranian bank card
- **Deposits are instant** (processed via payment gateway, no admin approval)
- **Withdrawals require admin approval**
- Transaction history and vault management

### Game & Service Management
- Dynamically add/remove/edit games
- Each game has unique services
- Service types: Mythic+ dungeons, Leveling, Raids, Delves, Custom boosts
- Flexible service configuration per game

## Architecture Principles
- Multi-role system with many-to-many user-role relationships
- Discord OAuth as primary authentication
- Team workspace with context switching
- Activity logging for collaborative work
- Flexible RBAC with granular permissions
- Multi-currency wallet system with conversion
- Admin approval workflow for roles and financial transactions

## Technology Stack
- **Backend**: Django (Python) with Django REST Framework
- **Frontend**: React (Vue.js under consideration)
- **Database**: PostgreSQL
- **Authentication**: Discord OAuth 2.0
- **Deployment**: Docker-based

## Current Status
Documentation phase - defining multi-role system, team workspace, and Discord OAuth integration
