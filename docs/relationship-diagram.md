# System Relationships and Interactions

## Client-Admin Relationship

### How They Work Together

```
┌──────────────────────────────────────────────────────────────┐
│                        Web Application                        │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  CLIENT SIDE                          ADMIN SIDE              │
│  ┌─────────────────┐                 ┌─────────────────┐     │
│  │ Client Dashboard│                 │ Admin Dashboard │     │
│  ├─────────────────┤                 ├─────────────────┤     │
│  │ • View data     │                 │ • Manage users  │     │
│  │ • Update profile│                 │ • View all data │     │
│  │ • (Features)    │                 │ • System config │     │
│  └────────┬────────┘                 └────────┬────────┘     │
│           │                                   │               │
│           │         ┌─────────────┐          │               │
│           └────────▶│ API Gateway │◀─────────┘               │
│                     │ + Auth      │                           │
│                     └──────┬──────┘                           │
│                            │                                  │
│                     ┌──────▼──────┐                           │
│                     │  Services   │                           │
│                     └──────┬──────┘                           │
│                            │                                  │
│                     ┌──────▼──────┐                           │
│                     │  Database   │                           │
│                     │             │                           │
│                     │ • Users     │                           │
│                     │ • Roles     │                           │
│                     │ • (Data)    │                           │
│                     └─────────────┘                           │
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

## Key Interactions

### 1. User Management
**Admin creates/manages → Client accounts**
- Admin creates new client accounts
- Admin can view all client data
- Admin can modify client permissions
- Admin can deactivate/activate clients

### 2. Data Access
**Shared database, different permissions**
- Clients: Read/Write own data only
- Admins: Read/Write all data

### 3. Authentication
**Same system, different roles**
- Both use same login endpoint
- Role determines dashboard redirect
- Role determines API permissions

## Workflow Examples

### Example 1: Admin Creates New Client
```
1. Admin logs in → Admin Dashboard
2. Admin navigates to User Management
3. Admin creates new client account
4. System sends invitation email to client
5. Client receives credentials
6. Client logs in → Client Dashboard
```

### Example 2: Client Updates Profile
```
1. Client logs in → Client Dashboard
2. Client updates profile information
3. API validates client can only update own data
4. Database updated
5. Admin can view the change in Admin Dashboard
```

### Example 3: Admin Views Analytics
```
1. Admin logs in → Admin Dashboard
2. Admin views analytics/reports
3. System aggregates data from all clients
4. Admin sees comprehensive overview
5. Clients cannot access this aggregated view
```

## Data Isolation

### Client Perspective
- Sees only their own data
- Cannot query other clients' information
- Limited to specific features

### Admin Perspective
- Sees all clients' data
- Can filter/search across all users
- Access to system-wide features

## Communication Patterns

### Client → Admin
- (To be defined: support tickets, requests, etc.)

### Admin → Client
- (To be defined: notifications, announcements, etc.)
