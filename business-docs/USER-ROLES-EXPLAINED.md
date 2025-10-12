# User Roles Explained

## 👥 Who Can Use the Platform?

The platform has **6 different user roles**, each with specific permissions and capabilities.

---

## 🎭 Role Hierarchy

```
┌─────────────────────────────────────────────────┐
│                    ADMIN                         │
│  (Full platform control - manages everything)   │
└─────────────────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
┌───────▼──────┐ ┌───▼────────┐ ┌─▼──────────┐
│   SUPPORT    │ │TEAM        │ │ ADVERTISER │
│              │ │ADVERTISER  │ │            │
│ Help users   │ │            │ │Create      │
│              │ │Manage teams│ │services    │
└──────────────┘ └────┬───────┘ └────────────┘
                      │
                ┌─────▼──────┐
                │  BOOSTER   │
                │            │
                │ Complete   │
                │ services   │
                └────────────┘
```

---

## 1. 👑 Admin

### What They Do
**Platform managers** who control everything.

### Key Responsibilities
- Add/remove games from the platform
- Approve or reject user role requests
- Approve withdrawal requests
- Set currency exchange rates
- Handle disputes
- Manage system settings
- View deposit history

### Example Tasks
- "Add Diablo 4 as a new game"
- "Approve John's request to become an advertiser"
- "Approve Sarah's $500 withdrawal request"
- "View deposit history for fraud detection"
- "Update Gold to USD exchange rate"

### Access Level
✅ **Full Access** - Can see and do everything

---

## 2. 💬 Support

### What They Do
**Customer service** staff who help users.

### Key Responsibilities
- Answer user questions
- View support tickets
- Look up user information (read-only)
- View order details (read-only)
- Escalate issues to admins

### Example Tasks
- "Help buyer understand how to purchase a service"
- "Look up why an order is delayed"
- "Explain wallet system to new user"
- "Escalate payment dispute to admin"

### Access Level
⚠️ **Limited Access** - Can view information but cannot approve transactions or manage users

### What They CANNOT Do
- ❌ Approve role requests
- ❌ Approve financial transactions
- ❌ Add/remove games
- ❌ Change system settings
- ❌ Modify user data

---

## 3. 📊 Advertiser

### What They Do
**Service creators** who list services for sale.

### Key Responsibilities
- Create service listings (Mythic+, Leveling, Delves, Custom)
- Set prices in multiple currencies
- Manage their own services
- Book buyers for raid services (cannot create raids)
- View orders for their services
- Track earnings

### Example Tasks
- "Create a Mythic+20 boost service for 500 Gold"
- "Update price of leveling service to $50"
- "Book a buyer for tonight's raid"
- "View how much I earned this month"

### Access Level
✅ Can create and manage own services  
⚠️ Cannot create raid services (only book buyers for existing raids)  
❌ Cannot see other advertisers' services

### How to Become One
1. Register with Discord
2. Request "Advertiser" role
3. Wait for admin approval
4. Start creating services

---

## 4. 👥 Team Advertiser

### What They Do
**Team leaders** who manage groups of service providers.

### Key Responsibilities
- Everything an Advertiser can do
- Create and manage a team
- Invite members to join team
- Collaborate on services with team
- Track team performance
- Distribute earnings

### Example Tasks
- "Create 'Elite Boosters' team"
- "Invite Sarah and Mike to my team"
- "Switch to team workspace to create team services"
- "View which team member created which service"
- "See team earnings for this month"

### Special Feature: Team Workspace
- **Personal Workspace:** Your own services, your earnings
- **Team Workspace:** Team services, earnings go to team leader

### Access Level
✅ All Advertiser permissions  
✅ Team management features  
✅ Can see team activity logs (who did what)

### How to Become One
1. First become an Advertiser
2. Request "Team Advertiser" role
3. Wait for admin approval
4. Create your team

---

## 5. 🎮 Booster

### What They Do
**Service providers** who complete the actual game services.

### Key Responsibilities
- View orders assigned to them
- Complete game services for buyers
- Upload evidence/proof of completion
- Submit orders for review
- Track earnings

### Example Tasks
- "Complete Mythic+20 run for buyer"
- "Upload screenshot showing completion"
- "Submit order for review"
- "View my pending earnings"

### Access Level
✅ Can view assigned orders  
✅ Can upload evidence/screenshots  
✅ Can submit for review  
❌ Cannot mark order as complete (requires approval)  
❌ Cannot create services  
❌ Cannot see other boosters' orders

### How to Become One
1. Register with Discord
2. Request "Booster" role
3. Wait for admin approval
4. Get assigned to orders

---

## 6. 🛒 Buyer (Not in this documentation scope)

### What They Do
**Customers** who purchase services.

**Note:** Buyers use a separate dashboard and are not part of the Admin/Service Provider dashboards covered in this documentation.

---

## 📊 Permission Comparison

| Feature | Admin | Support | Team Adv | Advertiser | Booster |
|---------|-------|---------|----------|------------|---------|
| **Platform Management** |
| Add/Remove Games | ✅ | ❌ | ❌ | ❌ | ❌ |
| Approve Roles | ✅ | ❌ | ❌ | ❌ | ❌ |
| Approve Transactions | ✅ | ❌ | ❌ | ❌ | ❌ |
| System Settings | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Support** |
| View Tickets | ✅ | ✅ | ❌ | ❌ | ❌ |
| Respond to Tickets | ✅ | ✅ | ❌ | ❌ | ❌ |
| View User Info | ✅ | ✅ (read-only) | ❌ | ❌ | ❌ |
| **Service Management** |
| Create Services | ✅ | ❌ | ✅ | ✅ | ❌ |
| Create Raids | ✅ | ❌ | ❌ | ❌ | ❌ |
| Book Raid Buyers | ✅ | ❌ | ✅ | ✅ | ❌ |
| Edit Own Services | ✅ | ❌ | ✅ | ✅ | ❌ |
| **Team Features** |
| Create Team | ✅ | ❌ | ✅ | ❌ | ❌ |
| Manage Team | ✅ | ❌ | ✅ | ❌ | ❌ |
| Team Workspace | ✅ | ❌ | ✅ | ❌ | ❌ |
| **Order Management** |
| View All Orders | ✅ | ✅ (read-only) | Own only | Own only | Assigned only |
| Upload Evidence | ✅ | ❌ | ❌ | ❌ | ✅ |
| Approve/Complete Orders | ✅ | ✅ | ✅ | ✅ | ❌ |
| Assign Boosters | ✅ | ❌ | ✅ | ❌ | ❌ |

---

## 🔄 Role Progression

### Typical User Journey

```
1. Register with Discord
   ↓
2. Auto-assigned "Client" role (buyer)
   ↓
3. Request "Booster" role
   ↓
4. Admin approves → Can complete orders
   ↓
5. Request "Advertiser" role
   ↓
6. Admin approves → Can create services
   ↓
7. Request "Team Advertiser" role
   ↓
8. Admin approves → Can manage teams
```

### Multiple Roles
**Users can have multiple roles at once!**

Example: John can be both a Booster AND an Advertiser
- As Booster: Complete orders assigned to him
- As Advertiser: Create his own service listings

---

## 🎯 Which Role is Right for You?

### Want to earn money completing game services?
→ **Booster**

### Want to create and sell service listings?
→ **Advertiser**

### Want to manage a team of service providers?
→ **Team Advertiser**

### Want to help users and answer questions?
→ **Support**

### Want to manage the entire platform?
→ **Admin**

---

## 🔐 How Roles Are Assigned

### Automatic
- **Client** - Everyone gets this when they register

### Requires Admin Approval
- **Booster** - Request → Admin reviews → Approved/Rejected
- **Advertiser** - Request → Admin reviews → Approved/Rejected
- **Team Advertiser** - Request → Admin reviews → Approved/Rejected
- **Support** - Admin assigns directly
- **Admin** - Admin assigns directly

### Admin Can Also
- **Manually assign** any role without waiting for request
- **Revoke** roles if needed
- **View** role request history

---

## 💡 Real-World Examples

### Example 1: Sarah the Booster
- Registered with Discord
- Requested Booster role
- Got approved by admin
- Now completes Mythic+ runs for buyers
- Earns money for each completed order

### Example 2: Mike the Team Advertiser
- Started as Booster
- Became Advertiser
- Built reputation
- Requested Team Advertiser role
- Created "Pro Gamers" team
- Invited 5 boosters to his team
- They collaborate on services
- Mike manages earnings distribution

### Example 3: Lisa the Support
- Hired by platform owner
- Admin assigned Support role
- Helps users with questions
- Views tickets and responds
- Escalates complex issues to admin

---

## 📞 Questions?

- **How do I request a role?** - Click "Request Role" button in your dashboard
- **How long does approval take?** - Depends on admin availability (usually 24-48 hours)
- **Can I have multiple roles?** - Yes! You can be Booster + Advertiser + Team Advertiser
- **Can roles be revoked?** - Yes, admins can revoke roles if needed
- **What if my request is rejected?** - You can request again later or contact support

---

**Next:** Check out the [Dashboard Guide](./DASHBOARD-GUIDE.md) to see what each role's interface looks like!
