# Final Architecture - CONFIRMED

## ✅ CORRECT: 2 Dashboards

### 1. Admin Dashboard
**For:** Admin and Support roles  
**Route:** `/admin-dashboard`

#### Admin Role (Full Access)
**Features:**
- Game management (add/edit/delete games)
- Service type management
- User management
- Role request approvals (approve/reject)
- Manual role assignment
- Financial transaction approvals
- Exchange rate management
- System settings
- Support tickets

#### Support Role (Limited Access)
**Features:**
- Support tickets (view and respond)
- User lookup (read-only)
- Order details (read-only)
- Cannot access: Game management, Role approvals, Financial approvals, System settings

**Access:** Users with active `admin` or `support` role

---

### 2. Service Provider Dashboard
**For:** Booster, Advertiser, Team Advertiser roles  
**Route:** `/service-provider-dashboard`

**Structure:** Role-based tabs

#### Advertiser Tab
**Requires:** `advertiser` role (active)

**Features:**
- Create services (Mythic+, Leveling, Delves, Custom)
- Book buyers for raids (cannot create raids)
- Manage own services
- View own orders
- View earnings

#### Team Advertiser Tab
**Requires:** `team_advertiser` role (active)

**Features:**
- All Advertiser features
- Create and manage team
- Invite team members
- Workspace switcher (Personal ↔ Team)
- Team services (collaborative)
- Team earnings
- Activity logging

#### Booster Tab
**Requires:** `booster` role (active)

**Features:**
- View assigned orders
- Update order progress
- Mark orders complete
- View earnings

---

## Role System

### Auto-Approved
- **Client** - Default role for all new users

### Requires Admin Approval
- **Booster**
- **Advertiser**
- **Team Advertiser**
- **Admin**

### Admin Can:
1. **Approve/Reject** role requests
2. **Manually assign** roles directly to users

---

## User Flows

### User with Booster Role
```
Login → Service Provider Dashboard → Booster Tab visible
```

### User with Advertiser + Booster Roles
```
Login → Service Provider Dashboard → [Advertiser Tab] [Booster Tab] both visible
```

### User with Admin Role
```
Login → Admin Dashboard (separate dashboard)
```

### User with Admin + Advertiser Roles
```
Login → Can access BOTH:
- Admin Dashboard (separate route)
- Service Provider Dashboard (with Advertiser tab)
```

---

## Key Points

✅ **2 Dashboards Total**
- Admin Dashboard (separate)
- Service Provider Dashboard (with tabs)

✅ **Admin is Separate**
- Admin Dashboard is NOT a tab
- It's a completely separate dashboard
- Different route, different features

✅ **Service Provider Dashboard has Tabs**
- Advertiser Tab
- Team Advertiser Tab
- Booster Tab
- Users see only tabs for their active roles

✅ **No Client Dashboard Mentioned**
- Client dashboard is separate (for buyers)
- Not part of this 2-dashboard structure
- Clients don't access Admin or Service Provider dashboards

---

## Routes

```javascript
// Admin Dashboard
/admin-dashboard  → AdminDashboard component (Admin role only)

// Service Provider Dashboard
/service-provider-dashboard → ServiceProviderDashboard component
  - Shows tabs based on user's roles
  - Advertiser tab (if has advertiser role)
  - Team Advertiser tab (if has team_advertiser role)
  - Booster tab (if has booster role)
```

---

## Frontend Implementation

```jsx
// App routing
<Routes>
  {/* Admin Dashboard - Separate */}
  <Route 
    path="/admin-dashboard" 
    element={
      <ProtectedRoute requiredRole="admin">
        <AdminDashboard />
      </ProtectedRoute>
    } 
  />
  
  {/* Service Provider Dashboard - With Tabs */}
  <Route 
    path="/service-provider-dashboard" 
    element={
      <ProtectedRoute requiredRoles={['booster', 'advertiser', 'team_advertiser']}>
        <ServiceProviderDashboard />
      </ProtectedRoute>
    } 
  />
</Routes>

// Service Provider Dashboard Component
function ServiceProviderDashboard() {
  const user = useUser();
  const [activeTab, setActiveTab] = useState(null);
  
  const tabs = [];
  if (user.hasRole('advertiser')) tabs.push('advertiser');
  if (user.hasRole('team_advertiser')) tabs.push('team_advertiser');
  if (user.hasRole('booster')) tabs.push('booster');
  
  return (
    <div>
      <nav>
        {tabs.map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={activeTab === tab ? 'active' : ''}
          >
            {tabLabel(tab)}
          </button>
        ))}
      </nav>
      
      <div>
        {activeTab === 'advertiser' && <AdvertiserContent />}
        {activeTab === 'team_advertiser' && <TeamAdvertiserContent />}
        {activeTab === 'booster' && <BoosterContent />}
      </div>
    </div>
  );
}
```

---

## Summary

**Total Dashboards: 2**

1. **Admin Dashboard** (separate, for Admin only)
2. **Service Provider Dashboard** (with tabs for Booster, Advertiser, Team Advertiser)

**NOT 3 dashboards. NOT tabs for Admin inside Service Provider Dashboard.**

**Admin Dashboard is completely separate from Service Provider Dashboard.**

---

**Status:** ✅ CONFIRMED AND DOCUMENTED

**Last Updated:** 2025-01-15
