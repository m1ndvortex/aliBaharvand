# Dashboard Guide

## 📊 Platform Dashboards Overview

The platform has **2 main dashboards**, each designed for different user types.

---

## 🎯 Dashboard Structure

```
┌─────────────────────────────────────────────────────────┐
│                  PLATFORM DASHBOARDS                     │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  1. ADMIN DASHBOARD                                      │
│     For: Admin role ONLY                                 │
│     Purpose: Platform management and approvals           │
│                                                           │
│  2. SERVICE PROVIDER DASHBOARD                           │
│     For: Booster, Advertiser, Team Advertiser           │
│     Purpose: Create and manage services                  │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

## 1. 👑 Admin Dashboard

### Who Can Access
- **Admin role ONLY**

### Dashboard Layout

```
┌──────────────────────────────────────────────────────────────┐
│  [Logo] Admin Dashboard                      [Profile Menu]  │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Sidebar Navigation:                                         │
│  ├─ 📊 Dashboard Home                                        │
│  ├─ 🎮 Games Management                                      │
│  ├─ 👥 Users & Roles                                         │
│  ├─ ⏳ Pending Role Requests                                 │
│  ├─ 💰 Pending Withdrawals                                   │
│  ├─ � Deposnit History                                       │
│  ├─ 💱 Exchange Rates                                        │
│  └─ ⚙️  System Settings                                      │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### Key Features

#### 📊 Dashboard Home
**What you see:**
- Total users count
- Pending role requests (needs your approval)
- Pending withdrawal requests (needs your approval)
- Platform statistics (orders, revenue, deposits)
- Recent activity log

**What you can do:**
- Quick overview of platform health
- See what needs immediate attention

---

#### 🎮 Games Management
**What you see:**
- List of all games (World of Warcraft, etc.)
- Service types per game

**What you can do:**
- ➕ Add new game
- ✏️ Edit game details
- 🗑️ Delete game
- ➕ Add service types to games (Mythic+, Leveling, Raids, etc.)
- ✏️ Edit service types
- 🗑️ Delete service types

**Example:**
```
Game: World of Warcraft
Service Types:
  - Mythic+ Dungeon
  - Leveling Boost
  - Raid (Admin only can create)
  - Delve
  - Custom Boost
```

---

#### 👥 Users & Roles
**What you see:**
- List of all users
- Their current roles
- Account status (Active/Suspended)

**What you can do:**
- View user details
- Manually assign roles to users
- Revoke roles from users
- Suspend/activate accounts
- Search and filter users

**Example Actions:**
- Assign "Booster" role to user John
- Revoke "Advertiser" role from user Sarah
- Suspend user account

---

#### ⏳ Pending Role Requests
**What you see:**
- Users who requested roles (Booster, Advertiser, etc.)
- Their current roles
- When they requested
- Their Discord username

**What you can do:**
- ✅ Approve role request
- ❌ Reject role request (with reason)
- View user's profile before deciding

**Example:**
```
User: john@example.com (JohnDoe#1234)
Current Roles: None
Requested Role: Booster
Requested: 2 hours ago

Actions: [Approve] [Reject]
```

---

#### 💰 Financial Approvals
**What you see:**
- Pending withdrawals (users want to take money out)
- Amount and currency (Gold, USD, Toman)
- Payment method for withdrawal

**What you can do:**
- ✅ Approve withdrawal (money sent to user)
- ❌ Reject withdrawal (with reason)
- Add admin notes
- View withdrawal history

**Note:** Deposits are instant and don't require approval

**Example:**
```
User: sarah@example.com
Type: Withdrawal
Amount: 100 USD
Payment Method: Bank Account
Status: Pending

Actions: [Approve] [Reject]
```

---

#### 💱 Exchange Rates
**What you see:**
- Current exchange rates between currencies
- Gold ↔ USD
- USD ↔ Toman
- Gold ↔ Toman

**What you can do:**
- Update exchange rates
- View rate history
- Set new rates (applies immediately)

**Example:**
```
1 Gold = 0.10 USD
1 USD = 50,000 Toman
1 Gold = 5,000 Toman

[Update Rates]
```

---

#### ⚙️ System Settings
**What you see:**
- Platform configuration
- Email templates
- Notification settings

**What you can do:**
- Configure platform settings
- Edit email templates
- Manage notification preferences

---

## 2. 🎮 Service Provider Dashboard

### Who Can Access
- **Booster** (sees Booster tabs)
- **Advertiser** (sees Advertiser tab)
- **Team Advertiser** (sees Team Advertiser tab)

**Note:** Users see only tabs for roles they have!

### Dashboard Layout

```
┌──────────────────────────────────────────────────────────────┐
│  [Logo] Service Provider Dashboard          [Profile Menu]  │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Tabs (based on your roles):                                 │
│  [📊 Advertiser] [👥 Team Advertiser] [🎮 Booster]          │
│                                                               │
│  (You only see tabs for roles you have)                      │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

---

### 📊 Advertiser Tab

**Who sees this:** Users with **Advertiser** role

#### What You Can Do

##### 1. Create Services
**Services you can create:**
- ✅ Mythic+ Dungeon Boost
- ✅ Leveling Boost
- ✅ Delve Boost
- ✅ Custom Boost
- ❌ Raid (cannot create - only Admin can)

**But you CAN:**
- 📝 Book buyers for existing Raid services (created by Admin)

**Example:**
```
Create New Service:
- Game: World of Warcraft
- Type: Mythic+ Dungeon
- Title: "Mythic+20 Boost"
- Price: 500 Gold (or 50 USD, or 2,500,000 Toman)
- Description: "Fast and professional boost"
- Estimated Time: 2 hours

[Create Service]
```

##### 2. Manage Your Services
**What you see:**
- List of your services
- How many orders each service has
- Total earnings per service
- Service status (Active/Inactive)

**What you can do:**
- Edit service details
- Change prices
- Activate/Deactivate services
- Delete services
- View service analytics

##### 3. View Your Orders
**What you see:**
- Orders for your services
- Buyer information
- Order status (Pending, In Progress, Completed)
- Assigned booster (if any)

**What you can do:**
- View order details
- Assign booster to order
- Track order progress
- Contact buyer

##### 4. View Your Earnings
**What you see:**
- Total earnings (Gold, USD, Toman)
- Earnings per service
- Earnings history
- Pending payouts

---

### 👥 Team Advertiser Tab

**Who sees this:** Users with **Team Advertiser** role

#### Everything from Advertiser Tab PLUS:

##### 1. Create Team
**What you can do:**
- Create your team
- Give it a name
- Add description

**Example:**
```
Team Name: Elite Boosters
Description: Professional WoW boosting team
[Create Team]
```

##### 2. Invite Team Members
**What you can do:**
- Search for users
- Send team invitations
- View pending invitations
- Remove team members

**Example:**
```
Invite User:
Search: john@example.com
[Send Invitation]

Team Members:
- You (Leader)
- Sarah (Member) - Joined 2 days ago
- Mike (Member) - Joined 1 week ago
```

##### 3. Workspace Switcher
**Two workspaces:**

**Personal Workspace:**
- Your own services
- Earnings go to YOUR wallet
- Only you can manage

**Team Workspace:**
- Team services (collaborative)
- All team members can create/edit
- Earnings go to TEAM LEADER's wallet (you)
- Activity log shows who did what

**Example:**
```
[Personal Workspace ▼] [Team Workspace ▼]

Currently in: Team Workspace

Team Services:
- Service A (created by Sarah) - 600 Gold
- Service B (created by Mike) - 800 Gold
- Service C (created by You) - 1000 Gold

All earnings from these → Your wallet (team leader)

Activity Log:
- 10:00 AM - Sarah created "Service A"
- 11:30 AM - Mike updated price on "Service B"
- 02:00 PM - You activated "Service C"
```

##### 4. Team Earnings
**What you see:**
- Total team earnings
- Earnings per team member (who contributed what)
- Team performance

---

### 🎮 Booster Tab

**Who sees this:** Users with **Booster** role

#### What You Can Do

##### 1. View Assigned Orders
**What you see:**
- Orders assigned to you
- Service details
- Buyer information
- Deadline
- Order status

**Example:**
```
Assigned Orders:

Order #12345
Service: Mythic+20 Boost
Buyer: john@example.com
Status: In Progress
Deadline: 2 hours
[View Details] [Upload Evidence]
```

##### 2. Upload Evidence/Proof
**What you can do:**
- Start working on order (mark as "In Progress")
- Upload screenshot/image as proof of completion
- Add notes about the boost
- Submit for review

**Evidence Upload:**
```
Order #12345 - Mythic+20 Boost

Upload Evidence:
[📷 Upload Screenshot]

Notes: "Completed +20 key, got 3 items for buyer"

[Submit for Review]
```

**Important:** You CANNOT mark order as complete yourself. After uploading evidence:
- Admin, Support, Advertiser, or Team Advertiser reviews it
- They approve and mark as complete
- Then you get paid

##### 3. View Your Earnings
**What you see:**
- Total earnings from completed orders
- Pending payments (orders awaiting approval)
- Earnings history
- Completion rate

---

## 🔄 How to Switch Between Dashboards

### If You Have Admin Role:
```
Login → Go to Admin Dashboard
```

### If You Have Service Provider Roles (Booster, Advertiser, Team Advertiser):
```
Login → Go to Service Provider Dashboard → See tabs for your roles
```

### If You Have BOTH Admin and Service Provider Roles:
```
You can access BOTH dashboards:
- Admin Dashboard (separate page)
- Service Provider Dashboard (separate page)

Use navigation menu to switch between them
```

---

## 📱 Navigation Example

### User with Booster + Advertiser Roles:

**Service Provider Dashboard:**
```
Tabs visible: [Advertiser] [Booster]

Click "Advertiser" → See advertiser features
Click "Booster" → See booster features

No page reload, instant switching!
```

### User with Admin Role:

**Admin Dashboard:**
```
No tabs, just sidebar navigation:
- Dashboard Home
- Games Management
- Users & Roles
- etc.
```

---

## ❓ Common Questions

### Q: I have Booster role. Where do I go?
**A:** Service Provider Dashboard → You'll see Booster tab

### Q: I have Advertiser + Booster roles. Do I see 2 dashboards?
**A:** No, you see ONE dashboard (Service Provider) with 2 tabs (Advertiser and Booster)

### Q: I'm an Admin. Where do I approve role requests?
**A:** Admin Dashboard → Pending Role Requests

### Q: I'm a Team Advertiser. Where do I create my team?
**A:** Service Provider Dashboard → Team Advertiser tab → Team Management

### Q: Can Advertisers create Raids?
**A:** No, only Admin can create Raids. But Advertisers can book buyers for existing Raids.

### Q: Where do team earnings go?
**A:** All team service earnings go to the Team Leader's wallet

### Q: How do I know who edited a team service?
**A:** Check the Activity Log in Team Workspace - it shows who did what and when

---

## 🎯 Quick Reference

| Role | Dashboard | What You See |
|------|-----------|--------------|
| Admin | Admin Dashboard | Full platform management |
| Booster | Service Provider Dashboard | Booster tab only |
| Advertiser | Service Provider Dashboard | Advertiser tab only |
| Team Advertiser | Service Provider Dashboard | Team Advertiser tab only |
| Booster + Advertiser | Service Provider Dashboard | Both tabs |
| Admin + Advertiser | Both dashboards | Can access both |

---

**Need help?** Contact support or check the detailed documentation.
