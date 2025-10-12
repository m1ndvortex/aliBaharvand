# Multi-Role System

## Overview
Users can have **multiple roles simultaneously**. For example, a user can be both an Advertiser and a Booster at the same time.

---

## Role Types

### Auto-Approved Roles
- **Client** - Default role for all new users (auto-assigned on registration)

### Admin-Approved Roles
Users must request these roles and wait for admin approval, OR admin can manually assign them:
- **Booster** - Can fulfill service orders
- **Advertiser** - Can create and manage service listings
- **Team Advertiser** - Advertiser with team management capabilities
- **Support** - Customer support access
- **Admin** - Full system access

**Admin Options:**
1. **Approve/Reject Requests**: Users request roles, admin reviews and approves/rejects
2. **Manual Assignment**: Admin directly assigns roles to users without request

---

## Database Structure

### Many-to-Many Relationship
```sql
-- Users can have multiple roles
CREATE TABLE user_roles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    role_id INTEGER REFERENCES roles(id),
    status VARCHAR(20), -- 'active', 'pending_approval', 'rejected'
    approved_by INTEGER REFERENCES users(id) NULL,
    approved_at TIMESTAMP NULL,
    requested_at TIMESTAMP DEFAULT NOW(),
    rejection_reason TEXT NULL,
    UNIQUE(user_id, role_id)
);
```


## Role Request Flow

### Flow 1: Request Role (All Roles Except Client)

**User Journey:**
```
1. User logged in as Client
2. Clicks "Request [Role Name]" (e.g., "Request Booster Role")
3. System checks: role.requires_approval = TRUE
4. UserRole created with status='pending_approval'
5. Admin notified
6. User sees "Request pending" status
7. Admin approves/rejects
8. If approved: User gets access to role tab
```

**Backend Implementation:**
```python
@api_view(['POST'])
def request_role(request):
    user = request.user
    role_name = request.data.get('role')
    
    role = Role.objects.get(name=role_name)
    
    # Check if already has role
    existing = UserRole.objects.filter(
        user=user,
        role=role
    ).first()
    
    if existing and existing.status == 'active':
        return Response({'error': 'Already has this role'}, status=400)
    
    if existing and existing.status == 'pending_approval':
        return Response({'error': 'Request already pending'}, status=400)
    
    # All roles except client require approval
    if role.name != 'client':
        # Create pending request
        user_role = UserRole.objects.create(
            user=user,
            role=role,
            status='pending_approval'
        )
        notify_admins_new_role_request(user, role)
        return Response({
            'message': 'Request submitted. Awaiting admin approval.',
            'status': 'pending'
        })
    else:
        return Response({'error': 'Client role is auto-assigned'}, status=400)
```

### Flow 2: Admin Manually Assigns Role

**Admin Journey:**
```
1. Admin goes to User Management
2. Admin searches for user
3. Admin clicks "Manage Roles"
4. Admin selects role to assign (Booster, Advertiser, etc.)
5. UserRole created with status='active' immediately
6. User notified
7. Role tab appears in user's Platform Dashboard
```

**Backend Implementation:**
```python
@api_view(['POST'])
@require_role('admin')
def manually_assign_role(request, user_id):
    admin = request.user
    target_user = User.objects.get(id=user_id)
    role_name = request.data.get('role')
    
    role = Role.objects.get(name=role_name)
    
    # Check if user already has role
    existing = UserRole.objects.filter(
        user=target_user,
        role=role
    ).first()
    
    if existing and existing.status == 'active':
        return Response({'error': 'User already has this role'}, status=400)
    
    # Create or update role assignment
    if existing:
        existing.status = 'active'
        existing.approved_by = admin
        existing.approved_at = timezone.now()
        existing.save()
    else:
        UserRole.objects.create(
            user=target_user,
            role=role,
            status='active',
            approved_by=admin,
            approved_at=timezone.now()
        )
    
    # Notify user
    notify_user_role_assigned(target_user, role)
    
    return Response({'message': f'Role {role.display_name} assigned to user'})
```

### Flow 3: Admin Approves/Rejects Role Request

**Admin Approval:**
```python
@api_view(['POST'])
@require_role('admin')
def approve_role_request(request, user_role_id):
    admin = request.user
    user_role = UserRole.objects.get(id=user_role_id)
    action = request.data.get('action')  # 'approve' or 'reject'
    
    if action == 'approve':
        user_role.status = 'active'
        user_role.approved_by = admin
        user_role.approved_at = timezone.now()
        user_role.save()
        
        notify_user_role_approved(user_role.user, user_role.role)
        
        return Response({'message': 'Role approved'})
    
    elif action == 'reject':
        user_role.status = 'rejected'
        user_role.rejection_reason = request.data.get('reason', '')
        user_role.save()
        
        notify_user_role_rejected(user_role.user, user_role.role, user_role.rejection_reason)
        
        return Response({'message': 'Role rejected'})
```

---

## Dashboard Access

### Dashboard Selector

When a user has multiple roles, they see a dashboard selector:

```jsx
function DashboardSelector() {
  const user = useUser();
  const activeRoles = user.roles.filter(r => r.status === 'active');
  
  return (
    <div className="dashboard-selector">
      <h2>Select Dashboard</h2>
      
      {activeRoles.map(role => (
        <DashboardCard
          key={role.name}
          role={role}
          onClick={() => navigate(`/${role.name}-dashboard`)}
        />
      ))}
    </div>
  );
}

function DashboardCard({ role, onClick }) {
  const icons = {
    client: '🛒',
    booster: '🎮',
    advertiser: '📊',
    team_advertiser: '👥',
    support: '💬',
    admin: '⚙️'
  };
  
  return (
    <div className="dashboard-card" onClick={onClick}>
      <span className="icon">{icons[role.name]}</span>
      <h3>{role.display_name}</h3>
      <p>{role.description}</p>
    </div>
  );
}
```

### Dashboard Routing

```javascript
// App.js
function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard-selector" element={<DashboardSelector />} />
      
      {/* Protected routes */}
      <Route 
        path="/client-dashboard/*" 
        element={
          <ProtectedRoute requiredRole="client">
            <ClientDashboard />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/booster-dashboard/*" 
        element={
          <ProtectedRoute requiredRole="booster">
            <BoosterDashboard />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/advertiser-dashboard/*" 
        element={
          <ProtectedRoute requiredRole="advertiser">
            <AdvertiserDashboard />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/admin-dashboard/*" 
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

// Protected Route Component
function ProtectedRoute({ children, requiredRole }) {
  const user = useUser();
  const hasRole = user.roles.some(r => r.name === requiredRole && r.status === 'active');
  
  if (!hasRole) {
    return <Navigate to="/dashboard-selector" />;
  }
  
  return children;
}
```

---

## Permission Checking

### Backend Permission Check

```python
# Decorator for role-based access
from functools import wraps
from rest_framework.response import Response

def require_role(role_name):
    """Decorator to check if user has required active role"""
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            if not request.user.has_role(role_name):
                return Response(
                    {'error': f'Requires {role_name} role'},
                    status=403
                )
            return view_func(request, *args, **kwargs)
        return wrapper
    return decorator

# Usage
@require_role('advertiser')
def create_service(request):
    # Only users with active advertiser role can access
    pass

@require_role('booster')
def update_order_progress(request, order_id):
    # Only users with active booster role can access
    pass

@require_role('admin')
def approve_transaction(request, transaction_id):
    # Only admins can access
    pass
```

### Frontend Permission Check

```javascript
// useAuth hook
function useAuth() {
  const [user, setUser] = useState(null);
  
  const hasRole = (roleName) => {
    if (!user) return false;
    return user.roles.some(r => r.name === roleName && r.status === 'active');
  };
  
  const hasAnyRole = (roleNames) => {
    if (!user) return false;
    return roleNames.some(roleName => hasRole(roleName));
  };
  
  return { user, hasRole, hasAnyRole };
}

// Usage in components
function ServiceManagement() {
  const { hasRole } = useAuth();
  
  return (
    <div>
      {hasRole('advertiser') && (
        <button onClick={createService}>Create Service</button>
      )}
      
      {hasRole('admin') && (
        <button onClick={deleteAnyService}>Delete Any Service</button>
      )}
    </div>
  );
}
```

---

## User Experience Examples

### Example 1: Client Becomes Booster

**Initial State:**
```
User: john@example.com
Roles: [Client (active)]
Dashboard Access: Client Dashboard only
```

**Action:** User clicks "Become a Booster"

**Result:**
```
User: john@example.com
Roles: [Client (active), Booster (active)]
Dashboard Access: Client Dashboard, Booster Dashboard
```

**UI:**
```
┌─────────────────────────────────────┐
│ Select Dashboard                     │
├─────────────────────────────────────┤
│ 🛒 Client Dashboard                 │
│    Purchase services and manage      │
│    your wallet                       │
├─────────────────────────────────────┤
│ 🎮 Booster Dashboard                │
│    View assigned orders and          │
│    complete services                 │
└─────────────────────────────────────┘
```

### Example 2: Booster Requests Advertiser Role

**Initial State:**
```
User: sarah@example.com
Roles: [Client (active), Booster (active)]
```

**Action:** User clicks "Become an Advertiser"

**Intermediate State:**
```
User: sarah@example.com
Roles: [
  Client (active),
  Booster (active),
  Advertiser (pending_approval)
]
```

**UI Shows:**
```
┌─────────────────────────────────────┐
│ Role Request Status                  │
├─────────────────────────────────────┤
│ ⏳ Advertiser Role                  │
│    Status: Pending Admin Approval    │
│    Requested: 2 hours ago            │
└─────────────────────────────────────┘
```

**After Admin Approval:**
```
User: sarah@example.com
Roles: [
  Client (active),
  Booster (active),
  Advertiser (active)
]
Dashboard Access: Client, Booster, Advertiser
```

### Example 3: User with All Roles

```
User: admin@example.com
Roles: [
  Client (active),
  Booster (active),
  Advertiser (active),
  Admin (active)
]
```

**Dashboard Selector:**
```
┌─────────────────────────────────────┐
│ Select Dashboard                     │
├─────────────────────────────────────┤
│ 🛒 Client Dashboard                 │
│ 🎮 Booster Dashboard                │
│ 📊 Advertiser Dashboard             │
│ ⚙️  Admin Dashboard                 │
└─────────────────────────────────────┘
```

---

## Admin Dashboard: Role Management

### Pending Role Requests View

```jsx
function PendingRoleRequests() {
  const [requests, setRequests] = useState([]);
  
  useEffect(() => {
    fetchPendingRequests();
  }, []);
  
  const fetchPendingRequests = async () => {
    const response = await fetch('/api/admin/role-requests/pending');
    const data = await response.json();
    setRequests(data);
  };
  
  const handleApprove = async (requestId) => {
    await fetch(`/api/admin/role-requests/${requestId}/approve`, {
      method: 'POST'
    });
    fetchPendingRequests();
  };
  
  const handleReject = async (requestId) => {
    const reason = prompt('Rejection reason:');
    await fetch(`/api/admin/role-requests/${requestId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason })
    });
    fetchPendingRequests();
  };
  
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
                <button 
                  onClick={() => handleApprove(req.id)}
                  className="btn-approve"
                >
                  ✓ Approve
                </button>
                <button 
                  onClick={() => handleReject(req.id)}
                  className="btn-reject"
                >
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

---

## API Endpoints

### Role Management Endpoints

```
POST /api/roles/request                    - Request a new role
GET  /api/roles/my-roles                   - Get user's roles and statuses
GET  /api/admin/role-requests/pending      - Get pending role requests (admin)
POST /api/admin/role-requests/:id/approve  - Approve role request (admin)
POST /api/admin/role-requests/:id/reject   - Reject role request (admin)
GET  /api/admin/users/:id/roles            - Get user's role history (admin)
POST /api/admin/users/:id/roles            - Manually assign role (admin)
DELETE /api/admin/users/:id/roles/:roleId  - Revoke role (admin)
```

---

## Notifications

### Email Notifications

**Role Request Submitted:**
```
To: Admin
Subject: New Role Request - Advertiser

User john@example.com (JohnDoe#1234) has requested the Advertiser role.

Review request: https://yourapp.com/admin/role-requests
```

**Role Approved:**
```
To: User
Subject: Role Request Approved - Advertiser

Congratulations! Your request for the Advertiser role has been approved.

You can now access the Advertiser Dashboard.

Login: https://yourapp.com/login
```

**Role Rejected:**
```
To: User
Subject: Role Request Rejected - Advertiser

Your request for the Advertiser role has been rejected.

Reason: Insufficient experience

If you have questions, please contact support.
```

---

## Security Considerations

### 1. Role Verification
- Always verify role status is 'active' before granting access
- Check role on every API request (don't trust frontend)
- Use decorators/middleware for consistent checking

### 2. Role Revocation
- Admins can revoke roles at any time
- Revoked users immediately lose access
- Audit log tracks all role changes

### 3. Multiple Role Conflicts
- No conflicts - users can have any combination of roles
- Each dashboard is independent
- Permissions are additive (having multiple roles = more permissions)

---

## Testing

### Unit Tests

```python
from django.test import TestCase
from .models import User, Role, UserRole

class MultiRoleTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create(
            discord_id='123456789',
            email='test@example.com'
        )
        self.client_role = Role.objects.create(name='client', requires_approval=False)
        self.booster_role = Role.objects.create(name='booster', requires_approval=False)
        self.advertiser_role = Role.objects.create(name='advertiser', requires_approval=True)
    
    def test_user_can_have_multiple_roles(self):
        # Assign client role
        UserRole.objects.create(user=self.user, role=self.client_role, status='active')
        
        # Assign booster role
        UserRole.objects.create(user=self.user, role=self.booster_role, status='active')
        
        # Check user has both roles
        self.assertTrue(self.user.has_role('client'))
        self.assertTrue(self.user.has_role('booster'))
        self.assertEqual(self.user.get_active_roles().count(), 2)
    
    def test_pending_role_not_active(self):
        # Request advertiser role (pending)
        UserRole.objects.create(
            user=self.user,
            role=self.advertiser_role,
            status='pending_approval'
        )
        
        # User should not have advertiser access yet
        self.assertFalse(self.user.has_role('advertiser'))
```
