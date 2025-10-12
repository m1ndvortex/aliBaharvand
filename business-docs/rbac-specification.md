# Role-Based Access Control (RBAC) Specification

## Overview
Flexible RBAC system with predefined roles and customizable permissions per user.

## Permission Model

### Permission Structure
```
{
  "resource": "service",
  "action": "create",
  "name": "create_service",
  "description": "Can create new services"
}
```

### Resources
- `game` - Game management
- `service` - Service management
- `service_type` - Service type management
- `user` - User management
- `role` - Role management
- `permission` - Permission management
- `transaction` - Financial transactions
- `order` - Order management
- `team` - Team management
- `ticket` - Support tickets
- `exchange_rate` - Currency exchange rates

### Actions
- `create` - Create new resource
- `read` - View resource
- `update` - Modify resource
- `delete` - Remove resource
- `approve` - Approve pending items
- `assign` - Assign resources

---

## Role Definitions

### 1. Admin Role

**Base Permissions:**
```json
{
  "game": ["create", "read", "update", "delete"],
  "service_type": ["create", "read", "update", "delete"],
  "service": ["create", "read", "update", "delete"],
  "user": ["create", "read", "update", "delete"],
  "role": ["create", "read", "update", "delete"],
  "permission": ["create", "read", "update", "delete"],
  "transaction": ["read", "approve"],
  "order": ["read", "update", "assign"],
  "team": ["read"],
  "ticket": ["read", "update"],
  "exchange_rate": ["read", "update"]
}
```

**Special Permissions:**
- `create_raid` - Can create raid services
- `approve_deposit` - Approve deposit requests
- `approve_withdrawal` - Approve withdrawal requests
- `set_exchange_rate` - Modify currency exchange rates
- `manage_permissions` - Configure user permissions
- `view_all_data` - Access all system data

**Restrictions:**
- None (full access)

---

### 2. Advertiser Role

**Base Permissions:**
```json
{
  "service": ["create", "read", "update", "delete"],
  "order": ["read"],
  "transaction": ["read"]
}
```

**Allowed Service Types:**
- Mythic+ Dungeon
- Leveling
- Delve
- Custom Boost

**Special Permissions:**
- `book_raid` - Book buyers for existing raid services (cannot create raids)

**Restrictions:**
- Cannot create raid services (only booking)
- Can only view/edit own services
- Can only view orders for own services
- Cannot approve transactions
- Cannot manage users
- Cannot access admin features

**Flexible Permissions:**
Admins can grant/revoke additional permissions per advertiser:
- `create_raid` - Exception: Allow specific advertiser to create raids
- `view_analytics` - Grant access to analytics
- `bulk_edit` - Allow bulk service editing
- Custom permissions as needed

**Example Custom Configurations:**
```json
// Advertiser A - Trusted partner
{
  "user_id": 123,
  "custom_permissions": {
    "granted": ["create_raid", "view_analytics"],
    "revoked": []
  }
}

// Advertiser B - Restricted
{
  "user_id": 456,
  "custom_permissions": {
    "granted": [],
    "revoked": ["create_custom_boost"]
  }
}
```

---

### 3. Team Advertiser Role

**Base Permissions:**
```json
{
  "service": ["create", "read", "update", "delete"],
  "order": ["read", "assign"],
  "team": ["create", "read", "update", "delete"],
  "transaction": ["read"]
}
```

**Inherits:** All Advertiser permissions

**Additional Permissions:**
- `create_team` - Create team
- `manage_team` - Add/remove team members
- `assign_booster` - Assign boosters to orders
- `view_team_performance` - View team analytics

**Team Management:**
- Can create one team
- Can invite boosters to team
- Can remove team members
- Can assign team boosters to orders
- Can view team earnings

---

### 4. Booster Role

**Base Permissions (Predefined, Non-Flexible):**
```json
{
  "order": ["read", "update"],
  "transaction": ["read"]
}
```

**Specific Permissions:**
- `view_assigned_orders` - View orders assigned to them
- `start_order` - Mark order as "In Progress"
- `upload_evidence` - Upload proof/screenshot of completion
- `submit_for_review` - Submit order for approval
- `view_own_earnings` - View personal earnings (pending and completed)

**Restrictions:**
- Cannot create services
- Cannot view other boosters' orders
- Cannot assign orders
- Cannot access admin features
- Cannot modify service listings
- Cannot approve transactions
- **Permissions are standardized and cannot be customized**

---

### 5. Support Role

**Base Permissions:**
```json
{
  "ticket": ["read", "update"],
  "user": ["read"],
  "order": ["read"],
  "transaction": ["read"]
}
```

**Specific Permissions:**
- `view_tickets` - View all support tickets
- `respond_ticket` - Respond to tickets
- `update_ticket_status` - Change ticket status
- `view_user_profile` - View user details (read-only)
- `view_order_details` - View order information (read-only)
- `escalate_ticket` - Escalate to admin

**Restrictions:**
- Cannot modify user data
- Cannot modify orders
- Cannot approve transactions
- Cannot create services
- Cannot access admin features
- Read-only access to user/order data

---

### 6. Client Role

**Base Permissions:**
```json
{
  "service": ["read"],
  "order": ["create", "read"],
  "transaction": ["create", "read"],
  "payment_method": ["create", "read", "update", "delete"]
}
```

**Specific Permissions:**
- `browse_services` - View all active services
- `purchase_service` - Create orders
- `view_own_orders` - View personal orders
- `manage_wallet` - Deposit, withdraw, convert
- `manage_payment_methods` - Add/remove payment methods
- `view_own_transactions` - View personal transaction history

**Restrictions:**
- Can only view own data
- Cannot access other users' information
- Cannot create services
- Cannot access admin dashboard
- Cannot approve transactions

---

## Permission Checking Logic

### Backend Permission Check
```python
def has_permission(user, resource, action):
    # 1. Check role-based permissions
    role_permissions = get_role_permissions(user.role)
    
    if f"{resource}:{action}" in role_permissions:
        # 2. Check user-specific overrides
        user_overrides = get_user_permission_overrides(user.id)
        
        # Check if permission is revoked
        if f"{resource}:{action}" in user_overrides.revoked:
            return False
        
        return True
    
    # 3. Check if permission is granted as override
    user_overrides = get_user_permission_overrides(user.id)
    if f"{resource}:{action}" in user_overrides.granted:
        return True
    
    return False
```

### Frontend Permission Check
```javascript
function canAccess(permission) {
  const userPermissions = store.getters.userPermissions;
  return userPermissions.includes(permission);
}

// Usage
if (canAccess('create_raid')) {
  // Show create raid button
}
```

---

## Permission Matrix

| Permission | Admin | Advertiser | Team Adv | Booster | Support | Client |
|------------|-------|------------|----------|---------|---------|--------|
| create_game | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| create_service | ✓ | ✓* | ✓* | ✗ | ✗ | ✗ |
| create_raid | ✓ | ✗** | ✗** | ✗ | ✗ | ✗ |
| book_raid | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| edit_own_service | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| edit_any_service | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| view_all_orders | ✓ | ✗ | ✗ | ✗ | ✓ | ✗ |
| view_own_orders | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ |
| assign_booster | ✓ | ✗ | ✓ | ✗ | ✗ | ✗ |
| approve_transaction | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| manage_users | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| manage_team | ✓ | ✗ | ✓ | ✗ | ✗ | ✗ |
| view_tickets | ✓ | ✗ | ✗ | ✗ | ✓ | ✗ |
| purchase_service | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |

*Except raids  
**Can be granted by admin as exception

---

## Implementation Notes

### Database Schema
```sql
-- Role permissions (base)
CREATE TABLE role_permissions (
    id SERIAL PRIMARY KEY,
    role_id INTEGER REFERENCES roles(id),
    permission_id INTEGER REFERENCES permissions(id),
    UNIQUE(role_id, permission_id)
);

-- User permission overrides (flexible)
CREATE TABLE user_permissions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    permission_id INTEGER REFERENCES permissions(id),
    granted BOOLEAN, -- true = grant, false = revoke
    created_at TIMESTAMP,
    created_by INTEGER REFERENCES users(id) -- admin who made change
);
```

### Django Implementation
```python
# models.py
class Permission(models.Model):
    name = models.CharField(max_length=100, unique=True)
    resource = models.CharField(max_length=50)
    action = models.CharField(max_length=50)
    description = models.TextField()

class RolePermission(models.Model):
    role = models.ForeignKey(Role, on_delete=models.CASCADE)
    permission = models.ForeignKey(Permission, on_delete=models.CASCADE)
    
    class Meta:
        unique_together = ('role', 'permission')

class UserPermission(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    permission = models.ForeignKey(Permission, on_delete=models.CASCADE)
    granted = models.BooleanField()  # True = grant, False = revoke
    created_by = models.ForeignKey(User, related_name='permissions_granted')
    created_at = models.DateTimeField(auto_now_add=True)
```

### Permission Decorator
```python
from functools import wraps
from rest_framework.response import Response
from rest_framework import status

def require_permission(resource, action):
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            if not request.user.has_permission(resource, action):
                return Response(
                    {"error": "Permission denied"},
                    status=status.HTTP_403_FORBIDDEN
                )
            return view_func(request, *args, **kwargs)
        return wrapper
    return decorator

# Usage
@require_permission('service', 'create')
def create_service(request):
    # Only users with create_service permission can access
    pass
```

---

## Admin UI for Permission Management

### User Permission Override Interface
1. Select user (advertiser)
2. Display user's role and base permissions
3. Show available permissions to grant
4. Show granted custom permissions (with remove option)
5. Show revoked permissions (with restore option)
6. Save changes with audit log

### Permission Audit Log
Track all permission changes:
- Who made the change (admin)
- What changed (permission granted/revoked)
- When (timestamp)
- Why (optional notes)
