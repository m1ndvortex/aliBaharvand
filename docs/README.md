# Gaming Services Marketplace - Documentation

## Overview
Complete documentation for a gaming services marketplace platform (similar to G2G.com) where users can buy and sell game boosting services across multiple games.

## Business Model
- Multi-game platform supporting various games (World of Warcraft, etc.)
- Services: Mythic+ dungeons, leveling, raids, delves, custom boosts
- Multi-currency wallet system (Gold, USD, Toman)
- Role-based access control with flexible permissions

## Documentation Structure

### Core Documentation
- **[requirements.md](./requirements.md)** - Detailed functional and non-functional requirements, user stories
- **[architecture.md](./architecture.md)** - System architecture, technology stack, deployment
- **[data-models.md](./data-models.md)** - Complete database schema and entity relationships

### Dashboard Specifications
- **[admin-dashboard.md](./admin-dashboard.md)** - Admin Dashboard (separate, for Admin role only)
- **[platform-dashboard.md](./platform-dashboard.md)** - Service Provider Dashboard with role-based tabs (Booster, Advertiser, Team Advertiser)

### System Features
- **[authentication.md](./authentication.md)** - Discord OAuth 2.0 authentication system
- **[multi-role-system.md](./multi-role-system.md)** - Users with multiple roles, approval flows
- **[team-workspace.md](./team-workspace.md)** - Team collaboration, context switching, activity logging
- **[rbac-specification.md](./rbac-specification.md)** - Role-based access control with flexible permissions
- **[wallet-system.md](./wallet-system.md)** - Multi-currency wallet, deposits, withdrawals, conversions
- **[api-specification.md](./api-specification.md)** - API endpoints and contracts
- **[security.md](./security.md)** - Security considerations and authentication flow
- **[relationship-diagram.md](./relationship-diagram.md)** - How different components interact
- **[system-diagrams.md](./system-diagrams.md)** - Visual diagrams of architecture and workflows

## Quick Start

### 🚀 Start Here
1. **[QUICK REFERENCE](./QUICK-REFERENCE.md)** - Essential info at a glance
2. **[IMPLEMENTATION SUMMARY](./IMPLEMENTATION-SUMMARY.md)** - Complete overview of all architectural decisions
3. **[SYSTEM DIAGRAMS](./system-diagrams.md)** - Visual representation of architecture and workflows

### For Developers
1. Read [Quick Reference](./QUICK-REFERENCE.md)
2. Review [Implementation Summary](./IMPLEMENTATION-SUMMARY.md)
3. Check [System Diagrams](./system-diagrams.md)
4. Review [Architecture Overview](./architecture.md)
5. Check [Data Models](./data-models.md)
6. Review [API Specification](./api-specification.md)

### For Product/Business
1. Read [Quick Reference](./QUICK-REFERENCE.md)
2. Review [Implementation Summary](./IMPLEMENTATION-SUMMARY.md)
3. Check [System Diagrams](./system-diagrams.md)
4. Review [Requirements](./requirements.md)
5. Check [Client Dashboard](./client-dashboard.md)
6. Check [Admin Dashboard](./admin-dashboard.md)

### For Understanding Authentication
1. Read [Discord OAuth Authentication](./authentication.md)

### For Understanding Multi-Role System
1. Read [Multi-Role System](./multi-role-system.md)

### For Understanding Team Workspace
1. Read [Team Workspace](./team-workspace.md)

### For Understanding Permissions
1. Read [RBAC Specification](./rbac-specification.md)

### For Understanding Wallet System
1. Read [Wallet System](./wallet-system.md)

## Technology Stack
- **Backend:** Django (Python)
- **Frontend:** React (Vue.js under consideration)
- **Database:** PostgreSQL
- **Deployment:** Docker-based

## Key Features
- **Discord OAuth Authentication**: Mandatory Discord login for all users
- **Multi-Role System**: Users can have multiple roles simultaneously (e.g., Advertiser + Booster)
- **Team Workspace**: Collaborative service management with activity logging
- **Dynamic Game Management**: Add/remove games and services dynamically
- **Flexible RBAC**: Role-based permissions with custom overrides
- **Multi-Currency Wallet**: Gold, USD, Toman with conversions
- **Admin Approval Workflows**: Role requests and financial transactions
- **Activity Logging**: Track all changes in team workspace
