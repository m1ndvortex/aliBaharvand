/**
 * Order Management System for Service Provider Dashboard
 * Handles order listing, filtering, assignment, evidence review, and bulk operations
 */

class OrderManager {
    constructor() {
        this.orders = new Map();
        this.filteredOrders = [];
        this.currentFilters = {
            status: 'all',
            service: 'all',
            booster: 'all',
            dateRange: 'all',
            search: ''
        };
        this.sortConfig = {
            field: 'createdAt',
            direction: 'desc'
        };
        this.selectedOrders = new Set();
        
        // Initialize with mock data
        this.initializeMockData();
        
        // Bind methods
        this.renderOrders = this.renderOrders.bind(this);
        this.handleFilterChange = this.handleFilterChange.bind(this);
        this.handleSort = this.handleSort.bind(this);
        this.handleOrderSelection = this.handleOrderSelection.bind(this);
        this.handleBulkAction = this.handleBulkAction.bind(this);
    }

    /**
     * Initialize mock data
     */
    initializeMockData() {
        if (typeof MockData !== 'undefined' && MockData.orders) {
            MockData.orders.forEach(order => {
                this.orders.set(order.id, order);
            });
            this.applyFilters();
        }
    }

    /**
     * Render orders management interface
     */
    renderOrders() {
        const contentArea = Utils.DOM.select('.content-area');
        Utils.DOM.empty(contentArea);

        const container = Utils.DOM.create('div', {
            className: 'orders-management'
        });

        // Header
        const header = this.createOrdersHeader();
        container.appendChild(header);

        // Filters and controls
        const controls = this.createOrdersControls();
        container.appendChild(controls);

        // Orders table
        const tableContainer = this.createOrdersTable();
        container.appendChild(tableContainer);

        contentArea.appendChild(container);
    }

    /**
     * Create orders header
     */
    createOrdersHeader() {
        const header = Utils.DOM.create('div', {
            className: 'orders-header'
        });

        const title = Utils.DOM.create('h2', {
            className: 'orders-title'
        }, 'Order Management');

        const stats = this.createOrdersStats();

        header.appendChild(title);
        header.appendChild(stats);

        return header;
    }

    /**
     * Create orders statistics
     */
    createOrdersStats() {
        const stats = Utils.DOM.create('div', {
            className: 'orders-stats'
        });

        const statusCounts = this.getOrderStatusCounts();
        
        const statItems = [
            { label: 'Total Orders', value: this.orders.size, className: 'total' },
            { label: 'Pending', value: statusCounts.pending || 0, className: 'pending' },
            { label: 'In Progress', value: statusCounts.in_progress || 0, className: 'in-progress' },
            { label: 'Evidence Submitted', value: statusCounts.evidence_submitted || 0, className: 'evidence-submitted' },
            { label: 'Completed', value: statusCounts.completed || 0, className: 'completed' }
        ];

        statItems.forEach(item => {
            const statItem = Utils.DOM.create('div', {
                className: `stat-item ${item.className}`
            });

            const value = Utils.DOM.create('div', {
                className: 'stat-value'
            }, item.value.toString());

            const label = Utils.DOM.create('div', {
                className: 'stat-label'
            }, item.label);

            statItem.appendChild(value);
            statItem.appendChild(label);
            stats.appendChild(statItem);
        });

        return stats;
    }

    /**
     * Get order status counts
     */
    getOrderStatusCounts() {
        const counts = {};
        this.orders.forEach(order => {
            counts[order.status] = (counts[order.status] || 0) + 1;
        });
        return counts;
    }

    /**
     * Create orders controls (filters, search, bulk actions)
     */
    createOrdersControls() {
        const controls = Utils.DOM.create('div', {
            className: 'orders-controls'
        });

        // Filters section
        const filters = this.createOrdersFilters();
        controls.appendChild(filters);

        // Bulk actions section
        const bulkActions = this.createBulkActions();
        controls.appendChild(bulkActions);

        return controls;
    }

    /**
     * Create orders filters
     */
    createOrdersFilters() {
        const filters = Utils.DOM.create('div', {
            className: 'orders-filters'
        });

        // Status filter
        const statusFilter = Components.createFormGroup({
            label: 'Status',
            type: 'select',
            name: 'statusFilter',
            value: this.currentFilters.status,
            options: [
                { value: 'all', label: 'All Statuses' },
                { value: 'pending', label: 'Pending Assignment' },
                { value: 'assigned', label: 'Assigned' },
                { value: 'in_progress', label: 'In Progress' },
                { value: 'evidence_submitted', label: 'Evidence Submitted' },
                { value: 'under_review', label: 'Under Review' },
                { value: 'completed', label: 'Completed' },
                { value: 'rejected', label: 'Rejected' }
            ]
        });

        // Service filter
        const serviceOptions = this.getServiceOptions();
        const serviceFilter = Components.createFormGroup({
            label: 'Service',
            type: 'select',
            name: 'serviceFilter',
            value: this.currentFilters.service,
            options: [{ value: 'all', label: 'All Services' }, ...serviceOptions]
        });

        // Booster filter
        const boosterOptions = this.getBoosterOptions();
        const boosterFilter = Components.createFormGroup({
            label: 'Booster',
            type: 'select',
            name: 'boosterFilter',
            value: this.currentFilters.booster,
            options: [{ value: 'all', label: 'All Boosters' }, ...boosterOptions]
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
                { value: 'month', label: 'This Month' },
                { value: 'custom', label: 'Custom Range' }
            ]
        });

        // Search input
        const searchInput = Components.createFormGroup({
            label: 'Search',
            type: 'text',
            name: 'searchFilter',
            value: this.currentFilters.search,
            placeholder: 'Search orders, buyers, services...'
        });

        // Add event listeners
        statusFilter.querySelector('select').addEventListener('change', (e) => {
            this.currentFilters.status = e.target.value;
            this.handleFilterChange();
        });

        serviceFilter.querySelector('select').addEventListener('change', (e) => {
            this.currentFilters.service = e.target.value;
            this.handleFilterChange();
        });

        boosterFilter.querySelector('select').addEventListener('change', (e) => {
            this.currentFilters.booster = e.target.value;
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
        filters.appendChild(serviceFilter);
        filters.appendChild(boosterFilter);
        filters.appendChild(dateFilter);
        filters.appendChild(searchInput);

        return filters;
    }

    /**
     * Create bulk actions section
     */
    createBulkActions() {
        const bulkActions = Utils.DOM.create('div', {
            className: 'bulk-actions'
        });

        const selectedCount = Utils.DOM.create('span', {
            className: 'selected-count'
        }, `${this.selectedOrders.size} selected`);

        const actionButtons = Utils.DOM.create('div', {
            className: 'action-buttons'
        });

        const assignBtn = Components.createButton({
            text: 'Bulk Assign',
            icon: '👤',
            variant: 'primary',
            size: 'sm',
            disabled: this.selectedOrders.size === 0,
            onClick: () => this.handleBulkAction('assign')
        });

        const exportBtn = Components.createButton({
            text: 'Export',
            icon: '📊',
            variant: 'secondary',
            size: 'sm',
            disabled: this.selectedOrders.size === 0,
            onClick: () => this.handleBulkAction('export')
        });

        const deleteBtn = Components.createButton({
            text: 'Delete',
            icon: '🗑️',
            variant: 'error',
            size: 'sm',
            disabled: this.selectedOrders.size === 0,
            onClick: () => this.handleBulkAction('delete')
        });

        actionButtons.appendChild(assignBtn);
        actionButtons.appendChild(exportBtn);
        actionButtons.appendChild(deleteBtn);

        bulkActions.appendChild(selectedCount);
        bulkActions.appendChild(actionButtons);

        // Hide bulk actions if no orders selected
        if (this.selectedOrders.size === 0) {
            Utils.DOM.addClass(bulkActions, 'hidden');
        }

        return bulkActions;
    }

    /**
     * Create orders table
     */
    createOrdersTable() {
        const container = Utils.DOM.create('div', {
            className: 'orders-table-container'
        });

        if (this.filteredOrders.length === 0) {
            const emptyState = Components.createCard({
                title: 'No Orders Found',
                content: `
                    <p>No orders match your current filters.</p>
                    <p>Try adjusting your search criteria or filters.</p>
                `,
                className: 'empty-state'
            });
            container.appendChild(emptyState);
            return container;
        }

        const table = this.createTable();
        container.appendChild(table);

        return container;
    }

    /**
     * Create the actual table element
     */
    createTable() {
        const columns = [
            { 
                key: 'select', 
                label: '', 
                sortable: false, 
                width: '40px',
                render: (value, row) => this.createSelectCheckbox(row.id)
            },
            { key: 'id', label: 'Order ID', sortable: true },
            { key: 'service', label: 'Service', sortable: true },
            { 
                key: 'buyer', 
                label: 'Buyer', 
                sortable: true,
                render: (value, row) => this.getBuyerInfo(row.buyerId)
            },
            { 
                key: 'booster', 
                label: 'Booster', 
                sortable: true,
                render: (value, row) => this.getBoosterInfo(row.boosterId)
            },
            { 
                key: 'status', 
                label: 'Status', 
                sortable: true,
                render: (value, row) => this.createStatusBadge(row.status)
            },
            { 
                key: 'amount', 
                label: 'Amount', 
                sortable: true,
                render: (value, row) => this.formatOrderAmount(row)
            },
            { 
                key: 'createdAt', 
                label: 'Created', 
                sortable: true,
                render: (value, row) => Utils.Format.date(row.createdAt, 'datetime')
            },
            { 
                key: 'actions', 
                label: 'Actions', 
                sortable: false, 
                width: '200px',
                render: (value, row) => this.createOrderActions(row)
            }
        ];

        const tableData = this.filteredOrders.map(order => ({
            // Include all original order properties
            ...order,
            // Add computed properties for display
            service: this.getServiceTitle(order.serviceId)
        }));

        const table = Components.createTable({
            columns: columns,
            data: tableData,
            className: 'orders-table',
            sortable: true,
            selectable: false // We handle selection manually
        });

        // Add sort event listeners
        const headers = table.querySelectorAll('th.sortable');
        headers.forEach(header => {
            header.addEventListener('click', () => {
                const column = columns.find(col => col.label === header.textContent);
                if (column) {
                    this.handleSort(column.key);
                }
            });
        });

        return table;
    }

    /**
     * Create select checkbox for order
     */
    createSelectCheckbox(orderId) {
        const checkbox = Utils.DOM.create('input', {
            type: 'checkbox',
            className: 'order-select',
            dataset: { orderId: orderId },
            checked: this.selectedOrders.has(orderId),
            onchange: (e) => this.handleOrderSelection(orderId, e.target.checked)
        });

        return checkbox;
    }

    /**
     * Create status badge for order
     */
    createStatusBadge(status) {
        const statusMap = {
            'pending': { text: 'Pending', class: 'pending' },
            'assigned': { text: 'Assigned', class: 'assigned' },
            'in_progress': { text: 'In Progress', class: 'in-progress' },
            'evidence_submitted': { text: 'Evidence Submitted', class: 'evidence-submitted' },
            'under_review': { text: 'Under Review', class: 'under-review' },
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
     * Create action buttons for order
     */
    createOrderActions(order) {
        const actions = Utils.DOM.create('div', {
            className: 'order-actions'
        });

        // View details button
        const viewBtn = Components.createButton({
            text: 'View',
            icon: '👁️',
            variant: 'secondary',
            size: 'sm',
            disabled: false,
            onClick: () => this.showOrderDetails(order.id)
        });

        // Status-specific actions
        if (order.status === 'pending') {
            const assignBtn = Components.createButton({
                text: 'Assign',
                icon: '👤',
                variant: 'primary',
                size: 'sm',
                disabled: false,
                onClick: () => this.showBoosterAssignment(order.id)
            });
            actions.appendChild(assignBtn);
        }

        if (order.status === 'evidence_submitted') {
            const reviewBtn = Components.createButton({
                text: 'Review',
                icon: '🔍',
                variant: 'warning',
                size: 'sm',
                disabled: false,
                onClick: () => this.showEvidenceReview(order.id)
            });
            actions.appendChild(reviewBtn);
        }

        actions.appendChild(viewBtn);

        return actions;
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
     * Get buyer info by ID
     */
    getBuyerInfo(buyerId) {
        if (typeof MockData !== 'undefined' && MockData.buyers) {
            const buyer = MockData.buyers.find(b => b.id === buyerId);
            if (buyer) {
                const info = Utils.DOM.create('div', {
                    className: 'buyer-info'
                });

                const avatar = Utils.DOM.create('img', {
                    src: buyer.discordAvatarUrl,
                    alt: buyer.discordUsername,
                    className: 'buyer-avatar'
                });

                const name = Utils.DOM.create('span', {
                    className: 'buyer-name'
                }, buyer.discordUsername);

                info.appendChild(avatar);
                info.appendChild(name);
                return info;
            }
        }
        return 'Unknown Buyer';
    }

    /**
     * Get booster info by ID
     */
    getBoosterInfo(boosterId) {
        if (!boosterId) {
            return Utils.DOM.create('span', {
                className: 'no-booster'
            }, 'Not Assigned');
        }

        if (typeof MockData !== 'undefined' && MockData.users) {
            const booster = MockData.users.find(u => u.id === boosterId);
            if (booster) {
                const info = Utils.DOM.create('div', {
                    className: 'booster-info'
                });

                const avatar = Utils.DOM.create('img', {
                    src: booster.discordAvatarUrl,
                    alt: booster.discordUsername,
                    className: 'booster-avatar'
                });

                const name = Utils.DOM.create('span', {
                    className: 'booster-name'
                }, booster.discordUsername);

                info.appendChild(avatar);
                info.appendChild(name);
                return info;
            }
        }
        return 'Unknown Booster';
    }

    /**
     * Format order amount
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
     * Get service options for filter
     */
    getServiceOptions() {
        const services = new Set();
        this.orders.forEach(order => {
            const serviceTitle = this.getServiceTitle(order.serviceId);
            if (serviceTitle !== 'Unknown Service') {
                services.add({ value: order.serviceId, label: serviceTitle });
            }
        });
        return Array.from(services);
    }

    /**
     * Get booster options for filter
     */
    getBoosterOptions() {
        const boosters = new Set();
        this.orders.forEach(order => {
            if (order.boosterId && typeof MockData !== 'undefined' && MockData.users) {
                const booster = MockData.users.find(u => u.id === order.boosterId);
                if (booster) {
                    boosters.add({ value: booster.id, label: booster.discordUsername });
                }
            }
        });
        return Array.from(boosters);
    }

    /**
     * Apply current filters to orders
     */
    applyFilters() {
        let filtered = Array.from(this.orders.values());

        // Status filter
        if (this.currentFilters.status !== 'all') {
            filtered = filtered.filter(order => order.status === this.currentFilters.status);
        }

        // Service filter
        if (this.currentFilters.service !== 'all') {
            filtered = filtered.filter(order => order.serviceId === this.currentFilters.service);
        }

        // Booster filter
        if (this.currentFilters.booster !== 'all') {
            filtered = filtered.filter(order => order.boosterId === this.currentFilters.booster);
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
                const buyerName = typeof buyerInfo === 'string' ? buyerInfo.toLowerCase() : '';
                
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
            if (this.sortConfig.field.includes('At')) {
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
        this.renderOrders();
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
        this.renderOrders();
    }

    /**
     * Handle order selection
     */
    handleOrderSelection(orderId, selected) {
        if (selected) {
            this.selectedOrders.add(orderId);
        } else {
            this.selectedOrders.delete(orderId);
        }

        // Update bulk actions visibility
        const bulkActions = Utils.DOM.select('.bulk-actions');
        const selectedCount = Utils.DOM.select('.selected-count');
        
        if (bulkActions && selectedCount) {
            selectedCount.textContent = `${this.selectedOrders.size} selected`;
            
            if (this.selectedOrders.size > 0) {
                Utils.DOM.removeClass(bulkActions, 'hidden');
            } else {
                Utils.DOM.addClass(bulkActions, 'hidden');
            }

            // Update button states
            const buttons = bulkActions.querySelectorAll('button');
            buttons.forEach(btn => {
                btn.disabled = this.selectedOrders.size === 0;
            });
        }
    }

    /**
     * Handle bulk actions
     */
    handleBulkAction(action) {
        const selectedOrderIds = Array.from(this.selectedOrders);
        
        switch (action) {
            case 'assign':
                this.showBulkBoosterAssignment(selectedOrderIds);
                break;
            case 'export':
                this.exportOrders(selectedOrderIds);
                break;
            case 'delete':
                this.showBulkDeleteConfirmation(selectedOrderIds);
                break;
        }
    }

    /**
     * Show order details modal
     */
    showOrderDetails(orderId) {
        const order = this.orders.get(orderId);
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
     * Create order details content
     */
    createOrderDetailsContent(order) {
        const container = Utils.DOM.create('div', {
            className: 'order-details'
        });

        // Order info section
        const orderInfo = this.createOrderInfoSection(order);
        container.appendChild(orderInfo);

        // Timeline section
        const timeline = this.createOrderTimeline(order);
        container.appendChild(timeline);

        // Evidence section (if available)
        if (order.evidence) {
            const evidence = this.createEvidenceSection(order);
            container.appendChild(evidence);
        }

        return container;
    }

    /**
     * Create order info section
     */
    createOrderInfoSection(order) {
        const section = Utils.DOM.create('div', {
            className: 'order-info-section'
        });

        const title = Utils.DOM.create('h3', {}, 'Order Information');
        section.appendChild(title);

        const info = Utils.DOM.create('div', {
            className: 'order-info-grid'
        });

        const fields = [
            { label: 'Order ID', value: order.id },
            { label: 'Service', value: this.getServiceTitle(order.serviceId) },
            { label: 'Status', value: order.status },
            { label: 'Amount', value: this.formatOrderAmount(order) },
            { label: 'Created', value: Utils.Format.date(order.createdAt, 'datetime') },
            { label: 'Special Instructions', value: order.specialInstructions || 'None' }
        ];

        fields.forEach(field => {
            const fieldEl = Utils.DOM.create('div', {
                className: 'info-field'
            });

            const label = Utils.DOM.create('label', {}, field.label);
            const value = Utils.DOM.create('div', {
                className: 'field-value'
            }, field.value);

            fieldEl.appendChild(label);
            fieldEl.appendChild(value);
            info.appendChild(fieldEl);
        });

        section.appendChild(info);
        return section;
    }

    /**
     * Create order timeline with enhanced visual progress representation
     */
    createOrderTimeline(order) {
        const section = Utils.DOM.create('div', {
            className: 'order-timeline-section'
        });

        const title = Utils.DOM.create('h3', {}, 'Order Timeline');
        section.appendChild(title);

        // Create progress indicator
        const progressIndicator = this.createOrderProgressIndicator(order);
        section.appendChild(progressIndicator);

        const timeline = Utils.DOM.create('div', {
            className: 'order-timeline'
        });

        if (order.timeline && order.timeline.length > 0) {
            order.timeline.forEach((event, index) => {
                const timelineItem = Utils.DOM.create('div', {
                    className: `timeline-item ${this.getTimelineItemClass(event.status)}`
                });

                const timelineIcon = Utils.DOM.create('div', {
                    className: 'timeline-icon'
                });
                timelineIcon.innerHTML = this.getStatusIcon(event.status);

                const timelineContent = Utils.DOM.create('div', {
                    className: 'timeline-content'
                });

                const timelineHeader = Utils.DOM.create('div', {
                    className: 'timeline-header'
                });

                const status = Utils.DOM.create('div', {
                    className: 'timeline-status'
                }, this.getStatusDisplayName(event.status));

                const timestamp = Utils.DOM.create('div', {
                    className: 'timeline-timestamp'
                }, Utils.Format.date(event.timestamp, 'datetime'));

                timelineHeader.appendChild(status);
                timelineHeader.appendChild(timestamp);

                const note = Utils.DOM.create('div', {
                    className: 'timeline-note'
                }, event.note);

                timelineContent.appendChild(timelineHeader);
                timelineContent.appendChild(note);

                timelineItem.appendChild(timelineIcon);
                timelineItem.appendChild(timelineContent);
                timeline.appendChild(timelineItem);

                // Add connector line (except for last item)
                if (index < order.timeline.length - 1) {
                    const connector = Utils.DOM.create('div', {
                        className: 'timeline-connector'
                    });
                    timeline.appendChild(connector);
                }
            });
        } else {
            const noTimeline = Utils.DOM.create('p', {
                className: 'no-timeline'
            }, 'No timeline data available');
            timeline.appendChild(noTimeline);
        }

        section.appendChild(timeline);
        return section;
    }

    /**
     * Create visual progress indicator for order status
     */
    createOrderProgressIndicator(order) {
        const progressContainer = Utils.DOM.create('div', {
            className: 'order-progress-indicator'
        });

        const statusFlow = [
            { key: 'pending', label: 'Pending', icon: '⏳' },
            { key: 'assigned', label: 'Assigned', icon: '👤' },
            { key: 'in_progress', label: 'In Progress', icon: '🎮' },
            { key: 'evidence_submitted', label: 'Evidence Submitted', icon: '📸' },
            { key: 'under_review', label: 'Under Review', icon: '🔍' },
            { key: 'completed', label: 'Completed', icon: '✅' }
        ];

        const currentStatusIndex = statusFlow.findIndex(s => s.key === order.status);
        const isRejected = order.status === 'rejected';

        statusFlow.forEach((status, index) => {
            const stepElement = Utils.DOM.create('div', {
                className: `progress-step ${this.getProgressStepClass(status.key, order.status, index, currentStatusIndex, isRejected)}`
            });

            const stepIcon = Utils.DOM.create('div', {
                className: 'step-icon'
            }, status.icon);

            const stepLabel = Utils.DOM.create('div', {
                className: 'step-label'
            }, status.label);

            stepElement.appendChild(stepIcon);
            stepElement.appendChild(stepLabel);
            progressContainer.appendChild(stepElement);

            // Add connector (except for last item)
            if (index < statusFlow.length - 1) {
                const connector = Utils.DOM.create('div', {
                    className: `progress-connector ${index < currentStatusIndex ? 'completed' : ''}`
                });
                progressContainer.appendChild(connector);
            }
        });

        // Add rejected status if applicable
        if (isRejected) {
            const rejectedStep = Utils.DOM.create('div', {
                className: 'progress-step rejected active'
            });

            const rejectedIcon = Utils.DOM.create('div', {
                className: 'step-icon'
            }, '❌');

            const rejectedLabel = Utils.DOM.create('div', {
                className: 'step-label'
            }, 'Rejected');

            rejectedStep.appendChild(rejectedIcon);
            rejectedStep.appendChild(rejectedLabel);
            progressContainer.appendChild(rejectedStep);
        }

        return progressContainer;
    }

    /**
     * Get CSS class for progress step based on current order status
     */
    getProgressStepClass(stepStatus, currentStatus, stepIndex, currentIndex, isRejected) {
        if (isRejected && stepStatus !== 'pending') {
            return stepIndex <= currentIndex ? 'completed rejected-flow' : 'inactive';
        }

        if (stepStatus === currentStatus) {
            return 'active';
        }

        if (stepIndex < currentIndex) {
            return 'completed';
        }

        return 'inactive';
    }

    /**
     * Get timeline item CSS class based on status
     */
    getTimelineItemClass(status) {
        const statusClasses = {
            'pending': 'timeline-pending',
            'assigned': 'timeline-assigned',
            'in_progress': 'timeline-in-progress',
            'evidence_submitted': 'timeline-evidence',
            'under_review': 'timeline-review',
            'completed': 'timeline-completed',
            'rejected': 'timeline-rejected'
        };
        return statusClasses[status] || 'timeline-default';
    }

    /**
     * Get icon for order status
     */
    getStatusIcon(status) {
        const statusIcons = {
            'pending': '⏳',
            'assigned': '👤',
            'in_progress': '🎮',
            'evidence_submitted': '📸',
            'under_review': '🔍',
            'completed': '✅',
            'rejected': '❌'
        };
        return statusIcons[status] || '📋';
    }

    /**
     * Get display name for status
     */
    getStatusDisplayName(status) {
        const statusNames = {
            'pending': 'Pending Assignment',
            'assigned': 'Assigned to Booster',
            'in_progress': 'Service In Progress',
            'evidence_submitted': 'Evidence Submitted',
            'under_review': 'Under Review',
            'completed': 'Completed Successfully',
            'rejected': 'Rejected'
        };
        return statusNames[status] || status;
    }

    /**
     * Create evidence section
     */
    createEvidenceSection(order) {
        const section = Utils.DOM.create('div', {
            className: 'evidence-section'
        });

        const title = Utils.DOM.create('h3', {}, 'Evidence');
        section.appendChild(title);

        const evidence = Utils.DOM.create('div', {
            className: 'evidence-content'
        });

        if (order.evidence.imageUrl) {
            const image = Utils.DOM.create('img', {
                src: order.evidence.imageUrl,
                alt: 'Order Evidence',
                className: 'evidence-image',
                onclick: () => this.showImageModal(order.evidence.imageUrl)
            });
            evidence.appendChild(image);
        }

        if (order.evidence.notes) {
            const notes = Utils.DOM.create('div', {
                className: 'evidence-notes'
            });

            const notesLabel = Utils.DOM.create('label', {}, 'Completion Notes:');
            const notesText = Utils.DOM.create('p', {}, order.evidence.notes);

            notes.appendChild(notesLabel);
            notes.appendChild(notesText);
            evidence.appendChild(notes);
        }

        section.appendChild(evidence);
        return section;
    }

    /**
     * Show booster assignment modal
     */
    showBoosterAssignment(orderId) {
        const order = this.orders.get(orderId);
        if (!order) return;

        const content = this.createBoosterAssignmentContent(order);
        
        Components.showModal({
            title: `Assign Booster - ${order.id}`,
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
                    text: 'Assign Booster',
                    variant: 'primary',
                    onClick: () => this.assignBooster(orderId)
                })
            ]
        });
    }

    /**
     * Create booster assignment content
     */
    createBoosterAssignmentContent(order) {
        const container = Utils.DOM.create('div', {
            className: 'booster-assignment'
        });

        // Order summary
        const orderSummary = Utils.DOM.create('div', {
            className: 'order-summary'
        });

        const summaryTitle = Utils.DOM.create('h4', {}, 'Order Summary');
        const serviceTitle = Utils.DOM.create('p', {}, `Service: ${this.getServiceTitle(order.serviceId)}`);
        const amount = Utils.DOM.create('p', {}, `Amount: ${this.formatOrderAmount(order)}`);

        orderSummary.appendChild(summaryTitle);
        orderSummary.appendChild(serviceTitle);
        orderSummary.appendChild(amount);

        // Available boosters
        const boostersSection = Utils.DOM.create('div', {
            className: 'available-boosters'
        });

        const boostersTitle = Utils.DOM.create('h4', {}, 'Available Boosters');
        const boostersList = this.createAvailableBoostersList();

        boostersSection.appendChild(boostersTitle);
        boostersSection.appendChild(boostersList);

        container.appendChild(orderSummary);
        container.appendChild(boostersSection);

        return container;
    }

    /**
     * Create available boosters list
     */
    createAvailableBoostersList() {
        const list = Utils.DOM.create('div', {
            className: 'boosters-list'
        });

        // Get available boosters (users with booster role)
        const availableBoosters = MockData.users.filter(user => 
            user.roles.includes('booster') && user.isActive
        );

        if (availableBoosters.length === 0) {
            const noBoosters = Utils.DOM.create('p', {
                className: 'no-boosters'
            }, 'No available boosters found');
            list.appendChild(noBoosters);
            return list;
        }

        availableBoosters.forEach(booster => {
            const boosterItem = Utils.DOM.create('div', {
                className: 'booster-item'
            });

            const radio = Utils.DOM.create('input', {
                type: 'radio',
                name: 'selectedBooster',
                value: booster.id,
                id: `booster_${booster.id}`
            });

            const label = Utils.DOM.create('label', {
                for: `booster_${booster.id}`,
                className: 'booster-label'
            });

            const avatar = Utils.DOM.create('img', {
                src: booster.discordAvatarUrl,
                alt: booster.discordUsername,
                className: 'booster-avatar'
            });

            const info = Utils.DOM.create('div', {
                className: 'booster-info'
            });

            const name = Utils.DOM.create('div', {
                className: 'booster-name'
            }, booster.discordUsername);

            const stats = Utils.DOM.create('div', {
                className: 'booster-stats'
            }, `Rating: ${booster.stats.rating} | Completed: ${booster.stats.completedOrders}`);

            info.appendChild(name);
            info.appendChild(stats);

            label.appendChild(avatar);
            label.appendChild(info);

            boosterItem.appendChild(radio);
            boosterItem.appendChild(label);
            list.appendChild(boosterItem);
        });

        return list;
    }

    /**
     * Assign booster to order
     */
    assignBooster(orderId) {
        const selectedBooster = document.querySelector('input[name="selectedBooster"]:checked');
        
        if (!selectedBooster) {
            Components.showNotification({
                type: 'error',
                title: 'No Booster Selected',
                message: 'Please select a booster to assign to this order.',
                duration: 4000
            });
            return;
        }

        const boosterId = selectedBooster.value;
        const order = this.orders.get(orderId);
        
        if (order) {
            try {
                // Set booster before status change
                order.boosterId = boosterId;
                
                // Use comprehensive status management
                const boosterName = MockData.users.find(u => u.id === boosterId)?.discordUsername || 'Unknown Booster';
                this.changeOrderStatus(orderId, 'assigned', `Assigned to ${boosterName}`, 'current_user');

                // Close modal and refresh view
                Components.closeModal();
                this.applyFilters();
                this.renderOrders();

                Components.showNotification({
                    type: 'success',
                    title: 'Booster Assigned',
                    message: `Order ${orderId} has been assigned successfully to ${boosterName}.`,
                    duration: 3000
                });
            } catch (error) {
                Components.showNotification({
                    type: 'error',
                    title: 'Assignment Failed',
                    message: error.message,
                    duration: 4000
                });
            }
        }
    }

    /**
     * Show evidence review modal with comprehensive review capabilities
     */
    showEvidenceReview(orderId) {
        const order = this.orders.get(orderId);
        if (!order || !order.evidence) {
            Utils.UI.showNotification('No evidence found for this order', 'error');
            return;
        }

        const content = this.createEvidenceReviewContent(order);
        
        Components.showModal({
            title: `🔍 Review Evidence - Order ${order.id}`,
            content: content,
            size: 'extra-large',
            closable: true,
            className: 'evidence-review-modal',
            footer: this.createEvidenceReviewFooter(orderId)
        });

        // Initialize evidence review functionality
        this.initializeEvidenceReview(orderId);
    }

    /**
     * Create comprehensive evidence review content
     */
    createEvidenceReviewContent(order) {
        const container = Utils.DOM.create('div', {
            className: 'evidence-review-container'
        });

        // Create main layout with sidebar and content
        const layout = Utils.DOM.create('div', {
            className: 'evidence-review-layout'
        });

        // Left sidebar with order info and quality assessment
        const sidebar = this.createEvidenceReviewSidebar(order);
        
        // Main content area with evidence display
        const mainContent = this.createEvidenceMainContent(order);

        layout.appendChild(sidebar);
        layout.appendChild(mainContent);
        container.appendChild(layout);

        return container;
    }

    /**
     * Create evidence review sidebar
     */
    createEvidenceReviewSidebar(order) {
        const sidebar = Utils.DOM.create('div', {
            className: 'evidence-review-sidebar'
        });

        // Order Information Section
        const orderInfoSection = this.createOrderInfoSection(order);
        sidebar.appendChild(orderInfoSection);

        // Quality Assessment Section
        const qualitySection = this.createQualityAssessmentSection(order);
        sidebar.appendChild(qualitySection);

        // Evidence History Section
        const historySection = this.createEvidenceHistorySection(order);
        sidebar.appendChild(historySection);

        // Review Guidelines Section
        const guidelinesSection = this.createReviewGuidelinesSection();
        sidebar.appendChild(guidelinesSection);

        return sidebar;
    }

    /**
     * Create evidence main content area
     */
    createEvidenceMainContent(order) {
        const mainContent = Utils.DOM.create('div', {
            className: 'evidence-main-content'
        });

        // Evidence Display Header
        const header = Utils.DOM.create('div', {
            className: 'evidence-content-header'
        });

        const title = Utils.DOM.create('h3', {
            className: 'evidence-title'
        }, '📸 Submitted Evidence');

        const timestamp = Utils.DOM.create('div', {
            className: 'evidence-timestamp'
        }, `Submitted: ${Utils.Format.date(order.evidence.uploadedAt, 'datetime')}`);

        header.appendChild(title);
        header.appendChild(timestamp);
        mainContent.appendChild(header);

        // Evidence Images Section
        if (order.evidence.imageUrl || (order.evidence.images && order.evidence.images.length > 0)) {
            const imagesSection = this.createEvidenceImagesSection(order);
            mainContent.appendChild(imagesSection);
        }

        // Evidence Notes Section
        if (order.evidence.notes) {
            const notesSection = this.createEvidenceNotesSection(order);
            mainContent.appendChild(notesSection);
        }

        // Review Actions Section
        const actionsSection = this.createReviewActionsSection(order);
        mainContent.appendChild(actionsSection);

        return mainContent;
    }

    /**
     * Create order information section
     */
    createOrderInfoSection(order) {
        const section = Utils.DOM.create('div', {
            className: 'review-section order-info-section'
        });

        const title = Utils.DOM.create('h4', {
            className: 'section-title'
        }, '📋 Order Details');

        const infoGrid = Utils.DOM.create('div', {
            className: 'order-info-grid'
        });

        const infoItems = [
            { label: 'Order ID', value: order.id, icon: '🆔' },
            { label: 'Service', value: this.getServiceTitle(order.serviceId), icon: '🎮' },
            { label: 'Booster', value: this.getBoosterDisplayName(order.boosterId), icon: '👤' },
            { label: 'Amount', value: this.formatOrderAmount(order), icon: '💰' },
            { label: 'Status', value: order.status, icon: '📊' },
            { label: 'Created', value: Utils.Format.date(order.createdAt, 'datetime'), icon: '📅' }
        ];

        infoItems.forEach(item => {
            const infoItem = Utils.DOM.create('div', {
                className: 'info-item'
            });

            const label = Utils.DOM.create('div', {
                className: 'info-label'
            }, `${item.icon} ${item.label}`);

            const value = Utils.DOM.create('div', {
                className: 'info-value'
            }, item.value);

            infoItem.appendChild(label);
            infoItem.appendChild(value);
            infoGrid.appendChild(infoItem);
        });

        // Special Instructions
        if (order.specialInstructions) {
            const instructionsItem = Utils.DOM.create('div', {
                className: 'info-item special-instructions'
            });

            const label = Utils.DOM.create('div', {
                className: 'info-label'
            }, '📝 Special Instructions');

            const value = Utils.DOM.create('div', {
                className: 'info-value instructions-text'
            }, order.specialInstructions);

            instructionsItem.appendChild(label);
            instructionsItem.appendChild(value);
            infoGrid.appendChild(instructionsItem);
        }

        section.appendChild(title);
        section.appendChild(infoGrid);

        return section;
    }

    /**
     * Create quality assessment section
     */
    createQualityAssessmentSection(order) {
        const section = Utils.DOM.create('div', {
            className: 'review-section quality-assessment-section'
        });

        const title = Utils.DOM.create('h4', {
            className: 'section-title'
        }, '⭐ Quality Assessment');

        const assessmentForm = Utils.DOM.create('div', {
            className: 'quality-assessment-form'
        });

        // Quality criteria checklist
        const criteria = [
            { id: 'evidence_clear', label: 'Evidence is clear and readable', weight: 3 },
            { id: 'service_completed', label: 'Service appears completed as requested', weight: 5 },
            { id: 'instructions_followed', label: 'Special instructions were followed', weight: 4 },
            { id: 'notes_detailed', label: 'Completion notes are detailed and helpful', weight: 2 },
            { id: 'professional_quality', label: 'Professional quality of service delivery', weight: 4 }
        ];

        criteria.forEach(criterion => {
            const criterionItem = Utils.DOM.create('div', {
                className: 'quality-criterion'
            });

            const checkbox = Utils.DOM.create('input', {
                type: 'checkbox',
                id: `criterion_${criterion.id}`,
                className: 'criterion-checkbox',
                dataset: { weight: criterion.weight }
            });

            const label = Utils.DOM.create('label', {
                htmlFor: `criterion_${criterion.id}`,
                className: 'criterion-label'
            }, criterion.label);

            const weight = Utils.DOM.create('span', {
                className: 'criterion-weight'
            }, `(${criterion.weight}pts)`);

            criterionItem.appendChild(checkbox);
            criterionItem.appendChild(label);
            criterionItem.appendChild(weight);
            assessmentForm.appendChild(criterionItem);
        });

        // Quality score display
        const scoreDisplay = Utils.DOM.create('div', {
            className: 'quality-score-display'
        });

        const scoreLabel = Utils.DOM.create('div', {
            className: 'score-label'
        }, 'Quality Score:');

        const scoreValue = Utils.DOM.create('div', {
            className: 'score-value',
            id: 'qualityScore'
        }, '0/18');

        const scoreBar = Utils.DOM.create('div', {
            className: 'score-bar'
        });

        const scoreProgress = Utils.DOM.create('div', {
            className: 'score-progress',
            id: 'scoreProgress'
        });

        scoreBar.appendChild(scoreProgress);
        scoreDisplay.appendChild(scoreLabel);
        scoreDisplay.appendChild(scoreValue);
        scoreDisplay.appendChild(scoreBar);

        section.appendChild(title);
        section.appendChild(assessmentForm);
        section.appendChild(scoreDisplay);

        return section;
    }

    /**
     * Create evidence history section
     */
    createEvidenceHistorySection(order) {
        const section = Utils.DOM.create('div', {
            className: 'review-section evidence-history-section'
        });

        const title = Utils.DOM.create('h4', {
            className: 'section-title'
        }, '📚 Evidence History');

        const historyList = Utils.DOM.create('div', {
            className: 'evidence-history-list'
        });

        // Get evidence history from order timeline
        const evidenceEvents = order.timeline?.filter(event => 
            event.status === 'evidence_submitted' || 
            event.status === 'under_review' || 
            event.status === 'rejected' ||
            event.status === 'completed'
        ) || [];

        if (evidenceEvents.length === 0) {
            const noHistory = Utils.DOM.create('div', {
                className: 'no-history'
            }, 'No previous evidence submissions');
            historyList.appendChild(noHistory);
        } else {
            evidenceEvents.forEach((event, index) => {
                const historyItem = this.createEvidenceHistoryItem(event, index);
                historyList.appendChild(historyItem);
            });
        }

        section.appendChild(title);
        section.appendChild(historyList);

        return section;
    }

    /**
     * Create evidence history item
     */
    createEvidenceHistoryItem(event, index) {
        const item = Utils.DOM.create('div', {
            className: 'history-item'
        });

        const statusIcon = this.getStatusIcon(event.status);
        const statusText = this.getStatusDisplayText(event.status);

        const header = Utils.DOM.create('div', {
            className: 'history-header'
        });

        const status = Utils.DOM.create('div', {
            className: `history-status status-${event.status}`
        }, `${statusIcon} ${statusText}`);

        const timestamp = Utils.DOM.create('div', {
            className: 'history-timestamp'
        }, Utils.Format.date(event.timestamp, 'datetime'));

        header.appendChild(status);
        header.appendChild(timestamp);

        const note = Utils.DOM.create('div', {
            className: 'history-note'
        }, event.note || 'No additional notes');

        // Add reviewer info if available
        if (event.reviewerId) {
            const reviewer = Utils.DOM.create('div', {
                className: 'history-reviewer'
            }, `Reviewed by: ${this.getUserDisplayName(event.reviewerId)}`);
            item.appendChild(reviewer);
        }

        item.appendChild(header);
        item.appendChild(note);

        return item;
    }

    /**
     * Create review guidelines section
     */
    createReviewGuidelinesSection() {
        const section = Utils.DOM.create('div', {
            className: 'review-section guidelines-section'
        });

        const title = Utils.DOM.create('h4', {
            className: 'section-title'
        }, '📖 Review Guidelines');

        const guidelines = Utils.DOM.create('div', {
            className: 'guidelines-content'
        });

        const guidelinesList = [
            '✅ Verify service completion matches order requirements',
            '📸 Check evidence images are clear and relevant',
            '📝 Review completion notes for accuracy and detail',
            '⚠️ Look for any signs of account compromise or issues',
            '🎯 Ensure special instructions were followed',
            '💬 Provide constructive feedback when rejecting'
        ];

        guidelinesList.forEach(guideline => {
            const item = Utils.DOM.create('div', {
                className: 'guideline-item'
            }, guideline);
            guidelines.appendChild(item);
        });

        section.appendChild(title);
        section.appendChild(guidelines);

        return section;
    }

    /**
     * Create evidence images section with zoom capabilities
     */
    createEvidenceImagesSection(order) {
        const section = Utils.DOM.create('div', {
            className: 'evidence-images-section'
        });

        const header = Utils.DOM.create('div', {
            className: 'images-section-header'
        });

        const title = Utils.DOM.create('h4', {
            className: 'section-title'
        }, '🖼️ Evidence Images');

        const imageCount = Utils.DOM.create('div', {
            className: 'image-count'
        }, `${order.evidence.images?.length || 1} image(s)`);

        header.appendChild(title);
        header.appendChild(imageCount);

        const imagesContainer = Utils.DOM.create('div', {
            className: 'evidence-images-container'
        });

        // Handle single image or multiple images
        const images = order.evidence.images || [{ url: order.evidence.imageUrl, caption: 'Evidence Image' }];

        images.forEach((image, index) => {
            const imageWrapper = this.createEvidenceImageWrapper(image, index, order.id);
            imagesContainer.appendChild(imageWrapper);
        });

        section.appendChild(header);
        section.appendChild(imagesContainer);

        return section;
    }

    /**
     * Create evidence image wrapper with zoom and controls
     */
    createEvidenceImageWrapper(image, index, orderId) {
        const wrapper = Utils.DOM.create('div', {
            className: 'evidence-image-wrapper'
        });

        const imageContainer = Utils.DOM.create('div', {
            className: 'evidence-image-container'
        });

        const img = Utils.DOM.create('img', {
            src: image.url || image,
            alt: `Evidence Image ${index + 1}`,
            className: 'evidence-image',
            loading: 'lazy'
        });

        // Image controls overlay
        const controls = Utils.DOM.create('div', {
            className: 'image-controls'
        });

        const zoomBtn = Utils.DOM.create('button', {
            className: 'image-control-btn zoom-btn',
            title: 'View Full Size',
            onclick: () => this.showImageZoomModal(image.url || image, index)
        }, '🔍');

        const downloadBtn = Utils.DOM.create('button', {
            className: 'image-control-btn download-btn',
            title: 'Download Image',
            onclick: () => this.downloadEvidenceImage(image.url || image, `evidence_${orderId}_${index + 1}`)
        }, '💾');

        controls.appendChild(zoomBtn);
        controls.appendChild(downloadBtn);

        imageContainer.appendChild(img);
        imageContainer.appendChild(controls);

        // Image caption if available
        if (image.caption) {
            const caption = Utils.DOM.create('div', {
                className: 'image-caption'
            }, image.caption);
            wrapper.appendChild(caption);
        }

        wrapper.appendChild(imageContainer);

        return wrapper;
    }

    /**
     * Create evidence notes section
     */
    createEvidenceNotesSection(order) {
        const section = Utils.DOM.create('div', {
            className: 'evidence-notes-section'
        });

        const header = Utils.DOM.create('div', {
            className: 'notes-section-header'
        });

        const title = Utils.DOM.create('h4', {
            className: 'section-title'
        }, '📝 Completion Notes');

        const wordCount = Utils.DOM.create('div', {
            className: 'word-count'
        }, `${order.evidence.notes.split(' ').length} words`);

        header.appendChild(title);
        header.appendChild(wordCount);

        const notesContainer = Utils.DOM.create('div', {
            className: 'evidence-notes-container'
        });

        const notesText = Utils.DOM.create('div', {
            className: 'evidence-notes-text'
        }, order.evidence.notes);

        notesContainer.appendChild(notesText);

        section.appendChild(header);
        section.appendChild(notesContainer);

        return section;
    }

    /**
     * Create review actions section
     */
    createReviewActionsSection(order) {
        const section = Utils.DOM.create('div', {
            className: 'review-actions-section'
        });

        const title = Utils.DOM.create('h4', {
            className: 'section-title'
        }, '⚡ Quick Actions');

        const actionsGrid = Utils.DOM.create('div', {
            className: 'review-actions-grid'
        });

        // Quick approval reasons
        const approvalReasons = [
            { text: 'Perfect completion', icon: '✅', action: () => this.quickApprove(order.id, 'Perfect completion') },
            { text: 'Good quality work', icon: '👍', action: () => this.quickApprove(order.id, 'Good quality work') },
            { text: 'Meets requirements', icon: '✔️', action: () => this.quickApprove(order.id, 'Meets requirements') }
        ];

        // Quick rejection reasons
        const rejectionReasons = [
            { text: 'Incomplete service', icon: '❌', action: () => this.quickReject(order.id, 'Service appears incomplete') },
            { text: 'Poor evidence quality', icon: '📷', action: () => this.quickReject(order.id, 'Evidence quality is insufficient') },
            { text: 'Instructions not followed', icon: '⚠️', action: () => this.quickReject(order.id, 'Special instructions were not followed') }
        ];

        // Create approval section
        const approvalSection = Utils.DOM.create('div', {
            className: 'quick-actions-group approval-actions'
        });

        const approvalTitle = Utils.DOM.create('h5', {}, 'Quick Approve');
        approvalSection.appendChild(approvalTitle);

        approvalReasons.forEach(reason => {
            const btn = Utils.DOM.create('button', {
                className: 'quick-action-btn approval-btn',
                onclick: reason.action
            }, `${reason.icon} ${reason.text}`);
            approvalSection.appendChild(btn);
        });

        // Create rejection section
        const rejectionSection = Utils.DOM.create('div', {
            className: 'quick-actions-group rejection-actions'
        });

        const rejectionTitle = Utils.DOM.create('h5', {}, 'Quick Reject');
        rejectionSection.appendChild(rejectionTitle);

        rejectionReasons.forEach(reason => {
            const btn = Utils.DOM.create('button', {
                className: 'quick-action-btn rejection-btn',
                onclick: reason.action
            }, `${reason.icon} ${reason.text}`);
            rejectionSection.appendChild(btn);
        });

        actionsGrid.appendChild(approvalSection);
        actionsGrid.appendChild(rejectionSection);

        section.appendChild(title);
        section.appendChild(actionsGrid);

        return section;
    }

    /**
     * Create evidence review footer with main action buttons
     */
    createEvidenceReviewFooter(orderId) {
        return [
            Components.createButton({
                text: '❌ Reject with Feedback',
                variant: 'error',
                size: 'md',
                onClick: () => this.showDetailedRejectModal(orderId)
            }),
            Components.createButton({
                text: '🔄 Request Resubmission',
                variant: 'warning',
                size: 'md',
                onClick: () => this.requestEvidenceResubmission(orderId)
            }),
            Components.createButton({
                text: '✅ Approve & Complete',
                variant: 'success',
                size: 'md',
                onClick: () => this.showApprovalConfirmation(orderId)
            })
        ];
    }

    /**
     * Initialize evidence review functionality
     */
    initializeEvidenceReview(orderId) {
        // Initialize quality assessment scoring
        this.initializeQualityScoring();
        
        // Set up image lazy loading
        this.setupImageLazyLoading();
        
        // Initialize keyboard shortcuts
        this.setupEvidenceReviewKeyboardShortcuts(orderId);
        
        // Track review start time for analytics
        this.trackReviewStart(orderId);
    }

    /**
     * Initialize quality scoring system
     */
    initializeQualityScoring() {
        const checkboxes = document.querySelectorAll('.criterion-checkbox');
        const scoreDisplay = document.getElementById('qualityScore');
        const scoreProgress = document.getElementById('scoreProgress');

        const updateScore = () => {
            let totalScore = 0;
            let maxScore = 0;

            checkboxes.forEach(checkbox => {
                const weight = parseInt(checkbox.dataset.weight);
                maxScore += weight;
                if (checkbox.checked) {
                    totalScore += weight;
                }
            });

            const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
            
            if (scoreDisplay) scoreDisplay.textContent = `${totalScore}/${maxScore}`;
            if (scoreProgress) {
                scoreProgress.style.width = `${percentage}%`;
                scoreProgress.className = `score-progress ${this.getScoreClass(percentage)}`;
            }
        };

        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', updateScore);
        });

        updateScore(); // Initial calculation
    }

    /**
     * Get score class based on percentage
     */
    getScoreClass(percentage) {
        if (percentage >= 80) return 'score-excellent';
        if (percentage >= 60) return 'score-good';
        if (percentage >= 40) return 'score-fair';
        return 'score-poor';
    }

    /**
     * Setup image lazy loading
     */
    setupImageLazyLoading() {
        const images = document.querySelectorAll('.evidence-image[loading="lazy"]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src || img.src;
                        img.classList.remove('lazy');
                        observer.unobserve(img);
                    }
                });
            });

            images.forEach(img => imageObserver.observe(img));
        }
    }

    /**
     * Setup keyboard shortcuts for evidence review
     */
    setupEvidenceReviewKeyboardShortcuts(orderId) {
        const handleKeyPress = (event) => {
            // Only handle shortcuts when modal is open
            if (!document.querySelector('.evidence-review-modal')) return;

            switch (event.key.toLowerCase()) {
                case 'a':
                    if (event.ctrlKey || event.metaKey) {
                        event.preventDefault();
                        this.showApprovalConfirmation(orderId);
                    }
                    break;
                case 'r':
                    if (event.ctrlKey || event.metaKey) {
                        event.preventDefault();
                        this.showDetailedRejectModal(orderId);
                    }
                    break;
                case 'z':
                    if (event.ctrlKey || event.metaKey) {
                        event.preventDefault();
                        const firstImage = document.querySelector('.evidence-image');
                        if (firstImage) {
                            this.showImageZoomModal(firstImage.src, 0);
                        }
                    }
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyPress);
        
        // Clean up event listener when modal closes
        const modal = document.querySelector('.evidence-review-modal');
        if (modal) {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList' && !document.querySelector('.evidence-review-modal')) {
                        document.removeEventListener('keydown', handleKeyPress);
                        observer.disconnect();
                    }
                });
            });
            observer.observe(document.body, { childList: true, subtree: true });
        }
    }

    /**
     * Show image zoom modal with enhanced viewing capabilities
     */
    showImageZoomModal(imageUrl, index = 0) {
        const content = Utils.DOM.create('div', {
            className: 'image-zoom-container'
        });

        const imageWrapper = Utils.DOM.create('div', {
            className: 'zoom-image-wrapper'
        });

        const image = Utils.DOM.create('img', {
            src: imageUrl,
            alt: `Evidence Image ${index + 1}`,
            className: 'zoom-image'
        });

        // Image controls
        const controls = Utils.DOM.create('div', {
            className: 'zoom-controls'
        });

        const zoomInBtn = Utils.DOM.create('button', {
            className: 'zoom-control-btn',
            onclick: () => this.adjustImageZoom(image, 1.2)
        }, '🔍+');

        const zoomOutBtn = Utils.DOM.create('button', {
            className: 'zoom-control-btn',
            onclick: () => this.adjustImageZoom(image, 0.8)
        }, '🔍-');

        const resetBtn = Utils.DOM.create('button', {
            className: 'zoom-control-btn',
            onclick: () => this.resetImageZoom(image)
        }, '↻');

        const downloadBtn = Utils.DOM.create('button', {
            className: 'zoom-control-btn',
            onclick: () => this.downloadEvidenceImage(imageUrl, `evidence_image_${index + 1}`)
        }, '💾');

        controls.appendChild(zoomInBtn);
        controls.appendChild(zoomOutBtn);
        controls.appendChild(resetBtn);
        controls.appendChild(downloadBtn);

        imageWrapper.appendChild(image);
        content.appendChild(imageWrapper);
        content.appendChild(controls);

        Components.showModal({
            title: `🔍 Evidence Image ${index + 1}`,
            content: content,
            size: 'full-screen',
            closable: true,
            className: 'image-zoom-modal'
        });

        // Enable image dragging for panning
        this.enableImagePanning(image);
    }

    /**
     * Adjust image zoom level
     */
    adjustImageZoom(image, factor) {
        const currentScale = parseFloat(image.dataset.scale || '1');
        const newScale = Math.max(0.1, Math.min(5, currentScale * factor));
        
        image.style.transform = `scale(${newScale})`;
        image.dataset.scale = newScale.toString();
    }

    /**
     * Reset image zoom to original size
     */
    resetImageZoom(image) {
        image.style.transform = 'scale(1)';
        image.dataset.scale = '1';
        image.style.left = '0px';
        image.style.top = '0px';
    }

    /**
     * Enable image panning functionality
     */
    enableImagePanning(image) {
        let isDragging = false;
        let startX, startY, initialX = 0, initialY = 0;

        image.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX - initialX;
            startY = e.clientY - initialY;
            image.style.cursor = 'grabbing';
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            e.preventDefault();
            initialX = e.clientX - startX;
            initialY = e.clientY - startY;
            
            image.style.left = `${initialX}px`;
            image.style.top = `${initialY}px`;
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
            image.style.cursor = 'grab';
        });
    }

    /**
     * Download evidence image
     */
    downloadEvidenceImage(imageUrl, filename) {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        Utils.UI.showNotification('Image download started', 'success');
    }

    /**
     * Quick approve with predefined reason
     */
    quickApprove(orderId, reason) {
        this.approveOrderWithReason(orderId, reason);
        Components.closeModal();
    }

    /**
     * Quick reject with predefined reason
     */
    quickReject(orderId, reason) {
        this.rejectOrderWithReason(orderId, reason);
        Components.closeModal();
    }

    /**
     * Show detailed rejection modal
     */
    showDetailedRejectModal(orderId) {
        const content = Utils.DOM.create('div', {
            className: 'detailed-reject-modal'
        });

        const title = Utils.DOM.create('h3', {}, 'Provide Detailed Feedback');

        const reasonSelect = Components.createFormGroup({
            label: 'Rejection Reason',
            type: 'select',
            name: 'rejectionReason',
            required: true,
            options: [
                { value: '', label: 'Select a reason...' },
                { value: 'incomplete', label: 'Service incomplete' },
                { value: 'poor_evidence', label: 'Poor evidence quality' },
                { value: 'instructions_ignored', label: 'Instructions not followed' },
                { value: 'account_issues', label: 'Account safety concerns' },
                { value: 'wrong_service', label: 'Wrong service provided' },
                { value: 'other', label: 'Other (specify below)' }
            ]
        });

        const feedbackTextarea = Components.createFormGroup({
            label: 'Detailed Feedback',
            type: 'textarea',
            name: 'rejectionFeedback',
            placeholder: 'Provide specific feedback to help the booster improve...',
            required: true,
            rows: 4
        });

        const allowResubmission = Components.createFormGroup({
            label: 'Allow Resubmission',
            type: 'checkbox',
            name: 'allowResubmission',
            checked: true,
            help: 'Allow the booster to resubmit evidence after addressing the issues'
        });

        content.appendChild(title);
        content.appendChild(reasonSelect);
        content.appendChild(feedbackTextarea);
        content.appendChild(allowResubmission);

        Components.showModal({
            title: '❌ Reject Evidence',
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
                    text: 'Reject Order',
                    variant: 'error',
                    onClick: () => this.processDetailedRejection(orderId)
                })
            ]
        });
    }

    /**
     * Show approval confirmation modal
     */
    showApprovalConfirmation(orderId) {
        const order = this.orders.get(orderId);
        const content = Utils.DOM.create('div', {
            className: 'approval-confirmation'
        });

        const message = Utils.DOM.create('p', {}, 
            `Are you sure you want to approve this order and release payment of ${this.formatOrderAmount(order)} to the booster?`
        );

        const approvalNotes = Components.createFormGroup({
            label: 'Approval Notes (Optional)',
            type: 'textarea',
            name: 'approvalNotes',
            placeholder: 'Add any positive feedback or notes...',
            rows: 3
        });

        content.appendChild(message);
        content.appendChild(approvalNotes);

        Components.showModal({
            title: '✅ Approve Evidence',
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
                    text: 'Approve & Release Payment',
                    variant: 'success',
                    onClick: () => this.processApproval(orderId)
                })
            ]
        });
    }

    /**
     * Request evidence resubmission
     */
    requestEvidenceResubmission(orderId) {
        const content = Utils.DOM.create('div', {
            className: 'resubmission-request'
        });

        const message = Utils.DOM.create('p', {}, 
            'Request the booster to resubmit evidence with specific improvements:'
        );

        const improvementsList = Components.createFormGroup({
            label: 'Requested Improvements',
            type: 'textarea',
            name: 'improvements',
            placeholder: 'Please provide:\n- Clearer screenshots\n- More detailed completion notes\n- Additional evidence of completion',
            required: true,
            rows: 4
        });

        content.appendChild(message);
        content.appendChild(improvementsList);

        Components.showModal({
            title: '🔄 Request Resubmission',
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
                    text: 'Send Request',
                    variant: 'warning',
                    onClick: () => this.processResubmissionRequest(orderId)
                })
            ]
        });
    }

    /**
     * Process detailed rejection
     */
    processDetailedRejection(orderId) {
        const reason = document.querySelector('[name="rejectionReason"]').value;
        const feedback = document.querySelector('[name="rejectionFeedback"]').value;
        const allowResubmission = document.querySelector('[name="allowResubmission"]').checked;

        if (!reason || !feedback) {
            Utils.UI.showNotification('Please provide both reason and feedback', 'error');
            return;
        }

        const order = this.orders.get(orderId);
        const rejectionData = {
            reason: reason,
            feedback: feedback,
            allowResubmission: allowResubmission,
            reviewerId: 'current_user', // Replace with actual user ID
            reviewedAt: new Date().toISOString()
        };

        // Add rejection data to order
        order.rejectionData = rejectionData;
        order.reviewNotes = feedback;

        // Change order status
        if (allowResubmission) {
            this.changeOrderStatus(orderId, 'in_progress', `Evidence rejected: ${feedback}. Resubmission allowed.`);
        } else {
            this.changeOrderStatus(orderId, 'rejected', `Evidence rejected: ${feedback}`);
        }

        // Add to evidence history
        this.addEvidenceHistoryEntry(orderId, 'rejected', rejectionData);

        Components.closeModal(); // Close rejection modal
        Components.closeModal(); // Close evidence review modal

        Utils.UI.showNotification('Order rejected with feedback', 'success');
    }

    /**
     * Process approval
     */
    processApproval(orderId) {
        const approvalNotes = document.querySelector('[name="approvalNotes"]')?.value || '';
        
        const order = this.orders.get(orderId);
        const approvalData = {
            reviewerId: 'current_user', // Replace with actual user ID
            reviewedAt: new Date().toISOString(),
            notes: approvalNotes
        };

        // Add approval data to order
        order.approvalData = approvalData;
        if (approvalNotes) {
            order.reviewNotes = approvalNotes;
        }

        // Change order status to completed
        this.changeOrderStatus(orderId, 'completed', `Evidence approved. ${approvalNotes}`);

        // Process payment release
        this.releasePayment(orderId);

        // Add to evidence history
        this.addEvidenceHistoryEntry(orderId, 'approved', approvalData);

        Components.closeModal(); // Close approval modal
        Components.closeModal(); // Close evidence review modal

        Utils.UI.showNotification('Order approved and payment released', 'success');
    }

    /**
     * Process resubmission request
     */
    processResubmissionRequest(orderId) {
        const improvements = document.querySelector('[name="improvements"]').value;

        if (!improvements) {
            Utils.UI.showNotification('Please specify the requested improvements', 'error');
            return;
        }

        const order = this.orders.get(orderId);
        const resubmissionData = {
            requestedImprovements: improvements,
            requesterId: 'current_user', // Replace with actual user ID
            requestedAt: new Date().toISOString()
        };

        // Add resubmission request to order
        order.resubmissionRequest = resubmissionData;

        // Change order status back to in_progress
        this.changeOrderStatus(orderId, 'in_progress', `Resubmission requested: ${improvements}`);

        // Add to evidence history
        this.addEvidenceHistoryEntry(orderId, 'resubmission_requested', resubmissionData);

        Components.closeModal(); // Close resubmission modal
        Components.closeModal(); // Close evidence review modal

        Utils.UI.showNotification('Resubmission request sent to booster', 'success');
    }

    /**
     * Add evidence history entry
     */
    addEvidenceHistoryEntry(orderId, action, data) {
        const order = this.orders.get(orderId);
        if (!order.evidenceHistory) {
            order.evidenceHistory = [];
        }

        order.evidenceHistory.push({
            action: action,
            timestamp: new Date().toISOString(),
            data: data
        });
    }

    /**
     * Release payment for approved order
     */
    releasePayment(orderId) {
        const order = this.orders.get(orderId);
        
        // Add payment transaction to booster's wallet
        if (typeof WalletManager !== 'undefined') {
            WalletManager.addTransaction({
                userId: order.boosterId,
                type: 'earning',
                amount: order.pricePaid,
                currency: order.currencyUsed,
                description: `Order #${order.id} completed`,
                orderId: order.id,
                status: 'completed'
            });
        }

        // Update order completion timestamp
        order.completedAt = new Date().toISOString();
    }

    /**
     * Track review start for analytics
     */
    trackReviewStart(orderId) {
        const order = this.orders.get(orderId);
        if (!order.reviewAnalytics) {
            order.reviewAnalytics = {};
        }
        
        order.reviewAnalytics.reviewStarted = new Date().toISOString();
        order.reviewAnalytics.reviewerId = 'current_user'; // Replace with actual user ID
    }

    /**
     * Get booster display name
     */
    getBoosterDisplayName(boosterId) {
        if (!boosterId) return 'Not Assigned';
        
        if (typeof MockData !== 'undefined' && MockData.users) {
            const booster = MockData.users.find(u => u.id === boosterId);
            return booster ? booster.discordUsername : 'Unknown Booster';
        }
        return 'Unknown Booster';
    }

    /**
     * Get user display name
     */
    getUserDisplayName(userId) {
        if (typeof MockData !== 'undefined' && MockData.users) {
            const user = MockData.users.find(u => u.id === userId);
            return user ? user.discordUsername : 'Unknown User';
        }
        return 'Unknown User';
    }

    /**
     * Get status icon
     */
    getStatusIcon(status) {
        const icons = {
            'pending': '⏳',
            'assigned': '👤',
            'in_progress': '🔄',
            'evidence_submitted': '📸',
            'under_review': '🔍',
            'completed': '✅',
            'rejected': '❌'
        };
        return icons[status] || '❓';
    }

    /**
     * Get status display text
     */
    getStatusDisplayText(status) {
        const texts = {
            'pending': 'Pending Assignment',
            'assigned': 'Assigned to Booster',
            'in_progress': 'In Progress',
            'evidence_submitted': 'Evidence Submitted',
            'under_review': 'Under Review',
            'completed': 'Completed',
            'rejected': 'Rejected'
        };
        return texts[status] || status;
    }

    /**
     * Approve order with reason
     */
    approveOrderWithReason(orderId, reason) {
        const order = this.orders.get(orderId);
        order.reviewNotes = reason;
        
        this.changeOrderStatus(orderId, 'completed', reason);
        this.releasePayment(orderId);
        
        Utils.UI.showNotification('Order approved successfully', 'success');
    }

    /**
     * Reject order with reason
     */
    rejectOrderWithReason(orderId, reason) {
        const order = this.orders.get(orderId);
        order.reviewNotes = reason;
        
        this.changeOrderStatus(orderId, 'rejected', reason);
        
        Utils.UI.showNotification('Order rejected', 'warning');
    }

    /**
     * Show reject modal
     */
    showRejectModal(orderId) {
        const content = Utils.DOM.create('div', {
            className: 'reject-order-form'
        });

        const label = Utils.DOM.create('label', {
            for: 'rejectReason'
        }, 'Rejection Reason:');

        const textarea = Utils.DOM.create('textarea', {
            id: 'rejectReason',
            className: 'form-input',
            placeholder: 'Please provide a reason for rejecting this order...',
            required: true,
            rows: 4
        });

        content.appendChild(label);
        content.appendChild(textarea);

        Components.showModal({
            title: 'Reject Order',
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
                    text: 'Reject Order',
                    variant: 'error',
                    onClick: () => this.rejectOrder(orderId, textarea.value)
                })
            ]
        });
    }

    /**
     * Approve order
     */
    approveOrder(orderId) {
        const order = this.orders.get(orderId);
        
        if (order) {
            try {
                // Set review notes
                order.reviewNotes = 'Order approved and completed successfully.';
                
                // Use comprehensive status management
                this.changeOrderStatus(orderId, 'completed', 'Order approved and payment released', 'current_user');

                // Close modal and refresh view
                Components.closeModal();
                this.applyFilters();
                this.renderOrders();

                Components.showNotification({
                    type: 'success',
                    title: 'Order Approved',
                    message: `Order ${orderId} has been approved and completed.`,
                    duration: 3000
                });
            } catch (error) {
                Components.showNotification({
                    type: 'error',
                    title: 'Approval Failed',
                    message: error.message,
                    duration: 4000
                });
            }
        }
    }

    /**
     * Reject order
     */
    rejectOrder(orderId, reason) {
        if (!reason.trim()) {
            Components.showNotification({
                type: 'error',
                title: 'Rejection Reason Required',
                message: 'Please provide a reason for rejecting this order.',
                duration: 4000
            });
            return;
        }

        const order = this.orders.get(orderId);
        
        if (order) {
            try {
                // Set review notes
                order.reviewNotes = reason;
                
                // Use comprehensive status management
                this.changeOrderStatus(orderId, 'rejected', `Order rejected: ${reason}`, 'current_user');

                // Close modal and refresh view
                Components.closeModal();
                this.applyFilters();
                this.renderOrders();

                Components.showNotification({
                    type: 'warning',
                    title: 'Order Rejected',
                    message: `Order ${orderId} has been rejected.`,
                    duration: 3000
                });
            } catch (error) {
                Components.showNotification({
                    type: 'error',
                    title: 'Rejection Failed',
                    message: error.message,
                    duration: 4000
                });
            }
        }
    }

    /**
     * Show bulk booster assignment
     */
    showBulkBoosterAssignment(orderIds) {
        const content = this.createBulkAssignmentContent(orderIds);
        
        Components.showModal({
            title: `Bulk Assign Boosters (${orderIds.length} orders)`,
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
                    text: 'Assign to All',
                    variant: 'primary',
                    onClick: () => this.performBulkAssignment(orderIds)
                })
            ]
        });
    }

    /**
     * Create bulk assignment content
     */
    createBulkAssignmentContent(orderIds) {
        const container = Utils.DOM.create('div', {
            className: 'bulk-assignment'
        });

        const summary = Utils.DOM.create('p', {}, 
            `You are about to assign a booster to ${orderIds.length} selected orders.`
        );

        const boostersList = this.createAvailableBoostersList();

        container.appendChild(summary);
        container.appendChild(boostersList);

        return container;
    }

    /**
     * Perform bulk assignment
     */
    performBulkAssignment(orderIds) {
        const selectedBooster = document.querySelector('input[name="selectedBooster"]:checked');
        
        if (!selectedBooster) {
            Components.showNotification({
                type: 'error',
                title: 'No Booster Selected',
                message: 'Please select a booster for bulk assignment.',
                duration: 4000
            });
            return;
        }

        const boosterId = selectedBooster.value;
        const boosterName = MockData.users.find(u => u.id === boosterId)?.discordUsername || 'Unknown Booster';
        let assignedCount = 0;
        let failedCount = 0;

        orderIds.forEach(orderId => {
            const order = this.orders.get(orderId);
            if (order && order.status === 'pending') {
                try {
                    // Set booster before status change
                    order.boosterId = boosterId;
                    
                    // Use comprehensive status management
                    this.changeOrderStatus(orderId, 'assigned', `Bulk assigned to ${boosterName}`, 'current_user');
                    assignedCount++;
                } catch (error) {
                    console.error(`Failed to assign order ${orderId}:`, error);
                    failedCount++;
                }
            }
        });

        // Clear selection and refresh
        this.selectedOrders.clear();
        Components.closeModal();
        this.applyFilters();
        this.renderOrders();

        const message = failedCount > 0 
            ? `${assignedCount} orders assigned successfully, ${failedCount} failed.`
            : `${assignedCount} orders have been assigned successfully.`;

        Components.showNotification({
            type: failedCount > 0 ? 'warning' : 'success',
            title: 'Bulk Assignment Complete',
            message: message,
            duration: 3000
        });
    }

    /**
     * Export orders
     */
    exportOrders(orderIds) {
        const orders = orderIds.map(id => this.orders.get(id)).filter(Boolean);
        
        // Create CSV content
        const headers = ['Order ID', 'Service', 'Buyer', 'Booster', 'Status', 'Amount', 'Created'];
        const csvContent = [
            headers.join(','),
            ...orders.map(order => [
                order.id,
                `"${this.getServiceTitle(order.serviceId)}"`,
                `"${this.getBuyerInfo(order.buyerId).textContent || 'Unknown'}"`,
                `"${this.getBoosterInfo(order.boosterId).textContent || 'Not Assigned'}"`,
                order.status,
                order.pricePaid,
                order.createdAt
            ].join(','))
        ].join('\n');

        // Download CSV
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `orders_export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        Components.showNotification({
            type: 'success',
            title: 'Export Complete',
            message: `${orders.length} orders exported successfully.`,
            duration: 3000
        });
    }

    /**
     * Show bulk delete confirmation
     */
    showBulkDeleteConfirmation(orderIds) {
        const content = Utils.DOM.create('div', {
            className: 'bulk-delete-confirmation'
        });

        const warning = Utils.DOM.create('p', {
            className: 'warning-text'
        }, `⚠️ You are about to delete ${orderIds.length} orders. This action cannot be undone.`);

        const confirmation = Utils.DOM.create('p', {}, 'Are you sure you want to proceed?');

        content.appendChild(warning);
        content.appendChild(confirmation);

        Components.showModal({
            title: 'Confirm Bulk Delete',
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
                    text: 'Delete Orders',
                    variant: 'error',
                    onClick: () => this.performBulkDelete(orderIds)
                })
            ]
        });
    }

    /**
     * Perform bulk delete
     */
    performBulkDelete(orderIds) {
        let deletedCount = 0;

        orderIds.forEach(orderId => {
            if (this.orders.has(orderId)) {
                this.orders.delete(orderId);
                deletedCount++;
            }
        });

        // Clear selection and refresh
        this.selectedOrders.clear();
        Components.closeModal();
        this.applyFilters();
        this.renderOrders();

        Components.showNotification({
            type: 'success',
            title: 'Bulk Delete Complete',
            message: `${deletedCount} orders have been deleted.`,
            duration: 3000
        });
    }

    /**
     * Complete order status management system
     */

    /**
     * Change order status with validation and timeline tracking
     */
    changeOrderStatus(orderId, newStatus, note = '', userId = 'current_user') {
        const order = this.orders.get(orderId);
        if (!order) {
            throw new Error(`Order ${orderId} not found`);
        }

        // Validate status transition
        if (!this.isValidStatusTransition(order.status, newStatus)) {
            throw new Error(`Invalid status transition from ${order.status} to ${newStatus}`);
        }

        // Apply business rule validation
        const validationResult = this.validateStatusChange(order, newStatus);
        if (!validationResult.isValid) {
            throw new Error(validationResult.message);
        }

        const previousStatus = order.status;
        
        // Update order status
        order.status = newStatus;
        
        // Update relevant timestamps
        this.updateOrderTimestamps(order, newStatus);
        
        // Add timeline entry
        this.addTimelineEntry(order, newStatus, note, userId);
        
        // Trigger status-specific actions
        this.handleStatusChangeActions(order, previousStatus, newStatus);
        
        // Update orders map
        this.orders.set(orderId, order);
        
        // Dispatch status change event
        this.dispatchStatusChangeEvent(order, previousStatus, newStatus);
        
        return order;
    }

    /**
     * Validate if status transition is allowed
     */
    isValidStatusTransition(currentStatus, newStatus) {
        const validTransitions = {
            'pending': ['assigned', 'rejected'],
            'assigned': ['in_progress', 'pending', 'rejected'],
            'in_progress': ['evidence_submitted', 'assigned', 'rejected'],
            'evidence_submitted': ['under_review', 'in_progress', 'rejected'],
            'under_review': ['completed', 'rejected', 'evidence_submitted'],
            'completed': [], // Final state
            'rejected': ['pending', 'assigned'] // Can be restarted
        };

        return validTransitions[currentStatus]?.includes(newStatus) || false;
    }

    /**
     * Validate status change based on business rules
     */
    validateStatusChange(order, newStatus) {
        switch (newStatus) {
            case 'assigned':
                if (!order.boosterId) {
                    return { isValid: false, message: 'Cannot assign order without selecting a booster' };
                }
                break;
                
            case 'in_progress':
                if (!order.boosterId) {
                    return { isValid: false, message: 'Cannot start order without assigned booster' };
                }
                break;
                
            case 'evidence_submitted':
                if (!order.evidence || !order.evidence.imageUrl) {
                    return { isValid: false, message: 'Cannot submit evidence without uploading proof' };
                }
                break;
                
            case 'completed':
                if (order.status !== 'under_review') {
                    return { isValid: false, message: 'Order must be under review before completion' };
                }
                break;
        }
        
        return { isValid: true };
    }

    /**
     * Update order timestamps based on status
     */
    updateOrderTimestamps(order, status) {
        const now = new Date().toISOString();
        
        switch (status) {
            case 'assigned':
                order.assignedAt = now;
                break;
            case 'in_progress':
                order.startedAt = now;
                break;
            case 'evidence_submitted':
                if (order.evidence) {
                    order.evidence.uploadedAt = now;
                }
                break;
            case 'completed':
                order.completedAt = now;
                break;
        }
    }

    /**
     * Add timeline entry for status change
     */
    addTimelineEntry(order, status, note, userId) {
        if (!order.timeline) {
            order.timeline = [];
        }
        
        const timelineEntry = {
            status: status,
            timestamp: new Date().toISOString(),
            note: note || this.getDefaultStatusNote(status),
            userId: userId,
            userInfo: this.getUserInfo(userId)
        };
        
        order.timeline.push(timelineEntry);
    }

    /**
     * Get default note for status change
     */
    getDefaultStatusNote(status) {
        const defaultNotes = {
            'pending': 'Order created and awaiting assignment',
            'assigned': 'Order assigned to booster',
            'in_progress': 'Service started by booster',
            'evidence_submitted': 'Evidence uploaded by booster',
            'under_review': 'Evidence under review by advertiser',
            'completed': 'Order completed successfully',
            'rejected': 'Order rejected'
        };
        
        return defaultNotes[status] || `Status changed to ${status}`;
    }

    /**
     * Get user info for timeline entry
     */
    getUserInfo(userId) {
        if (typeof MockData !== 'undefined' && MockData.users) {
            const user = MockData.users.find(u => u.id === userId);
            if (user) {
                return {
                    username: user.discordUsername,
                    avatar: user.discordAvatarUrl
                };
            }
        }
        return { username: 'System', avatar: null };
    }

    /**
     * Handle status-specific actions
     */
    handleStatusChangeActions(order, previousStatus, newStatus) {
        switch (newStatus) {
            case 'assigned':
                this.handleOrderAssignment(order);
                break;
            case 'in_progress':
                this.handleOrderStart(order);
                break;
            case 'evidence_submitted':
                this.handleEvidenceSubmission(order);
                break;
            case 'completed':
                this.handleOrderCompletion(order);
                break;
            case 'rejected':
                this.handleOrderRejection(order, previousStatus);
                break;
        }
    }

    /**
     * Handle order assignment actions
     */
    handleOrderAssignment(order) {
        // Send notification to booster
        this.sendNotification({
            type: 'order_assigned',
            recipientId: order.boosterId,
            orderId: order.id,
            message: `You have been assigned to order ${order.id}`
        });
        
        // Update booster's active orders count
        this.updateBoosterStats(order.boosterId, 'assigned');
    }

    /**
     * Handle order start actions
     */
    handleOrderStart(order) {
        // Send notification to advertiser
        this.sendNotification({
            type: 'order_started',
            recipientId: order.advertiserId,
            orderId: order.id,
            message: `Order ${order.id} has been started by the booster`
        });
    }

    /**
     * Handle evidence submission actions
     */
    handleEvidenceSubmission(order) {
        // Automatically move to under_review
        order.status = 'under_review';
        this.addTimelineEntry(order, 'under_review', 'Evidence automatically moved to review queue');
        
        // Send notification to advertiser
        this.sendNotification({
            type: 'evidence_submitted',
            recipientId: order.advertiserId,
            orderId: order.id,
            message: `Evidence has been submitted for order ${order.id} and is awaiting your review`
        });
    }

    /**
     * Handle order completion actions
     */
    handleOrderCompletion(order) {
        // Process payment to booster
        this.processOrderPayment(order);
        
        // Update statistics
        this.updateBoosterStats(order.boosterId, 'completed');
        this.updateAdvertiserStats(order.advertiserId, 'completed');
        
        // Send notifications
        this.sendNotification({
            type: 'order_completed',
            recipientId: order.boosterId,
            orderId: order.id,
            message: `Order ${order.id} has been completed and payment has been processed`
        });
    }

    /**
     * Handle order rejection actions
     */
    handleOrderRejection(order, previousStatus) {
        // If rejecting from evidence review, allow resubmission
        if (previousStatus === 'under_review') {
            // Send notification to booster for resubmission
            this.sendNotification({
                type: 'evidence_rejected',
                recipientId: order.boosterId,
                orderId: order.id,
                message: `Evidence for order ${order.id} has been rejected. Please resubmit.`
            });
        } else {
            // Full order rejection - process refund
            this.processOrderRefund(order);
        }
    }

    /**
     * Process payment for completed order
     */
    processOrderPayment(order) {
        // This would integrate with the wallet system
        console.log(`Processing payment of ${order.pricePaid} ${order.currencyUsed} to booster ${order.boosterId} for order ${order.id}`);
        
        // Add payment timeline entry
        this.addTimelineEntry(order, 'payment_processed', `Payment of ${order.pricePaid} ${order.currencyUsed} processed to booster wallet`);
    }

    /**
     * Process refund for rejected order
     */
    processOrderRefund(order) {
        // This would integrate with the wallet system
        console.log(`Processing refund of ${order.pricePaid} ${order.currencyUsed} to buyer ${order.buyerId} for order ${order.id}`);
        
        // Add refund timeline entry
        this.addTimelineEntry(order, 'refund_processed', `Refund of ${order.pricePaid} ${order.currencyUsed} processed to buyer`);
    }

    /**
     * Update booster statistics
     */
    updateBoosterStats(boosterId, action) {
        if (typeof MockData !== 'undefined' && MockData.users) {
            const booster = MockData.users.find(u => u.id === boosterId);
            if (booster && booster.stats) {
                switch (action) {
                    case 'assigned':
                        booster.stats.activeOrders = (booster.stats.activeOrders || 0) + 1;
                        break;
                    case 'completed':
                        booster.stats.completedOrders = (booster.stats.completedOrders || 0) + 1;
                        booster.stats.activeOrders = Math.max((booster.stats.activeOrders || 0) - 1, 0);
                        break;
                }
            }
        }
    }

    /**
     * Update advertiser statistics
     */
    updateAdvertiserStats(advertiserId, action) {
        if (typeof MockData !== 'undefined' && MockData.users) {
            const advertiser = MockData.users.find(u => u.id === advertiserId);
            if (advertiser && advertiser.stats) {
                switch (action) {
                    case 'completed':
                        advertiser.stats.completedSales = (advertiser.stats.completedSales || 0) + 1;
                        break;
                }
            }
        }
    }

    /**
     * Send notification (placeholder for notification system integration)
     */
    sendNotification(notification) {
        // This would integrate with the notification system
        console.log('Notification sent:', notification);
        
        // For now, show browser notification if supported
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`Order ${notification.orderId}`, {
                body: notification.message,
                icon: '/favicon.ico'
            });
        }
    }

    /**
     * Dispatch status change event for other systems to listen to
     */
    dispatchStatusChangeEvent(order, previousStatus, newStatus) {
        const event = new CustomEvent('orderStatusChanged', {
            detail: {
                orderId: order.id,
                previousStatus: previousStatus,
                newStatus: newStatus,
                order: order
            }
        });
        
        document.dispatchEvent(event);
    }

    /**
     * Get orders by status with optional filtering
     */
    getOrdersByStatus(status, additionalFilters = {}) {
        let orders = Array.from(this.orders.values()).filter(order => order.status === status);
        
        // Apply additional filters
        if (additionalFilters.advertiserId) {
            orders = orders.filter(order => order.advertiserId === additionalFilters.advertiserId);
        }
        
        if (additionalFilters.boosterId) {
            orders = orders.filter(order => order.boosterId === additionalFilters.boosterId);
        }
        
        if (additionalFilters.serviceType) {
            orders = orders.filter(order => {
                const service = this.getServiceById(order.serviceId);
                return service && service.serviceType === additionalFilters.serviceType;
            });
        }
        
        return orders;
    }

    /**
     * Get service by ID
     */
    getServiceById(serviceId) {
        if (typeof MockData !== 'undefined' && MockData.services) {
            return MockData.services.find(s => s.id === serviceId);
        }
        return null;
    }

    /**
     * Get order status statistics
     */
    getOrderStatusStatistics() {
        const stats = {
            total: this.orders.size,
            byStatus: {},
            byTimeRange: {
                today: 0,
                thisWeek: 0,
                thisMonth: 0
            }
        };
        
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        this.orders.forEach(order => {
            // Count by status
            stats.byStatus[order.status] = (stats.byStatus[order.status] || 0) + 1;
            
            // Count by time range
            const orderDate = new Date(order.createdAt);
            if (orderDate >= today) stats.byTimeRange.today++;
            if (orderDate >= thisWeek) stats.byTimeRange.thisWeek++;
            if (orderDate >= thisMonth) stats.byTimeRange.thisMonth++;
        });
        
        return stats;
    }

    /**
     * Validate order workflow integrity
     */
    validateOrderWorkflow(orderId) {
        const order = this.orders.get(orderId);
        if (!order) {
            return { isValid: false, errors: ['Order not found'] };
        }
        
        const errors = [];
        
        // Check required fields based on status
        switch (order.status) {
            case 'assigned':
                if (!order.boosterId) errors.push('Assigned order must have a booster');
                if (!order.assignedAt) errors.push('Assigned order must have assignment timestamp');
                break;
                
            case 'in_progress':
                if (!order.boosterId) errors.push('In-progress order must have a booster');
                if (!order.startedAt) errors.push('In-progress order must have start timestamp');
                break;
                
            case 'evidence_submitted':
            case 'under_review':
                if (!order.evidence) errors.push('Order with evidence status must have evidence data');
                break;
                
            case 'completed':
                if (!order.completedAt) errors.push('Completed order must have completion timestamp');
                if (!order.evidence) errors.push('Completed order must have evidence');
                break;
        }
        
        // Validate timeline consistency
        if (order.timeline) {
            const timelineStatuses = order.timeline.map(entry => entry.status);
            const lastTimelineStatus = timelineStatuses[timelineStatuses.length - 1];
            
            if (lastTimelineStatus !== order.status) {
                errors.push('Order status does not match latest timeline entry');
            }
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Booster starts an assigned order
     */
    startOrder(orderId, boosterId = 'current_user') {
        const order = this.orders.get(orderId);
        if (!order) {
            throw new Error(`Order ${orderId} not found`);
        }

        if (order.status !== 'assigned') {
            throw new Error('Only assigned orders can be started');
        }

        if (order.boosterId !== boosterId && boosterId !== 'current_user') {
            throw new Error('Only the assigned booster can start this order');
        }

        try {
            this.changeOrderStatus(orderId, 'in_progress', 'Service started by booster', boosterId);
            
            Components.showNotification({
                type: 'success',
                title: 'Order Started',
                message: `Order ${orderId} has been started successfully.`,
                duration: 3000
            });

            return order;
        } catch (error) {
            Components.showNotification({
                type: 'error',
                title: 'Failed to Start Order',
                message: error.message,
                duration: 4000
            });
            throw error;
        }
    }

    /**
     * Booster submits evidence for an order
     */
    submitEvidence(orderId, evidenceData, boosterId = 'current_user') {
        const order = this.orders.get(orderId);
        if (!order) {
            throw new Error(`Order ${orderId} not found`);
        }

        if (order.status !== 'in_progress') {
            throw new Error('Only in-progress orders can have evidence submitted');
        }

        if (order.boosterId !== boosterId && boosterId !== 'current_user') {
            throw new Error('Only the assigned booster can submit evidence');
        }

        // Validate evidence data
        if (!evidenceData.imageUrl && !evidenceData.images) {
            throw new Error('Evidence must include at least one image');
        }

        if (!evidenceData.notes || evidenceData.notes.trim().length < 10) {
            throw new Error('Evidence notes must be at least 10 characters long');
        }

        try {
            // Add evidence to order
            order.evidence = {
                ...evidenceData,
                uploadedAt: new Date().toISOString()
            };

            this.changeOrderStatus(orderId, 'evidence_submitted', 'Evidence uploaded by booster', boosterId);
            
            Components.showNotification({
                type: 'success',
                title: 'Evidence Submitted',
                message: `Evidence for order ${orderId} has been submitted successfully.`,
                duration: 3000
            });

            return order;
        } catch (error) {
            Components.showNotification({
                type: 'error',
                title: 'Failed to Submit Evidence',
                message: error.message,
                duration: 4000
            });
            throw error;
        }
    }

    /**
     * Get overdue orders
     */
    getOverdueOrders() {
        const now = new Date();
        const overdueThreshold = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        
        return Array.from(this.orders.values()).filter(order => {
            if (order.status === 'completed' || order.status === 'rejected') {
                return false;
            }
            
            const orderDate = new Date(order.createdAt);
            return (now - orderDate) > overdueThreshold;
        });
    }

    /**
     * Generate comprehensive status report
     */
    generateStatusReport() {
        const stats = this.getOrderStatusStatistics();
        const attention = {
            pendingAssignment: this.getOrdersByStatus('pending'),
            evidenceToReview: this.getOrdersByStatus('under_review'),
            rejectedOrders: this.getOrdersByStatus('rejected'),
            overdueOrders: this.getOverdueOrders()
        };

        const completionRate = stats.total > 0 
            ? Math.round(((stats.byStatus.completed || 0) / stats.total) * 100)
            : 0;

        return {
            timestamp: new Date().toISOString(),
            summary: {
                total: stats.total,
                pending: stats.byStatus.pending || 0,
                assigned: stats.byStatus.assigned || 0,
                inProgress: stats.byStatus.in_progress || 0,
                evidenceSubmitted: stats.byStatus.evidence_submitted || 0,
                underReview: stats.byStatus.under_review || 0,
                completed: stats.byStatus.completed || 0,
                rejected: stats.byStatus.rejected || 0,
                completionRate: completionRate
            },
            attention: {
                pendingAssignment: attention.pendingAssignment.length,
                evidenceToReview: attention.evidenceToReview.length,
                rejectedOrders: attention.rejectedOrders.length,
                overdueOrders: attention.overdueOrders.length
            },
            timeRange: stats.byTimeRange
        };
    }
}

// Create global instance
let OrderManager_Instance;
if (typeof window !== 'undefined') {
    OrderManager_Instance = new OrderManager();
    window.OrderManager = OrderManager;
    window.OrderManager_Instance = OrderManager_Instance;
}    /
**
     * Approve order and trigger payment release
     * @param {string} orderId - Order ID
     */
    async approveOrder(orderId) {
        try {
            const order = this.orders.get(orderId);
            if (!order) {
                throw new Error('Order not found');
            }

            // Update order status
            const updatedOrder = {
                ...order,
                status: 'completed',
                completedAt: new Date().toISOString(),
                reviewNotes: 'Order approved - service completed satisfactorily'
            };

            // Add completion timeline entry
            if (!updatedOrder.timeline) {
                updatedOrder.timeline = [];
            }
            updatedOrder.timeline.push({
                status: 'completed',
                timestamp: updatedOrder.completedAt,
                note: 'Order approved and completed'
            });

            // Update order in state
            this.orders.set(orderId, updatedOrder);
            AppState.setState('orders', this.orders);

            // Close modal
            Components.closeModal();

            // Show success notification
            AppState.addNotification({
                type: 'success',
                title: 'Order Approved',
                message: `Order #${orderId} has been approved and payment is being processed.`
            });

            // Re-render orders
            this.renderOrders();

        } catch (error) {
            console.error('Error approving order:', error);
            AppState.addNotification({
                type: 'error',
                title: 'Approval Failed',
                message: 'Failed to approve order. Please try again.'
            });
        }
    }

    /**
     * Reject order and trigger payment reversal
     * @param {string} orderId - Order ID
     */
    async rejectOrder(orderId) {
        try {
            // Show rejection reason modal first
            const rejectionReason = await this.showRejectionReasonModal();
            if (!rejectionReason) {
                return; // User cancelled
            }

            const order = this.orders.get(orderId);
            if (!order) {
                throw new Error('Order not found');
            }

            // Update order status
            const updatedOrder = {
                ...order,
                status: 'rejected',
                rejectedAt: new Date().toISOString(),
                reviewNotes: rejectionReason
            };

            // Add rejection timeline entry
            if (!updatedOrder.timeline) {
                updatedOrder.timeline = [];
            }
            updatedOrder.timeline.push({
                status: 'rejected',
                timestamp: updatedOrder.rejectedAt,
                note: `Order rejected: ${rejectionReason}`
            });

            // Update order in state
            this.orders.set(orderId, updatedOrder);
            AppState.setState('orders', this.orders);

            // Close modal
            Components.closeModal();

            // Show success notification
            AppState.addNotification({
                type: 'warning',
                title: 'Order Rejected',
                message: `Order #${orderId} has been rejected and refund is being processed.`
            });

            // Re-render orders
            this.renderOrders();

        } catch (error) {
            console.error('Error rejecting order:', error);
            AppState.addNotification({
                type: 'error',
                title: 'Rejection Failed',
                message: 'Failed to reject order. Please try again.'
            });
        }
    }

    /**
     * Show rejection reason modal
     * @returns {Promise<string|null>} Rejection reason or null if cancelled
     */
    showRejectionReasonModal() {
        return new Promise((resolve) => {
            const content = Utils.DOM.create('div', {
                className: 'rejection-reason-modal'
            });

            const description = Utils.DOM.create('p', {
                className: 'rejection-description'
            }, 'Please provide a reason for rejecting this order. This will be sent to the booster and buyer.');

            const textarea = Utils.DOM.create('textarea', {
                className: 'rejection-textarea',
                placeholder: 'Enter rejection reason...',
                rows: 4,
                required: true
            });

            content.appendChild(description);
            content.appendChild(textarea);

            Components.showModal({
                title: 'Reject Order',
                content: content,
                size: 'medium',
                footer: [
                    Components.createButton({
                        text: 'Cancel',
                        variant: 'secondary',
                        onClick: () => {
                            Components.closeModal();
                            resolve(null);
                        }
                    }),
                    Components.createButton({
                        text: 'Reject Order',
                        variant: 'error',
                        onClick: () => {
                            const reason = textarea.value.trim();
                            if (!reason) {
                                AppState.addNotification({
                                    type: 'error',
                                    title: 'Validation Error',
                                    message: 'Please provide a rejection reason.'
                                });
                                return;
                            }
                            Components.closeModal();
                            resolve(reason);
                        }
                    })
                ]
            });

            // Focus textarea
            setTimeout(() => textarea.focus(), 100);
        });
    }

    /**
     * Assign booster to order and trigger payment hold
     * @param {string} orderId - Order ID
     * @param {string} boosterId - Booster ID
     */
    async assignBoosterToOrder(orderId, boosterId) {
        try {
            const order = this.orders.get(orderId);
            if (!order) {
                throw new Error('Order not found');
            }

            // Update order with booster assignment
            const updatedOrder = {
                ...order,
                boosterId: boosterId,
                status: 'assigned',
                assignedAt: new Date().toISOString()
            };

            // Add assignment timeline entry
            if (!updatedOrder.timeline) {
                updatedOrder.timeline = [];
            }
            updatedOrder.timeline.push({
                status: 'assigned',
                timestamp: updatedOrder.assignedAt,
                note: `Assigned to booster ${this.getBoosterUsername(boosterId)}`
            });

            // Update order in state
            this.orders.set(orderId, updatedOrder);
            AppState.setState('orders', this.orders);

            // Show success notification
            AppState.addNotification({
                type: 'success',
                title: 'Booster Assigned',
                message: `Order #${orderId} has been assigned and payment is being held securely.`
            });

            // Re-render orders
            this.renderOrders();

        } catch (error) {
            console.error('Error assigning booster:', error);
            AppState.addNotification({
                type: 'error',
                title: 'Assignment Failed',
                message: 'Failed to assign booster. Please try again.'
            });
        }
    }

    /**
     * Get booster username by ID
     * @param {string} boosterId - Booster ID
     * @returns {string} Booster username
     */
    getBoosterUsername(boosterId) {
        if (typeof MockData !== 'undefined' && MockData.users) {
            const booster = MockData.users.find(u => u.id === boosterId);
            return booster ? booster.discordUsername : 'Unknown Booster';
        }
        return 'Unknown Booster';
    }