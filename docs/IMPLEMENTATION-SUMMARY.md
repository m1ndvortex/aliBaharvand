# Implementation Summary

## Overview
This document summarizes the key architectural decisions and implementation details for the gaming services marketplace platform.

---

## 1. Dashboard Architecture

### Decision: **2 Dashboards**

```
1. Admin Dashboard               - For Admin role ONLY
   - Game management
   - User management
   - Role approvals
   - Financial approvals
   - System settings

2. Service Provider Dashboard    - For Booster, Advertiser, Team Advertiser
   ├─ Advertiser Tab             (Advertiser role)
   ├─ Team Advertiser Tab        (Team Advertiser role)
   └─ Booster Tab                (Booster role)
```

**Rationale:**
- **Admin Dashboard separate**: Completely different features (system management, approvals)
- **Service Provider Dashboard unified**: Advertiser, Team Advertiser, and Booster share similar workflows
- Single codebase for service providers (easier maintenance)
- Role-based tab visibility (RBAC implementation)
- Shared components (orders, profile, notifications)
- Consistent UI/UX across service provider roles
- Users with multiple service provider roles see multiple tabs
- Clear separation between admin and service provider functions

---

## 2. Authentication System

### Discord OAuth 2.0 (Mandatory)

**Key Points:**
- All users MUST authenticate with Discord
- One Discord account = One platform account
- No traditional email/password registration
- Store: `discord_id`, `discord_username`, `discord_avatar`

**Benefits:**
- No password management
- Instant verification
- Community integration
- Prevents multiple accounts

**Implementation:**
```
User clicks "Login with Discord"
  ↓
Discord OAuth flow
  ↓
Backend receives authorization code
  ↓
Exchange code for access token
  ↓
Fetch user info from Discord
  ↓
Create/update user in database
  ↓
Generate JWT token
  ↓
User logged in
```

---

## 3. Multi-Role System

### Users Can Have Multiple Roles Simultaneously

**Database Structure:**
```sql
users (id, discord_id, email, ...)
roles (id, name, requires_approval, ...)
user_roles (user_id, role_id, status, approved_by, ...)
```

**Role Types:**

#### Auto-Approved (Immediate Access)
- **Client** - Default for all new users

#### Admin-Approved (Requires Approval or Manual Assignment)
- **Booster** - Can fulfill services
- **Advertiser** - Create service listings
- **Team Advertiser** - Advertiser + team management
- **Support** - Customer support
- **Admin** - Full system access

**Admin Can:**
- Approve/reject role requests
- Manually assign roles to users directly

**Example Scenario:**
```
User: john@example.com
Roles: [Client (active), Booster (active), Advertiser (pending_approval)]

Dashboard Access:
- Client Dashboard (always accessible)
- Platform Dashboard with tabs:
  ✓ Booster Tab (visible - has active role)
  ⏳ Advertiser Tab (hidden - pending approval)
```

**User Experience:**
- Users see Client Dashboard and Platform Dashboard
- Platform Dashboard shows only tabs for active roles
- Tabs appear/disappear based on role status
- No dashboard switching needed - just tab navigation

---

## 4. Team Workspace System

### Collaborative Service Management

**Key Concepts:**
- Team Advertiser creates team
- Invites members to join
- Team workspace button appears for all team members
- Context switching: Personal ↔ Team

**Workspace Context:**
```javascript
{
  type: 'personal',  // or 'team'
  id: 123,           // user_id or team_id
  name: 'Team Name'  // if team
}
```

**Service Ownership:**
```sql
services (
  workspace_type,      -- 'personal' or 'team'
  workspace_owner_id,  -- user_id or team_id
  created_by           -- who actually created it
)
```

**Earnings Flow:**
- Personal service → Creator's wallet
- Team service → Team leader's wallet

**Activity Logging:**
```sql
service_activity_logs (
  service_id,
  user_id,      -- who did it
  action,       -- what they did
  changes,      -- what changed
  created_at
)
```

**Features:**
- All team members can view/edit team services
- Activity log tracks who did what
- Real-time collaboration
- Team leader receives all earnings
- Contribution tracking per member

---

## 5. Database Schema Highlights

### Core Tables

**users**
```sql
id, discord_id (unique), discord_username, discord_avatar,
email, status, created_at
```

**roles**
```sql
id, name, display_name, requires_approval, is_system_role
```

**user_roles** (Many-to-Many)
```sql
id, user_id, role_id, status (active/pending_approval/rejected),
approved_by, approved_at, requested_at, rejection_reason
```

**teams**
```sql
id, name, leader_id, description, is_active, created_at
```

**team_members**
```sql
id, team_id, user_id, role (leader/member), status (active/invited/left),
invited_by, joined_at
```

**services**
```sql
id, game_id, service_type_id,
workspace_type (personal/team),
workspace_owner_id (user_id or team_id),
created_by (user_id),
title, description, prices, status, created_at
```

**service_activity_logs**
```sql
id, service_id, user_id, action, changes (JSONB),
ip_address, created_at
```

**orders**
```sql
id, service_id, buyer_id, booster_id,
earnings_recipient_id (who gets paid),
price_paid, currency_used, status, created_at
```

---

## 6. Key Workflows

### Workflow 1: New User Registration

```
1. User clicks "Login with Discord"
2. Discord OAuth flow
3. User authorizes application
4. Backend creates user with discord_id
5. Auto-assign 'client' role (status: active)
6. User logged in → Client Dashboard
```

### Workflow 2: User Requests Booster Role

```
1. User (client) clicks "Request Booster Role"
2. Backend checks: booster.requires_approval = TRUE
3. Create UserRole (status: pending_approval)
4. Notify admins
5. Admin reviews in Admin Dashboard
6. Admin approves/rejects
7. If approved: Booster tab appears in Platform Dashboard
```

### Workflow 2b: Admin Manually Assigns Booster Role

```
1. Admin goes to User Management
2. Admin selects user
3. Admin clicks "Assign Role" → Selects "Booster"
4. UserRole created (status: active)
5. User immediately has booster access
6. Booster tab appears in Platform Dashboard
```

### Workflow 3: User Requests Advertiser Role

```
1. User clicks "Request Advertiser Role"
2. Backend checks: advertiser.requires_approval = TRUE
3. Create UserRole (status: pending_approval)
4. Notify admins
5. Admin reviews in Admin Dashboard
6. Admin approves/rejects
7. User notified
8. If approved: Advertiser tab appears in Platform Dashboard
```

### Workflow 4: Team Advertiser Creates Team

```
1. User has team_advertiser role
2. User creates team (name, description)
3. User becomes team leader
4. "Team Workspace" button appears
5. User can invite members
```

### Workflow 5: Team Member Invited

```
1. Team leader invites user
2. User receives notification
3. User accepts invitation
4. TeamMember created (status: active)
5. "Team Workspace" button appears for user
6. User can switch to team workspace
```

### Workflow 6: Creating Service in Team Workspace

```
1. User switches to team workspace
2. User creates service
3. Service saved with:
   - workspace_type: 'team'
   - workspace_owner_id: team_id
   - created_by: user_id
4. Activity log records creation
5. All team members can see service
6. When sold: earnings → team leader wallet
```

### Workflow 7: Team Member Edits Service

```
1. Team member views team services
2. Team member edits service (e.g., changes price)
3. Service updated
4. Activity log records:
   - user_id: who edited
   - action: 'updated_price'
   - changes: {old: 500, new: 600}
5. All team members see updated service
6. Activity log shows who made the change
```

---

## 7. API Structure

### Authentication
```
GET  /api/auth/discord/callback?code=CODE
POST /api/auth/refresh
POST /api/auth/logout
GET  /api/auth/me
```

### Role Management
```
POST /api/roles/request
GET  /api/roles/my-roles
GET  /api/admin/role-requests/pending
POST /api/admin/role-requests/:id/approve
POST /api/admin/role-requests/:id/reject
```

### Team Management
```
POST   /api/teams
GET    /api/teams/my-teams
POST   /api/teams/:id/invite
POST   /api/team-members/:id/accept
DELETE /api/teams/:id/members/:memberId
GET    /api/teams/:id/earnings
```

### Service Management
```
GET  /api/services?workspace_type=team&workspace_id=123
POST /api/services (with workspace context)
PUT  /api/services/:id
GET  /api/services/:id/activity-log
```

---

## 8. Frontend Architecture

### Context Providers

**AuthContext**
```javascript
{
  user: { id, email, discord_username, roles: [...] },
  hasRole: (roleName) => boolean,
  hasAnyRole: (roleNames) => boolean
}
```

**WorkspaceContext**
```javascript
{
  workspace: { type, id, name },
  switchToPersonal: (userId) => void,
  switchToTeam: (teamId, teamName) => void
}
```

### Key Components

**DashboardSelector**
- Shows available dashboards based on user roles
- Redirects to selected dashboard

**WorkspaceSwitcher**
- Shows "Personal" and "Team" workspace buttons
- Only visible if user is in a team
- Switches workspace context

**WorkspaceIndicator**
- Banner showing current workspace
- "Team Workspace: [Name]" with info

**ServiceList**
- Fetches services based on workspace context
- Shows activity log for team services

**ActivityLog**
- Displays who did what and when
- Shows changes made to services

---

## 9. Security Considerations

### Authentication
- Discord OAuth 2.0 (industry standard)
- JWT tokens (15 min expiry)
- Refresh tokens (7 day expiry)
- HTTPS only in production

### Authorization
- Role verification on every API request
- Backend never trusts frontend
- Decorators for consistent permission checking
- Team membership verified before access

### Data Protection
- Payment details encrypted
- Activity logs for audit trail
- IP address tracking
- Admin approval for sensitive operations

---

## 10. Technology Stack

### Backend
- **Framework**: Django (Python)
- **API**: Django REST Framework
- **Authentication**: djangorestframework-simplejwt
- **Database**: PostgreSQL
- **Task Queue**: Celery (for async tasks)
- **Caching**: Redis

### Frontend
- **Framework**: React (Vue.js under consideration)
- **State Management**: Redux / Context API
- **HTTP Client**: Axios
- **Routing**: React Router

### DevOps
- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **Web Server**: Nginx
- **WSGI Server**: Gunicorn

---

## 11. Implementation Priority

### Phase 1: Core Authentication & Roles
1. Discord OAuth integration
2. User model with discord_id
3. Multi-role system (user_roles table)
4. Role request and approval flow
5. Dashboard selector

### Phase 2: Basic Dashboards
1. Client Dashboard (service browsing, wallet)
2. Admin Dashboard (user management, role approvals)
3. Advertiser Dashboard (service creation)
4. Booster Dashboard (order management)

### Phase 3: Team Workspace
1. Team creation and management
2. Team member invitation
3. Workspace context switching
4. Team service creation
5. Activity logging

### Phase 4: Advanced Features
1. Wallet system (multi-currency)
2. Transaction approvals
3. Currency conversion
4. Payment methods
5. Order tracking

### Phase 5: Polish & Optimization
1. Real-time notifications
2. Analytics and reporting
3. Performance optimization
4. Mobile responsiveness
5. Testing and bug fixes

---

## 12. Key Decisions Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Authentication | Discord OAuth (mandatory) | No password management, community integration |
| Role System | Many-to-many (multiple roles per user) | Users can be both Advertiser and Booster |
| Role Approval | Auto (Client only) / Admin approval (all others) | Quality control, admin can manually assign |
| Dashboards | 2 dashboards (Client + Platform with tabs) | Unified codebase, role-based tab visibility |
| Tab Navigation | Role-based tabs in Platform Dashboard | No dashboard switching, seamless UX |
| Team Workspace | Context switching (Personal ↔ Team) | Within Advertiser/Team Advertiser tabs |
| Service Ownership | workspace_type + workspace_owner_id | Flexible ownership (personal or team) |
| Earnings | Team services → Team leader wallet | Centralized earnings management |
| Activity Logging | All changes logged with user_id | Accountability in collaborative environment |
| Database | PostgreSQL | Relational data, JSONB for flexibility |
| Backend | Django | Rapid development, robust ecosystem |

---

## 13. Next Steps

1. **Review Documentation**: Ensure all stakeholders understand the architecture
2. **Set Up Development Environment**: Docker, PostgreSQL, Django, React
3. **Create Discord Application**: Get OAuth credentials
4. **Database Schema**: Create migrations for all tables
5. **Implement Authentication**: Discord OAuth flow
6. **Build Core Models**: User, Role, UserRole, Team, Service
7. **Develop APIs**: Authentication, role management, team management
8. **Build Dashboards**: Start with dashboard selector and basic views
9. **Implement Team Workspace**: Context switching and activity logging
10. **Testing**: Unit tests, integration tests, end-to-end tests

---

## Questions or Clarifications?

If you need any clarification on:
- Database schema
- API endpoints
- Frontend architecture
- Workflow details
- Implementation approach

Please refer to the detailed documentation files or ask for specific examples.
