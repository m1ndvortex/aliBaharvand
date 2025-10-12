# Quick Reference Guide

## 🎯 Core Concepts

### Authentication
- **Method**: Discord OAuth 2.0 (mandatory)
- **One Discord account** = One platform account
- **Stored**: discord_id, discord_username, discord_avatar

### Multi-Role System
- Users can have **multiple roles simultaneously**
- Example: User can be Client + Booster + Advertiser
- Roles stored in `user_roles` table (many-to-many)

### Role Types
| Role | Auto-Approved | Description |
|------|---------------|-------------|
| Client | ✅ Yes | Default for all users |
| Booster | ❌ No | Fulfill services |
| Advertiser | ❌ No | Create service listings |
| Team Advertiser | ❌ No | Advertiser + team management |
| Support | ❌ No | Customer support |
| Admin | ❌ No | Full system access |

**Note:** All roles except Client require admin approval or manual assignment.

### Team Workspace
- **Team Advertiser** creates team
- Invites members to join
- Context switching: **Personal ↔ Team**
- Team services → Earnings go to **team leader**
- **Activity logging** tracks who did what

---

## 📊 Dashboard Structure

```
3 Dashboards:
1. Admin Dashboard               - For Admin role ONLY
   - Game & user management
   - Role approvals
   - Financial approvals

2. Service Provider Dashboard    - For Booster, Advertiser, Team Advertiser
   - Role-based tabs:
     ├─ Advertiser Tab           (Advertiser role required)
     ├─ Team Advertiser Tab      (Team Advertiser role required)
     └─ Booster Tab              (Booster role required)
   
Users see only tabs they have access to based on their roles.
```

---

## 🗄️ Key Database Tables

### users
```sql
id, discord_id (unique), discord_username, discord_avatar,
email, status, created_at
```

### user_roles (Many-to-Many)
```sql
id, user_id, role_id, 
status (active/pending_approval/rejected),
approved_by, approved_at, requested_at
```

### teams
```sql
id, name, leader_id, description, is_active
```

### team_members
```sql
id, team_id, user_id, role (leader/member),
status (active/invited/left), invited_by, joined_at
```

### services
```sql
id, game_id, service_type_id,
workspace_type (personal/team),
workspace_owner_id (user_id or team_id),
created_by (user_id),
title, description, prices, status
```

### service_activity_logs
```sql
id, service_id, user_id, action, 
changes (JSONB), ip_address, created_at
```

### orders
```sql
id, service_id, buyer_id, booster_id,
earnings_recipient_id (who gets paid),
price_paid, currency_used, status
```

---

## 🔄 Common Workflows

### 1. User Registration
```
Discord OAuth → Create user → Auto-assign Client role → Login
```

### 2. Request Booster Role
```
Click "Request Booster Role" → Pending → Admin reviews → Approved/Rejected
```

### 3. Request Advertiser Role
```
Click "Request Advertiser Role" → Pending → Admin reviews → Approved/Rejected
```

### Alternative: Admin Manually Assigns Role
```
Admin selects user → Assigns role directly → User immediately has access
```

### 4. Create Team
```
Have team_advertiser role → Create team → Become leader → Invite members
```

### 5. Team Member Joins
```
Receive invitation → Accept → Team workspace button appears
```

### 6. Create Service in Team Workspace
```
Switch to team workspace → Create service → 
workspace_type='team', workspace_owner_id=team_id →
When sold: earnings → team leader wallet
```

### 7. Team Collaboration
```
Member A creates service → Member B edits price → Member C activates →
Activity log tracks all actions → All members see changes
```

---

## 🔐 Permission Checking

### Backend (Django)
```python
@require_role('advertiser')
def create_service(request):
    # Only users with active advertiser role can access
    pass
```

### Frontend (React)
```javascript
const { hasRole } = useAuth();

{hasRole('advertiser') && (
  <button>Create Service</button>
)}
```

---

## 🌐 Key API Endpoints

### Authentication
```
GET  /api/auth/discord/callback?code=CODE
POST /api/auth/refresh
GET  /api/auth/me
```

### Role Management
```
POST /api/roles/request
GET  /api/roles/my-roles
GET  /api/admin/role-requests/pending
POST /api/admin/role-requests/:id/approve
```

### Team Management
```
POST   /api/teams
GET    /api/teams/my-teams
POST   /api/teams/:id/invite
POST   /api/team-members/:id/accept
DELETE /api/teams/:id/members/:memberId
```

### Service Management
```
GET  /api/services?workspace_type=team&workspace_id=123
POST /api/services (with workspace context)
PUT  /api/services/:id
GET  /api/services/:id/activity-log
```

---

## 💰 Earnings Flow

### Personal Service
```
Service sold → Earnings → Service creator's wallet
```

### Team Service
```
Service sold → Earnings → Team leader's wallet
(Not the creator, but the team leader)
```

---

## 📝 Activity Logging

### What Gets Logged
- Service created
- Service updated (price, description, etc.)
- Service activated/deactivated
- Service deleted
- Raid booked

### Log Structure
```json
{
  "service_id": 123,
  "user_id": 456,
  "action": "updated_price",
  "changes": {
    "field": "price_gold",
    "old_value": 500,
    "new_value": 600
  },
  "ip_address": "192.168.1.1",
  "created_at": "2025-01-15T10:30:00Z"
}
```

---

## 🎨 Frontend Context

### AuthContext
```javascript
{
  user: { id, email, discord_username, roles: [...] },
  hasRole: (roleName) => boolean,
  hasAnyRole: (roleNames) => boolean
}
```

### WorkspaceContext
```javascript
{
  workspace: { 
    type: 'personal' | 'team',
    id: number,  // user_id or team_id
    name: string // team name if team
  },
  switchToPersonal: (userId) => void,
  switchToTeam: (teamId, teamName) => void
}
```

---

## 🔧 Tech Stack

### Backend
- Django (Python)
- Django REST Framework
- PostgreSQL
- Redis
- Celery

### Frontend
- React (or Vue.js)
- Redux / Context API
- Axios
- React Router

### DevOps
- Docker
- Docker Compose
- Nginx
- Gunicorn

---

## 📋 Implementation Checklist

### Phase 1: Core
- [ ] Discord OAuth integration
- [ ] User model with discord_id
- [ ] Multi-role system (user_roles table)
- [ ] Role request and approval flow
- [ ] Dashboard selector

### Phase 2: Dashboards
- [ ] Client Dashboard
- [ ] Admin Dashboard
- [ ] Advertiser Dashboard
- [ ] Booster Dashboard

### Phase 3: Team Workspace
- [ ] Team creation and management
- [ ] Team member invitation
- [ ] Workspace context switching
- [ ] Team service creation
- [ ] Activity logging

### Phase 4: Advanced
- [ ] Wallet system
- [ ] Transaction approvals
- [ ] Currency conversion
- [ ] Payment methods
- [ ] Order tracking

---

## 🚨 Important Notes

### Role Assignment
- Client and Booster: **Auto-approved**
- Others: **Require admin approval**

### Service Ownership
- Personal: `workspace_type='personal'`, `workspace_owner_id=user_id`
- Team: `workspace_type='team'`, `workspace_owner_id=team_id`

### Earnings
- Personal service → Creator gets paid
- Team service → **Team leader** gets paid (not creator)

### Activity Logging
- **Critical for team workspace**
- Tracks who did what and when
- Provides accountability

### Permission Checking
- **Always verify on backend**
- Never trust frontend
- Check role status is 'active'

---

## 🔗 Quick Links

- [Full Implementation Summary](./IMPLEMENTATION-SUMMARY.md)
- [System Diagrams](./system-diagrams.md)
- [Discord OAuth Guide](./authentication.md)
- [Multi-Role System](./multi-role-system.md)
- [Team Workspace](./team-workspace.md)
- [Database Schema](./data-models.md)

---

## 💡 Common Questions

### Q: Can a user be both Advertiser and Booster?
**A:** Yes! Users can have multiple roles simultaneously.

### Q: Who gets paid for team services?
**A:** The team leader, not the person who created the service.

### Q: How do we track who did what in a team?
**A:** Activity logs record every action with user_id, timestamp, and changes.

### Q: Can advertisers create raids?
**A:** No, only admins can create raids. Advertisers can only book buyers for existing raids.

### Q: What happens when a team member leaves?
**A:** Their status changes to 'left', they lose access to team workspace, but their activity logs remain.

### Q: Can a user be in multiple teams?
**A:** Yes, the database supports it (team_members table allows multiple team_id per user_id).

### Q: How do we prevent unauthorized access?
**A:** Backend verifies role status and team membership on every API request.

---

This quick reference provides the essential information you need. For detailed implementation, refer to the full documentation.
