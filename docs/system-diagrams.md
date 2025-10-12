# System Diagrams

## 1. Overall System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USERS                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Discord OAuth Login                                             │
│         ↓                                                        │
│  ┌──────────────┐         ┌──────────────────────────┐          │
│  │    Admin     │         │ Service Provider         │          │
│  │  Dashboard   │         │    Dashboard             │          │
│  │              │         │  (Role-Based Tabs)       │          │
│  │  - Games     │         │  ┌────────────────────┐  │          │
│  │  - Users     │         │  │ Advertiser Tab     │  │          │
│  │  - Roles     │         │  │ Team Advertiser Tab│  │          │
│  │  - Approvals │         │  │ Booster Tab        │  │          │
│  └──────┬───────┘         │  └────────────────────┘  │          │
│         │                 └──────────┬───────────────┘          │
│         │                            │                           │
│         └────────────────┬───────────┘                           │
│                          │                                       │
│                   ┌──────▼──────┐                                │
│                   │  API Gateway │                               │
│                   │  (Django)    │                               │
│                   └──────┬───────┘                               │
│                          │                                       │
│        ┌─────────────────┼─────────────────┐                    │
│        │                 │                 │                    │
│  ┌─────▼──────┐   ┌─────▼─────┐   ┌──────▼──────┐             │
│  │ PostgreSQL │   │   Redis   │   │   Celery    │             │
│  │  Database  │   │   Cache   │   │   Worker    │             │
│  └────────────┘   └───────────┘   └─────────────┘             │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Multi-Role System with Tab-Based Access

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER: john@example.com                        │
│                    Discord: JohnDoe#1234                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ROLES (Many-to-Many):                                           │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Booster    │  │  Advertiser  │  │    Admin     │          │
│  │  (active)    │  │  (pending)   │  │  (rejected)  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                   │
│  DASHBOARD ACCESS:                                               │
│                                                                   │
│  ✓ Service Provider Dashboard with tabs:                        │
│    ✓ Booster Tab (visible - has active role)                    │
│    ⏳ Advertiser Tab (hidden - pending approval)                 │
│                                                                   │
│  ✗ Admin Dashboard (no access - admin role rejected)            │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Role Request & Approval Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    ROLE REQUEST FLOW                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  USER                    SYSTEM                    ADMIN         │
│   │                        │                        │            │
│   │  Request Role          │                        │            │
│   ├───────────────────────▶│                        │            │
│   │                        │                        │            │
│   │                        │  Check requires_       │            │
│   │                        │  approval              │            │
│   │                        │                        │            │
│   │                        ├─ Auto-Approved? ───────┤            │
│   │                        │  (Client, Booster)     │            │
│   │  ✓ Role Active         │                        │            │
│   │◀───────────────────────┤                        │            │
│   │                        │                        │            │
│   │                        ├─ Needs Approval? ──────┤            │
│   │                        │  (Advertiser, etc)     │            │
│   │  ⏳ Pending Approval   │                        │            │
│   │◀───────────────────────┤                        │            │
│   │                        │                        │            │
│   │                        │  Notify Admin          │            │
│   │                        ├───────────────────────▶│            │
│   │                        │                        │            │
│   │                        │                        │  Review    │
│   │                        │                        │  Request   │
│   │                        │                        │            │
│   │                        │  Approve/Reject        │            │
│   │                        │◀───────────────────────┤            │
│   │                        │                        │            │
│   │  ✓ Approved / ✗ Rejected                       │            │
│   │◀───────────────────────┤                        │            │
│   │                        │                        │            │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Team Workspace Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    TEAM WORKSPACE SYSTEM                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  TEAM: "Elite Boosters"                                          │
│  Leader: John (Team Advertiser)                                  │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  TEAM MEMBERS                                             │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │  • John (Leader)                                          │   │
│  │  • Sarah (Member)                                         │   │
│  │  • Mike (Member)                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  TEAM SERVICES                                            │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │  Service 1: Mythic+20 (Created by John)                  │   │
│  │  Service 2: Leveling (Created by Sarah)                  │   │
│  │  Service 3: Raid Booking (Created by Mike)               │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  ACTIVITY LOG                                             │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │  10:00 - John created "Mythic+20"                        │   │
│  │  11:30 - Sarah updated price: 500G → 600G                │   │
│  │  14:00 - Mike created "Raid Booking"                     │   │
│  │  15:20 - John deactivated "Mythic+20"                    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  EARNINGS FLOW:                                                  │
│  All team service sales → John's Wallet (Team Leader)           │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Service Provider Dashboard with Role-Based Tabs

```
┌─────────────────────────────────────────────────────────────────┐
│              SERVICE PROVIDER DASHBOARD                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Top Navigation:                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ [Logo] Service Provider Dashboard      [Profile ▼]       │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │ Tabs: [Advertiser] [Team Advertiser] [Booster]          │   │
│  │       (Only visible tabs based on user's active roles)   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  ADVERTISER TAB (Active)                                 │    │
│  ├─────────────────────────────────────────────────────────┤    │
│  │                                                           │    │
│  │  Workspace Switcher: [Personal ▼] [Team: Elite Boosters]│    │
│  │                                                           │    │
│  │  PERSONAL WORKSPACE:                                     │    │
│  │  • My Services                                           │    │
│  │  • Service A (500G)                                      │    │
│  │  • Service B (1000G)                                     │    │
│  │  • Earnings: 5,000G → My Wallet                         │    │
│  │                                                           │    │
│  │  TEAM WORKSPACE:                                         │    │
│  │  • Team Services (collaborative)                         │    │
│  │  • Service X (600G) - Created by Sarah                   │    │
│  │  • Service Y (800G) - Created by Mike                    │    │
│  │  • Earnings: 10,000G → Team Leader's Wallet             │    │
│  │                                                           │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                   │
│  Click [Booster] tab to switch to booster features              │
│  Click [Team Advertiser] tab for team management                │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. Service Ownership Model

```
┌─────────────────────────────────────────────────────────────────┐
│                    SERVICE OWNERSHIP                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  PERSONAL SERVICE:                                               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Service: "Mythic+20 Boost"                               │   │
│  │ workspace_type: "personal"                               │   │
│  │ workspace_owner_id: 123 (John's user_id)                │   │
│  │ created_by: 123 (John)                                   │   │
│  │                                                           │   │
│  │ When sold:                                               │   │
│  │ Earnings → John's Wallet                                 │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  TEAM SERVICE:                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Service: "Raid Booking"                                  │   │
│  │ workspace_type: "team"                                   │   │
│  │ workspace_owner_id: 456 (Team ID)                       │   │
│  │ created_by: 789 (Sarah's user_id)                       │   │
│  │                                                           │   │
│  │ When sold:                                               │   │
│  │ Earnings → Team Leader's Wallet (John)                   │   │
│  │                                                           │   │
│  │ Activity Log:                                            │   │
│  │ • Sarah created service                                  │   │
│  │ • Mike updated price                                     │   │
│  │ • John activated service                                 │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. Database Relationships

```
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE SCHEMA                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────┐         ┌──────────┐         ┌──────────┐         │
│  │  users   │────────▶│user_roles│◀────────│  roles   │         │
│  └────┬─────┘         └──────────┘         └──────────┘         │
│       │                                                           │
│       │  discord_id (unique)                                     │
│       │                                                           │
│       │               ┌──────────┐                               │
│       └──────────────▶│  wallet  │                               │
│       │               └──────────┘                               │
│       │                                                           │
│       │               ┌──────────┐                               │
│       ├──────────────▶│  teams   │                               │
│       │               └────┬─────┘                               │
│       │                    │                                     │
│       │               ┌────▼──────┐                              │
│       └──────────────▶│team_members                             │
│                       └───────────┘                              │
│                                                                   │
│  ┌──────────┐         ┌──────────┐                               │
│  │ services │────────▶│  orders  │                               │
│  └────┬─────┘         └──────────┘                               │
│       │                                                           │
│       │  workspace_type                                          │
│       │  workspace_owner_id                                      │
│       │  created_by                                              │
│       │                                                           │
│       │               ┌──────────────────┐                       │
│       └──────────────▶│service_activity_ │                       │
│                       │      logs        │                       │
│                       └──────────────────┘                       │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. User Journey: From Registration to Team Collaboration

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER JOURNEY                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  DAY 1: Registration                                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 1. User clicks "Login with Discord"                      │   │
│  │ 2. Discord OAuth flow                                    │   │
│  │ 3. User created with discord_id                          │   │
│  │ 4. Auto-assigned "Client" role                           │   │
│  │ 5. Access: Client Dashboard                              │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  DAY 2: Becomes Booster                                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 1. User clicks "Become a Booster"                        │   │
│  │ 2. Auto-approved (no admin needed)                       │   │
│  │ 3. Access: Client Dashboard + Booster Dashboard          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  DAY 5: Requests Advertiser Role                                │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 1. User clicks "Become an Advertiser"                    │   │
│  │ 2. Request submitted (pending approval)                  │   │
│  │ 3. Admin notified                                        │   │
│  │ 4. Admin approves                                        │   │
│  │ 5. Access: Client + Booster + Advertiser Dashboards      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  DAY 10: Requests Team Advertiser Role                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 1. User requests "Team Advertiser" role                  │   │
│  │ 2. Admin approves                                        │   │
│  │ 3. User creates team "Elite Boosters"                    │   │
│  │ 4. "Team Workspace" button appears                       │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  DAY 12: Invites Team Members                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 1. User invites Sarah and Mike                           │   │
│  │ 2. They accept invitations                               │   │
│  │ 3. "Team Workspace" button appears for them too          │   │
│  │ 4. All can collaborate on team services                  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  DAY 15: Team Collaboration                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 1. User creates service in team workspace                │   │
│  │ 2. Sarah edits the service                               │   │
│  │ 3. Mike activates the service                            │   │
│  │ 4. Service sold → Earnings to team leader (User)         │   │
│  │ 5. Activity log shows all contributions                  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 9. API Request Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    API REQUEST FLOW                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  FRONTEND                  BACKEND                               │
│     │                        │                                   │
│     │  POST /api/services    │                                   │
│     │  {                     │                                   │
│     │    workspace_type: "team",                                │
│     │    workspace_id: 123,  │                                   │
│     │    title: "Mythic+20"  │                                   │
│     │  }                     │                                   │
│     ├───────────────────────▶│                                   │
│     │                        │                                   │
│     │                        │  1. Verify JWT token              │
│     │                        │  2. Get user from token           │
│     │                        │  3. Check user has 'advertiser'   │
│     │                        │     role (active)                 │
│     │                        │  4. Verify user is team member    │
│     │                        │     (if workspace_type='team')    │
│     │                        │  5. Create service                │
│     │                        │  6. Log activity                  │
│     │                        │                                   │
│     │  Response:             │                                   │
│     │  {                     │                                   │
│     │    id: 456,            │                                   │
│     │    title: "Mythic+20", │                                   │
│     │    workspace_type: "team"                                 │
│     │  }                     │                                   │
│     │◀───────────────────────┤                                   │
│     │                        │                                   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 10. Earnings Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    EARNINGS FLOW                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  PERSONAL SERVICE SALE:                                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Buyer purchases service (500G)                           │   │
│  │         ↓                                                 │   │
│  │ Buyer wallet: -500G                                      │   │
│  │         ↓                                                 │   │
│  │ Service creator wallet: +500G                            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  TEAM SERVICE SALE:                                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Buyer purchases team service (600G)                      │   │
│  │         ↓                                                 │   │
│  │ Buyer wallet: -600G                                      │   │
│  │         ↓                                                 │   │
│  │ Team leader wallet: +600G                                │   │
│  │         ↓                                                 │   │
│  │ (Not the service creator, but team leader)               │   │
│  │                                                           │   │
│  │ Activity log shows:                                      │   │
│  │ • Service created by: Sarah                              │   │
│  │ • Earnings went to: John (Team Leader)                   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

These diagrams provide a visual representation of the system architecture, workflows, and data flows. Refer to the detailed documentation for implementation specifics.
