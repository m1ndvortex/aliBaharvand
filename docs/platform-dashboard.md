# Platform Dashboard Specification

## Overview
Service Provider Dashboard for Booster, Advertiser, and Team Advertiser roles with role-based tab navigation. Users see only tabs they have permission to access based on their active roles.

**Note:** Admin has a separate Admin Dashboard with completely different features.

---

## Dashboard Structure

### Top Navigation
```
┌─────────────────────────────────────────────────────────────┐
│ [Logo] [Service Provider Dashboard]            [Profile ▼]  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ Tabs (visible based on user roles):                         │
│ [Advertiser] [Team Advertiser] [Booster]                    │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Tab Visibility Rules
- **Advertiser Tab**: Visible only if user has `advertiser` role (active)
- **Team Advertiser Tab**: Visible only if user has `team_advertiser` role (active)
- **Booster Tab**: Visible only if user has `booster` role (active)

### Example Scenarios

**User with Booster role only:**
```
Visible tabs: [Booster]
```

**User with Booster + Advertiser roles:**
```
Visible tabs: [Advertiser] [Booster]
```

**User with all service provider roles:**
```
Visible tabs: [Advertiser] [Team Advertiser] [Booster]
```

**User with Admin role:**
```
Goes to Admin Dashboard (separate dashboard, not tabs)
```

---



## Advertiser Tab

### Features
- Create & manage service listings
- Book buyers for raids (cannot create raids)
- View orders for own services
- View earnings
- Manage profile

### Pages
1. **Dashboard Home**
   - Earnings summary
   - Active services count
   - Recent orders

2. **My Services**
   - List of personal services
   - Create new service
   - Edit/Delete services
   - Service analytics

3. **Raid Booking**
   - View available raids (admin-created)
   - Book buyers for raid slots
   - Manage raid bookings

4. **My Orders**
   - Orders for advertiser's services
   - Order details
   - Assign boosters (if applicable)

5. **Earnings**
   - Total earnings by currency
   - Earnings history
   - Payout requests

---

## Team Advertiser Tab

### All Advertiser Features +

### Additional Features
- Create and manage team
- Invite team members
- Team workspace switcher
- View team performance

### Pages
1. **All Advertiser pages**

2. **Team Management**
   - Team information
   - Team members list
   - Invite members
   - Remove members

3. **Team Workspace**
   - Workspace switcher: [Personal] [Team]
   - Team services (collaborative)
   - Team orders
   - Team earnings
   - Activity log

---

## Booster Tab

### Features
- View assigned orders
- Update order progress
- Mark orders complete
- View earnings
- Basic profile management

### Pages
1. **Dashboard Home**
   - Assigned orders count
   - Earnings summary
   - Completion rate

2. **Assigned Orders**
   - List of orders assigned to booster
   - Order details
   - Update progress
   - Mark complete

3. **My Earnings**
   - Total earnings
   - Earnings history
   - Pending payments

4. **Profile**
   - Update personal information
   - Change password
   - Notification preferences

---



## Role Request Interface

### For Users (Non-Admin)

**Request Role Button:**
```jsx
function RoleRequestSection() {
  const user = useUser();
  const availableRoles = ['booster', 'advertiser', 'team_advertiser'];
  
  return (
    <div className="role-request-section">
      <h3>Request Additional Roles</h3>
      
      {availableRoles.map(role => {
        const hasRole = user.roles.some(r => r.name === role && r.status === 'active');
        const hasPending = user.roles.some(r => r.name === role && r.status === 'pending_approval');
        
        if (hasRole) {
          return (
            <div key={role} className="role-card">
              <h4>{roleDisplayName(role)}</h4>
              <span className="badge-active">✓ Active</span>
            </div>
          );
        }
        
        if (hasPending) {
          return (
            <div key={role} className="role-card">
              <h4>{roleDisplayName(role)}</h4>
              <span className="badge-pending">⏳ Pending Approval</span>
            </div>
          );
        }
        
        return (
          <div key={role} className="role-card">
            <h4>{roleDisplayName(role)}</h4>
            <p>{roleDescription(role)}</p>
            <button onClick={() => requestRole(role)}>
              Request Role
            </button>
          </div>
        );
      })}
    </div>
  );
}
```

---

## Admin Role Management Interface

### Pending Role Requests

```jsx
function PendingRoleRequests() {
  const [requests, setRequests] = useState([]);
  
  return (
    <div className="pending-requests">
      <h2>Pending Role Requests</h2>
      
      <table>
        <thead>
          <tr>
            <th>User</th>
            <th>Discord</th>
            <th>Current Roles</th>
            <th>Requested Role</th>
            <th>Requested At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.map(req => (
            <tr key={req.id}>
              <td>{req.user.email}</td>
              <td>{req.user.discord_username}</td>
              <td>
                {req.user.active_roles.map(r => (
                  <span key={r.id} className="role-badge">{r.display_name}</span>
                ))}
              </td>
              <td><strong>{req.role.display_name}</strong></td>
              <td>{formatDate(req.requested_at)}</td>
              <td>
                <button onClick={() => handleApprove(req.id)}>
                  ✓ Approve
                </button>
                <button onClick={() => handleReject(req.id)}>
                  ✗ Reject
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### Manual Role Assignment

```jsx
function ManualRoleAssignment({ userId }) {
  const [selectedRole, setSelectedRole] = useState('');
  const availableRoles = ['booster', 'advertiser', 'team_advertiser', 'support', 'admin'];
  
  const handleAssign = async () => {
    await fetch(`/api/admin/users/${userId}/assign-role`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: selectedRole })
    });
    
    alert('Role assigned successfully');
  };
  
  return (
    <div className="manual-role-assignment">
      <h3>Manually Assign Role</h3>
      
      <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
        <option value="">Select Role</option>
        {availableRoles.map(role => (
          <option key={role} value={role}>{roleDisplayName(role)}</option>
        ))}
      </select>
      
      <button onClick={handleAssign} disabled={!selectedRole}>
        Assign Role
      </button>
      
      <p className="note">
        This will immediately grant the user access to the role without requiring approval.
      </p>
    </div>
  );
}
```

---

## Tab Navigation Implementation

### Frontend Implementation

```jsx
function ServiceProviderDashboard() {
  const user = useUser();
  const [activeTab, setActiveTab] = useState(null);
  
  // Determine available tabs based on user roles
  const availableTabs = [];
  
  if (user.hasRole('advertiser')) {
    availableTabs.push({ name: 'advertiser', label: 'Advertiser', icon: '📊' });
  }
  if (user.hasRole('team_advertiser')) {
    availableTabs.push({ name: 'team_advertiser', label: 'Team Advertiser', icon: '👥' });
  }
  if (user.hasRole('booster')) {
    availableTabs.push({ name: 'booster', label: 'Booster', icon: '🎮' });
  }
  
  // Set default active tab
  useEffect(() => {
    if (!activeTab && availableTabs.length > 0) {
      setActiveTab(availableTabs[0].name);
    }
  }, [availableTabs]);
  
  if (availableTabs.length === 0) {
    return (
      <div className="no-access">
        <h2>No Service Provider Access</h2>
        <p>You don't have any service provider roles yet.</p>
        <RoleRequestSection />
      </div>
    );
  }
  
  return (
    <div className="service-provider-dashboard">
      <nav className="tab-navigation">
        {availableTabs.map(tab => (
          <button
            key={tab.name}
            className={activeTab === tab.name ? 'active' : ''}
            onClick={() => setActiveTab(tab.name)}
          >
            <span className="icon">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>
      
      <div className="tab-content">
        {activeTab === 'advertiser' && <AdvertiserTabContent />}
        {activeTab === 'team_advertiser' && <TeamAdvertiserTabContent />}
        {activeTab === 'booster' && <BoosterTabContent />}
      </div>
    </div>
  );
}
```

---

## API Endpoints

### Role Management
```
POST /api/roles/request                        - Request a role
GET  /api/roles/my-roles                       - Get user's roles and statuses
GET  /api/admin/role-requests/pending          - Get pending role requests
POST /api/admin/role-requests/:id/approve      - Approve role request
POST /api/admin/role-requests/:id/reject       - Reject role request
POST /api/admin/users/:id/assign-role          - Manually assign role
DELETE /api/admin/users/:id/roles/:roleId      - Revoke role
```

---

## Summary

### Key Features
- ✅ Unified dashboard for service provider roles (Booster, Advertiser, Team Advertiser)
- ✅ Role-based tab visibility (RBAC)
- ✅ Users request roles → Admin approves/rejects
- ✅ Admin can manually assign roles
- ✅ Tabs appear/disappear based on role status
- ✅ Shared components across tabs
- ✅ Consistent UI/UX

### Benefits
- Easier maintenance (shared codebase for service providers)
- Better user experience (no dashboard switching between service provider roles)
- Flexible role management
- Clear separation from admin functions
