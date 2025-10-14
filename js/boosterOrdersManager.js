/**
 * Booster Orders Management System
 * Handles assigned orders listing, status management, evidence submission, and order communication
 */

class BoosterOrdersManager {
    constructor() {
        this.assignedOrders = new Map();
        this.filteredOrders = [];
        this.currentFilters = {
            status: 'all',
            dateRange: 'all',
            search: ''
        };
        this.sortConfig = {
            field: 'createdAt',
            direction: 'desc'
        };
        
        // Initialize with mock data
        this.initializeMockData();
        
        // Bind methods
        this.renderBoosterOrders = this.renderBoosterOrders.bind(this);
        this.handleFilterChange = this.handleFilterChange.bind(this);
        this.handleSort = this.handleSort.bind(this);
        this.startOrder = this.startOrder.bind(this);
        this.showOrderDetails = this.showOrderDetails.bind(this);
        this.showEvidenceSubmission = this.showEvidenceSubmission.bind(this);
    }

    /**
     * Initialize mock data for current booster
     */
    initializeMockData() {
        const currentUserId = AppState.getState('user.id');
        if (typeof MockData !== 'undefined' && MockData.orders) {
            // Filter orders assigned to current booster
            const boosterOrders = MockData.orders.filter(order => order.boosterId === currentUserId);
            boosterOrders.forEach(order => {
                this.assignedOrders.set(order.id, order);
            });
            this.applyFilters();
        }
    }

    /**
     * Render booster orders management interface
     */
    renderBoosterOrders() {
        const contentArea = Utils.DOM.select('.content-area');
        Utils.DOM.empty(contentArea);

        const container = Utils.DOM.create('div', {
            className: 'booster-orders-management'
        });

        // Header
        const header = this.createOrdersHeader();
        container.appendChild(header);

        // Filters and controls
        const controls = this.createOrdersControls();
        container.appendChild(controls);

        // Orders list
        const ordersContainer = this.createOrdersList();
        container.appendChild(ordersContainer);

        contentArea.appendChild(container);
    }

    /**
     * Create orders header with statistics
     */
    createOrdersHeader() {
        const header = Utils.DOM.create('div', {
            className: 'booster-orders-header'
        });

        const titleSection = Utils.DOM.create('div', {
            className: 'header-title-section'
        });

        const title = Utils.DOM.create('h2', {
            className: 'orders-title'
        }, '📋 Assigned Orders');

        const subtitle = Utils.DOM.create('p', {
            className: 'orders-subtitle'
        }, 'Manage your assigned orders and track progress');

        titleSection.appendChild(title);
        titleSection.appendChild(subtitle);

        // Statistics
        const stats = this.createOrdersStats();

        header.appendChild(titleSection);
        header.appendChild(stats);

        return header;
    }

    /**
     * Create orders statistics
     */
    createOrdersStats() {
        const stats = Utils.DOM.create('div', {
            className: 'booster-orders-stats'
        });

        const statusCounts = this.getOrderStatusCounts();
        
        const statItems = [
            { 
                label: 'Total Assigned', 
                value: this.assignedOrders.size, 
                className: 'total',
                icon: '📋'
            },
            { 
                label: 'In Progress', 
                value: statusCounts.in_progress || 0, 
                className: 'in-progress',
                icon: '⚡'
            },
            { 
                label: 'Awaiting Review', 
                value: statusCounts.evidence_submitted || 0, 
                className: 'evidence-submitted',
                icon: '👁️'
            },
            { 
                label: 'Completed', 
                value: statusCounts.completed || 0, 
                className: 'completed',
                icon: '✅'
            }
        ];

        statItems.forEach(item => {
            const statCard = Utils.DOM.create('div', {
                className: `stat-card ${item.className}`
            });

            const statIcon = Utils.DOM.create('div', {
                className: 'stat-icon'
            }, item.icon);

            const statContent = Utils.DOM.create('div', {
                className: 'stat-content'
            });

            const value = Utils.DOM.create('div', {
                className: 'stat-value'
            }, item.value.toString());

            const label = Utils.DOM.create('div', {
                className: 'stat-label'
            }, item.label);

            statContent.appendChild(value);
            statContent.appendChild(label);
            statCard.appendChild(statIcon);
            statCard.appendChild(statContent);
            stats.appendChild(statCard);
        });

        return stats;
    }

    /**
     * Get order status counts
     */
    getOrderStatusCounts() {
        const counts = {};
        this.assignedOrders.forEach(order => {
            counts[order.status] = (counts[order.status] || 0) + 1;
        });
        return counts;
    }

    /**
     * Create orders controls (filters, search)
     */
    createOrdersControls() {
        const controls = Utils.DOM.create('div', {
            className: 'booster-orders-controls'
        });

        // Filters section
        const filters = this.createOrdersFilters();
        controls.appendChild(filters);

        return controls;
    }

    /**
     * Create orders filters
     */
    createOrdersFilters() {
        const filters = Utils.DOM.create('div', {
            className: 'booster-orders-filters'
        });

        // Status filter
        const statusFilter = Components.createFormGroup({
            label: 'Status',
            type: 'select',
            name: 'statusFilter',
            value: this.currentFilters.status,
            options: [
                { value: 'all', label: 'All Orders' },
                { value: 'assigned', label: 'Assigned' },
                { value: 'in_progress', label: 'In Progress' },
                { value: 'evidence_submitted', label: 'Evidence Submitted' },
                { value: 'completed', label: 'Completed' },
                { value: 'rejected', label: 'Rejected' }
            ]
        });

        // Date range filter
        const dateFilter = Components.createFormGroup({
            label: 'Date Range',
            type: 'select',
            name: 'dateFilter',
            value: this.currentFilters.dateRange,
            options: [
                { value: 'all', label: 'All Time' },
                { value: 'today', label: 'Today' },
                { value: 'week', label: 'This Week' },
                { value: 'month', label: 'This Month' }
            ]
        });

        // Search input
        const searchInput = Components.createFormGroup({
            label: 'Search',
            type: 'text',
            name: 'searchFilter',
            value: this.currentFilters.search,
            placeholder: 'Search orders, services, buyers...'
        });

        // Add event listeners
        statusFilter.querySelector('select').addEventListener('change', (e) => {
            this.currentFilters.status = e.target.value;
            this.handleFilterChange();
        });

        dateFilter.querySelector('select').addEventListener('change', (e) => {
            this.currentFilters.dateRange = e.target.value;
            this.handleFilterChange();
        });

        searchInput.querySelector('input').addEventListener('input', Utils.Events.debounce((e) => {
            this.currentFilters.search = e.target.value;
            this.handleFilterChange();
        }, 300));

        filters.appendChild(statusFilter);
        filters.appendChild(dateFilter);
        filters.appendChild(searchInput);

        return filters;
    }

    /**
     * Create orders list
     */
    createOrdersList() {
        const container = Utils.DOM.create('div', {
            className: 'booster-orders-list-container'
        });

        if (this.filteredOrders.length === 0) {
            const emptyState = Components.createCard({
                title: 'No Orders Found',
                content: `
                    <div class="empty-state">
                        <div class="empty-state-icon">📋</div>
                        <p>No assigned orders match your current filters.</p>
                        <p>Orders will appear here when they are assigned to you.</p>
                    </div>
                `,
                className: 'empty-state-card'
            });
            container.appendChild(emptyState);
            return container;
        }

        const ordersList = Utils.DOM.create('div', {
            className: 'booster-orders-list'
        });

        this.filteredOrders.forEach(order => {
            const orderCard = this.createOrderCard(order);
            ordersList.appendChild(orderCard);
        });

        container.appendChild(ordersList);
        return container;
    }

    /**
     * Create individual order card
     */
    createOrderCard(order) {
        const card = Utils.DOM.create('div', {
            className: `booster-order-card status-${order.status.replace('_', '-')}`
        });

        // Header
        const header = this.createOrderCardHeader(order);
        card.appendChild(header);

        // Content
        const content = this.createOrderCardContent(order);
        card.appendChild(content);

        // Progress tracking
        const progress = this.createOrderProgress(order);
        card.appendChild(progress);

        // Actions
        const actions = this.createOrderCardActions(order);
        card.appendChild(actions);

        return card;
    }

    /**
     * Create order card header
     */
    createOrderCardHeader(order) {
        const header = Utils.DOM.create('div', {
            className: 'order-card-header'
        });

        const orderInfo = Utils.DOM.create('div', {
            className: 'order-info'
        });

        const orderId = Utils.DOM.create('div', {
            className: 'order-id'
        }, `Order #${order.id}`);

        const serviceTitle = Utils.DOM.create('div', {
            className: 'service-title'
        }, this.getServiceTitle(order.serviceId));

        orderInfo.appendChild(orderId);
        orderInfo.appendChild(serviceTitle);

        const statusBadge = this.createStatusBadge(order.status);
        const amount = this.createAmountDisplay(order);

        header.appendChild(orderInfo);
        header.appendChild(statusBadge);
        header.appendChild(amount);

        return header;
    }

    /**
     * Create order card content
     */
    createOrderCardContent(order) {
        const content = Utils.DOM.create('div', {
            className: 'order-card-content'
        });

        // Buyer information
        const buyerInfo = this.createBuyerInfo(order);
        content.appendChild(buyerInfo);

        // Service requirements
        const requirements = this.createServiceRequirements(order);
        content.appendChild(requirements);

        // Special instructions
        if (order.specialInstructions) {
            const instructions = this.createSpecialInstructions(order);
            content.appendChild(instructions);
        }

        // Game credentials (if order is in progress)
        if (order.status === 'in_progress' || order.status === 'evidence_submitted') {
            const credentials = this.createGameCredentials(order);
            content.appendChild(credentials);
        }

        return content;
    }

    /**
     * Create buyer information section
     */
    createBuyerInfo(order) {
        const buyerSection = Utils.DOM.create('div', {
            className: 'buyer-info-section'
        });

        const buyer = this.getBuyerInfo(order.buyerId);
        
        const buyerHeader = Utils.DOM.create('div', {
            className: 'section-header'
        });

        const buyerIcon = Utils.DOM.create('span', {
            className: 'section-icon'
        }, '👤');

        const buyerLabel = Utils.DOM.create('span', {
            className: 'section-label'
        }, 'Buyer Information');

        buyerHeader.appendChild(buyerIcon);
        buyerHeader.appendChild(buyerLabel);

        const buyerContent = Utils.DOM.create('div', {
            className: 'buyer-content'
        });

        if (buyer && typeof buyer === 'object') {
            const buyerAvatar = Utils.DOM.create('img', {
                src: buyer.discordAvatarUrl,
                alt: buyer.discordUsername,
                className: 'buyer-avatar'
            });

            const buyerName = Utils.DOM.create('span', {
                className: 'buyer-name'
            }, buyer.discordUsername);

            const buyerRating = Utils.DOM.create('span', {
                className: 'buyer-rating'
            }, buyer.rating ? `⭐ ${buyer.rating}` : 'New Buyer');

            buyerContent.appendChild(buyerAvatar);
            buyerContent.appendChild(buyerName);
            buyerContent.appendChild(buyerRating);
        } else {
            buyerContent.textContent = 'Unknown Buyer';
        }

        buyerSection.appendChild(buyerHeader);
        buyerSection.appendChild(buyerContent);

        return buyerSection;
    }

    /**
     * Create service requirements section
     */
    createServiceRequirements(order) {
        const requirementsSection = Utils.DOM.create('div', {
            className: 'requirements-section'
        });

        const service = this.getServiceDetails(order.serviceId);
        
        const reqHeader = Utils.DOM.create('div', {
            className: 'section-header'
        });

        const reqIcon = Utils.DOM.create('span', {
            className: 'section-icon'
        }, '📋');

        const reqLabel = Utils.DOM.create('span', {
            className: 'section-label'
        }, 'Service Requirements');

        reqHeader.appendChild(reqIcon);
        reqHeader.appendChild(reqLabel);

        const reqContent = Utils.DOM.create('div', {
            className: 'requirements-content'
        });

        if (service) {
            const requirements = Utils.DOM.create('p', {
                className: 'requirements-text'
            }, service.requirements || 'No specific requirements');

            const estimatedTime = Utils.DOM.create('div', {
                className: 'estimated-time'
            });

            const timeIcon = Utils.DOM.create('span', {
                className: 'time-icon'
            }, '⏱️');

            const timeText = Utils.DOM.create('span', {
                className: 'time-text'
            }, `Estimated time: ${service.estimatedTime || 'Not specified'}`);

            estimatedTime.appendChild(timeIcon);
            estimatedTime.appendChild(timeText);

            reqContent.appendChild(requirements);
            reqContent.appendChild(estimatedTime);
        } else {
            reqContent.textContent = 'Service details not available';
        }

        requirementsSection.appendChild(reqHeader);
        requirementsSection.appendChild(reqContent);

        return requirementsSection;
    }

    /**
     * Create special instructions section
     */
    createSpecialInstructions(order) {
        const instructionsSection = Utils.DOM.create('div', {
            className: 'instructions-section'
        });

        const instHeader = Utils.DOM.create('div', {
            className: 'section-header'
        });

        const instIcon = Utils.DOM.create('span', {
            className: 'section-icon'
        }, '💬');

        const instLabel = Utils.DOM.create('span', {
            className: 'section-label'
        }, 'Special Instructions');

        instHeader.appendChild(instIcon);
        instHeader.appendChild(instLabel);

        const instContent = Utils.DOM.create('div', {
            className: 'instructions-content'
        });

        const instructionsText = Utils.DOM.create('p', {
            className: 'instructions-text'
        }, order.specialInstructions);

        instContent.appendChild(instructionsText);
        instructionsSection.appendChild(instHeader);
        instructionsSection.appendChild(instContent);

        return instructionsSection;
    }

    /**
     * Create game credentials section
     */
    createGameCredentials(order) {
        const credentialsSection = Utils.DOM.create('div', {
            className: 'credentials-section'
        });

        const credHeader = Utils.DOM.create('div', {
            className: 'section-header'
        });

        const credIcon = Utils.DOM.create('span', {
            className: 'section-icon'
        }, '🎮');

        const credLabel = Utils.DOM.create('span', {
            className: 'section-label'
        }, 'Game Information');

        credHeader.appendChild(credIcon);
        credHeader.appendChild(credLabel);

        const credContent = Utils.DOM.create('div', {
            className: 'credentials-content'
        });

        if (order.gameCredentials) {
            const charInfo = Utils.DOM.create('div', {
                className: 'character-info'
            });

            const charName = Utils.DOM.create('div', {
                className: 'char-detail'
            }, `Character: ${order.gameCredentials.username}`);

            const charRealm = Utils.DOM.create('div', {
                className: 'char-detail'
            }, `Realm: ${order.gameCredentials.realm}`);

            const charClass = Utils.DOM.create('div', {
                className: 'char-detail'
            }, `Class: ${order.gameCredentials.characterClass || 'Not specified'}`);

            const charLevel = Utils.DOM.create('div', {
                className: 'char-detail'
            }, `Level: ${order.gameCredentials.characterLevel || 'Not specified'}`);

            charInfo.appendChild(charName);
            charInfo.appendChild(charRealm);
            charInfo.appendChild(charClass);
            charInfo.appendChild(charLevel);

            credContent.appendChild(charInfo);
        } else {
            credContent.textContent = 'Game credentials not provided';
        }

        credentialsSection.appendChild(credHeader);
        credentialsSection.appendChild(credContent);

        return credentialsSection;
    }

    /**
     * Create order progress tracking
     */
    createOrderProgress(order) {
        const progressSection = Utils.DOM.create('div', {
            className: 'order-progress-section'
        });

        const progressHeader = Utils.DOM.create('div', {
            className: 'progress-header'
        });

        const progressIcon = Utils.DOM.create('span', {
            className: 'progress-icon'
        }, '📊');

        const progressLabel = Utils.DOM.create('span', {
            className: 'progress-label'
        }, 'Order Progress');

        progressHeader.appendChild(progressIcon);
        progressHeader.appendChild(progressLabel);

        const progressContent = this.createProgressTimeline(order);

        progressSection.appendChild(progressHeader);
        progressSection.appendChild(progressContent);

        return progressSection;
    }

    /**
     * Create progress timeline
     */
    createProgressTimeline(order) {
        const timeline = Utils.DOM.create('div', {
            className: 'progress-timeline'
        });

        const steps = [
            { key: 'assigned', label: 'Assigned', icon: '👤' },
            { key: 'in_progress', label: 'In Progress', icon: '⚡' },
            { key: 'evidence_submitted', label: 'Evidence Submitted', icon: '📸' },
            { key: 'completed', label: 'Completed', icon: '✅' }
        ];

        steps.forEach((step, index) => {
            const stepElement = Utils.DOM.create('div', {
                className: `timeline-step ${this.getStepStatus(order.status, step.key)}`
            });

            const stepIcon = Utils.DOM.create('div', {
                className: 'step-icon'
            }, step.icon);

            const stepLabel = Utils.DOM.create('div', {
                className: 'step-label'
            }, step.label);

            const stepTime = Utils.DOM.create('div', {
                className: 'step-time'
            }, this.getStepTime(order, step.key));

            stepElement.appendChild(stepIcon);
            stepElement.appendChild(stepLabel);
            stepElement.appendChild(stepTime);

            timeline.appendChild(stepElement);

            // Add connector line (except for last step)
            if (index < steps.length - 1) {
                const connector = Utils.DOM.create('div', {
                    className: `timeline-connector ${this.getConnectorStatus(order.status, step.key, steps[index + 1].key)}`
                });
                timeline.appendChild(connector);
            }
        });

        return timeline;
    }

    /**
     * Get step status for timeline
     */
    getStepStatus(currentStatus, stepKey) {
        const statusOrder = ['assigned', 'in_progress', 'evidence_submitted', 'completed'];
        const currentIndex = statusOrder.indexOf(currentStatus);
        const stepIndex = statusOrder.indexOf(stepKey);

        if (currentIndex >= stepIndex) {
            return stepKey === currentStatus ? 'current' : 'completed';
        }
        return 'pending';
    }

    /**
     * Get connector status for timeline
     */
    getConnectorStatus(currentStatus, fromStep, toStep) {
        const statusOrder = ['assigned', 'in_progress', 'evidence_submitted', 'completed'];
        const currentIndex = statusOrder.indexOf(currentStatus);
        const toIndex = statusOrder.indexOf(toStep);

        return currentIndex >= toIndex ? 'completed' : 'pending';
    }

    /**
     * Get step time from order timeline
     */
    getStepTime(order, stepKey) {
        if (order.timeline) {
            const timelineEntry = order.timeline.find(entry => entry.status === stepKey);
            if (timelineEntry) {
                return Utils.Format.date(timelineEntry.timestamp, 'time');
            }
        }

        // Fallback to order properties
        switch (stepKey) {
            case 'assigned':
                return order.assignedAt ? Utils.Format.date(order.assignedAt, 'time') : '';
            case 'in_progress':
                return order.startedAt ? Utils.Format.date(order.startedAt, 'time') : '';
            case 'evidence_submitted':
                return order.evidence?.uploadedAt ? Utils.Format.date(order.evidence.uploadedAt, 'time') : '';
            case 'completed':
                return order.completedAt ? Utils.Format.date(order.completedAt, 'time') : '';
            default:
                return '';
        }
    }

    /**
     * Create order card actions
     */
    createOrderCardActions(order) {
        const actions = Utils.DOM.create('div', {
            className: 'order-card-actions'
        });

        // View details button (always available)
        const viewBtn = Components.createButton({
            text: 'View Details',
            icon: '👁️',
            variant: 'secondary',
            size: 'sm',
            onClick: () => this.showOrderDetails(order.id)
        });

        actions.appendChild(viewBtn);

        // Status-specific actions
        if (order.status === 'assigned') {
            const startBtn = Components.createButton({
                text: 'Start Order',
                icon: '▶️',
                variant: 'success',
                size: 'sm',
                onClick: () => this.startOrder(order.id)
            });
            actions.appendChild(startBtn);
        }

        if (order.status === 'in_progress') {
            const submitBtn = Components.createButton({
                text: 'Submit Evidence',
                icon: '📸',
                variant: 'primary',
                size: 'sm',
                onClick: () => this.showEvidenceSubmission(order.id)
            });
            actions.appendChild(submitBtn);
        }

        if (order.status === 'evidence_submitted') {
            const statusBtn = Components.createButton({
                text: 'Awaiting Review',
                icon: '⏳',
                variant: 'warning',
                size: 'sm',
                disabled: true
            });
            actions.appendChild(statusBtn);
        }

        if (order.status === 'completed') {
            const completedBtn = Components.createButton({
                text: 'Completed',
                icon: '✅',
                variant: 'success',
                size: 'sm',
                disabled: true
            });
            actions.appendChild(completedBtn);
        }

        if (order.status === 'rejected') {
            const resubmitBtn = Components.createButton({
                text: 'Resubmit Evidence',
                icon: '🔄',
                variant: 'warning',
                size: 'sm',
                onClick: () => this.showEvidenceSubmission(order.id)
            });
            actions.appendChild(resubmitBtn);
        }

        return actions;
    }

    /**
     * Create status badge
     */
    createStatusBadge(status) {
        const statusMap = {
            'assigned': { text: 'Assigned', class: 'assigned' },
            'in_progress': { text: 'In Progress', class: 'in-progress' },
            'evidence_submitted': { text: 'Evidence Submitted', class: 'evidence-submitted' },
            'completed': { text: 'Completed', class: 'completed' },
            'rejected': { text: 'Rejected', class: 'rejected' }
        };

        const statusInfo = statusMap[status] || { text: status, class: 'unknown' };
        
        return Components.createStatusBadge({
            status: statusInfo.class,
            text: statusInfo.text
        });
    }

    /**
     * Create amount display
     */
    createAmountDisplay(order) {
        const amountContainer = Utils.DOM.create('div', {
            className: 'order-amount'
        });

        const currencySymbols = {
            'gold': '🪙',
            'usd': '💵',
            'toman': '﷼'
        };

        const symbol = currencySymbols[order.currencyUsed] || '';
        let formattedAmount = '';

        if (order.currencyUsed === 'gold') {
            formattedAmount = `${order.pricePaid}G`;
        } else if (order.currencyUsed === 'usd') {
            formattedAmount = `$${order.pricePaid.toFixed(2)}`;
        } else if (order.currencyUsed === 'toman') {
            formattedAmount = `${order.pricePaid.toLocaleString()}`;
        }

        const amountText = Utils.DOM.create('div', {
            className: 'amount-text'
        }, `${symbol} ${formattedAmount}`);

        amountContainer.appendChild(amountText);
        return amountContainer;
    }

    /**
     * Get service title by ID
     */
    getServiceTitle(serviceId) {
        if (typeof MockData !== 'undefined' && MockData.services) {
            const service = MockData.services.find(s => s.id === serviceId);
            return service ? service.title : 'Unknown Service';
        }
        return 'Unknown Service';
    }

    /**
     * Get service details by ID
     */
    getServiceDetails(serviceId) {
        if (typeof MockData !== 'undefined' && MockData.services) {
            return MockData.services.find(s => s.id === serviceId);
        }
        return null;
    }

    /**
     * Get buyer info by ID
     */
    getBuyerInfo(buyerId) {
        if (typeof MockData !== 'undefined' && MockData.buyers) {
            const buyer = MockData.buyers.find(b => b.id === buyerId);
            return buyer || 'Unknown Buyer';
        }
        return 'Unknown Buyer';
    }

    /**
     * Apply current filters to orders
     */
    applyFilters() {
        let filtered = Array.from(this.assignedOrders.values());

        // Status filter
        if (this.currentFilters.status !== 'all') {
            filtered = filtered.filter(order => order.status === this.currentFilters.status);
        }

        // Date range filter
        if (this.currentFilters.dateRange !== 'all') {
            const now = new Date();
            let startDate;

            switch (this.currentFilters.dateRange) {
                case 'today':
                    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    break;
                case 'week':
                    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case 'month':
                    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                    break;
            }

            if (startDate) {
                filtered = filtered.filter(order => new Date(order.createdAt) >= startDate);
            }
        }

        // Search filter
        if (this.currentFilters.search) {
            const searchTerm = this.currentFilters.search.toLowerCase();
            filtered = filtered.filter(order => {
                const serviceTitle = this.getServiceTitle(order.serviceId).toLowerCase();
                const buyerInfo = this.getBuyerInfo(order.buyerId);
                const buyerName = typeof buyerInfo === 'object' ? buyerInfo.discordUsername.toLowerCase() : '';
                
                return order.id.toLowerCase().includes(searchTerm) ||
                       serviceTitle.includes(searchTerm) ||
                       buyerName.includes(searchTerm) ||
                       order.status.toLowerCase().includes(searchTerm);
            });
        }

        // Apply sorting
        filtered.sort((a, b) => {
            let aValue = a[this.sortConfig.field];
            let bValue = b[this.sortConfig.field];

            // Handle date sorting
            if (this.sortConfig.field.includes('At') || this.sortConfig.field === 'createdAt') {
                aValue = new Date(aValue);
                bValue = new Date(bValue);
            }

            // Handle numeric sorting
            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return this.sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
            }

            // Handle string sorting
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return this.sortConfig.direction === 'asc' 
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            }

            // Handle date sorting
            if (aValue instanceof Date && bValue instanceof Date) {
                return this.sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
            }

            return 0;
        });

        this.filteredOrders = filtered;
    }

    /**
     * Handle filter changes
     */
    handleFilterChange() {
        this.applyFilters();
        this.renderBoosterOrders();
    }

    /**
     * Handle sorting
     */
    handleSort(field) {
        if (this.sortConfig.field === field) {
            this.sortConfig.direction = this.sortConfig.direction === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortConfig.field = field;
            this.sortConfig.direction = 'asc';
        }

        this.applyFilters();
        this.renderBoosterOrders();
    }

    /**
     * Start an assigned order
     */
    async startOrder(orderId) {
        try {
            const order = this.assignedOrders.get(orderId);
            if (!order) {
                throw new Error('Order not found');
            }

            if (order.status !== 'assigned') {
                throw new Error('Order must be in assigned status to start');
            }

            // Update order status to in_progress
            const result = await MockDataAPI.updateOrderStatus(orderId, 'in_progress', 'Booster started working on the order');
            
            if (result.success) {
                // Update local data
                this.assignedOrders.set(orderId, result.data);
                
                // Refresh the display
                this.applyFilters();
                this.renderBoosterOrders();
                
                Components.showNotification({
                    type: 'success',
                    title: 'Order Started',
                    message: 'You have successfully started working on this order.',
                    duration: 3000
                });
            } else {
                throw new Error(result.error || 'Failed to start order');
            }
        } catch (error) {
            console.error('Error starting order:', error);
            Components.showNotification({
                type: 'error',
                title: 'Error',
                message: error.message || 'Failed to start order. Please try again.',
                duration: 5000
            });
        }
    }

    /**
     * Show order details modal
     */
    showOrderDetails(orderId) {
        const order = this.assignedOrders.get(orderId);
        if (!order) return;

        const content = this.createOrderDetailsContent(order);
        
        Components.showModal({
            title: `Order Details - ${order.id}`,
            content: content,
            size: 'large',
            closable: true
        });
    }

    /**
     * Create order details content for modal
     */
    createOrderDetailsContent(order) {
        const container = Utils.DOM.create('div', {
            className: 'order-details-modal'
        });

        // Order summary
        const summary = this.createOrderSummary(order);
        container.appendChild(summary);

        // Service details
        const serviceDetails = this.createServiceDetailsSection(order);
        container.appendChild(serviceDetails);

        // Timeline
        const timeline = this.createDetailedTimeline(order);
        container.appendChild(timeline);

        // Evidence section (if available)
        if (order.evidence) {
            const evidence = this.createEvidenceSection(order);
            container.appendChild(evidence);
        }

        return container;
    }

    /**
     * Create order summary for details modal
     */
    createOrderSummary(order) {
        const summary = Utils.DOM.create('div', {
            className: 'order-summary'
        });

        const title = Utils.DOM.create('h3', {}, 'Order Summary');
        summary.appendChild(title);

        const summaryGrid = Utils.DOM.create('div', {
            className: 'summary-grid'
        });

        const fields = [
            { label: 'Order ID', value: order.id },
            { label: 'Service', value: this.getServiceTitle(order.serviceId) },
            { label: 'Status', value: order.status.replace('_', ' ').toUpperCase() },
            { label: 'Amount', value: this.formatOrderAmount(order) },
            { label: 'Created', value: Utils.Format.date(order.createdAt, 'datetime') },
            { label: 'Buyer', value: this.getBuyerDisplayName(order.buyerId) }
        ];

        fields.forEach(field => {
            const fieldEl = Utils.DOM.create('div', {
                className: 'summary-field'
            });

            const label = Utils.DOM.create('label', {}, field.label);
            const value = Utils.DOM.create('div', {
                className: 'field-value'
            }, field.value);

            fieldEl.appendChild(label);
            fieldEl.appendChild(value);
            summaryGrid.appendChild(fieldEl);
        });

        summary.appendChild(summaryGrid);
        return summary;
    }

    /**
     * Create service details section for modal
     */
    createServiceDetailsSection(order) {
        const section = Utils.DOM.create('div', {
            className: 'service-details-section'
        });

        const title = Utils.DOM.create('h3', {}, 'Service Details');
        section.appendChild(title);

        const service = this.getServiceDetails(order.serviceId);
        if (service) {
            const details = Utils.DOM.create('div', {
                className: 'service-details-content'
            });

            const description = Utils.DOM.create('p', {
                className: 'service-description'
            }, service.description);

            const requirements = Utils.DOM.create('div', {
                className: 'service-requirements'
            });

            const reqTitle = Utils.DOM.create('h4', {}, 'Requirements');
            const reqText = Utils.DOM.create('p', {}, service.requirements || 'No specific requirements');

            requirements.appendChild(reqTitle);
            requirements.appendChild(reqText);

            details.appendChild(description);
            details.appendChild(requirements);
            section.appendChild(details);
        }

        return section;
    }

    /**
     * Create detailed timeline for modal
     */
    createDetailedTimeline(order) {
        const section = Utils.DOM.create('div', {
            className: 'detailed-timeline-section'
        });

        const title = Utils.DOM.create('h3', {}, 'Order Timeline');
        section.appendChild(title);

        const timeline = Utils.DOM.create('div', {
            className: 'detailed-timeline'
        });

        if (order.timeline && order.timeline.length > 0) {
            order.timeline.forEach(event => {
                const timelineItem = Utils.DOM.create('div', {
                    className: 'timeline-item'
                });

                const timestamp = Utils.DOM.create('div', {
                    className: 'timeline-timestamp'
                }, Utils.Format.date(event.timestamp, 'datetime'));

                const status = Utils.DOM.create('div', {
                    className: 'timeline-status'
                }, event.status.replace('_', ' ').toUpperCase());

                const note = Utils.DOM.create('div', {
                    className: 'timeline-note'
                }, event.note);

                timelineItem.appendChild(timestamp);
                timelineItem.appendChild(status);
                timelineItem.appendChild(note);
                timeline.appendChild(timelineItem);
            });
        }

        section.appendChild(timeline);
        return section;
    }

    /**
     * Create evidence section for modal
     */
    createEvidenceSection(order) {
        const section = Utils.DOM.create('div', {
            className: 'evidence-section'
        });

        const title = Utils.DOM.create('h3', {}, 'Submitted Evidence');
        section.appendChild(title);

        const evidenceContent = Utils.DOM.create('div', {
            className: 'evidence-content'
        });

        if (order.evidence.imageUrl) {
            const image = Utils.DOM.create('img', {
                src: order.evidence.imageUrl,
                alt: 'Order Evidence',
                className: 'evidence-image'
            });
            evidenceContent.appendChild(image);
        }

        if (order.evidence.notes) {
            const notes = Utils.DOM.create('div', {
                className: 'evidence-notes'
            });

            const notesTitle = Utils.DOM.create('h4', {}, 'Completion Notes');
            const notesText = Utils.DOM.create('p', {}, order.evidence.notes);

            notes.appendChild(notesTitle);
            notes.appendChild(notesText);
            evidenceContent.appendChild(notes);
        }

        const uploadTime = Utils.DOM.create('div', {
            className: 'evidence-upload-time'
        }, `Uploaded: ${Utils.Format.date(order.evidence.uploadedAt, 'datetime')}`);

        evidenceContent.appendChild(uploadTime);
        section.appendChild(evidenceContent);
        return section;
    }

    /**
     * Show evidence submission modal
     */
    showEvidenceSubmission(orderId) {
        const order = this.assignedOrders.get(orderId);
        if (!order) return;

        const content = this.createEvidenceSubmissionForm(order);
        
        Components.showModal({
            title: `Submit Evidence - Order ${order.id}`,
            content: content,
            size: 'medium',
            closable: true,
            footer: [
                Components.createButton({
                    text: 'Cancel',
                    variant: 'secondary',
                    onClick: () => Components.closeModal()
                }),
                Components.createButton({
                    text: 'Submit Evidence',
                    variant: 'primary',
                    onClick: () => this.submitEvidence(orderId)
                })
            ]
        });
    }

    /**
     * Create evidence submission form
     */
    createEvidenceSubmissionForm(order) {
        const form = Utils.DOM.create('div', {
            className: 'evidence-submission-form'
        });

        // Service info
        const serviceInfo = Utils.DOM.create('div', {
            className: 'service-info'
        });

        const serviceTitle = Utils.DOM.create('h4', {}, this.getServiceTitle(order.serviceId));
        const orderInfo = Utils.DOM.create('p', {
            className: 'order-info'
        }, `Order #${order.id} for ${this.getBuyerDisplayName(order.buyerId)}`);

        serviceInfo.appendChild(serviceTitle);
        serviceInfo.appendChild(orderInfo);

        // Image upload
        const imageUpload = Components.createFormGroup({
            label: 'Evidence Screenshot',
            type: 'file',
            name: 'evidenceImage',
            required: true,
            help: 'Upload a screenshot showing completion of the service (PNG, JPG, max 10MB)'
        });

        // Completion notes
        const notesField = Components.createFormGroup({
            label: 'Completion Notes',
            type: 'textarea',
            name: 'completionNotes',
            placeholder: 'Describe what was completed, any issues encountered, and any additional information for the buyer...',
            required: true,
            help: 'Provide detailed notes about the service completion (minimum 20 characters)'
        });

        form.appendChild(serviceInfo);
        form.appendChild(imageUpload);
        form.appendChild(notesField);

        return form;
    }

    /**
     * Submit evidence for order
     */
    async submitEvidence(orderId) {
        try {
            const form = Utils.DOM.select('.evidence-submission-form');
            const imageInput = form.querySelector('input[name="evidenceImage"]');
            const notesInput = form.querySelector('textarea[name="completionNotes"]');

            // Validate inputs
            const errors = [];
            
            if (!imageInput.files || imageInput.files.length === 0) {
                errors.push('Evidence screenshot is required');
            } else {
                const file = imageInput.files[0];
                const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
                if (!allowedTypes.includes(file.type)) {
                    errors.push('Only PNG and JPEG images are allowed');
                }
                if (file.size > 10 * 1024 * 1024) { // 10MB
                    errors.push('Image size must be less than 10MB');
                }
            }

            if (!notesInput.value || notesInput.value.trim().length < 20) {
                errors.push('Completion notes must be at least 20 characters long');
            }

            if (errors.length > 0) {
                Components.showNotification({
                    type: 'error',
                    title: 'Validation Error',
                    message: errors.join('. '),
                    duration: 5000
                });
                return;
            }

            // Simulate file upload and create evidence data
            const evidenceData = {
                imageUrl: `/mock-images/evidence_${orderId}_${Date.now()}.png`,
                notes: notesInput.value.trim(),
                uploadedAt: new Date().toISOString()
            };

            // Submit evidence via API
            const result = await MockDataAPI.submitEvidence(orderId, evidenceData);
            
            if (result.success) {
                // Update local data
                this.assignedOrders.set(orderId, result.data);
                
                // Close modal and refresh display
                Components.closeModal();
                this.applyFilters();
                this.renderBoosterOrders();
                
                Components.showNotification({
                    type: 'success',
                    title: 'Evidence Submitted',
                    message: 'Your evidence has been submitted and is now under review.',
                    duration: 3000
                });
            } else {
                throw new Error(result.error || 'Failed to submit evidence');
            }
        } catch (error) {
            console.error('Error submitting evidence:', error);
            Components.showNotification({
                type: 'error',
                title: 'Submission Error',
                message: error.message || 'Failed to submit evidence. Please try again.',
                duration: 5000
            });
        }
    }

    /**
     * Format order amount for display
     */
    formatOrderAmount(order) {
        const currencySymbols = {
            'gold': '🪙',
            'usd': '💵',
            'toman': '﷼'
        };

        const symbol = currencySymbols[order.currencyUsed] || '';
        let formattedAmount = '';

        if (order.currencyUsed === 'gold') {
            formattedAmount = `${order.pricePaid}G`;
        } else if (order.currencyUsed === 'usd') {
            formattedAmount = `$${order.pricePaid.toFixed(2)}`;
        } else if (order.currencyUsed === 'toman') {
            formattedAmount = `${order.pricePaid.toLocaleString()}`;
        }

        return `${symbol} ${formattedAmount}`;
    }

    /**
     * Get buyer display name
     */
    getBuyerDisplayName(buyerId) {
        const buyer = this.getBuyerInfo(buyerId);
        return typeof buyer === 'object' ? buyer.discordUsername : 'Unknown Buyer';
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BoosterOrdersManager;
} else if (typeof window !== 'undefined') {
    window.BoosterOrdersManager = BoosterOrdersManager;
}