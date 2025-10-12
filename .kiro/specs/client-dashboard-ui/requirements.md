# Requirements Document

## Introduction

This specification defines the requirements for a beautiful, responsive UI/UX prototype of the client dashboard for the gaming services marketplace platform. The client dashboard serves as the primary interface for buyers (clients) to browse and purchase game boosting services, manage their multi-currency wallet, track orders, and access the shop for game time purchases. This prototype will be built using HTML, CSS, and JavaScript without backend integration, focusing purely on the user interface and user experience.

## Requirements

### Requirement 1

**User Story:** As a client, I want to see a modern and intuitive dashboard homepage, so that I can quickly access all key features and get an overview of my account status.

#### Acceptance Criteria

1. WHEN I access the dashboard THEN the system SHALL display a clean, modern homepage with navigation sidebar
2. WHEN I view the homepage THEN the system SHALL show my wallet balances for all three currencies (Gold, USD, Toman)
3. WHEN I view the homepage THEN the system SHALL display recent orders (last 5) with status indicators
4. WHEN I view the homepage THEN the system SHALL show recent transactions (last 5) with type and amount
5. WHEN I view the homepage THEN the system SHALL include quick action buttons for Deposit, Withdraw, and Convert currencies

### Requirement 2

**User Story:** As a client, I want to browse available World of Warcraft services including Mythic+, Raids, Leveling, Delves, and Custom boosts, so that I can purchase the specific gaming services I need.

#### Acceptance Criteria

1. WHEN I access the marketplace THEN the system SHALL display World of Warcraft services in categories: Mythic+ Dungeons, Raids, Leveling, Delves, and Custom Boosts
2. WHEN I view services THEN the system SHALL show service title, description, price in all three currencies (Gold, USD, Toman), estimated completion time, and seller rating
3. WHEN I filter services THEN the system SHALL allow filtering by service type (Mythic+, Raids, Leveling, Delves, Custom), price range, and completion time
4. WHEN I view Mythic+ services THEN the system SHALL display key level (e.g., "+20 Mythic Dungeon"), dungeon name, and completion guarantees
5. WHEN I view Raid services THEN the system SHALL show raid name, difficulty level, loot options, and available slots for booking
6. WHEN I search THEN the system SHALL provide real-time search across service titles, descriptions, and game content names

### Requirement 3

**User Story:** As a client, I want to manage my multi-currency wallet (Gold, USD, Toman) with instant deposits and admin-approved withdrawals, so that I can handle my finances according to the platform's security model.

#### Acceptance Criteria

1. WHEN I access the wallet page THEN the system SHALL display current balances for Gold, USD, and Toman with conversion rates (1 Gold = 0.10 USD, 1 USD = 50,000 Toman)
2. WHEN I initiate a deposit THEN the system SHALL show "INSTANT" processing and payment methods (Credit Card, Crypto Wallet, Iranian Bank Card)
3. WHEN I request a withdrawal THEN the system SHALL show "REQUIRES ADMIN APPROVAL" status and create pending withdrawal request
4. WHEN I convert currencies THEN the system SHALL process conversion instantly using current exchange rates without admin approval
5. WHEN I view transaction history THEN the system SHALL show transaction types (Deposit-Completed, Withdrawal-Pending, Conversion-Completed, Purchase, Refund, Earning)

### Requirement 4

**User Story:** As a client, I want to track my orders through the complete workflow (Pending → Assigned → In Progress → Evidence Submitted → Completed), so that I can monitor the services I've purchased.

#### Acceptance Criteria

1. WHEN I access my orders THEN the system SHALL display orders with status badges (Pending, Assigned, In Progress, Evidence Submitted, Under Review, Completed, Rejected)
2. WHEN I view order details THEN the system SHALL show service information, assigned booster's Discord username and avatar, and current progress
3. WHEN an order is "In Progress" THEN the system SHALL display booster information and estimated completion time
4. WHEN an order is "Evidence Submitted" THEN the system SHALL show "Awaiting Review" status and reviewer information
5. WHEN an order is "Completed" THEN the system SHALL show completion evidence/screenshots and allow rating the booster

### Requirement 5

**User Story:** As a client, I want to purchase WoW game time (30, 60, 90 days) from the shop with dual payment options, so that I can extend my subscription alongside buying services.

#### Acceptance Criteria

1. WHEN I access the shop THEN the system SHALL display WoW game time products (30, 60, 90 days) with prices in Gold, USD, and Toman
2. WHEN I select a product THEN the system SHALL show two payment options: "Pay from Wallet" and "Pay Online"
3. WHEN I choose "Pay from Wallet" THEN the system SHALL check my balance, allow currency selection, and deduct from my wallet
4. WHEN I choose "Pay Online" THEN the system SHALL show payment gateway options (Credit Card, Crypto, Iranian Bank Card)
5. WHEN purchase is complete THEN the system SHALL display game time code and send it via email simulation

### Requirement 6

**User Story:** As a client, I want to manage my profile and account settings, so that I can keep my information up to date and configure preferences.

#### Acceptance Criteria

1. WHEN I access profile settings THEN the system SHALL display personal information form with Discord integration
2. WHEN I view security settings THEN the system SHALL show login history and session management
3. WHEN I configure preferences THEN the system SHALL allow setting preferred currency and notification preferences
4. WHEN I manage payment methods THEN the system SHALL display saved payment methods with add/remove functionality
5. WHEN I update information THEN the system SHALL provide form validation and success feedback

### Requirement 7

**User Story:** As a client, I want the interface to be responsive and work well on all devices, so that I can access the platform from desktop, tablet, or mobile.

#### Acceptance Criteria

1. WHEN I access the dashboard on desktop THEN the system SHALL display full sidebar navigation and multi-column layout
2. WHEN I access the dashboard on tablet THEN the system SHALL adapt to medium screen with collapsible sidebar
3. WHEN I access the dashboard on mobile THEN the system SHALL show mobile-optimized navigation and single-column layout
4. WHEN I interact with elements THEN the system SHALL provide touch-friendly buttons and inputs on mobile devices
5. WHEN I view content THEN the system SHALL maintain readability and usability across all screen sizes

### Requirement 8

**User Story:** As a client, I want to see Discord OAuth integration throughout the interface with proper branding, so that I feel connected to the gaming community and trust the platform's authentication system.

#### Acceptance Criteria

1. WHEN I access the login page THEN the system SHALL display "Login with Discord" button with Discord logo and branding
2. WHEN I am logged in THEN the system SHALL show my Discord username (e.g., "JohnDoe#1234") and Discord avatar in the header
3. WHEN I view boosters or service providers THEN the system SHALL display their Discord usernames and avatars
4. WHEN I view my profile THEN the system SHALL show Discord account information and connection status
5. WHEN I interact with the platform THEN the system SHALL use Discord's color palette (#5865F2) for accent colors and maintain gaming-focused design language

### Requirement 9

**User Story:** As a client, I want to see example data that reflects the World of Warcraft gaming context, so that I can understand how the platform works with real gaming scenarios.

#### Acceptance Criteria

1. WHEN I view services THEN the system SHALL display realistic WoW service examples (e.g., "Mythic+20 Necrotic Wake", "Heroic Vault of the Incarnates Full Clear", "1-80 Leveling Boost")
2. WHEN I view prices THEN the system SHALL show realistic pricing (e.g., 500 Gold, $50 USD, 2,500,000 Toman for Mythic+20)
3. WHEN I view boosters THEN the system SHALL display gaming-appropriate usernames and Discord handles
4. WHEN I view transaction history THEN the system SHALL show realistic gaming transaction examples
5. WHEN I view the shop THEN the system SHALL display actual WoW game time products (30 Days: 500G/$15/750,000 Toman)