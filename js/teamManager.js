/**
 * Team Management System for Service Provider Dashboard
 * Handles team creation, member management, and team settings
 */

class TeamManager {
    constructor() {
        this.initialized = false;
        this.currentTeam = null;
        
        // Bind methods
        this.init = this.init.bind(this);
        this.renderTeamManagement = this.renderTeamManagement.bind(this);
        this.showCreateTeamModal = this.showCreateTeamModal.bind(this);
        this.showEditTeamModal = this.showEditTeamModal.bind(this);
        this.showInviteMemberModal = this.showInviteMemberModal.bind(this);
        this.showTeamSettingsModal = this.showTeamSettingsModal.bind(this);
        this.handleCreateTeam = this.handleCreateTeam.bind(this);
        this.handleEditTeam = this.handleEditTeam.bind(this);
        this.handleInviteMember = this.handleInviteMember.bind(this);
        this.handleRemoveMember = this.handleRemoveMember.bind(this);
        this.handleUpdateTeamSettings = this.handleUpdateTeamSettings.bind(this);
    }

    /**
     * Initialize team manager
     */
    async init() {
        if (this.initialized) return;

        try {
            // Load current team data
            await this.loadCurrentTeam();
            
            this.initialized = true;
            console.log('Team Manager initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Team Manager:', error);
            Components.showNotification({
                type: 'error',
                title: 'Initialization Error',
                message: 'Failed to load team management system.',
                duration: 5000
            });
        }
    }

    /**
     * Load current team data
     */
    async loadCurrentTeam() {
        const workspaceContext = AppState.getWorkspaceContext();
        
        if (workspaceContext.type === 'team') {
            const teams = AppState.getState('teams');
            this.currentTeam = teams?.get(workspaceContext.id) || null;
        } else {
            // Check if user has any teams
            const userId = AppState.getState('user.id');
            const teams = AppState.getState('teams');
            
            if (teams && teams.size > 0) {
                // Find team where user is leader
                for (const [teamId, team] of teams) {
                    if (team.leaderId === userId) {
                        this.currentTeam = team;
                        break;
                    }
                }
            }
        }
    }

    /**
     * Render team management interface
     */
    async renderTeamManagement() {
        const contentArea = Utils.DOM.select('.content-area');
        Utils.DOM.empty(contentArea);

        await this.loadCurrentTeam();

        const container = Utils.DOM.create('div', {
            className: 'team-management-container'
        });

        // Header
        const header = this.createTeamManagementHeader();
        container.appendChild(header);

        if (this.currentTeam) {
            // Team exists - show management interface
            const teamInfo = this.createTeamInfoSection();
            const memberManagement = this.createMemberManagementSection();
            const teamSettings = this.createTeamSettingsSection();
            const activityLog = this.createActivityLogSection();

            container.appendChild(teamInfo);
            container.appendChild(memberManagement);
            container.appendChild(teamSettings);
            container.appendChild(activityLog);
        } else {
            // No team - show creation interface
            const createTeamSection = this.createNoTeamSection();
            container.appendChild(createTeamSection);
        }

        contentArea.appendChild(container);
    }

    /**
     * Create team management header
     */
    createTeamManagementHeader() {
        const header = Utils.DOM.create('div', {
            className: 'team-management-header'
        });

        const title = Utils.DOM.create('h1', {
            className: 'page-title'
        }, '🏢 Team Management');

        const subtitle = Utils.DOM.create('p', {
            className: 'page-subtitle'
        }, this.currentTeam 
            ? `Manage your team: ${this.currentTeam.name}`
            : 'Create and manage your team for collaborative service management'
        );

        header.appendChild(title);
        header.appendChild(subtitle);

        return header;
    }

    /**
     * Create no team section
     */
    createNoTeamSection() {
        const section = Utils.DOM.create('div', {
            className: 'no-team-section'
        });

        const card = Components.createCard({
            title: 'Create Your Team',
            content: `
                <div class="empty-state">
                    <div class="empty-state-icon">🏢</div>
                    <h3 class="empty-state-title">No Team Yet</h3>
                    <p class="empty-state-message">
                        Create a team to collaborate with other service providers. 
                        Team members can help manage services, and all earnings will go to your wallet as the team leader.
                    </p>
                </div>
            `,
            className: 'create-team-card'
        });

        const createButton = Components.createButton({
            text: 'Create Team',
            icon: '➕',
            variant: 'primary',
            size: 'lg',
            onClick: this.showCreateTeamModal
        });

        card.querySelector('.card-body').appendChild(createButton);
        section.appendChild(card);

        return section;
    }

    /**
     * Create team info section
     */
    createTeamInfoSection() {
        const section = Utils.DOM.create('div', {
            className: 'team-info-section'
        });

        const actions = [
            Components.createButton({
                text: 'Edit Team',
                icon: '✏️',
                variant: 'secondary',
                size: 'sm',
                onClick: this.showEditTeamModal
            })
        ];

        const card = Components.createCard({
            title: 'Team Information',
            actions: actions,
            content: this.createTeamInfoContent(),
            className: 'team-info-card'
        });

        section.appendChild(card);
        return section;
    }

    /**
     * Create team info content
     */
    createTeamInfoContent() {
        const content = Utils.DOM.create('div', {
            className: 'team-info-content'
        });

        const infoGrid = Utils.DOM.create('div', {
            className: 'team-info-grid'
        });

        // Team name and description
        const nameSection = Utils.DOM.create('div', {
            className: 'info-section'
        });
        nameSection.innerHTML = `
            <h4>Team Name</h4>
            <p>${this.currentTeam.name}</p>
        `;

        const descSection = Utils.DOM.create('div', {
            className: 'info-section'
        });
        descSection.innerHTML = `
            <h4>Description</h4>
            <p>${this.currentTeam.description || 'No description provided'}</p>
        `;

        // Team stats
        const statsSection = Utils.DOM.create('div', {
            className: 'info-section team-stats'
        });
        statsSection.innerHTML = `
            <h4>Team Statistics</h4>
            <div class="stats-grid">
                <div class="stat-item">
                    <span class="stat-value">${this.currentTeam.stats?.totalMembers || 0}</span>
                    <span class="stat-label">Members</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${this.currentTeam.stats?.totalServices || 0}</span>
                    <span class="stat-label">Services</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${this.currentTeam.stats?.totalOrders || 0}</span>
                    <span class="stat-label">Orders</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${this.formatCurrency(this.currentTeam.stats?.totalEarnings || 0, 'usd')}</span>
                    <span class="stat-label">Total Earnings</span>
                </div>
            </div>
        `;

        // Creation date
        const createdSection = Utils.DOM.create('div', {
            className: 'info-section'
        });
        createdSection.innerHTML = `
            <h4>Created</h4>
            <p>${this.formatDate(this.currentTeam.createdAt)}</p>
        `;

        infoGrid.appendChild(nameSection);
        infoGrid.appendChild(descSection);
        infoGrid.appendChild(statsSection);
        infoGrid.appendChild(createdSection);

        content.appendChild(infoGrid);
        return content;
    }

    /**
     * Create member management section
     */
    createMemberManagementSection() {
        const section = Utils.DOM.create('div', {
            className: 'member-management-section'
        });

        const actions = [
            Components.createButton({
                text: 'Invite Member',
                icon: '👥',
                variant: 'primary',
                size: 'sm',
                onClick: this.showInviteMemberModal
            })
        ];

        const card = Components.createCard({
            title: 'Team Members',
            actions: actions,
            content: this.createMemberManagementContent(),
            className: 'member-management-card'
        });

        section.appendChild(card);
        return section;
    }

    /**
     * Create member management content
     */
    createMemberManagementContent() {
        const content = Utils.DOM.create('div', {
            className: 'member-management-content'
        });

        const members = this.currentTeam.members || [];
        
        if (members.length === 0) {
            const emptyState = Components.createCard({
                content: `
                    <div class="empty-state">
                        <div class="empty-state-icon">👥</div>
                        <h4 class="empty-state-title">No Team Members</h4>
                        <p class="empty-state-message">Invite members to start collaborating on services.</p>
                    </div>
                `,
                className: 'empty-members-card'
            });
            content.appendChild(emptyState);
            return content;
        }

        const membersList = Utils.DOM.create('div', {
            className: 'members-list'
        });

        members.forEach(member => {
            const memberCard = this.createMemberCard(member);
            membersList.appendChild(memberCard);
        });

        content.appendChild(membersList);
        return content;
    }

    /**
     * Create member card
     */
    createMemberCard(member) {
        const card = Utils.DOM.create('div', {
            className: 'member-card'
        });

        const isCurrentUser = member.userId === AppState.getState('user.id');
        const isLeader = member.role === 'leader';

        card.innerHTML = `
            <div class="member-info">
                <div class="member-avatar">
                    <img src="${member.discordAvatarUrl || 'https://cdn.discordapp.com/embed/avatars/0.png'}" 
                         alt="${member.discordUsername || 'Member'}" />
                </div>
                <div class="member-details">
                    <h4 class="member-name">${member.discordUsername || 'Unknown User'}</h4>
                    <p class="member-role">${this.formatMemberRole(member.role)}</p>
                    <p class="member-joined">Joined ${this.formatDate(member.joinedAt)}</p>
                </div>
            </div>
            <div class="member-stats">
                <div class="stat-item">
                    <span class="stat-value">${member.contributionStats?.servicesCreated || 0}</span>
                    <span class="stat-label">Services</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${member.contributionStats?.ordersGenerated || 0}</span>
                    <span class="stat-label">Orders</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${this.formatCurrency(member.contributionStats?.totalEarnings || 0, 'usd')}</span>
                    <span class="stat-label">Earnings</span>
                </div>
            </div>
        `;

        // Add actions for non-current user members
        if (!isCurrentUser && !isLeader) {
            const actions = Utils.DOM.create('div', {
                className: 'member-actions'
            });

            const changeRoleBtn = Components.createButton({
                text: 'Change Role',
                icon: '🔄',
                variant: 'secondary',
                size: 'sm',
                onClick: () => this.showChangeRoleModal(member)
            });

            const removeBtn = Components.createButton({
                text: 'Remove',
                icon: '🗑️',
                variant: 'error',
                size: 'sm',
                onClick: () => this.confirmRemoveMember(member)
            });

            actions.appendChild(changeRoleBtn);
            actions.appendChild(removeBtn);
            card.appendChild(actions);
        }

        // Add leader badge
        if (isLeader) {
            const leaderBadge = Utils.DOM.create('div', {
                className: 'leader-badge'
            }, '👑 Leader');
            card.appendChild(leaderBadge);
        }

        return card;
    }

    /**
     * Create team settings section
     */
    createTeamSettingsSection() {
        const section = Utils.DOM.create('div', {
            className: 'team-settings-section'
        });

        const actions = [
            Components.createButton({
                text: 'Edit Settings',
                icon: '⚙️',
                variant: 'secondary',
                size: 'sm',
                onClick: this.showTeamSettingsModal
            })
        ];

        const card = Components.createCard({
            title: 'Team Settings',
            actions: actions,
            content: this.createTeamSettingsContent(),
            className: 'team-settings-card'
        });

        section.appendChild(card);
        return section;
    }

    /**
     * Create team settings content
     */
    createTeamSettingsContent() {
        const content = Utils.DOM.create('div', {
            className: 'team-settings-content'
        });

        const settings = this.currentTeam.settings || {};

        content.innerHTML = `
            <div class="settings-grid">
                <div class="setting-item">
                    <h4>Auto-approve Members</h4>
                    <p class="setting-value ${settings.autoApproveMembers ? 'enabled' : 'disabled'}">
                        ${settings.autoApproveMembers ? '✅ Enabled' : '❌ Disabled'}
                    </p>
                    <p class="setting-description">
                        ${settings.autoApproveMembers 
                            ? 'New members are automatically approved when they accept invitations.'
                            : 'New members require manual approval after accepting invitations.'
                        }
                    </p>
                </div>
                <div class="setting-item">
                    <h4>Earnings Distribution</h4>
                    <p class="setting-value">${this.formatEarningsDistribution(settings.earningsDistribution)}</p>
                    <p class="setting-description">How team earnings are distributed among members.</p>
                </div>
                <div class="setting-item">
                    <h4>Service Approval Required</h4>
                    <p class="setting-value ${settings.requireApprovalForServices ? 'enabled' : 'disabled'}">
                        ${settings.requireApprovalForServices ? '✅ Required' : '❌ Not Required'}
                    </p>
                    <p class="setting-description">
                        ${settings.requireApprovalForServices
                            ? 'Team leader must approve services created by members.'
                            : 'Members can create services without approval.'
                        }
                    </p>
                </div>
                <div class="setting-item">
                    <h4>Member Invites</h4>
                    <p class="setting-value ${settings.allowMemberInvites ? 'enabled' : 'disabled'}">
                        ${settings.allowMemberInvites ? '✅ Allowed' : '❌ Leader Only'}
                    </p>
                    <p class="setting-description">
                        ${settings.allowMemberInvites
                            ? 'All members can invite new team members.'
                            : 'Only the team leader can invite new members.'
                        }
                    </p>
                </div>
            </div>
        `;

        return content;
    }

    /**
     * Create activity log section
     */
    createActivityLogSection() {
        const section = Utils.DOM.create('div', {
            className: 'activity-log-section'
        });

        const card = Components.createCard({
            title: 'Recent Activity',
            content: this.createActivityLogContent(),
            className: 'activity-log-card'
        });

        section.appendChild(card);
        return section;
    }

    /**
     * Create activity log content
     */
    createActivityLogContent() {
        const content = Utils.DOM.create('div', {
            className: 'activity-log-content'
        });

        // Mock activity data for demonstration
        const activities = [
            {
                id: 1,
                userId: 'user123',
                username: 'ProBooster#1234',
                action: 'team_created',
                details: { teamName: this.currentTeam.name },
                timestamp: new Date().toISOString()
            },
            {
                id: 2,
                userId: 'user123',
                username: 'ProBooster#1234',
                action: 'service_created',
                details: { serviceName: 'Mythic+20 Boost' },
                timestamp: new Date(Date.now() - 3600000).toISOString()
            }
        ];

        if (activities.length === 0) {
            const emptyState = Utils.DOM.create('div', {
                className: 'empty-state'
            });
            emptyState.innerHTML = `
                <div class="empty-state-icon">📋</div>
                <h4 class="empty-state-title">No Activity Yet</h4>
                <p class="empty-state-message">Team activity will appear here as members perform actions.</p>
            `;
            content.appendChild(emptyState);
            return content;
        }

        const activityList = Utils.DOM.create('div', {
            className: 'activity-list'
        });

        activities.forEach(activity => {
            const activityItem = this.createActivityItem(activity);
            activityList.appendChild(activityItem);
        });

        content.appendChild(activityList);
        return content;
    }

    /**
     * Create activity item
     */
    createActivityItem(activity) {
        const item = Utils.DOM.create('div', {
            className: 'activity-item'
        });

        const icon = this.getActivityIcon(activity.action);
        const description = this.getActivityDescription(activity);

        item.innerHTML = `
            <div class="activity-icon">${icon}</div>
            <div class="activity-content">
                <p class="activity-description">${description}</p>
                <p class="activity-timestamp">${this.formatRelativeTime(activity.timestamp)}</p>
            </div>
        `;

        return item;
    }

    /**
     * Show create team modal
     */
    showCreateTeamModal() {
        const form = this.createTeamForm();
        
        Components.showModal({
            title: 'Create Team',
            content: form,
            size: 'medium',
            footer: [
                Components.createButton({
                    text: 'Cancel',
                    variant: 'secondary',
                    onClick: () => Components.closeModal()
                }),
                Components.createButton({
                    text: 'Create Team',
                    variant: 'primary',
                    onClick: () => this.handleCreateTeam()
                })
            ]
        });
    }

    /**
     * Show edit team modal
     */
    showEditTeamModal() {
        const form = this.createTeamForm(this.currentTeam);
        
        Components.showModal({
            title: 'Edit Team Information',
            content: form,
            size: 'medium',
            footer: [
                Components.createButton({
                    text: 'Cancel',
                    variant: 'secondary',
                    onClick: () => Components.closeModal()
                }),
                Components.createButton({
                    text: 'Save Changes',
                    variant: 'primary',
                    onClick: () => this.handleEditTeam()
                })
            ]
        });
    }

    /**
     * Show invite member modal
     */
    showInviteMemberModal() {
        const form = this.createInviteMemberForm();
        
        Components.showModal({
            title: 'Invite Team Member',
            content: form,
            size: 'medium',
            footer: [
                Components.createButton({
                    text: 'Cancel',
                    variant: 'secondary',
                    onClick: () => Components.closeModal()
                }),
                Components.createButton({
                    text: 'Send Invitation',
                    variant: 'primary',
                    onClick: () => this.handleInviteMember()
                })
            ]
        });
    }

    /**
     * Show team settings modal
     */
    showTeamSettingsModal() {
        const form = this.createTeamSettingsForm();
        
        Components.showModal({
            title: 'Team Settings',
            content: form,
            size: 'large',
            footer: [
                Components.createButton({
                    text: 'Cancel',
                    variant: 'secondary',
                    onClick: () => Components.closeModal()
                }),
                Components.createButton({
                    text: 'Save Settings',
                    variant: 'primary',
                    onClick: () => this.handleUpdateTeamSettings()
                })
            ]
        });
    }

    /**
     * Create team form
     */
    createTeamForm(team = null) {
        const form = Utils.DOM.create('form', {
            className: 'team-form',
            id: 'teamForm'
        });

        const nameGroup = Components.createFormGroup({
            label: 'Team Name',
            type: 'text',
            name: 'name',
            value: team?.name || '',
            placeholder: 'Enter team name...',
            required: true,
            help: 'Choose a unique name for your team (3-50 characters)'
        });

        const descGroup = Components.createFormGroup({
            label: 'Description',
            type: 'textarea',
            name: 'description',
            value: team?.description || '',
            placeholder: 'Describe your team and what services you offer...',
            help: 'Optional description to help potential members understand your team'
        });

        form.appendChild(nameGroup);
        form.appendChild(descGroup);

        return form;
    }

    /**
     * Create invite member form
     */
    createInviteMemberForm() {
        const form = Utils.DOM.create('form', {
            className: 'invite-member-form',
            id: 'inviteMemberForm'
        });

        const methodGroup = Components.createFormGroup({
            label: 'Invitation Method',
            type: 'select',
            name: 'inviteMethod',
            required: true,
            options: [
                { value: '', label: 'Select invitation method...' },
                { value: 'discord', label: 'Discord Username' },
                { value: 'email', label: 'Email Address' }
            ]
        });

        const identifierGroup = Components.createFormGroup({
            label: 'Discord Username or Email',
            type: 'text',
            name: 'identifier',
            placeholder: 'Enter Discord username (e.g., Username#1234) or email...',
            required: true,
            help: 'The person will receive an invitation to join your team'
        });

        const roleGroup = Components.createFormGroup({
            label: 'Initial Role',
            type: 'select',
            name: 'role',
            value: 'member',
            required: true,
            options: [
                { value: 'member', label: 'Member - Basic team access' },
                { value: 'moderator', label: 'Moderator - Can manage services and orders' }
            ],
            help: 'You can change member roles later'
        });

        const messageGroup = Components.createFormGroup({
            label: 'Invitation Message',
            type: 'textarea',
            name: 'message',
            placeholder: 'Optional personal message to include with the invitation...',
            help: 'Add a personal touch to your invitation'
        });

        form.appendChild(methodGroup);
        form.appendChild(identifierGroup);
        form.appendChild(roleGroup);
        form.appendChild(messageGroup);

        return form;
    }

    /**
     * Create team settings form
     */
    createTeamSettingsForm() {
        const form = Utils.DOM.create('form', {
            className: 'team-settings-form',
            id: 'teamSettingsForm'
        });

        const settings = this.currentTeam.settings || {};

        form.innerHTML = `
            <div class="form-section">
                <h4 class="form-section-title">Member Management</h4>
                
                <div class="form-group">
                    <label class="form-label">
                        <input type="checkbox" name="autoApproveMembers" ${settings.autoApproveMembers ? 'checked' : ''}>
                        Auto-approve new members
                    </label>
                    <div class="form-help">Automatically approve members when they accept invitations</div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">
                        <input type="checkbox" name="allowMemberInvites" ${settings.allowMemberInvites ? 'checked' : ''}>
                        Allow members to invite others
                    </label>
                    <div class="form-help">Let team members send invitations (leader approval still required)</div>
                </div>
            </div>
            
            <div class="form-section">
                <h4 class="form-section-title">Service Management</h4>
                
                <div class="form-group">
                    <label class="form-label">
                        <input type="checkbox" name="requireApprovalForServices" ${settings.requireApprovalForServices ? 'checked' : ''}>
                        Require approval for new services
                    </label>
                    <div class="form-help">Team leader must approve services created by members</div>
                </div>
            </div>
            
            <div class="form-section">
                <h4 class="form-section-title">Earnings Distribution</h4>
                
                <div class="form-group">
                    <label class="form-label">Distribution Method</label>
                    <select class="form-input" name="earningsDistribution" required>
                        <option value="leader_wallet" ${settings.earningsDistribution === 'leader_wallet' ? 'selected' : ''}>
                            Leader Wallet (All earnings go to team leader)
                        </option>
                        <option value="individual_wallets" ${settings.earningsDistribution === 'individual_wallets' ? 'selected' : ''}>
                            Individual Wallets (Earnings go to service creator)
                        </option>
                        <option value="split_percentage" ${settings.earningsDistribution === 'split_percentage' ? 'selected' : ''}>
                            Percentage Split (Custom distribution)
                        </option>
                    </select>
                    <div class="form-help">Choose how team earnings are distributed among members</div>
                </div>
            </div>
        `;

        return form;
    }

    /**
     * Handle create team
     */
    async handleCreateTeam() {
        const form = Utils.DOM.select('#teamForm');
        const formData = new FormData(form);
        const teamData = Object.fromEntries(formData.entries());

        // Validate form
        const errors = this.validateTeamForm(teamData);
        if (errors.length > 0) {
            Components.showNotification({
                type: 'error',
                title: 'Validation Error',
                message: errors.join(', '),
                duration: 5000
            });
            return;
        }

        try {
            // Show loading state
            AppState.setLoading('team-creation', true);

            // Create team data
            const newTeamData = {
                name: teamData.name.trim(),
                description: teamData.description?.trim() || '',
                leaderId: AppState.getState('user.id')
            };

            // Create team via mock API
            const response = await MockDataAPI.createTeam(newTeamData);

            if (response.success) {
                // Update state with new team
                const teams = AppState.getState('teams') || new Map();
                teams.set(response.data.id, response.data);
                AppState.setState('teams', teams);

                // Set current team
                this.currentTeam = response.data;

                // Close modal and refresh view
                Components.closeModal();
                await this.renderTeamManagement();

                Components.showNotification({
                    type: 'success',
                    title: 'Team Created',
                    message: `Team "${newTeamData.name}" has been created successfully!`,
                    duration: 5000
                });
            } else {
                throw new Error(response.message || 'Failed to create team');
            }
        } catch (error) {
            console.error('Error creating team:', error);
            Components.showNotification({
                type: 'error',
                title: 'Creation Failed',
                message: error.message || 'Failed to create team. Please try again.',
                duration: 5000
            });
        } finally {
            AppState.setLoading('team-creation', false);
        }
    }

    /**
     * Handle edit team
     */
    async handleEditTeam() {
        const form = Utils.DOM.select('#teamForm');
        const formData = new FormData(form);
        const teamData = Object.fromEntries(formData.entries());

        // Validate form
        const errors = this.validateTeamForm(teamData);
        if (errors.length > 0) {
            Components.showNotification({
                type: 'error',
                title: 'Validation Error',
                message: errors.join(', '),
                duration: 5000
            });
            return;
        }

        try {
            // Show loading state
            AppState.setLoading('team-edit', true);

            // Update team data
            const updatedTeamData = {
                ...this.currentTeam,
                name: teamData.name.trim(),
                description: teamData.description?.trim() || '',
                updatedAt: new Date().toISOString()
            };

            // Update team via mock API
            const response = await MockDataAPI.updateTeam(this.currentTeam.id, updatedTeamData);

            if (response.success) {
                // Update state
                const teams = AppState.getState('teams');
                teams.set(this.currentTeam.id, response.data);
                AppState.setState('teams', teams);

                // Update current team
                this.currentTeam = response.data;

                // Close modal and refresh view
                Components.closeModal();
                await this.renderTeamManagement();

                Components.showNotification({
                    type: 'success',
                    title: 'Team Updated',
                    message: 'Team information has been updated successfully!',
                    duration: 5000
                });
            } else {
                throw new Error(response.message || 'Failed to update team');
            }
        } catch (error) {
            console.error('Error updating team:', error);
            Components.showNotification({
                type: 'error',
                title: 'Update Failed',
                message: error.message || 'Failed to update team. Please try again.',
                duration: 5000
            });
        } finally {
            AppState.setLoading('team-edit', false);
        }
    }

    /**
     * Handle invite member
     */
    async handleInviteMember() {
        const form = Utils.DOM.select('#inviteMemberForm');
        const formData = new FormData(form);
        const inviteData = Object.fromEntries(formData.entries());

        // Validate form
        const errors = this.validateInviteForm(inviteData);
        if (errors.length > 0) {
            Components.showNotification({
                type: 'error',
                title: 'Validation Error',
                message: errors.join(', '),
                duration: 5000
            });
            return;
        }

        try {
            // Show loading state
            AppState.setLoading('member-invite', true);

            // Prepare invite data
            const invitePayload = {
                teamId: this.currentTeam.id,
                inviterUserId: AppState.getState('user.id'),
                inviteMethod: inviteData.inviteMethod,
                identifier: inviteData.identifier.trim(),
                role: inviteData.role,
                message: inviteData.message?.trim() || ''
            };

            // Send invitation via mock API
            const response = await MockDataAPI.inviteTeamMember(
                this.currentTeam.id,
                AppState.getState('user.id'),
                invitePayload
            );

            if (response.success) {
                // Close modal and refresh view
                Components.closeModal();
                await this.renderTeamManagement();

                Components.showNotification({
                    type: 'success',
                    title: 'Invitation Sent',
                    message: `Invitation sent to ${inviteData.identifier}!`,
                    duration: 5000
                });
            } else {
                throw new Error(response.message || 'Failed to send invitation');
            }
        } catch (error) {
            console.error('Error sending invitation:', error);
            Components.showNotification({
                type: 'error',
                title: 'Invitation Failed',
                message: error.message || 'Failed to send invitation. Please try again.',
                duration: 5000
            });
        } finally {
            AppState.setLoading('member-invite', false);
        }
    }

    /**
     * Handle update team settings
     */
    async handleUpdateTeamSettings() {
        const form = Utils.DOM.select('#teamSettingsForm');
        const formData = new FormData(form);
        
        // Process checkbox values
        const settings = {
            autoApproveMembers: formData.has('autoApproveMembers'),
            allowMemberInvites: formData.has('allowMemberInvites'),
            requireApprovalForServices: formData.has('requireApprovalForServices'),
            earningsDistribution: formData.get('earningsDistribution')
        };

        try {
            // Show loading state
            AppState.setLoading('team-settings', true);

            // Update team settings
            const updatedTeam = {
                ...this.currentTeam,
                settings: settings,
                updatedAt: new Date().toISOString()
            };

            // Update via mock API
            const response = await MockDataAPI.updateTeam(this.currentTeam.id, updatedTeam);

            if (response.success) {
                // Update state
                const teams = AppState.getState('teams');
                teams.set(this.currentTeam.id, response.data);
                AppState.setState('teams', teams);

                // Update current team
                this.currentTeam = response.data;

                // Close modal and refresh view
                Components.closeModal();
                await this.renderTeamManagement();

                Components.showNotification({
                    type: 'success',
                    title: 'Settings Updated',
                    message: 'Team settings have been updated successfully!',
                    duration: 5000
                });
            } else {
                throw new Error(response.message || 'Failed to update settings');
            }
        } catch (error) {
            console.error('Error updating team settings:', error);
            Components.showNotification({
                type: 'error',
                title: 'Update Failed',
                message: error.message || 'Failed to update settings. Please try again.',
                duration: 5000
            });
        } finally {
            AppState.setLoading('team-settings', false);
        }
    }

    /**
     * Confirm remove member
     */
    confirmRemoveMember(member) {
        Components.showModal({
            title: 'Remove Team Member',
            content: `
                <div class="confirmation-dialog">
                    <div class="confirmation-icon">⚠️</div>
                    <h3 class="confirmation-title">Remove ${member.discordUsername || 'Member'}?</h3>
                    <p class="confirmation-message">
                        This action will remove the member from your team. They will lose access to team services and workspace.
                        This action cannot be undone.
                    </p>
                </div>
            `,
            size: 'medium',
            footer: [
                Components.createButton({
                    text: 'Cancel',
                    variant: 'secondary',
                    onClick: () => Components.closeModal()
                }),
                Components.createButton({
                    text: 'Remove Member',
                    variant: 'error',
                    onClick: () => this.handleRemoveMember(member)
                })
            ]
        });
    }

    /**
     * Handle remove member
     */
    async handleRemoveMember(member) {
        try {
            // Show loading state
            AppState.setLoading('member-removal', true);

            // Remove member via mock API
            const response = await MockDataAPI.removeTeamMember(this.currentTeam.id, member.userId);

            if (response.success) {
                // Update current team
                this.currentTeam = response.data;

                // Update state
                const teams = AppState.getState('teams');
                teams.set(this.currentTeam.id, response.data);
                AppState.setState('teams', teams);

                // Close modal and refresh view
                Components.closeModal();
                await this.renderTeamManagement();

                Components.showNotification({
                    type: 'success',
                    title: 'Member Removed',
                    message: `${member.discordUsername || 'Member'} has been removed from the team.`,
                    duration: 5000
                });
            } else {
                throw new Error(response.message || 'Failed to remove member');
            }
        } catch (error) {
            console.error('Error removing member:', error);
            Components.showNotification({
                type: 'error',
                title: 'Removal Failed',
                message: error.message || 'Failed to remove member. Please try again.',
                duration: 5000
            });
        } finally {
            AppState.setLoading('member-removal', false);
        }
    }

    /**
     * Validate team form
     */
    validateTeamForm(data) {
        const errors = [];

        if (!data.name || data.name.trim().length < 3) {
            errors.push('Team name must be at least 3 characters long');
        }

        if (data.name && data.name.trim().length > 50) {
            errors.push('Team name must be less than 50 characters');
        }

        if (data.description && data.description.trim().length > 500) {
            errors.push('Description must be less than 500 characters');
        }

        return errors;
    }

    /**
     * Validate invite form
     */
    validateInviteForm(data) {
        const errors = [];

        if (!data.inviteMethod) {
            errors.push('Please select an invitation method');
        }

        if (!data.identifier || data.identifier.trim().length === 0) {
            errors.push('Please enter a Discord username or email address');
        }

        if (data.inviteMethod === 'discord' && data.identifier) {
            // Basic Discord username validation
            if (!data.identifier.includes('#') || data.identifier.length < 6) {
                errors.push('Discord username must be in format Username#1234');
            }
        }

        if (data.inviteMethod === 'email' && data.identifier) {
            // Basic email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data.identifier)) {
                errors.push('Please enter a valid email address');
            }
        }

        if (!data.role) {
            errors.push('Please select an initial role for the member');
        }

        return errors;
    }

    /**
     * Utility methods
     */
    formatMemberRole(role) {
        const roleMap = {
            'leader': '👑 Team Leader',
            'moderator': '🛡️ Moderator',
            'member': '👤 Member'
        };
        return roleMap[role] || role;
    }

    formatEarningsDistribution(distribution) {
        const distributionMap = {
            'leader_wallet': '👑 Leader Wallet',
            'individual_wallets': '👤 Individual Wallets',
            'split_percentage': '📊 Percentage Split'
        };
        return distributionMap[distribution] || distribution;
    }

    formatCurrency(amount, currency) {
        switch (currency) {
            case 'gold':
                return `${amount}G`;
            case 'usd':
                return `$${amount.toFixed(2)}`;
            case 'toman':
                return `﷼${amount.toLocaleString()}`;
            default:
                return amount.toString();
        }
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    formatRelativeTime(dateString) {
        const now = new Date();
        const date = new Date(dateString);
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minutes ago`;
        if (diffHours < 24) return `${diffHours} hours ago`;
        if (diffDays < 7) return `${diffDays} days ago`;
        return this.formatDate(dateString);
    }

    getActivityIcon(action) {
        const iconMap = {
            'team_created': '🏢',
            'member_joined': '👥',
            'member_left': '👋',
            'service_created': '📝',
            'service_updated': '✏️',
            'order_assigned': '📦',
            'settings_updated': '⚙️'
        };
        return iconMap[action] || '📋';
    }

    getActivityDescription(activity) {
        const { action, username, details } = activity;
        
        switch (action) {
            case 'team_created':
                return `${username} created the team "${details.teamName}"`;
            case 'member_joined':
                return `${username} joined the team`;
            case 'member_left':
                return `${username} left the team`;
            case 'service_created':
                return `${username} created service "${details.serviceName}"`;
            case 'service_updated':
                return `${username} updated service "${details.serviceName}"`;
            case 'order_assigned':
                return `${username} assigned order #${details.orderId}`;
            case 'settings_updated':
                return `${username} updated team settings`;
            default:
                return `${username} performed an action`;
        }
    }
}

// Create global instance
const TeamManager_Instance = new TeamManager();

// Export for use in other modules
window.TeamManager = TeamManager_Instance;