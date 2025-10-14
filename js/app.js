/**
 * Main Application Controller for Service Provider Dashboard
 * Handles initialization, routing, and core functionality
 */

class DashboardApp {
    constructor() {
        this.initialized = false;
        this.currentView = null;
        this.mobileNavOpen = false;
        
        // Bind methods
        this.init = this.init.bind(this);
        this.handleRoleTabClick = this.handleRoleTabClick.bind(this);
        this.handleWorkspaceSwitch = this.handleWorkspaceSwitch.bind(this);
        this.handleSidebarClick = this.handleSidebarClick.bind(this);
        this.handleMobileNavToggle = this.handleMobileNavToggle.bind(this);
        this.renderSidebar = this.renderSidebar.bind(this);
        this.renderMainContent = this.renderMainContent.bind(this);
        
        // Role-based navigation configuration
        this.navigationConfig = {
            advertiser: {
                personal: [
                    { id: 'dashboard', icon: '🏠', label: 'Dashboard Home' },
                    { id: 'services', icon: '📝', label: 'My Services' },
                    { id: 'raids', icon: '🏰', label: 'Raid Booking' },
                    { id: 'orders', icon: '📦', label: 'My Orders' },
                    { id: 'earnings', icon: '💰', label: 'Earnings' },
                    { id: 'wallet', icon: '💳', label: 'Wallet' }
                ],
                team: [
                    { id: 'dashboard', icon: '🏠', label: 'Dashboard Home' },
                    { id: 'services', icon: '📝', label: 'My Services' },
                    { id: 'raids', icon: '🏰', label: 'Raid Booking' },
                    { id: 'orders', icon: '📦', label: 'My Orders' },
                    { id: 'earnings', icon: '💰', label: 'Earnings' },
                    { id: 'wallet', icon: '💳', label: 'Wallet' }
                ]
            },
            team_advertiser: {
                personal: [
                    { id: 'dashboard', icon: '🏠', label: 'Dashboard Home' },
                    { id: 'services', icon: '📝', label: 'My Services' },
                    { id: 'raids', icon: '🏰', label: 'Raid Booking' },
                    { id: 'orders', icon: '📦', label: 'My Orders' },
                    { id: 'earnings', icon: '💰', label: 'Earnings' },
                    { id: 'wallet', icon: '💳', label: 'Wallet' }
                ],
                team: [
                    { id: 'dashboard', icon: '🏠', label: 'Team Dashboard' },
                    { id: 'services', icon: '📝', label: 'Team Services' },
                    { id: 'raids', icon: '🏰', label: 'Team Raids' },
                    { id: 'orders', icon: '📦', label: 'Team Orders' },
                    { id: 'team', icon: '🏢', label: 'Team Management' },
                    { id: 'analytics', icon: '📊', label: 'Team Analytics' },
                    { id: 'earnings', icon: '💰', label: 'Team Earnings' },
                    { id: 'wallet', icon: '💳', label: 'Wallet' }
                ]
            },
            booster: {
                personal: [
                    { id: 'dashboard', icon: '🏠', label: 'Dashboard Home' },
                    { id: 'orders', icon: '📋', label: 'Assigned Orders' },
                    { id: 'earnings', icon: '💰', label: 'My Earnings' },
                    { id: 'profile', icon: '👤', label: 'Profile' },
                    { id: 'wallet', icon: '💳', label: 'Wallet' }
                ],
                team: [
                    { id: 'dashboard', icon: '🏠', label: 'Dashboard Home' },
                    { id: 'orders', icon: '📋', label: 'Assigned Orders' },
                    { id: 'earnings', icon: '💰', label: 'My Earnings' },
                    { id: 'profile', icon: '👤', label: 'Profile' },
                    { id: 'wallet', icon: '💳', label: 'Wallet' }
                ]
            }
        };
    }

    /**
     * Initialize the application
     */
    async init() {
        if (this.initialized) return;

        try {
            // Set up event listeners
            this.setupEventListeners();
            
            // Set up state subscriptions
            this.setupStateSubscriptions();
            
            // Initialize UI based on current state
            this.initializeUI();
            
            // Create mobile navigation toggle
            this.createMobileNavToggle();
            
            // Initialize managers
            await this.initializeManagers();
            
            // Mark as initialized
            this.initialized = true;
            
            console.log('Dashboard application initialized successfully');
            
            // Show welcome notification
            Components.showNotification({
                type: 'success',
                title: 'Welcome!',
                message: 'Dashboard loaded successfully',
                duration: 3000
            });
            
        } catch (error) {
            console.error('Failed to initialize dashboard:', error);
            Components.showNotification({
                type: 'error',
                title: 'Initialization Error',
                message: 'Failed to load dashboard. Please refresh the page.',
                duration: 0
            });
        }
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Role tab clicks - use direct event binding
        document.querySelectorAll('.role-tab').forEach(tab => {
            tab.addEventListener('click', this.handleRoleTabClick);
        });
        
        // Workspace switcher clicks - use direct event binding
        document.querySelectorAll('.workspace-btn').forEach(btn => {
            btn.addEventListener('click', this.handleWorkspaceSwitch);
        });
        
        // Sidebar clicks - use event delegation since sidebar items are dynamic
        document.addEventListener('click', (e) => {
            const sidebarItem = e.target.closest('.sidebar-item');
            if (sidebarItem) {
                this.handleSidebarClick(e);
            }
        });
        
        // Modal overlay clicks (close modal when clicking outside)
        Utils.Events.on('#modalOverlay', 'click', (e) => {
            if (e.target === e.currentTarget) {
                Components.closeModal();
            }
        });
        
        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                Components.closeModal();
            }
        });
        
        // Keyboard navigation for role tabs
        document.querySelectorAll('.role-tab').forEach(tab => {
            tab.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.handleRoleTabClick(e);
                } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                    e.preventDefault();
                    this.handleRoleTabNavigation(e);
                }
            });
        });
        
        // Keyboard navigation for workspace switcher
        document.querySelectorAll('.workspace-btn').forEach(btn => {
            btn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.handleWorkspaceSwitch(e);
                } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                    e.preventDefault();
                    this.handleWorkspaceNavigation(e);
                }
            });
        });
        
        // Window resize handler
        window.addEventListener('resize', Utils.Events.debounce(() => {
            this.handleWindowResize();
        }, 250));
        
        // Handle browser back/forward
        window.addEventListener('popstate', (e) => {
            this.handlePopState(e);
        });
    }

    /**
     * Set up state subscriptions
     */
    setupStateSubscriptions() {
        // Subscribe to UI state changes
        AppState.subscribe('ui.activeRole', (newRole) => {
            this.handleRoleChange(newRole);
        });
        
        AppState.subscribe('ui.activeSidebarItem', (newItem) => {
            this.handleSidebarItemChange(newItem);
        });
        
        AppState.subscribe('ui.workspaceType', (newWorkspace) => {
            this.handleWorkspaceChange(newWorkspace);
        });
        
        AppState.subscribe('ui.notifications', (notifications) => {
            this.handleNotificationsChange(notifications);
        });
    }

    /**
     * Initialize UI based on current state
     */
    initializeUI() {
        const activeRole = AppState.getState('ui.activeRole');
        const activeSidebarItem = AppState.getState('ui.activeSidebarItem');
        const workspaceType = AppState.getState('ui.workspaceType');
        
        // Update role tabs
        this.updateRoleTabs(activeRole);
        
        // Update workspace switcher
        this.updateWorkspaceSwitcher(workspaceType);
        
        // Render sidebar
        this.renderSidebar(activeRole);
        
        // Render main content
        this.renderMainContent(activeRole, activeSidebarItem);
        
        // Update page title
        this.updatePageTitle(activeRole, activeSidebarItem);
    }

    /**
     * Handle role tab clicks
     */
    handleRoleTabClick(e) {
        const roleTab = e.currentTarget || e.target.closest('.role-tab');
        const role = roleTab ? roleTab.dataset.role : null;
        
        if (role && roleTab && AppState.hasRole(role)) {
            // Show loading state
            this.showLoading('navigation');
            
            // Update state
            AppState.setState({
                'ui.activeRole': role,
                'ui.activeSidebarItem': 'dashboard' // Reset to dashboard when switching roles
            });
            
            // Show success notification
            Components.showNotification({
                type: 'success',
                title: 'Role Switched',
                message: `Switched to ${this.getRoleDisplayName(role)} dashboard`,
                duration: 2000
            });
            
            // Hide loading state
            setTimeout(() => {
                this.hideLoading('navigation');
            }, 300);
        } else {
            // Show error if user doesn't have role
            Components.showNotification({
                type: 'error',
                title: 'Access Denied',
                message: `You don't have access to the ${this.getRoleDisplayName(role)} role`,
                duration: 4000
            });
        }
    }

    /**
     * Handle workspace switcher clicks
     */
    handleWorkspaceSwitch(e) {
        const workspaceBtn = e.currentTarget || e.target.closest('.workspace-btn');
        const workspaceType = workspaceBtn ? workspaceBtn.dataset.workspace : null;
        const currentWorkspace = AppState.getState('ui.workspaceType');
        
        // Don't switch if already in the selected workspace or if no workspace type
        if (!workspaceType || !workspaceBtn || workspaceType === currentWorkspace) {
            return;
        }
        
        // Show loading state
        this.showLoading('workspace');
        
        if (workspaceType === 'team') {
            // Check if user has Team Advertiser role
            if (!AppState.hasRole('team_advertiser')) {
                Components.showNotification({
                    type: 'error',
                    title: 'Access Denied',
                    message: 'You need Team Advertiser role to access team workspace.',
                    duration: 4000
                });
                this.hideLoading('workspace');
                return;
            }
            
            // Check if user has teams
            const teams = AppState.getState('teams');
            if (!teams || teams.size === 0) {
                // Create a mock team for demonstration
                const mockTeam = {
                    id: 'team_demo_123',
                    name: 'Elite Boosters',
                    description: 'Professional WoW boosting team',
                    leaderId: AppState.getState('user.id'),
                    members: [
                        {
                            userId: AppState.getState('user.id'),
                            role: 'leader',
                            status: 'active',
                            joinedAt: new Date().toISOString()
                        }
                    ],
                    isActive: true,
                    createdAt: new Date().toISOString()
                };
                
                // Add mock team to state
                const teamsMap = new Map();
                teamsMap.set(mockTeam.id, mockTeam);
                AppState.setState('teams', teamsMap);
                
                // Switch to the mock team
                AppState.switchWorkspace('team', mockTeam.id, mockTeam.name);
                
                Components.showNotification({
                    type: 'info',
                    title: 'Demo Team Created',
                    message: 'Created a demo team for workspace switching demonstration.',
                    duration: 3000
                });
            } else {
                // Switch to first team (in real app, might show team selector)
                const firstTeam = Array.from(teams.values())[0];
                AppState.switchWorkspace('team', firstTeam.id, firstTeam.name);
                
                Components.showNotification({
                    type: 'success',
                    title: 'Workspace Switched',
                    message: `Switched to team workspace: ${firstTeam.name}`,
                    duration: 2000
                });
            }
        } else {
            // Switch to personal workspace
            const userId = AppState.getState('user.id');
            AppState.switchWorkspace('personal', userId, null);
            
            Components.showNotification({
                type: 'success',
                title: 'Workspace Switched',
                message: 'Switched to personal workspace',
                duration: 2000
            });
        }
        
        // Hide loading state
        setTimeout(() => {
            this.hideLoading('workspace');
        }, 300);
    }

    /**
     * Handle sidebar item clicks
     */
    handleSidebarClick(e) {
        const sidebarItem = e.currentTarget || e.target.closest('.sidebar-item');
        const itemId = sidebarItem ? sidebarItem.dataset.id : null;
        const currentItem = AppState.getState('ui.activeSidebarItem');
        
        if (itemId && sidebarItem && itemId !== currentItem) {
            // Show loading state for content area
            this.showLoading('content');
            
            // Update active sidebar item
            AppState.setState('ui.activeSidebarItem', itemId);
            
            // Hide loading state after content renders
            setTimeout(() => {
                this.hideLoading('content');
            }, 200);
        }
    }

    /**
     * Handle mobile navigation toggle
     */
    handleMobileNavToggle() {
        this.mobileNavOpen = !this.mobileNavOpen;
        const sidebar = Utils.DOM.select('.sidebar');
        
        if (this.mobileNavOpen) {
            Utils.DOM.addClass(sidebar, 'mobile-open');
        } else {
            Utils.DOM.removeClass(sidebar, 'mobile-open');
        }
        
        AppState.setState('ui.isMobileNavOpen', this.mobileNavOpen);
    }

    /**
     * Create mobile navigation toggle button
     */
    createMobileNavToggle() {
        const existingToggle = Utils.DOM.select('.mobile-nav-toggle');
        if (existingToggle) return;
        
        const toggle = Utils.DOM.create('button', {
            className: 'mobile-nav-toggle mobile-only',
            onclick: this.handleMobileNavToggle
        }, '☰');
        
        document.body.appendChild(toggle);
    }

    /**
     * Handle role change
     */
    handleRoleChange(newRole) {
        this.updateRoleTabs(newRole);
        this.renderSidebar(newRole);
        
        const activeSidebarItem = AppState.getState('ui.activeSidebarItem');
        this.renderMainContent(newRole, activeSidebarItem);
        this.updatePageTitle(newRole, activeSidebarItem);
    }

    /**
     * Handle sidebar item change
     */
    handleSidebarItemChange(newItem) {
        this.updateSidebarItems(newItem);
        
        const activeRole = AppState.getState('ui.activeRole');
        this.renderMainContent(activeRole, newItem);
        this.updatePageTitle(activeRole, newItem);
    }

    /**
     * Handle workspace change
     */
    handleWorkspaceChange(newWorkspace) {
        this.updateWorkspaceSwitcher(newWorkspace);
        
        // Re-render sidebar to show workspace-specific navigation
        const activeRole = AppState.getState('ui.activeRole');
        this.renderSidebar(activeRole);
        
        // Refresh current view to reflect workspace change
        const activeSidebarItem = AppState.getState('ui.activeSidebarItem');
        this.renderMainContent(activeRole, activeSidebarItem);
    }

    /**
     * Handle notifications change
     */
    handleNotificationsChange(notifications) {
        // This would update notification display
        // For now, notifications are handled by Components.showNotification
    }

    /**
     * Update role tabs
     */
    updateRoleTabs(activeRole) {
        const roleTabs = Utils.DOM.selectAll('.role-tab');
        const userRoles = AppState.getUserRoles();
        
        roleTabs.forEach(tab => {
            const role = tab.dataset.role;
            
            // Update active state
            if (role === activeRole) {
                Utils.DOM.addClass(tab, 'active');
                tab.setAttribute('aria-selected', 'true');
                tab.setAttribute('tabindex', '0');
            } else {
                Utils.DOM.removeClass(tab, 'active');
                tab.setAttribute('aria-selected', 'false');
                tab.setAttribute('tabindex', '-1');
            }
            
            // Show/hide tabs based on user roles
            if (!userRoles.includes(role)) {
                Utils.DOM.hide(tab);
                tab.setAttribute('aria-hidden', 'true');
                tab.disabled = true;
            } else {
                Utils.DOM.show(tab);
                tab.setAttribute('aria-hidden', 'false');
                tab.disabled = false;
            }
            
            // Add loading state if navigation is loading
            if (AppState.isLoading('navigation')) {
                Utils.DOM.addClass(tab, 'loading');
            } else {
                Utils.DOM.removeClass(tab, 'loading');
            }
        });
    }

    /**
     * Update workspace switcher
     */
    updateWorkspaceSwitcher(activeWorkspace) {
        const workspaceBtns = Utils.DOM.selectAll('.workspace-btn');
        const workspaceSwitcher = Utils.DOM.select('.workspace-switcher');
        const activeRole = AppState.getState('ui.activeRole');
        const workspaceContext = AppState.getWorkspaceContext();
        
        // Update button states
        workspaceBtns.forEach(btn => {
            const workspace = btn.dataset.workspace;
            
            if (workspace === activeWorkspace) {
                Utils.DOM.addClass(btn, 'active');
                btn.setAttribute('aria-pressed', 'true');
            } else {
                Utils.DOM.removeClass(btn, 'active');
                btn.setAttribute('aria-pressed', 'false');
            }
            
            // Add loading state if workspace is loading
            if (AppState.isLoading('workspace')) {
                Utils.DOM.addClass(btn, 'loading');
            } else {
                Utils.DOM.removeClass(btn, 'loading');
            }
            
            // Update button text for team workspace
            if (workspace === 'team' && workspaceContext.type === 'team' && workspaceContext.name) {
                btn.textContent = `Team: ${workspaceContext.name}`;
            } else if (workspace === 'team') {
                btn.textContent = 'Team Workspace';
            } else if (workspace === 'personal') {
                btn.textContent = 'Personal Workspace';
            }
        });
        
        // Show/hide workspace switcher based on role
        if (activeRole === 'team_advertiser' && AppState.hasRole('team_advertiser')) {
            Utils.DOM.show(workspaceSwitcher);
            workspaceSwitcher.setAttribute('aria-hidden', 'false');
        } else {
            Utils.DOM.hide(workspaceSwitcher);
            workspaceSwitcher.setAttribute('aria-hidden', 'true');
        }
    }

    /**
     * Render sidebar navigation
     */
    renderSidebar(activeRole) {
        const sidebarNav = Utils.DOM.select('.sidebar-nav');
        const activeSidebarItem = AppState.getState('ui.activeSidebarItem');
        const workspaceContext = AppState.getWorkspaceContext();
        
        // Clear existing items
        Utils.DOM.empty(sidebarNav);
        
        // Get navigation items for current role
        const navItems = this.getNavigationItemsForRole(activeRole, workspaceContext);
        
        // Add workspace indicator if in team workspace
        if (workspaceContext.type === 'team' && workspaceContext.name) {
            const workspaceIndicator = Utils.DOM.create('div', {
                className: 'workspace-indicator'
            });
            
            const indicatorIcon = Utils.DOM.create('span', {
                className: 'indicator-icon'
            }, '🏢');
            
            const indicatorText = Utils.DOM.create('span', {
                className: 'indicator-text'
            }, workspaceContext.name);
            
            workspaceIndicator.appendChild(indicatorIcon);
            workspaceIndicator.appendChild(indicatorText);
            sidebarNav.appendChild(workspaceIndicator);
            
            // Add separator
            const separator = Utils.DOM.create('div', {
                className: 'sidebar-separator'
            });
            sidebarNav.appendChild(separator);
        }
        
        // Create sidebar items
        navItems.forEach((item, index) => {
            const sidebarItem = Components.createSidebarItem({
                id: item.id,
                icon: item.icon,
                label: item.label,
                active: item.id === activeSidebarItem,
                disabled: false, // Enable all sidebar items for navigation testing
                badge: item.badge || null,
                onClick: (e) => this.handleSidebarClick(e)
            });
            
            // Add keyboard navigation
            sidebarItem.setAttribute('tabindex', '0');
            sidebarItem.setAttribute('role', 'menuitem');
            sidebarItem.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.handleSidebarClick(e);
                }
            });
            
            sidebarNav.appendChild(sidebarItem);
        });
        
        // Set ARIA attributes
        sidebarNav.setAttribute('role', 'menu');
        sidebarNav.setAttribute('aria-label', `${this.getRoleDisplayName(activeRole)} navigation`);
    }

    /**
     * Update sidebar items active state
     */
    updateSidebarItems(activeItem) {
        const sidebarItems = Utils.DOM.selectAll('.sidebar-item');
        sidebarItems.forEach(item => {
            const itemId = item.dataset.id;
            if (itemId === activeItem) {
                Utils.DOM.addClass(item, 'active');
            } else {
                Utils.DOM.removeClass(item, 'active');
            }
        });
    }

    /**
     * Render main content area
     */
    renderMainContent(activeRole, activeSidebarItem) {
        const contentArea = Utils.DOM.select('.content-area');
        
        // Clear existing content
        Utils.DOM.empty(contentArea);
        
        // Create content based on role and sidebar item
        const content = this.createContentForView(activeRole, activeSidebarItem);
        contentArea.appendChild(content);
        
        // Close mobile nav if open
        if (this.mobileNavOpen) {
            this.handleMobileNavToggle();
        }
    }

    /**
     * Create content for specific view
     */
    createContentForView(role, item) {
        const workspaceContext = AppState.getWorkspaceContext();
        const workspaceText = workspaceContext.type === 'team' 
            ? `Team: ${workspaceContext.name}` 
            : 'Personal Workspace';
        
        // For now, create placeholder content
        const content = Utils.DOM.create('div', {
            className: 'view-content'
        });
        
        // Header
        const header = Utils.DOM.create('div', {
            className: 'view-header'
        });
        
        const title = Utils.DOM.create('h1', {}, this.getViewTitle(role, item));
        const subtitle = Utils.DOM.create('p', {
            className: 'text-secondary'
        }, `${this.getRoleDisplayName(role)} • ${workspaceText}`);
        
        header.appendChild(title);
        header.appendChild(subtitle);
        content.appendChild(header);
        
        // Main content
        const main = Utils.DOM.create('div', {
            className: 'view-main'
        });
        
        // Create placeholder content based on view
        const placeholder = this.createPlaceholderContent(role, item);
        main.appendChild(placeholder);
        
        content.appendChild(main);
        
        return content;
    }

    /**
     * Create placeholder content for views
     */
    createPlaceholderContent(role, item) {
        // Handle services view with actual implementation
        if (item === 'services' && (role === 'advertiser' || role === 'team_advertiser')) {
            return this.createServicesView();
        }
        
        // Handle raids view with actual implementation
        if (item === 'raids' && (role === 'advertiser' || role === 'team_advertiser')) {
            return this.createRaidsView();
        }
        
        // Handle orders view with actual implementation
        if (item === 'orders' && (role === 'advertiser' || role === 'team_advertiser')) {
            return this.createOrdersView();
        }
        
        // Handle earnings view with actual implementation
        if (item === 'earnings') {
            return this.createEarningsView();
        }
        
        // Handle team management view with actual implementation
        if (item === 'team' && role === 'team_advertiser') {
            return this.createTeamManagementView();
        }
        
        const placeholder = Utils.DOM.create('div', {
            className: 'placeholder-content'
        });
        
        const card = Components.createCard({
            title: `${this.getViewTitle(role, item)} - Coming Soon`,
            content: `
                <p>This section is under development and will be implemented in future tasks.</p>
                <p><strong>Current View:</strong> ${role} → ${item}</p>
                <p><strong>Features to be implemented:</strong></p>
                <ul>
                    ${this.getFeatureList(role, item).map(feature => `<li>${feature}</li>`).join('')}
                </ul>
            `,
            className: 'placeholder-card'
        });
        
        placeholder.appendChild(card);
        return placeholder;
    }

    /**
     * Create services view
     */
    createServicesView() {
        const container = Utils.DOM.create('div', {
            className: 'services-view'
        });

        // Initialize ServiceManager if not already done
        if (typeof ServiceManager !== 'undefined' && ServiceManager.renderServices) {
            // ServiceManager will render directly to content area
            setTimeout(() => {
                ServiceManager.renderServices();
            }, 0);
            
            // Return loading placeholder
            const loadingCard = Components.createCard({
                title: 'My Services',
                content: '<div class="loading-spinner"></div><p>Loading services...</p>',
                className: 'loading-card'
            });
            container.appendChild(loadingCard);
        } else {
            // Fallback if ServiceManager is not loaded
            const errorCard = Components.createCard({
                title: 'Service Management',
                content: '<p>Service management is loading...</p>',
                className: 'error-card'
            });
            container.appendChild(errorCard);
        }

        return container;
    }

    /**
     * Create raids view
     */
    createRaidsView() {
        const container = Utils.DOM.create('div', {
            className: 'raids-view'
        });

        // Initialize RaidBookingManager if not already done
        if (typeof RaidBookingManager !== 'undefined' && RaidBookingManager_Instance) {
            // Initialize and render raid booking
            RaidBookingManager_Instance.init();
            setTimeout(() => {
                RaidBookingManager_Instance.renderRaidBooking();
            }, 0);
            
            // Return loading placeholder
            const loadingCard = Components.createCard({
                title: 'Raid Booking',
                content: '<div class="loading-spinner"></div><p>Loading raid booking...</p>',
                className: 'loading-card'
            });
            container.appendChild(loadingCard);
        } else {
            // Fallback if RaidBookingManager is not loaded
            const errorCard = Components.createCard({
                title: 'Raid Booking',
                content: '<p>Raid booking is loading...</p>',
                className: 'error-card'
            });
            container.appendChild(errorCard);
        }

        return container;
    }

    /**
     * Create earnings view
     */
    createEarningsView() {
        const container = Utils.DOM.create('div', {
            className: 'earnings-view'
        });

        // Initialize EarningsManager if not already done
        if (typeof EarningsManager !== 'undefined' && EarningsManager_Instance) {
            // Initialize and render earnings
            EarningsManager_Instance.init();
            setTimeout(() => {
                EarningsManager_Instance.renderEarnings();
            }, 0);
            
            // Return loading placeholder
            const loadingCard = Components.createCard({
                title: 'Earnings Dashboard',
                content: '<div class="loading-spinner"></div><p>Loading earnings data...</p>',
                className: 'loading-card'
            });
            container.appendChild(loadingCard);
        } else {
            // Fallback if EarningsManager is not loaded
            const errorCard = Components.createCard({
                title: 'Earnings Dashboard',
                content: '<p>Earnings dashboard is loading...</p>',
                className: 'error-card'
            });
            container.appendChild(errorCard);
        }

        return container;
    }

    /**
     * Create orders view
     */
    createOrdersView() {
        const container = Utils.DOM.create('div', {
            className: 'orders-view'
        });

        // Initialize OrderManager if not already done
        if (typeof OrderManager !== 'undefined' && OrderManager_Instance) {
            // Initialize and render orders
            OrderManager_Instance.init();
            setTimeout(() => {
                OrderManager_Instance.renderOrders();
            }, 0);
            
            // Return loading placeholder
            const loadingCard = Components.createCard({
                title: 'Raid Booking',
                content: '<div class="loading-spinner"></div><p>Loading raid booking system...</p>',
                className: 'loading-card'
            });
            container.appendChild(loadingCard);
        } else {
            // Fallback if RaidBookingManager is not loaded
            const errorCard = Components.createCard({
                title: 'Raid Booking',
                content: '<p>Raid booking system is loading...</p>',
                className: 'error-card'
            });
            container.appendChild(errorCard);
        }

        return container;
    }

    /**
     * Create orders view
     */
    createOrdersView() {
        const container = Utils.DOM.create('div', {
            className: 'orders-view'
        });

        // Initialize OrderManager if not already done
        if (typeof OrderManager !== 'undefined' && OrderManager_Instance) {
            // Render orders management
            setTimeout(() => {
                OrderManager_Instance.renderOrders();
            }, 0);
            
            // Return loading placeholder
            const loadingCard = Components.createCard({
                title: 'Order Management',
                content: '<div class="loading-spinner"></div><p>Loading order management system...</p>',
                className: 'loading-card'
            });
            container.appendChild(loadingCard);
        } else {
            // Fallback if OrderManager is not loaded
            const errorCard = Components.createCard({
                title: 'Order Management',
                content: '<p>Order management system is loading...</p>',
                className: 'error-card'
            });
            container.appendChild(errorCard);
        }

        return container;
    }

    /**
     * Get navigation items for role and workspace
     */
    getNavigationItemsForRole(role, workspaceContext) {
        const roleConfig = this.navigationConfig[role];
        if (!roleConfig) return [];
        
        const workspaceType = workspaceContext.type || 'personal';
        return roleConfig[workspaceType] || roleConfig.personal || [];
    }

    /**
     * Get view title
     */
    getViewTitle(role, item) {
        const workspaceContext = AppState.getWorkspaceContext();
        const navItems = this.getNavigationItemsForRole(role, workspaceContext);
        const navItem = navItems.find(nav => nav.id === item);
        return navItem ? navItem.label : 'Dashboard';
    }

    /**
     * Get role display name
     */
    getRoleDisplayName(role) {
        const roleNames = {
            'advertiser': 'Advertiser',
            'team_advertiser': 'Team Advertiser',
            'booster': 'Booster'
        };
        return roleNames[role] || role;
    }

    /**
     * Get feature list for view
     */
    getFeatureList(role, item) {
        const workspaceContext = AppState.getWorkspaceContext();
        const isTeamWorkspace = workspaceContext.type === 'team';
        
        const features = {
            'advertiser': {
                'dashboard': isTeamWorkspace 
                    ? ['Team service overview', 'Team orders', 'Team earnings summary']
                    : ['Service overview', 'Recent orders', 'Earnings summary'],
                'services': isTeamWorkspace
                    ? ['View team services', 'Collaborate on services', 'Team service analytics']
                    : ['Create services', 'Edit services', 'Service status management'],
                'raids': isTeamWorkspace
                    ? ['Team raid bookings', 'Coordinate team raids', 'Team raid analytics']
                    : ['View available raids', 'Book raid slots', 'Manage bookings'],
                'orders': isTeamWorkspace
                    ? ['Team order management', 'Assign team boosters', 'Team evidence review']
                    : ['Order management', 'Booster assignment', 'Evidence review'],
                'earnings': isTeamWorkspace
                    ? ['Team earnings tracking', 'Member contributions', 'Team analytics']
                    : ['Earnings tracking', 'Payment history', 'Analytics'],
                'wallet': ['Balance management', 'Transactions', 'Payment methods']
            },
            'team_advertiser': {
                'dashboard': isTeamWorkspace
                    ? ['Team dashboard', 'Team performance', 'Team activity']
                    : ['Personal dashboard', 'Individual performance', 'Personal activity'],
                'services': isTeamWorkspace
                    ? ['Team services', 'Collaborative editing', 'Team service management']
                    : ['Personal services', 'Individual service management'],
                'team': ['Team creation', 'Member management', 'Role assignment', 'Team settings'],
                'analytics': ['Team performance', 'Member contributions', 'Earnings distribution', 'Activity logs'],
                'orders': isTeamWorkspace
                    ? ['Team orders', 'Team booster assignment', 'Team evidence review']
                    : ['Personal orders', 'Individual order management'],
                'earnings': isTeamWorkspace
                    ? ['Team earnings', 'Distribution management', 'Team financial analytics']
                    : ['Personal earnings', 'Individual tracking'],
                'wallet': ['Balance management', 'Transactions', 'Payment methods']
            },
            'booster': {
                'dashboard': ['Assigned orders overview', 'Performance metrics', 'Completion stats'],
                'orders': ['Order details', 'Progress tracking', 'Evidence submission', 'Communication'],
                'earnings': ['Earnings history', 'Completion rates', 'Performance stats', 'Payment tracking'],
                'profile': ['Profile management', 'Skills', 'Availability', 'Booster rating'],
                'wallet': ['Balance management', 'Transactions', 'Payment methods']
            }
        };
        
        return features[role]?.[item] || ['Feature implementation pending'];
    }

    /**
     * Update page title
     */
    updatePageTitle(role, item) {
        const viewTitle = this.getViewTitle(role, item);
        const roleTitle = this.getRoleDisplayName(role);
        document.title = `${viewTitle} - ${roleTitle} | Service Provider Dashboard`;
    }

    /**
     * Handle window resize
     */
    handleWindowResize() {
        // Handle responsive behavior
        const isMobile = window.innerWidth < 768;
        
        if (!isMobile && this.mobileNavOpen) {
            this.handleMobileNavToggle();
        }
    }

    /**
     * Handle role tab keyboard navigation
     */
    handleRoleTabNavigation(e) {
        const roleTabs = Utils.DOM.selectAll('.role-tab:not([aria-hidden="true"])');
        const currentIndex = Array.from(roleTabs).findIndex(tab => tab === e.currentTarget);
        let nextIndex;
        
        if (e.key === 'ArrowLeft') {
            nextIndex = currentIndex > 0 ? currentIndex - 1 : roleTabs.length - 1;
        } else if (e.key === 'ArrowRight') {
            nextIndex = currentIndex < roleTabs.length - 1 ? currentIndex + 1 : 0;
        }
        
        if (nextIndex !== undefined && roleTabs[nextIndex]) {
            roleTabs[nextIndex].focus();
        }
    }
    
    /**
     * Handle workspace switcher keyboard navigation
     */
    handleWorkspaceNavigation(e) {
        const workspaceBtns = Utils.DOM.selectAll('.workspace-btn');
        const currentIndex = Array.from(workspaceBtns).findIndex(btn => btn === e.currentTarget);
        let nextIndex;
        
        if (e.key === 'ArrowLeft') {
            nextIndex = currentIndex > 0 ? currentIndex - 1 : workspaceBtns.length - 1;
        } else if (e.key === 'ArrowRight') {
            nextIndex = currentIndex < workspaceBtns.length - 1 ? currentIndex + 1 : 0;
        }
        
        if (nextIndex !== undefined && workspaceBtns[nextIndex]) {
            workspaceBtns[nextIndex].focus();
        }
    }

    /**
     * Handle browser back/forward
     */
    handlePopState(e) {
        // Handle browser navigation
        // This would restore state from URL or history
    }

    /**
     * Show loading state
     */
    showLoading(component = 'global') {
        AppState.setLoading(component, true);
    }

    /**
     * Initialize managers
     */
    async initializeManagers() {
        try {
            // Initialize TeamManager if available
            if (typeof TeamManager !== 'undefined' && TeamManager.init) {
                await TeamManager.init();
            }
        } catch (error) {
            console.warn('Failed to initialize some managers:', error);
        }
    }

    /**
     * Create team management view
     */
    createTeamManagementView() {
        const container = Utils.DOM.create('div', {
            className: 'team-management-view'
        });

        // Initialize TeamManager if not already done
        if (typeof TeamManager !== 'undefined' && TeamManager.renderTeamManagement) {
            // TeamManager will render directly to content area
            setTimeout(() => {
                TeamManager.renderTeamManagement();
            }, 0);
            
            // Return loading placeholder
            const loadingCard = Components.createCard({
                title: 'Team Management',
                content: '<div class="loading-spinner"></div><p>Loading team management...</p>',
                className: 'loading-card'
            });
            container.appendChild(loadingCard);
        } else {
            // Fallback if TeamManager is not loaded
            const errorCard = Components.createCard({
                title: 'Team Management',
                content: '<p>Team management is loading...</p>',
                className: 'error-card'
            });
            container.appendChild(errorCard);
        }

        return container;
    }

    /**
     * Hide loading state
     */
    hideLoading(component = 'global') {
        AppState.setLoading(component, false);
    }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new DashboardApp();
    app.init();
    
    // Make app globally available for debugging
    window.DashboardApp = app;
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        // Page became visible, could refresh data here
        console.log('Page became visible');
    }
});