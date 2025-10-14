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
     * Create order timeline
     */
    createOrderTimeline(order) {
        const section = Utils.DOM.create('div', {
            className: 'order-timeline-section'
        });

        const title = Utils.DOM.create('h3', {}, 'Order Timeline');
        section.appendChild(title);

        const timeline = Utils.DOM.create('div', {
            className: 'order-timeline'
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
                }, event.status);

                const note = Utils.DOM.create('div', {
                    className: 'timeline-note'
                }, event.note);

                timelineItem.appendChild(timestamp);
                timelineItem.appendChild(status);
                timelineItem.appendChild(note);
                timeline.appendChild(timelineItem);
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
            // Update order
            order.boosterId = boosterId;
            order.status = 'assigned';
            order.assignedAt = new Date().toISOString();
            
            // Add timeline entry
            if (!order.timeline) order.timeline = [];
            order.timeline.push({
                status: 'assigned',
                timestamp: new Date().toISOString(),
                note: `Assigned to ${MockData.users.find(u => u.id === boosterId)?.discordUsername}`
            });

            // Update orders map
            this.orders.set(orderId, order);

            // Close modal and refresh view
            Components.closeModal();
            this.applyFilters();
            this.renderOrders();

            Components.showNotification({
                type: 'success',
                title: 'Booster Assigned',
                message: `Order ${orderId} has been assigned successfully.`,
                duration: 3000
            });
        }
    }

    /**
     * Show evidence review modal
     */
    showEvidenceReview(orderId) {
        const order = this.orders.get(orderId);
        if (!order || !order.evidence) return;

        const content = this.createEvidenceReviewContent(order);
        
        Components.showModal({
            title: `Review Evidence - ${order.id}`,
            content: content,
            size: 'large',
            closable: true,
            footer: [
                Components.createButton({
                    text: 'Reject',
                    variant: 'error',
                    onClick: () => this.showRejectModal(orderId)
                }),
                Components.createButton({
                    text: 'Approve',
                    variant: 'success',
                    onClick: () => this.approveOrder(orderId)
                })
            ]
        });
    }

    /**
     * Create evidence review content
     */
    createEvidenceReviewContent(order) {
        const container = Utils.DOM.create('div', {
            className: 'evidence-review'
        });

        // Order info
        const orderInfo = Utils.DOM.create('div', {
            className: 'review-order-info'
        });

        const infoTitle = Utils.DOM.create('h4', {}, 'Order Information');
        const serviceTitle = Utils.DOM.create('p', {}, `Service: ${this.getServiceTitle(order.serviceId)}`);
        const boosterName = Utils.DOM.create('p', {}, `Booster: ${this.getBoosterInfo(order.boosterId).textContent || 'Unknown'}`);

        orderInfo.appendChild(infoTitle);
        orderInfo.appendChild(serviceTitle);
        orderInfo.appendChild(boosterName);

        // Evidence display
        const evidenceDisplay = Utils.DOM.create('div', {
            className: 'evidence-display'
        });

        const evidenceTitle = Utils.DOM.create('h4', {}, 'Submitted Evidence');

        if (order.evidence.imageUrl) {
            const imageContainer = Utils.DOM.create('div', {
                className: 'evidence-image-container'
            });

            const image = Utils.DOM.create('img', {
                src: order.evidence.imageUrl,
                alt: 'Order Evidence',
                className: 'evidence-image-large',
                onclick: () => this.showImageModal(order.evidence.imageUrl)
            });

            const imageLabel = Utils.DOM.create('p', {
                className: 'image-label'
            }, 'Click image to view full size');

            imageContainer.appendChild(image);
            imageContainer.appendChild(imageLabel);
            evidenceDisplay.appendChild(imageContainer);
        }

        if (order.evidence.notes) {
            const notesContainer = Utils.DOM.create('div', {
                className: 'evidence-notes-container'
            });

            const notesLabel = Utils.DOM.create('h5', {}, 'Completion Notes:');
            const notes = Utils.DOM.create('div', {
                className: 'evidence-notes-text'
            }, order.evidence.notes);

            notesContainer.appendChild(notesLabel);
            notesContainer.appendChild(notes);
            evidenceDisplay.appendChild(notesContainer);
        }

        const uploadedAt = Utils.DOM.create('p', {
            className: 'evidence-timestamp'
        }, `Submitted: ${Utils.Format.date(order.evidence.uploadedAt, 'datetime')}`);

        evidenceDisplay.appendChild(uploadedAt);

        container.appendChild(orderInfo);
        container.appendChild(evidenceTitle);
        container.appendChild(evidenceDisplay);

        return container;
    }

    /**
     * Show image in modal
     */
    showImageModal(imageUrl) {
        const image = Utils.DOM.create('img', {
            src: imageUrl,
            alt: 'Evidence Image',
            className: 'modal-image',
            style: 'max-width: 100%; height: auto;'
        });

        Components.showModal({
            title: 'Evidence Image',
            content: image,
            size: 'large',
            closable: true
        });
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
            // Update order status
            order.status = 'completed';
            order.completedAt = new Date().toISOString();
            order.reviewNotes = 'Order approved and completed successfully.';

            // Add timeline entry
            if (!order.timeline) order.timeline = [];
            order.timeline.push({
                status: 'completed',
                timestamp: new Date().toISOString(),
                note: 'Order approved and payment released'
            });

            // Update orders map
            this.orders.set(orderId, order);

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
            // Update order status
            order.status = 'rejected';
            order.reviewNotes = reason;

            // Add timeline entry
            if (!order.timeline) order.timeline = [];
            order.timeline.push({
                status: 'rejected',
                timestamp: new Date().toISOString(),
                note: `Order rejected: ${reason}`
            });

            // Update orders map
            this.orders.set(orderId, order);

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
        let assignedCount = 0;

        orderIds.forEach(orderId => {
            const order = this.orders.get(orderId);
            if (order && order.status === 'pending') {
                order.boosterId = boosterId;
                order.status = 'assigned';
                order.assignedAt = new Date().toISOString();
                
                if (!order.timeline) order.timeline = [];
                order.timeline.push({
                    status: 'assigned',
                    timestamp: new Date().toISOString(),
                    note: `Bulk assigned to ${MockData.users.find(u => u.id === boosterId)?.discordUsername}`
                });

                this.orders.set(orderId, order);
                assignedCount++;
            }
        });

        // Clear selection and refresh
        this.selectedOrders.clear();
        Components.closeModal();
        this.applyFilters();
        this.renderOrders();

        Components.showNotification({
            type: 'success',
            title: 'Bulk Assignment Complete',
            message: `${assignedCount} orders have been assigned successfully.`,
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
}

// Create global instance
const OrderManager_Instance = new OrderManager();

// Export for use in other modules
window.OrderManager = OrderManager;
window.OrderManager_Instance = OrderManager_Instance;