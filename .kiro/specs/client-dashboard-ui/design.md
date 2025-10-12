# Client Dashboard UI Design Document

## Overview

This document outlines the design for a beautiful, modern client dashboard UI prototype for the gaming services marketplace platform. The design focuses on creating an intuitive, responsive interface that allows clients to browse WoW services, manage their multi-currency wallet, track orders, and purchase game time. The prototype will be built using HTML, CSS, and JavaScript with a focus on visual appeal and user experience.

## Architecture

### Technology Stack
- **Frontend**: HTML5, CSS3 (with CSS Grid and Flexbox), Vanilla JavaScript
- **Styling**: Custom CSS with CSS variables for theming
- **Icons**: Font Awesome or similar icon library
- **Fonts**: Gaming-appropriate fonts (e.g., Inter for UI, custom gaming font for headers)
- **Responsive**: Mobile-first approach with breakpoints for tablet and desktop
- **No Backend**: Static prototype with simulated data and interactions

### File Structure
```
client-dashboard-ui/
├── index.html                 # Login page
├── dashboard.html             # Main dashboard
├── css/
│   ├── main.css              # Main styles
│   ├── components.css        # Component styles
│   └── responsive.css        # Media queries
├── js/
│   ├── main.js               # Core functionality
│   ├── wallet.js             # Wallet operations
│   ├── marketplace.js        # Service browsing
│   └── data.js               # Mock data
├── assets/
│   ├── images/               # Avatars, logos, icons
│   └── fonts/                # Custom fonts
└── README.md                 # Setup instructions
```

## Components and Interfaces

### 1. Authentication Interface

#### Login Page
**Design Elements:**
- Full-screen background with WoW-themed gaming imagery
- Centered login card with Discord branding
- "Login with Discord" button with Discord logo and #5865F2 color
- Platform logo and tagline
- Responsive design for all screen sizes

**Visual Hierarchy:**
```
┌─────────────────────────────────────────┐
│  [Gaming Background Image]              │
│                                         │
│    ┌─────────────────────────────┐     │
│    │     Platform Logo           │     │
│    │  Gaming Services Marketplace│     │
│    │                             │     │
│    │  [🎮 Login with Discord]    │     │
│    │                             │     │
│    │  Don't have Discord?        │     │
│    │  [Create Account]           │     │
│    └─────────────────────────────┘     │
└─────────────────────────────────────────┘
```

### 2. Main Dashboard Layout

#### Header Component
**Elements:**
- Platform logo (left)
- User profile dropdown with Discord avatar and username (right)
- Notification bell icon
- Wallet balance summary (Gold, USD, Toman)

#### Sidebar Navigation
**Structure:**
- Dashboard Home (🏠)
- Marketplace (🛒)
- My Orders (📦)
- Wallet (💰)
- Shop (🏪)
- Profile (👤)
- Help & Support (❓)

**Visual Design:**
- Dark sidebar with gaming theme
- Active state highlighting
- Collapsible on mobile
- Icons with labels

#### Main Content Area
**Layout:**
- Responsive grid system
- Card-based components
- Consistent spacing and typography
- Loading states and animations

### 3. Dashboard Home Page

#### Layout Structure
```
┌─────────────────────────────────────────────────────────┐
│  Header (Logo, User Profile, Wallet Summary)           │
├─────────────────────────────────────────────────────────┤
│ Sidebar │  Main Content Area                           │
│         │  ┌─────────────────────────────────────────┐ │
│ 🏠 Home │  │  Wallet Balance Cards                   │ │
│ 🛒 Market│  │  [Gold] [USD] [Toman]                  │ │
│ 📦 Orders│  └─────────────────────────────────────────┘ │
│ 💰 Wallet│  ┌─────────────────────────────────────────┐ │
│ 🏪 Shop  │  │  Quick Actions                          │ │
│ 👤 Profile│  │  [Deposit] [Withdraw] [Convert]        │ │
│ ❓ Help   │  └─────────────────────────────────────────┘ │
│         │  ┌─────────────────────────────────────────┐ │
│         │  │  Recent Orders (Last 5)                 │ │
│         │  └─────────────────────────────────────────┘ │
│         │  ┌─────────────────────────────────────────┐ │
│         │  │  Recent Transactions (Last 5)           │ │
│         │  └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

#### Wallet Balance Cards
**Design:**
- Three cards for Gold, USD, Toman
- Large balance numbers
- Currency symbols and icons
- Gradient backgrounds with currency-specific colors
- Hover effects and animations

#### Quick Actions
**Buttons:**
- Deposit (Green, instant badge)
- Withdraw (Orange, "Admin Approval Required" badge)
- Convert (Blue, instant badge)

### 4. Marketplace Interface

#### Service Categories
**Tabs:**
- All Services
- Mythic+ Dungeons
- Raids
- Leveling
- Delves
- Custom Boosts

#### Filter Sidebar
**Options:**
- Price Range (slider)
- Completion Time
- Seller Rating
- Availability

#### Service Cards
**Layout:**
```
┌─────────────────────────────────────┐
│  [Service Image/Icon]               │
│  Mythic+20 Necrotic Wake           │
│  ⭐⭐⭐⭐⭐ (4.8) • 127 reviews    │
│                                     │
│  💰 500G / $50 / 2,500,000﷼       │
│  ⏱️ ~2 hours                       │
│  👤 BoosterPro#1234                │
│                                     │
│  [View Details] [Purchase]          │
└─────────────────────────────────────┘
```

#### Service Detail Modal
**Content:**
- Full service description
- Requirements (level, gear, etc.)
- Booster information and rating
- Price breakdown
- Purchase form
- Reviews and ratings

### 5. Wallet Management Interface

#### Wallet Overview
**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  Multi-Currency Wallet                                  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐      │
│  │    Gold     │ │     USD     │ │   Toman     │      │
│  │  1,500.50 G │ │  $250.00    │ │ 5,000,000﷼ │      │
│  │             │ │             │ │             │      │
│  └─────────────┘ └─────────────┘ └─────────────┘      │
│                                                         │
│  Exchange Rates: 1G = $0.10 | 1USD = 50,000﷼         │
└─────────────────────────────────────────────────────────┘
```

#### Deposit Interface
**Flow:**
1. Select currency (Gold, USD, Toman)
2. Enter amount
3. Choose payment method:
   - Credit Card (Visa, Mastercard icons)
   - Crypto Wallet (Bitcoin, Ethereum icons)
   - Iranian Bank Card (local bank logos)
4. Payment gateway simulation
5. Success confirmation with "INSTANT" badge

#### Withdrawal Interface
**Flow:**
1. Select currency and amount
2. Choose verified payment method
3. Show "REQUIRES ADMIN APPROVAL" warning
4. Submit request
5. Show "Pending Approval" status

#### Currency Conversion
**Interface:**
```
┌─────────────────────────────────────────┐
│  Currency Converter                     │
│                                         │
│  From: [Gold ▼]  Amount: [100]         │
│  To:   [USD ▼]   Result: $10.00        │
│                                         │
│  Rate: 1 Gold = $0.10                  │
│  Fee: Free (Instant)                   │
│                                         │
│  [Convert Now]                          │
└─────────────────────────────────────────┘
```

### 6. Orders Tracking Interface

#### Orders List
**Columns:**
- Order # (clickable)
- Service Name
- Booster (Discord username + avatar)
- Status Badge
- Price
- Date
- Actions

#### Status Badges
**Design:**
- Pending (Gray)
- Assigned (Blue)
- In Progress (Yellow)
- Evidence Submitted (Orange)
- Under Review (Purple)
- Completed (Green)
- Rejected (Red)

#### Order Detail View
**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  Order #12345 - Mythic+20 Necrotic Wake               │
│  Status: [In Progress]                                  │
│                                                         │
│  Service Details:                                       │
│  • Mythic+20 Necrotic Wake completion                  │
│  • Guaranteed completion within 2 hours                │
│  • Price: 500 Gold                                     │
│                                                         │
│  Booster Information:                                   │
│  👤 BoosterPro#1234 ⭐⭐⭐⭐⭐ (4.9/5)              │
│  📅 Started: 2 hours ago                               │
│  ⏱️ Estimated completion: 30 minutes                   │
│                                                         │
│  Progress Updates:                                      │
│  ✅ Order accepted by booster                          │
│  ✅ Booster started the dungeon                        │
│  🔄 Currently in progress...                           │
│                                                         │
│  [Contact Support] [Report Issue]                      │
└─────────────────────────────────────────────────────────┘
```

### 7. Shop Interface

#### Product Grid
**WoW Game Time Products:**
```
┌─────────────────────────────────────┐
│  [WoW Logo]                         │
│  WoW - 30 Days Game Time           │
│                                     │
│  💰 500G / $15 / 750,000﷼         │
│                                     │
│  [Pay from Wallet] [Pay Online]     │
└─────────────────────────────────────┘
```

#### Purchase Flow
**Wallet Payment:**
1. Select currency from wallet
2. Confirm sufficient balance
3. Process payment
4. Show game time code
5. Email simulation

**Online Payment:**
1. Select payment method
2. Payment gateway simulation
3. Process payment
4. Show game time code
5. Email simulation

### 8. Profile Management

#### Profile Overview
**Sections:**
- Discord Account Info (username, avatar, connection status)
- Personal Information (name, email, country)
- Security Settings (login history, sessions)
- Preferences (currency, notifications, language)
- Payment Methods (saved cards, crypto wallets, bank accounts)

## Data Models

### Mock Data Structure

#### User Profile
```javascript
const userProfile = {
  id: 1,
  discordId: "123456789012345678",
  discordUsername: "GamerPro#1234",
  discordAvatar: "https://cdn.discordapp.com/avatars/123456789012345678/avatar.png",
  email: "gamer@example.com",
  firstName: "John",
  lastName: "Doe",
  country: "United States",
  preferredCurrency: "usd",
  joinDate: "2024-01-15"
};
```

#### Wallet Data
```javascript
const walletData = {
  balances: {
    gold: 1500.50,
    usd: 250.00,
    toman: 5000000
  },
  exchangeRates: {
    goldToUsd: 0.10,
    usdToToman: 50000,
    goldToToman: 5000
  }
};
```

#### Services Data
```javascript
const services = [
  {
    id: 1,
    title: "Mythic+20 Necrotic Wake",
    category: "mythic_plus",
    description: "Professional +20 key completion with guaranteed success",
    prices: { gold: 500, usd: 50, toman: 2500000 },
    estimatedTime: "2 hours",
    booster: {
      username: "BoosterPro#1234",
      avatar: "avatar1.png",
      rating: 4.8,
      reviews: 127
    },
    requirements: "Level 80, Item Level 470+",
    image: "mythic-plus-icon.png"
  },
  {
    id: 2,
    title: "Heroic Vault of the Incarnates Full Clear",
    category: "raid",
    description: "Complete heroic raid clear with all bosses",
    prices: { gold: 2000, usd: 200, toman: 10000000 },
    estimatedTime: "4-6 hours",
    booster: {
      username: "RaidMaster#5678",
      avatar: "avatar2.png",
      rating: 4.9,
      reviews: 89
    },
    requirements: "Level 80, Item Level 480+",
    image: "raid-icon.png"
  }
];
```

#### Orders Data
```javascript
const orders = [
  {
    id: 12345,
    serviceTitle: "Mythic+20 Necrotic Wake",
    status: "in_progress",
    booster: {
      username: "BoosterPro#1234",
      avatar: "avatar1.png"
    },
    price: { amount: 500, currency: "gold" },
    createdAt: "2024-01-15T10:30:00Z",
    estimatedCompletion: "2024-01-15T14:30:00Z",
    progress: [
      { step: "Order accepted", completed: true, timestamp: "2024-01-15T10:35:00Z" },
      { step: "Booster started dungeon", completed: true, timestamp: "2024-01-15T12:00:00Z" },
      { step: "In progress", completed: false, timestamp: null }
    ]
  }
];
```

## Error Handling

### User Feedback
- Toast notifications for actions (success, error, info)
- Loading states for async operations
- Form validation with inline error messages
- Confirmation dialogs for important actions

### Error States
- Network connection issues
- Insufficient wallet balance
- Payment processing errors
- Service unavailability
- Session timeout

### Loading States
- Skeleton screens for content loading
- Spinner animations for actions
- Progress bars for multi-step processes
- Disabled states for buttons during processing

## Testing Strategy

### Manual Testing Checklist
1. **Responsive Design**
   - Test on desktop (1920x1080, 1366x768)
   - Test on tablet (768x1024, 1024x768)
   - Test on mobile (375x667, 414x896)

2. **Navigation**
   - All sidebar links work
   - Breadcrumbs are accurate
   - Back button functionality
   - Modal opening/closing

3. **Wallet Operations**
   - Balance display accuracy
   - Currency conversion calculations
   - Deposit/withdrawal flows
   - Transaction history display

4. **Service Browsing**
   - Filter functionality
   - Search functionality
   - Service detail modals
   - Purchase flow simulation

5. **Order Tracking**
   - Status badge display
   - Order detail information
   - Progress tracking
   - Action buttons

### Browser Compatibility
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

### Performance Testing
- Page load times under 3 seconds
- Smooth animations (60fps)
- Responsive interactions
- Image optimization

## Visual Design System

### Color Palette
```css
:root {
  /* Primary Colors */
  --discord-blue: #5865F2;
  --gaming-purple: #6441A4;
  --dark-bg: #1a1a1a;
  --card-bg: #2d2d2d;
  
  /* Currency Colors */
  --gold-color: #FFD700;
  --usd-color: #28a745;
  --toman-color: #007bff;
  
  /* Status Colors */
  --success: #28a745;
  --warning: #ffc107;
  --danger: #dc3545;
  --info: #17a2b8;
  
  /* Text Colors */
  --text-primary: #ffffff;
  --text-secondary: #b0b0b0;
  --text-muted: #6c757d;
}
```

### Typography
```css
/* Headings */
h1, h2, h3 { font-family: 'Inter', sans-serif; font-weight: 600; }
h1 { font-size: 2.5rem; }
h2 { font-size: 2rem; }
h3 { font-size: 1.5rem; }

/* Body Text */
body { font-family: 'Inter', sans-serif; font-size: 1rem; line-height: 1.6; }

/* Gaming Elements */
.gaming-title { font-family: 'Orbitron', monospace; }
```

### Component Styles
- Cards: Rounded corners (8px), subtle shadows, hover effects
- Buttons: Consistent padding, hover states, disabled states
- Forms: Clean inputs, proper validation styling
- Modals: Backdrop blur, smooth animations
- Tables: Zebra striping, hover rows, responsive design

### Animations
- Smooth transitions (0.3s ease)
- Hover effects on interactive elements
- Loading animations
- Page transition effects
- Micro-interactions for user feedback

This design document provides a comprehensive foundation for building a beautiful, functional client dashboard UI prototype that accurately represents your gaming services marketplace platform.