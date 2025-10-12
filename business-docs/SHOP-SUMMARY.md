# Shop System - Quick Summary

## 🛒 What is the Shop?

A tab in the client dashboard where users can purchase **game time** (subscriptions) for various games.

---

## 💳 Payment Options

Users can choose:
1. **Pay from Wallet** - Use existing balance (Gold, USD, Toman)
2. **Pay Online** - Direct payment via gateway (Credit Card, Crypto, etc.)

---

## 🎯 User Flow

```
Browse Shop → Select Product → Choose Payment Method
    ↓
Option 1: Wallet          Option 2: Online
    ↓                         ↓
Check balance             Payment gateway
    ↓                         ↓
Deduct from wallet        Process payment
    ↓                         ↓
Generate code             Generate code
    ↓                         ↓
Send email                Send email
    ↓                         ↓
Purchase complete         Purchase complete
```

---

## 👑 Admin Features

### Shop Management
- Add/Edit/Delete products
- Set prices in multiple currencies (Gold, USD, Toman)
- Activate/Deactivate products
- Manage stock (unlimited or limited)

### Order Management
- View all shop orders
- Resend game time codes
- Refund orders
- View analytics

---

## 📦 Example Products

```
WoW - 30 Days Game Time
Price: 500 Gold / $15 USD / 750,000 Toman

WoW - 60 Days Game Time
Price: 950 Gold / $28 USD / 1,400,000 Toman

WoW - 90 Days Game Time
Price: 1,350 Gold / $40 USD / 2,000,000 Toman
```

---

## 🗄️ Database Tables

### shop_products
- Product details
- Multi-currency pricing
- Stock management
- Active status

### shop_orders
- User purchases
- Payment details
- Game time codes
- Delivery status

---

## 🔑 Key Points

✅ **Dual Payment**: Wallet or Online  
✅ **Instant Delivery**: Code sent via email  
✅ **Multi-Currency**: Gold, USD, Toman  
✅ **Admin Control**: Full product management  
✅ **Purchase History**: Users can view past orders  

---

**Status:** ✅ Shop system ready for implementation
