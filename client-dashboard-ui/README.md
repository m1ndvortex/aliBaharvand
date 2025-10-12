# Client Dashboard UI Prototype

A beautiful, responsive UI/UX prototype for the gaming services marketplace client dashboard. This prototype demonstrates the user interface for clients to browse WoW services, manage their multi-currency wallet, track orders, and purchase game time.

## Features

- **Discord OAuth Integration**: Login with Discord branding and user profile display
- **Responsive Design**: Mobile-first approach with tablet and desktop optimizations
- **Multi-Currency Wallet**: Support for Gold, USD, and Toman currencies
- **Gaming Theme**: Discord-inspired color scheme with gaming aesthetics
- **Interactive Prototype**: Simulated functionality with mock data

## Project Structure

```
client-dashboard-ui/
├── index.html              # Login page with Discord OAuth
├── dashboard.html           # Main dashboard application
├── css/
│   ├── main.css            # CSS variables, reset, and base styles
│   ├── components.css      # Component-specific styles
│   └── responsive.css      # Mobile-first responsive design
├── js/
│   ├── main.js             # Core application functionality
│   ├── data.js             # Mock data and utility functions
│   ├── wallet.js           # Wallet management features
│   └── marketplace.js      # Marketplace functionality (placeholder)
├── assets/
│   └── images/             # Images and avatars
└── README.md               # This file
```

## Setup Instructions

1. **Clone or Download**: Get the project files to your local machine

2. **Open in Browser**: 
   - Open `index.html` in your web browser to start with the login page
   - Or open `dashboard.html` directly to view the main dashboard

3. **Local Server (Recommended)**:
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js (if you have http-server installed)
   npx http-server
   
   # Using PHP
   php -S localhost:8000
   ```
   Then navigate to `http://localhost:8000`

## Usage

### Login Page
- Click "Login with Discord" to simulate Discord OAuth authentication
- Automatically redirects to the dashboard after a simulated login process

### Dashboard Navigation
- **Dashboard**: Overview with wallet balances, quick actions, recent orders, and transactions
- **Marketplace**: Browse WoW services (implementation in progress)
- **My Orders**: Track service orders and progress (implementation in progress)
- **Wallet**: Manage multi-currency wallet with deposit, withdraw, and convert features
- **Shop**: Purchase WoW game time (implementation in progress)
- **Profile**: Account settings and preferences (implementation in progress)
- **Help & Support**: Support and help resources (implementation in progress)

### Wallet Features (Implemented)
- **Deposit**: Add funds using Credit Card, Crypto, or Iranian Bank Card
- **Withdraw**: Request withdrawals (requires admin approval simulation)
- **Convert**: Exchange between Gold, USD, and Toman currencies
- **Real-time Balance Updates**: See changes reflected immediately

### Responsive Design
- **Mobile**: Collapsible sidebar navigation, touch-friendly interface
- **Tablet**: Adaptive layout with medium screen optimizations
- **Desktop**: Full sidebar, multi-column layouts, enhanced features

## Technical Details

### Technologies Used
- **HTML5**: Semantic markup and modern web standards
- **CSS3**: CSS Grid, Flexbox, CSS Variables, and animations
- **Vanilla JavaScript**: No frameworks, pure JavaScript functionality
- **Font Awesome**: Icons and visual elements
- **Google Fonts**: Inter and Orbitron font families

### Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

### Performance Features
- Optimized CSS with efficient selectors
- Minimal JavaScript for fast loading
- Responsive images and assets
- Smooth animations with CSS transitions

## Mock Data

The prototype includes comprehensive mock data:

- **User Profile**: Discord integration with realistic user data
- **Wallet Balances**: Multi-currency with exchange rates
- **Services**: WoW-specific services (Mythic+, Raids, Leveling, Delves)
- **Orders**: Complete order workflow with status tracking
- **Transactions**: Deposit, withdrawal, conversion, and purchase history
- **Shop Products**: WoW game time packages

## Customization

### Colors and Theming
Edit CSS variables in `css/main.css`:
```css
:root {
  --discord-blue: #5865F2;
  --gaming-purple: #6441A4;
  --gold-color: #FFD700;
  /* ... more variables */
}
```

### Mock Data
Modify `js/data.js` to change:
- User profiles and avatars
- Service offerings and prices
- Wallet balances and exchange rates
- Order statuses and progress

### Layout and Components
- `css/components.css`: Modify component styles
- `css/responsive.css`: Adjust responsive breakpoints
- `js/main.js`: Update navigation and page loading logic

## Future Implementation

This prototype serves as the foundation for:
1. Backend API integration
2. Real Discord OAuth implementation
3. Payment gateway integration
4. Real-time order tracking
5. Admin dashboard integration
6. Database connectivity

## Development Notes

- All functionality is currently simulated with mock data
- Local storage is used to maintain state between page refreshes
- Toast notifications provide user feedback
- Form validation ensures data integrity
- Loading states enhance user experience

## Support

For questions or issues with this prototype:
1. Check the browser console for any JavaScript errors
2. Ensure all files are properly served (use a local server)
3. Verify that Font Awesome and Google Fonts are loading correctly
4. Test responsive design using browser developer tools

---

**Note**: This is a UI/UX prototype for demonstration purposes. All data is simulated and no real transactions or Discord authentication occur.