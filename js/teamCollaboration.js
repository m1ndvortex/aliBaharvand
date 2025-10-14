/**
 * Team Collaboration System for Service Provider Dashboard
 * Handles activity logging, member contribution tracking, and collaborative features
 */

class TeamCollaboration {
    constructor() {
        this.initialized = false;
        this.activityFilters = {
            action: 'all',
            dateRange: 'all',
            member: 'all'
        };
        
        // Bind methods
        this.init = this.init.bind(this);
        this.logActivity = this.logActivity.bind(this);
        this.trackContribution = this.trackContribution.bind(this);
        this.updateEarningsDistribution = this.updateEarningsDistribution.bind(this);
        this.renderCollaborationFeatures = this.renderCollaborationFeatures.bind(this);
    }

    /**
     * Initialize team collaboration system
     */
    async init() {
        if (this.initialized) return;

        try {
            this.mockDataManager = new MockDataManager();
            this.initialized = true;
            console.log('Team Collaboration system initialized');
        } catch (error) {
            console.error('Failed to initialize Team Collaboration:', error);
        }
    }

    /**
     * Log team activity
     */
    async logActivity(teamId, userId, action, details = {}) {
        try {
            const result = await this.mockDataManager.addTeamActivityLog(teamId, userId, action, details);
            
            if (result.success) {
                // Emit event for real-time updates
                this.emitActivityUpdate(teamId, result.data);
                return result;
            }
            
            return result;
        } catch (error) {
            console.error('Failed to log activity:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Track member contribution
     */
    async trackContribution(teamId, userId, contributionType, data) {
        try {
            const team = this.mockDataManager.getTeamSync(teamId);
            if (!team) {
                throw new Error('Team not found');
            }

            const memberIndex = team.members.findIndex(member => member.userId === userId);
            if (memberIndex === -1) {
                throw new Error('Member not found in team');
            }

            const member = team.members[memberIndex];
            
            // Update contribution stats
            switch (contributionType) {
                case 'service_created':
                    member.contributionStats.servicesCreated += 1;
                    await this.logActivity(teamId, userId, 'service_created', data);
                    break;
                case 'order_generated':
                    member.contributionStats.ordersGenerated += 1;
                    break;
                case 'earnings_added':
                    member.contributionStats.totalEarnings += data.amount || 0;
                    break;
            }

            // Update team
            const updateResult = await this.mockDataManager.updateEntity('teams', teamId, {
                members: team.members,
                updatedAt: new Date().toISOString()
            });

            return updateResult;
        } catch (error) {
            console.error('Failed to track contribution:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Update earnings distribution based on team settings
     */
    async updateEarningsDistribution(teamId, orderId, earnings) {
        try {
            const team = this.mockDataManager.getTeamSync(teamId);
            if (!team) {
                throw new Error('Team not found');
            }

            const { earningsDistribution } = team.settings;
            
            switch (earningsDistribution) {
                case 'leader_wallet':
                    // All earnings go to team leader's wallet
                    await this.distributeToLeaderWallet(team.leaderId, earnings);
                    await this.logActivity(teamId, team.leaderId, 'earnings_distributed', {
                        orderId,
                        amount: earnings.amount,
                        currency: earnings.currency,
                        distributionType: 'leader_wallet'
                    });
                    break;
                    
                case 'individual_wallets':
                    // Earnings go to individual service creator's wallet
                    const order = this.mockDataManager.getOrderSync(orderId);
                    const service = this.mockDataManager.getServiceSync(order.serviceId);
                    await this.distributeToIndividualWallet(service.createdBy, earnings);
                    await this.logActivity(teamId, service.createdBy, 'earnings_distributed', {
                        orderId,
                        amount: earnings.amount,
                        currency: earnings.currency,
                        distributionType: 'individual_wallet'
                    });
                    break;
                    
                case 'split_percentage':
                    // Custom percentage split (future implementation)
                    await this.distributePercentageSplit(team, earnings);
                    break;
            }

            return { success: true };
        } catch (error) {
            console.error('Failed to update earnings distribution:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Distribute earnings to team leader's wallet
     */
    async distributeToLeaderWallet(leaderId, earnings) {
        try {
            await this.mockDataManager.addWalletTransaction(leaderId, {
                type: 'team_earning',
                amount: earnings.amount,
                currency: earnings.currency,
                status: 'completed',
                description: `Team earnings from order #${earnings.orderId}`,
                orderId: earnings.orderId
            });

            await this.mockDataManager.updateWalletBalance(leaderId, earnings.currency, earnings.amount);
            
            return { success: true };
        } catch (error) {
            console.error('Failed to distribute to leader wallet:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Distribute earnings to individual member's wallet
     */
    async distributeToIndividualWallet(memberId, earnings) {
        try {
            await this.mockDataManager.addWalletTransaction(memberId, {
                type: 'individual_earning',
                amount: earnings.amount,
                currency: earnings.currency,
                status: 'completed',
                description: `Individual earnings from order #${earnings.orderId}`,
                orderId: earnings.orderId
            });

            await this.mockDataManager.updateWalletBalance(memberId, earnings.currency, earnings.amount);
            
            return { success: true };
        } catch (error) {
            console.error('Failed to distribute to individual wallet:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Distribute earnings based on percentage split
     */
    async distributePercentageSplit(team, earnings) {
        // Future implementation for custom percentage splits
        console.log('Percentage split distribution not yet implemented');
        return { success: false, message: 'Percentage split not implemented' };
    }

    /**
     * Render collaboration features in team management
     */
    renderCollaborationFeatures(teamId) {
        const container = Utils.DOM.create('div', {
            className: 'team-collaboration-features'
        });

        // Member contribution tracking
        const contributionSection = this.createContributionTrackingSection(teamId);
        container.appendChild(contributionSection);

        // Team communication features
        const communicationSection = this.createTeamCommunicationSection(teamId);
        container.appendChild(communicationSection);

        // Collaborative service management
        const collaborativeSection = this.createCollaborativeServiceSection(teamId);
        container.appendChild(collaborativeSection);

        return container;
    }

    /**
     * Create member contribution tracking section
     */
    createContributionTrackingSection(teamId) {
        const section = Utils.DOM.create('div', {
            className: 'contribution-tracking-section'
        });

        const card = Components.createCard({
            title: '📊 Member Contributions',
            className: 'contribution-tracking-card'
        });

        const team = this.mockDataManager.getTeamSync(teamId);
        if (!team) return section;

        const contributionTable = Components.createTable({
            columns: [
                { key: 'member', label: 'Member' },
                { key: 'services', label: 'Services Created' },
                { key: 'orders', label: 'Orders Generated' },
                { key: 'earnings', label: 'Total Earnings' },
                { key: 'joinDate', label: 'Join Date' }
            ],
            data: team.members.map(member => {
                const user = this.mockDataManager.getUserSync(member.userId);
                return {
                    member: user?.discordUsername || 'Unknown User',
                    services: member.contributionStats?.servicesCreated || 0,
                    orders: member.contributionStats?.ordersGenerated || 0,
                    earnings: `$${(member.contributionStats?.totalEarnings || 0).toFixed(2)}`,
                    joinDate: new Date(member.joinedAt).toLocaleDateString()
                };
            }),
            className: 'contribution-table'
        });

        const cardBody = card.querySelector('.card-body');
        cardBody.appendChild(contributionTable);
        section.appendChild(card);

        return section;
    }

    /**
     * Create team communication section
     */
    createTeamCommunicationSection(teamId) {
        const section = Utils.DOM.create('div', {
            className: 'team-communication-section'
        });

        const card = Components.createCard({
            title: '💬 Team Communication',
            className: 'team-communication-card'
        });

        const communicationContent = Utils.DOM.create('div', {
            className: 'communication-content'
        });

        // Notification preferences
        const notificationSettings = Utils.DOM.create('div', {
            className: 'notification-settings'
        });

        notificationSettings.innerHTML = `
            <h4>Notification Preferences</h4>
            <div class="notification-options">
                <label class="notification-option">
                    <input type="checkbox" checked> Service creation notifications
                </label>
                <label class="notification-option">
                    <input type="checkbox" checked> Order assignment notifications
                </label>
                <label class="notification-option">
                    <input type="checkbox"> Member activity notifications
                </label>
                <label class="notification-option">
                    <input type="checkbox" checked> Earnings notifications
                </label>
            </div>
        `;

        // Quick actions
        const quickActions = Utils.DOM.create('div', {
            className: 'quick-actions'
        });

        quickActions.innerHTML = `
            <h4>Quick Actions</h4>
            <div class="action-buttons">
                <button class="btn btn-secondary" onclick="TeamCollaboration_Instance.sendTeamMessage('${teamId}')">
                    📢 Send Team Message
                </button>
                <button class="btn btn-secondary" onclick="TeamCollaboration_Instance.scheduleTeamMeeting('${teamId}')">
                    📅 Schedule Meeting
                </button>
                <button class="btn btn-secondary" onclick="TeamCollaboration_Instance.shareTeamUpdate('${teamId}')">
                    📝 Share Update
                </button>
            </div>
        `;

        communicationContent.appendChild(notificationSettings);
        communicationContent.appendChild(quickActions);

        const cardBody = card.querySelector('.card-body');
        cardBody.appendChild(communicationContent);
        section.appendChild(card);

        return section;
    }

    /**
     * Create collaborative service management section
     */
    createCollaborativeServiceSection(teamId) {
        const section = Utils.DOM.create('div', {
            className: 'collaborative-service-section'
        });

        const card = Components.createCard({
            title: '🤝 Collaborative Service Management',
            className: 'collaborative-service-card'
        });

        const collaborativeContent = Utils.DOM.create('div', {
            className: 'collaborative-content'
        });

        // Service approval workflow
        const approvalWorkflow = Utils.DOM.create('div', {
            className: 'approval-workflow'
        });

        const team = this.mockDataManager.getTeamSync(teamId);
        const requiresApproval = team?.settings?.requireApprovalForServices || false;

        approvalWorkflow.innerHTML = `
            <h4>Service Approval Workflow</h4>
            <div class="workflow-status">
                <span class="status-indicator ${requiresApproval ? 'enabled' : 'disabled'}">
                    ${requiresApproval ? '✅ Enabled' : '❌ Disabled'}
                </span>
                <p class="workflow-description">
                    ${requiresApproval 
                        ? 'New services created by team members require leader approval before activation.'
                        : 'Team members can create and activate services without approval.'
                    }
                </p>
            </div>
        `;

        // Pending approvals (if any)
        const pendingApprovals = Utils.DOM.create('div', {
            className: 'pending-approvals'
        });

        pendingApprovals.innerHTML = `
            <h4>Pending Service Approvals</h4>
            <div class="pending-list">
                <div class="empty-state">
                    <p>No services pending approval</p>
                </div>
            </div>
        `;

        // Collaborative editing features
        const collaborativeEditing = Utils.DOM.create('div', {
            className: 'collaborative-editing'
        });

        collaborativeEditing.innerHTML = `
            <h4>Collaborative Features</h4>
            <div class="feature-list">
                <div class="feature-item">
                    <span class="feature-icon">👥</span>
                    <div class="feature-info">
                        <h5>Shared Service Templates</h5>
                        <p>Create and share service templates across team members</p>
                    </div>
                </div>
                <div class="feature-item">
                    <span class="feature-icon">📝</span>
                    <div class="feature-info">
                        <h5>Collaborative Editing</h5>
                        <p>Multiple team members can edit service descriptions and pricing</p>
                    </div>
                </div>
                <div class="feature-item">
                    <span class="feature-icon">🔄</span>
                    <div class="feature-info">
                        <h5>Version History</h5>
                        <p>Track changes and revert to previous versions of services</p>
                    </div>
                </div>
            </div>
        `;

        collaborativeContent.appendChild(approvalWorkflow);
        collaborativeContent.appendChild(pendingApprovals);
        collaborativeContent.appendChild(collaborativeEditing);

        const cardBody = card.querySelector('.card-body');
        cardBody.appendChild(collaborativeContent);
        section.appendChild(card);

        return section;
    }

    /**
     * Send team message (placeholder)
     */
    sendTeamMessage(teamId) {
        Components.showNotification({
            type: 'info',
            title: 'Team Message',
            message: 'Team messaging feature coming soon!',
            duration: 3000
        });
    }

    /**
     * Schedule team meeting (placeholder)
     */
    scheduleTeamMeeting(teamId) {
        Components.showNotification({
            type: 'info',
            title: 'Team Meeting',
            message: 'Team meeting scheduling feature coming soon!',
            duration: 3000
        });
    }

    /**
     * Share team update (placeholder)
     */
    shareTeamUpdate(teamId) {
        Components.showNotification({
            type: 'info',
            title: 'Team Update',
            message: 'Team update sharing feature coming soon!',
            duration: 3000
        });
    }

    /**
     * Emit activity update event
     */
    emitActivityUpdate(teamId, activity) {
        // Emit custom event for real-time activity updates
        const event = new CustomEvent('teamActivityUpdate', {
            detail: { teamId, activity }
        });
        document.dispatchEvent(event);
    }

    /**
     * Handle service creation in team context
     */
    async handleTeamServiceCreation(teamId, serviceData, createdBy) {
        try {
            // Track contribution
            await this.trackContribution(teamId, createdBy, 'service_created', {
                serviceName: serviceData.title,
                serviceType: serviceData.serviceType
            });

            // Log activity
            await this.logActivity(teamId, createdBy, 'service_created', {
                serviceName: serviceData.title,
                serviceType: serviceData.serviceType,
                serviceId: serviceData.id
            });

            return { success: true };
        } catch (error) {
            console.error('Failed to handle team service creation:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Handle service editing in team context
     */
    async handleTeamServiceEdit(teamId, serviceId, changes, editedBy) {
        try {
            const service = this.mockDataManager.getServiceSync(serviceId);
            if (!service) {
                throw new Error('Service not found');
            }

            // Log activity
            await this.logActivity(teamId, editedBy, 'service_edited', {
                serviceName: service.title,
                serviceId: serviceId,
                changes: Object.keys(changes)
            });

            return { success: true };
        } catch (error) {
            console.error('Failed to handle team service edit:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Handle member removal with permission updates
     */
    async handleMemberRemoval(teamId, memberId, removedBy, reason = '') {
        try {
            // Log activity
            await this.logActivity(teamId, removedBy, 'member_removed', {
                removedMemberId: memberId,
                reason: reason
            });

            // Update access permissions immediately
            await this.updateMemberPermissions(teamId, memberId, []);

            // Revoke access to team services
            await this.revokeTeamServiceAccess(teamId, memberId);

            return { success: true };
        } catch (error) {
            console.error('Failed to handle member removal:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Update member permissions
     */
    async updateMemberPermissions(teamId, memberId, permissions) {
        try {
            const team = this.mockDataManager.getTeamSync(teamId);
            if (!team) {
                throw new Error('Team not found');
            }

            const memberIndex = team.members.findIndex(member => member.userId === memberId);
            if (memberIndex !== -1) {
                team.members[memberIndex].permissions = permissions;
                
                await this.mockDataManager.updateEntity('teams', teamId, {
                    members: team.members
                });
            }

            return { success: true };
        } catch (error) {
            console.error('Failed to update member permissions:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Revoke team service access
     */
    async revokeTeamServiceAccess(teamId, memberId) {
        try {
            // This would typically involve updating service permissions
            // For now, we'll just log the action
            console.log(`Revoking team service access for member ${memberId} in team ${teamId}`);
            return { success: true };
        } catch (error) {
            console.error('Failed to revoke team service access:', error);
            return { success: false, error: error.message };
        }
    }
}

// Create global instance
const TeamCollaboration_Instance = new TeamCollaboration();

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.TeamCollaboration = TeamCollaboration;
    window.TeamCollaboration_Instance = TeamCollaboration_Instance;
}