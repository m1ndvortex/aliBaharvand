# Requirements Document

## Introduction

This document outlines the requirements for a Service Provider Dashboard prototype for a gaming services marketplace. The dashboard serves users with Booster, Advertiser, and Team Advertiser roles, providing comprehensive service management, order tracking, team collaboration, and earnings management. The prototype will be built using HTML, CSS, and JavaScript with a Discord-inspired dark theme design and will include mock data for demonstration purposes.

The system supports multiple user roles simultaneously, workspace switching between personal and team contexts, comprehensive order management with evidence submission, and a multi-currency wallet system. All features from the complete system documentation must be implemented with perfect detail and functionality.

## Requirements

### Requirement 1

**User Story:** As a user with multiple roles (Booster, Advertiser, Team Advertiser), I want to access role-specific dashboard tabs, so that I can manage different aspects of my gaming services business.

#### Acceptance Criteria

1. WHEN a user has Advertiser role THEN the system SHALL display an "Advertiser" tab in the top navigation
2. WHEN a user has Team Advertiser role THEN the system SHALL display both "Advertiser" and "Team Advertiser" tabs
3. WHEN a user has Booster role THEN the system SHALL display a "Booster" tab
4. WHEN a user clicks on any role tab THEN the system SHALL switch to that role's dashboard view
5. WHEN switching between tabs THEN the system SHALL maintain the current workspace context (personal/team)

### Requirement 2

**User Story:** As an Advertiser, I want to create and manage gaming services (Mythic+, Leveling, Delves, Custom Boosts), so that I can offer services to buyers and earn income.

#### Acceptance Criteria

1. WHEN an Advertiser accesses "My Services" THEN the system SHALL display a list of their personal services
2. WHEN creating a new service THEN the system SHALL allow selection of service types: Mythic+, Leveling, Delves, Custom Boost
3. WHEN creating a new service THEN the system SHALL NOT allow creation of Raid services (Admin only)
4. WHEN creating a service THEN the system SHALL require title, description, and pricing in Gold, USD, and Toman
5. WHEN editing a service THEN the system SHALL allow modification of all service details
6. WHEN activating/deactivating a service THEN the system SHALL update the service status immediately
7. WHEN viewing Raid Booking THEN the system SHALL display admin-created raids available for booking

### Requirement 3

**User Story:** As an Advertiser, I want to manage orders for my services by assigning boosters and reviewing evidence, so that I can ensure quality service delivery.

#### Acceptance Criteria

1. WHEN viewing "My Orders" THEN the system SHALL display all orders for the advertiser's services
2. WHEN an order is pending THEN the system SHALL allow assignment of available boosters
3. WHEN a booster submits evidence THEN the system SHALL notify the advertiser for review
4. WHEN reviewing evidence THEN the system SHALL display uploaded screenshots and completion notes
5. WHEN approving an order THEN the system SHALL release payment to the booster's wallet
6. WHEN rejecting an order THEN the system SHALL require a rejection reason and notify the booster

### Requirement 4

**User Story:** As a Team Advertiser, I want to create and manage teams with workspace switching capabilities, so that I can collaborate with team members on services.

#### Acceptance Criteria

1. WHEN a Team Advertiser creates a team THEN the system SHALL create a new team with the user as leader
2. WHEN a team exists THEN the system SHALL display workspace switcher buttons: "Personal Workspace" and "Team Workspace"
3. WHEN switching to Team Workspace THEN the system SHALL display team services and collaborative features
4. WHEN in Team Workspace THEN the system SHALL show activity logs of team member actions
5. WHEN team members create services THEN the earnings SHALL go to the team leader's wallet
6. WHEN inviting team members THEN the system SHALL send invitations and track acceptance status

### Requirement 5

**User Story:** As a Team Advertiser, I want to track team performance and member contributions, so that I can manage team productivity effectively.

#### Acceptance Criteria

1. WHEN viewing Team Analytics THEN the system SHALL display total team earnings across all currencies
2. WHEN viewing member contributions THEN the system SHALL show services created and orders generated per member
3. WHEN viewing activity logs THEN the system SHALL display who created, edited, or activated services with timestamps
4. WHEN managing team members THEN the system SHALL allow invitation, removal, and role management
5. WHEN viewing team earnings THEN the system SHALL show earnings breakdown by member contributions

### Requirement 6

**User Story:** As a Booster, I want to manage assigned orders with evidence submission capabilities, so that I can complete services and receive payment.

#### Acceptance Criteria

1. WHEN viewing "Assigned Orders" THEN the system SHALL display all orders assigned to the booster
2. WHEN starting an order THEN the system SHALL change order status to "In Progress"
3. WHEN uploading evidence THEN the system SHALL accept image files (PNG, JPG) and completion notes
4. WHEN submitting evidence THEN the system SHALL change order status to "Evidence Submitted"
5. WHEN evidence is approved THEN the system SHALL add earnings to the booster's wallet
6. WHEN evidence is rejected THEN the system SHALL display rejection reason and allow resubmission

### Requirement 7

**User Story:** As a service provider, I want to manage my multi-currency wallet with deposit, withdrawal, and conversion capabilities, so that I can handle my earnings effectively.

#### Acceptance Criteria

1. WHEN viewing wallet THEN the system SHALL display balances in Gold, USD, and Toman currencies
2. WHEN making a deposit THEN the system SHALL process payment instantly and update balance
3. WHEN requesting withdrawal THEN the system SHALL create a pending request requiring admin approval
4. WHEN converting currencies THEN the system SHALL use current exchange rates and update balances instantly
5. WHEN viewing transaction history THEN the system SHALL display all deposits, withdrawals, conversions, and earnings
6. WHEN managing payment methods THEN the system SHALL allow adding, verifying, and removing payment methods

### Requirement 8

**User Story:** As a user, I want the interface to have a Discord-inspired dark theme design, so that I have a familiar and visually appealing experience.

#### Acceptance Criteria

1. WHEN loading the dashboard THEN the system SHALL use a dark color scheme similar to Discord
2. WHEN displaying navigation elements THEN the system SHALL use Discord-style sidebar and tab designs
3. WHEN showing interactive elements THEN the system SHALL use Discord-inspired buttons, cards, and modals
4. WHEN displaying data tables THEN the system SHALL use dark theme styling with proper contrast
5. WHEN showing notifications THEN the system SHALL use Discord-style notification designs

### Requirement 9

**User Story:** As a prototype user, I want to see realistic mock data throughout the system, so that I can understand how the platform works in practice.

#### Acceptance Criteria

1. WHEN viewing services THEN the system SHALL display mock services with realistic titles, descriptions, and pricing
2. WHEN viewing orders THEN the system SHALL show mock orders with different statuses and realistic details
3. WHEN viewing team members THEN the system SHALL display mock team members with Discord usernames and avatars
4. WHEN viewing wallet transactions THEN the system SHALL show mock transaction history with various types
5. WHEN viewing earnings THEN the system SHALL display mock earnings data across different time periods

### Requirement 10

**User Story:** As a user, I want comprehensive order flow management with evidence review capabilities, so that I can ensure quality service delivery and proper payment processing.

#### Acceptance Criteria

1. WHEN an order progresses through statuses THEN the system SHALL track: Pending → Assigned → In Progress → Evidence Submitted → Under Review → Completed/Rejected
2. WHEN reviewing evidence THEN the system SHALL display uploaded images, completion notes, and order details
3. WHEN approving orders THEN the system SHALL release held payments to appropriate wallets
4. WHEN rejecting orders THEN the system SHALL maintain payment hold and require resubmission
5. WHEN viewing order history THEN the system SHALL show complete audit trail of status changes and actions

### Requirement 11

**User Story:** As a Team Advertiser, I want detailed activity logging and member management, so that I can maintain accountability and team coordination.

#### Acceptance Criteria

1. WHEN team members perform actions THEN the system SHALL log all service creation, editing, and status changes
2. WHEN viewing activity logs THEN the system SHALL display user attribution, timestamps, and change details
3. WHEN managing team members THEN the system SHALL show member roles, join dates, and contribution statistics
4. WHEN removing team members THEN the system SHALL update access permissions immediately
5. WHEN inviting new members THEN the system SHALL track invitation status and acceptance

### Requirement 12

**User Story:** As a service provider, I want comprehensive earnings tracking and analytics, so that I can monitor my business performance.

#### Acceptance Criteria

1. WHEN viewing earnings dashboard THEN the system SHALL display total earnings across all currencies
2. WHEN viewing earnings history THEN the system SHALL show earnings per service and time period
3. WHEN viewing pending earnings THEN the system SHALL display orders awaiting approval
4. WHEN viewing team earnings THEN the system SHALL show individual member contributions and team totals
5. WHEN viewing analytics THEN the system SHALL display completion rates, average earnings, and performance metrics