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
                // Show team selection modal if multiple teams or create team option
                this.showTeamSelectionModal();
            } else {
                // If only one team, switch to it directly
                const teamArray = Array.from(teams.values());
                if (teamArray.length === 1) {
                    const team = teamArray[0];
                    this.switchToTeamWorkspace(team);
                } else {
                    // Multiple teams - show selection modal
                    this.showTeamSelectionModal();
                }
            }
        } else {
            // Switch to personal workspace
            this.switchToPersonalWorkspace();
        }
        
        // Hide loading state
        setTimeout(() => {
            this.hideLoading('workspace');
        }, 300);
    }

    /**
     * Switch to personal workspace
     */
    switchToPersonalWorkspace() {
        const userId = AppState.getState('user.id');
        AppState.switchWorkspace('personal', userId, null);
        
        // Update workspace-specific data
        this.updateWorkspaceData('personal');
        
        Components.showNotification({
            type: 'success',
            title: 'Workspace Switched',
            message: 'Switched to personal workspace',
            duration: 2000
        });
    }

    /**
     * Switch to team workspace
     */
    switchToTeamWorkspace(team) {
        AppState.switchWorkspace('team', team.id, team.name);
        
        // Update workspace-specific data
        this.updateWorkspaceData('team', team);
        
        Components.showNotification({
            type: 'success',
            title: 'Workspace Switched',
            message: `Switched to team workspace: ${team.name}`,
            duration: 2000
        });
    }

    /**
     * Show team selection modal
     */
    showTeamSelectionModal() {
        const teams = AppState.getState('teams');
        const teamArray = Array.from(teams.values());
        
        if (teamArray.length === 0) {
            // No teams - offer to create one
            this.showCreateTeamForWorkspaceModal();
            return;
        }

        const modalContent = Utils.DOM.create('div', {
            className: 'team-selection-modal'
        });

        const title = Utils.DOM.create('h3', {
            className: 'modal-section-title'
        }, 'Select Team Workspace');

        const description = Utils.DOM.create('p', {
            className: 'text-secondary'
        }, 'Choose which team workspace you want to switch to:');

        const teamList = Utils.DOM.create('div', {
            className: 'team-selection-list'
        });

        teamArray.forEach(team => {
            const teamOption = Utils.DOM.create('div', {
                className: 'team-option',
                onclick: () => {
                    Components.closeModal();
                    this.switchToTeamWorkspace(team);
                }
            });

            teamOption.innerHTML = `
                <div class="team-option-info">
                    <h4 class="team-option-name">${team.name}</h4>
                    <p class="team-option-description">${team.description || 'No description'}</p>
                    <div class="team-option-stats">
                        <span class="stat-item">${team.members?.length || 0} members</span>
                        <span class="stat-item">Created ${this.formatDate(team.createdAt)}</span>
                    </div>
                </div>
                <div class="team-option-action">
                    <span class="btn-icon">→</span>
                </div>
            `;

            teamList.appendChild(teamOption);
        });

        modalContent.appendChild(title);
        modalContent.appendChild(description);
        modalContent.appendChild(teamList);

        Components.showModal({
            title: 'Switch to Team Workspace',
            content: modalContent,
            size: 'medium',
            footer: [
                Components.createButton({
                    text: 'Cancel',
                    variant: 'secondary',
                    onClick: () => Components.closeModal()
                }),
                Components.createButton({
                    text: 'Create New Team',
                    variant: 'primary',
                    onClick: () => {
                        Components.closeModal();
                        this.showCreateTeamForWorkspaceModal();
                    }
                })
            ]
        });
    }

    /**
     * Show create team modal for workspace switching
     */
    showCreateTeamForWorkspaceModal() {
        const modalContent = Utils.DOM.create('div', {
            className: 'create-team-workspace-modal'
        });

        modalContent.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🏢</div>
                <h3 class="empty-state-title">No Teams Available</h3>
                <p class="empty-state-message">
                    You need to create or join a team to access team workspace features.
                    Team workspaces allow collaborative service management with shared earnings.
                </p>
            </div>
            <div class="team-benefits">
                <h4>Team Workspace Benefits:</h4>
                <ul>
                    <li>Collaborative service creation and management</li>
                    <li>Shared order processing and booster assignment</li>
                    <li>Centralized earnings management</li>
                    <li>Team analytics and performance tracking</li>
                    <li>Activity logging and member coordination</li>
                </ul>
            </div>
        `;

        Components.showModal({
            title: 'Create Team for Workspace',
            content: modalContent,
            size: 'medium',
            footer: [
                Components.createButton({
                    text: 'Cancel',
                    variant: 'secondary',
                    onClick: () => Components.closeModal()
                }),
                Components.createButton({
                    text: 'Create Demo Team',
                    variant: 'primary',
                    onClick: () => {
                        Components.closeModal();
                        this.createDemoTeam();
                    }
                })
            ]
        });
    }

    /**
     * Create demo team for workspace switching
     */
    createDemoTeam() {
        const mockTeam = {
            id: 'team_demo_' + Date.now(),
            name: 'Elite Boosters',
            description: 'Professional WoW boosting team for demonstration',
            leaderId: AppState.getState('user.id'),
            members: [
                {
                    userId: AppState.getState('user.id'),
                    discordUsername: AppState.getState('user.discordUsername'),
                    discordAvatarUrl: AppState.getState('user.discordAvatarUrl'),
                    role: 'leader',
                    status: 'active',
                    joinedAt: new Date().toISOString(),
                    contributionStats: {
                        servicesCreated: 5,
                        ordersGenerated: 23,
                        totalEarnings: 1250.00
                    }
                }
            ],
            settings: {
                autoApproveMembers: false,
                allowMemberInvites: true,
                requireApprovalForServices: false,
                earningsDistribution: 'leader_wallet'
            },
            stats: {
                totalMembers: 1,
                totalServices: 5,
                totalOrders: 23,
                totalEarnings: 1250.00
            },
            isActive: true,
            createdAt: new Date().toISOString()
        };
        
        // Add mock team to state
        const teams = AppState.getState('teams') || new Map();
        teams.set(mockTeam.id, mockTeam);
        AppState.setState('teams', teams);
        
        // Switch to the new team workspace
        this.switchToTeamWorkspace(mockTeam);
        
        Components.showNotification({
            type: 'success',
            title: 'Demo Team Created',
            message: 'Created demo team "Elite Boosters" and switched to team workspace.',
            duration: 3000
        });
    }

    /**
     * Update workspace-specific data
     */
    updateWorkspaceData(workspaceType, team = null) {
        // Filter services based on workspace
        this.filterServicesForWorkspace(workspaceType, team);
        
        // Filter orders based on workspace
        this.filterOrdersForWorkspace(workspaceType, team);
        
        // Update navigation context
        this.updateNavigationForWorkspace(workspaceType, team);
    }

    /**
     * Filter services for current workspace
     */
    filterServicesForWorkspace(workspaceType, team = null) {
        const allServices = MockDataAPI.getAllServices();
        let filteredServices;

        if (workspaceType === 'team' && team) {
            // Show team services (services created by team members)
            filteredServices = allServices.filter(service => 
                service.workspaceType === 'team' && service.workspaceOwnerId === team.id
            );
        } else {
            // Show personal services
            const userId = AppState.getState('user.id');
            filteredServices = allServices.filter(service => 
                service.workspaceType === 'personal' && service.createdBy === userId
            );
        }

        // Update services in state
        const servicesMap = new Map();
        filteredServices.forEach(service => {
            servicesMap.set(service.id, service);
        });
        AppState.setState('services', servicesMap);
    }

    /**
     * Filter orders for current workspace
     */
    filterOrdersForWorkspace(workspaceType, team = null) {
        const allOrders = MockDataAPI.getAllOrders();
        let filteredOrders;

        if (workspaceType === 'team' && team) {
            // Show team orders (orders for team services)
            const teamServices = MockDataAPI.getAllServices().filter(service => 
                service.workspaceType === 'team' && service.workspaceOwnerId === team.id
            );
            const teamServiceIds = teamServices.map(service => service.id);
            
            filteredOrders = allOrders.filter(order => 
                teamServiceIds.includes(order.serviceId)
            );
        } else {
            // Show personal orders
            const userId = AppState.getState('user.id');
            filteredOrders = allOrders.filter(order => 
                order.advertiserId === userId
            );
        }

        // Update orders in state
        const ordersMap = new Map();
        filteredOrders.forEach(order => {
            ordersMap.set(order.id, order);
        });
        AppState.setState('orders', ordersMap);
    }

    /**
     * Update navigation for workspace context
     */
    updateNavigationForWorkspace(workspaceType, team = null) {
        // This will trigger sidebar re-render through state subscription
        AppState.setState('ui.workspaceContext', {
            type: workspaceType,
            team: team,
            lastUpdated: new Date().toISOString()
        });
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
        
        // Update button states and content
        workspaceBtns.forEach(btn => {
            const workspace = btn.dataset.workspace;
            
            // Clear existing content
            Utils.DOM.empty(btn);
            
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
            
            // Create button content with icons and indicators
            if (workspace === 'team') {
                const teamIcon = Utils.DOM.create('span', {
                    className: 'workspace-icon'
                }, '🏢');
                
                const teamText = Utils.DOM.create('span', {
                    className: 'workspace-text'
                });
                
                if (workspaceContext.type === 'team' && workspaceContext.name) {
                    teamText.textContent = workspaceContext.name;
                    
                    // Add team indicator
                    const teamIndicator = Utils.DOM.create('span', {
                        className: 'workspace-indicator team-indicator'
                    }, '●');
                    btn.appendChild(teamIcon);
                    btn.appendChild(teamText);
                    btn.appendChild(teamIndicator);
                } else {
                    teamText.textContent = 'Team Workspace';
                    btn.appendChild(teamIcon);
                    btn.appendChild(teamText);
                }
                
                // Add team count if available
                const teams = AppState.getState('teams');
                if (teams && teams.size > 0) {
                    const teamCount = Utils.DOM.create('span', {
                        className: 'workspace-badge'
                    }, teams.size.toString());
                    btn.appendChild(teamCount);
                }
                
            } else if (workspace === 'personal') {
                const personalIcon = Utils.DOM.create('span', {
                    className: 'workspace-icon'
                }, '👤');
                
                const personalText = Utils.DOM.create('span', {
                    className: 'workspace-text'
                }, 'Personal');
                
                btn.appendChild(personalIcon);
                btn.appendChild(personalText);
                
                if (activeWorkspace === 'personal') {
                    const personalIndicator = Utils.DOM.create('span', {
                        className: 'workspace-indicator personal-indicator'
                    }, '●');
                    btn.appendChild(personalIndicator);
                }
            }
        });
        
        // Show/hide workspace switcher based on role
        if (activeRole === 'team_advertiser' && AppState.hasRole('team_advertiser')) {
            Utils.DOM.show(workspaceSwitcher);
            workspaceSwitcher.setAttribute('aria-hidden', 'false');
            
            // Add workspace context banner
            this.updateWorkspaceContextBanner();
        } else {
            Utils.DOM.hide(workspaceSwitcher);
            workspaceSwitcher.setAttribute('aria-hidden', 'true');
            
            // Remove workspace context banner
            this.removeWorkspaceContextBanner();
        }
    }

    /**
     * Update workspace context banner
     */
    updateWorkspaceContextBanner() {
        const workspaceContext = AppState.getWorkspaceContext();
        const contentArea = Utils.DOM.select('.content-area');
        
        // Remove existing banner
        const existingBanner = Utils.DOM.select('.workspace-context-banner');
        if (existingBanner) {
            existingBanner.remove();
        }
        
        // Create new banner
        const banner = Utils.DOM.create('div', {
            className: 'workspace-context-banner'
        });
        
        if (workspaceContext.type === 'team' && workspaceContext.name) {
            banner.innerHTML = `
                <div class="banner-content">
                    <div class="banner-icon">🏢</div>
                    <div class="banner-info">
                        <div class="banner-title">Team Workspace</div>
                        <div class="banner-subtitle">${workspaceContext.name}</div>
                    </div>
                    <div class="banner-actions">
                        <button class="banner-action-btn" onclick="app.showTeamQuickActions()" title="Team Actions">
                            ⚙️
                        </button>
                        <button class="banner-action-btn" onclick="app.switchToPersonalWorkspace()" title="Switch to Personal">
                            👤
                        </button>
                    </div>
                </div>
            `;
            Utils.DOM.addClass(banner, 'team-banner');
        } else {
            banner.innerHTML = `
                <div class="banner-content">
                    <div class="banner-icon">👤</div>
                    <div class="banner-info">
                        <div class="banner-title">Personal Workspace</div>
                        <div class="banner-subtitle">Individual service management</div>
                    </div>
                    <div class="banner-actions">
                        <button class="banner-action-btn" onclick="app.showTeamSelectionModal()" title="Switch to Team">
                            🏢
                        </button>
                    </div>
                </div>
            `;
            Utils.DOM.addClass(banner, 'personal-banner');
        }
        
        // Insert banner at the top of content area
        contentArea.insertBefore(banner, contentArea.firstChild);
    }

    /**
     * Remove workspace context banner
     */
    removeWorkspaceContextBanner() {
        const existingBanner = Utils.DOM.select('.workspace-context-banner');
        if (existingBanner) {
            existingBanner.remove();
        }
    }

    /**
     * Show team quick actions menu
     */
    showTeamQuickActions() {
        const workspaceContext = AppState.getWorkspaceContext();
        const teams = AppState.getState('teams');
        const currentTeam = teams?.get(workspaceContext.id);
        
        if (!currentTeam) return;
        
        const modalContent = Utils.DOM.create('div', {
            className: 'team-quick-actions'
        });
        
        modalContent.innerHTML = `
            <div class="quick-actions-header">
                <h3>Team: ${currentTeam.name}</h3>
                <p class="text-secondary">Quick actions for team workspace</p>
            </div>
            <div class="quick-actions-grid">
                <button class="quick-action-item" onclick="Components.closeModal(); app.navigateToTeamManagement();">
                    <div class="action-icon">👥</div>
                    <div class="action-label">Manage Team</div>
                    <div class="action-description">Members, settings, and permissions</div>
                </button>
                <button class="quick-action-item" onclick="Components.closeModal(); app.navigateToTeamAnalytics();">
                    <div class="action-icon">📊</div>
                    <div class="action-label">Team Analytics</div>
                    <div class="action-description">Performance and earnings data</div>
                </button>
                <button class="quick-action-item" onclick="Components.closeModal(); app.navigateToTeamServices();">
                    <div class="action-icon">📝</div>
                    <div class="action-label">Team Services</div>
                    <div class="action-description">Collaborative service management</div>
                </button>
                <button class="quick-action-item" onclick="Components.closeModal(); app.switchToPersonalWorkspace();">
                    <div class="action-icon">👤</div>
                    <div class="action-label">Switch to Personal</div>
                    <div class="action-description">Return to personal workspace</div>
                </button>
            </div>
        `;
        
        Components.showModal({
            title: 'Team Workspace Actions',
            content: modalContent,
            size: 'medium',
            footer: [
                Components.createButton({
                    text: 'Close',
                    variant: 'secondary',
                    onClick: () => Components.closeModal()
                })
            ]
        });
    }

    /**
     * Create workspace indicator for sidebar
     */
    createWorkspaceIndicator(workspaceContext) {
        const workspaceIndicator = Utils.DOM.create('div', {
            className: 'workspace-indicator'
        });
        
        if (workspaceContext.type === 'team' && workspaceContext.name) {
            const indicatorIcon = Utils.DOM.create('span', {
                className: 'indicator-icon team-icon'
            }, '🏢');
            
            const indicatorContent = Utils.DOM.create('div', {
                className: 'indicator-content'
            });
            
            const indicatorTitle = Utils.DOM.create('span', {
                className: 'indicator-title'
            }, 'Team Workspace');
            
            const indicatorText = Utils.DOM.create('span', {
                className: 'indicator-text'
            }, workspaceContext.name);
            
            indicatorContent.appendChild(indicatorTitle);
            indicatorContent.appendChild(indicatorText);
            
            const indicatorActions = Utils.DOM.create('div', {
                className: 'indicator-actions'
            });
            
            const switchBtn = Utils.DOM.create('button', {
                className: 'indicator-action-btn',
                title: 'Switch to Personal Workspace',
                onclick: () => this.switchToPersonalWorkspace()
            }, '👤');
            
            indicatorActions.appendChild(switchBtn);
            
            workspaceIndicator.appendChild(indicatorIcon);
            workspaceIndicator.appendChild(indicatorContent);
            workspaceIndicator.appendChild(indicatorActions);
            
            Utils.DOM.addClass(workspaceIndicator, 'team-workspace');
            
        } else {
            const indicatorIcon = Utils.DOM.create('span', {
                className: 'indicator-icon personal-icon'
            }, '👤');
            
            const indicatorContent = Utils.DOM.create('div', {
                className: 'indicator-content'
            });
            
            const indicatorTitle = Utils.DOM.create('span', {
                className: 'indicator-title'
            }, 'Personal Workspace');
            
            const indicatorText = Utils.DOM.create('span', {
                className: 'indicator-text'
            }, 'Individual service management');
            
            indicatorContent.appendChild(indicatorTitle);
            indicatorContent.appendChild(indicatorText);
            
            // Only show team switch button if user has team advertiser role
            if (AppState.hasRole('team_advertiser')) {
                const indicatorActions = Utils.DOM.create('div', {
                    className: 'indicator-actions'
                });
                
                const switchBtn = Utils.DOM.create('button', {
                    className: 'indicator-action-btn',
                    title: 'Switch to Team Workspace',
                    onclick: () => this.showTeamSelectionModal()
                }, '🏢');
                
                indicatorActions.appendChild(switchBtn);
                workspaceIndicator.appendChild(indicatorActions);
            }
            
            workspaceIndicator.appendChild(indicatorIcon);
            workspaceIndicator.appendChild(indicatorContent);
            
            Utils.DOM.addClass(workspaceIndicator, 'personal-workspace');
        }
        
        return workspaceIndicator;
    }

    /**
     * Navigation helper methods
     */
    navigateToTeamManagement() {
        AppState.setState('ui.activeSidebarItem', 'team');
    }

    navigateToTeamAnalytics() {
        AppState.setState('ui.activeSidebarItem', 'analytics');
    }

    navigateToTeamServices() {
        AppState.setState('ui.activeSidebarItem', 'services');
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
        
        // Add workspace indicator
        const workspaceIndicator = this.createWorkspaceIndicator(workspaceContext);
        if (workspaceIndicator) {
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
        
        // Handle team analytics view with actual implementation
        if (item === 'analytics' && role === 'team_advertiser') {
            return this.createTeamAnalyticsView();
        }
        
        // Handle booster orders view with actual implementation
        if (item === 'orders' && role === 'booster') {
            return this.createBoosterOrdersView();
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
        let navItems = roleConfig[workspaceType] || roleConfig.personal || [];
        
        // Add workspace-specific badges and indicators
        navItems = navItems.map(item => {
            const enhancedItem = { ...item };
            
            // Add workspace context to labels
            if (workspaceType === 'team' && workspaceContext.name) {
                switch (item.id) {
                    case 'services':
                        enhancedItem.label = 'Team Services';
                        enhancedItem.badge = this.getTeamServiceCount();
                        break;
                    case 'orders':
                        enhancedItem.label = 'Team Orders';
                        enhancedItem.badge = this.getTeamOrderCount();
                        break;
                    case 'earnings':
                        enhancedItem.label = 'Team Earnings';
                        break;
                    case 'dashboard':
                        enhancedItem.label = 'Team Dashboard';
                        break;
                }
            } else {
                // Personal workspace labels
                switch (item.id) {
                    case 'services':
                        enhancedItem.badge = this.getPersonalServiceCount();
                        break;
                    case 'orders':
                        enhancedItem.badge = this.getPersonalOrderCount();
                        break;
                }
            }
            
            return enhancedItem;
        });
        
        return navItems;
    }

    /**
     * Get service count for current workspace
     */
    getTeamServiceCount() {
        const workspaceContext = AppState.getWorkspaceContext();
        if (workspaceContext.type !== 'team') return null;
        
        const services = AppState.getState('services');
        if (!services) return 0;
        
        return Array.from(services.values()).filter(service => 
            service.workspaceType === 'team' && service.workspaceOwnerId === workspaceContext.id
        ).length;
    }

    getPersonalServiceCount() {
        const userId = AppState.getState('user.id');
        const services = AppState.getState('services');
        if (!services) return 0;
        
        return Array.from(services.values()).filter(service => 
            service.workspaceType === 'personal' && service.createdBy === userId
        ).length;
    }

    /**
     * Get order count for current workspace
     */
    getTeamOrderCount() {
        const workspaceContext = AppState.getWorkspaceContext();
        if (workspaceContext.type !== 'team') return null;
        
        const orders = AppState.getState('orders');
        if (!orders) return 0;
        
        // Get team services first
        const services = AppState.getState('services');
        const teamServiceIds = Array.from(services.values())
            .filter(service => service.workspaceType === 'team' && service.workspaceOwnerId === workspaceContext.id)
            .map(service => service.id);
        
        return Array.from(orders.values()).filter(order => 
            teamServiceIds.includes(order.serviceId)
        ).length;
    }

    getPersonalOrderCount() {
        const userId = AppState.getState('user.id');
        const orders = AppState.getState('orders');
        if (!orders) return 0;
        
        return Array.from(orders.values()).filter(order => 
            order.advertiserId === userId
        ).length;
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
        // Initialize team collaboration system
        if (window.TeamCollaboration_Instance) {
            await window.TeamCollaboration_Instance.init();
        }
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
     * Create team analytics view
     */
    createTeamAnalyticsView() {
        const container = Utils.DOM.create('div', {
            className: 'team-analytics-view'
        });

        // Initialize TeamAnalytics if not already done
        if (typeof TeamAnalytics !== 'undefined' && TeamAnalytics_Instance) {
            // Initialize and render team analytics
            TeamAnalytics_Instance.init();
            setTimeout(() => {
                TeamAnalytics_Instance.renderTeamAnalytics();
            }, 0);
            
            // Return loading placeholder
            const loadingCard = Components.createCard({
                title: 'Team Analytics',
                content: '<div class="loading-spinner"></div><p>Loading team analytics dashboard...</p>',
                className: 'loading-card'
            });
            container.appendChild(loadingCard);
        } else {
            // Fallback if TeamAnalytics is not loaded
            const errorCard = Components.createCard({
                title: 'Team Analytics',
                content: '<p>Team analytics dashboard is loading...</p>',
                className: 'error-card'
            });
            container.appendChild(errorCard);
        }

        return container;
    }

    /**
     * Create booster orders view
     */
    createBoosterOrdersView() {
        const container = Utils.DOM.create('div', {
            className: 'booster-orders-view'
        });

        // Initialize BoosterOrdersManager if not already done
        if (typeof BoosterOrdersManager !== 'undefined') {
            // Create instance and render booster orders
            const boosterOrdersManager = new BoosterOrdersManager();
            setTimeout(() => {
                boosterOrdersManager.renderBoosterOrders();
            }, 0);
            
            // Return loading placeholder
            const loadingCard = Components.createCard({
                title: 'Assigned Orders',
                content: '<div class="loading-spinner"></div><p>Loading assigned orders...</p>',
                className: 'loading-card'
            });
            container.appendChild(loadingCard);
        } else {
            // Fallback if BoosterOrdersManager is not loaded
            const errorCard = Components.createCard({
                title: 'Assigned Orders',
                content: '<p>Booster orders management is loading...</p>',
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
    
    // Make app globally available for onclick handlers
    window.app = app;
    
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