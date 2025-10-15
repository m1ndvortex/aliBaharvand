/**
 * Payment Management Interface for Service Provider Dashboard
 * Provides UI for viewing payment holds, audit trails, and statistics
 */

class PaymentManager {
    constructor() {
        this.initialized = false;
        this.currentView = 'overview';
        this.filters = {
            status: 'all',
            currency: 'all',
            dateRange: 'all',
            search: ''
        };
        
        // Bind methods
        this.init = this.init.bind(this);
        this.renderPaymentInterface = this.renderPaymentInterface.bind(this);
        this.renderOverview = this.renderOverview.bind(this);
        this.renderPaymentHolds = this.renderPaymentHolds.bind(this);
        this.renderAuditTrail = this.renderAuditTrail.bind(this);
        this.renderStatistics = this.renderStatistics.bind(this);
        this.handleViewChange = this.handleViewChange.bind(this);
        this.handleFilterChange = this.handleFilterChange.bind(this);
        this.showPaymentDetails = this.showPaymentDetails.bind(this);
        this.exportPaymentData = this.exportPaymentData.bind(this);
    }

    /**
     * Initialize payment manager
     */
    async init() {
        if (this.initialized) return;

        try {
            // Ensure PaymentProcessor is initialized
            if (window.PaymentProcessor && !window.PaymentProcessor.initialized) {
                await window.PaymentProcessor.init();
            }
            
            this.initialized = true;
            console.log('Payment Manager initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize Payment Manager:', error);
            throw error;
        }
    }

    /**
     * Render payment management interface
     * @param {Element} container - Container element
     */
    renderPaymentInterface(container) {
        if (!container) return;

        // Clear container
        Utils.DOM.empty(container);

        // Create payment management layout
        const paymentContainer = Utils.DOM.create('div', {
            className: 'payment-management-container'
        });

        // Header with navigation
        const header = this.createPaymentHeader();
        paymentContainer.appendChild(header);

        // Content area
        const contentArea = Utils.DOM.create('div', {
            className: 'payment-content-area'
        });

        // Render current view
        this.renderCurrentView(contentArea);

        paymentContainer.appendChild(contentArea);
        container.appendChild(paymentContainer);
    }

    /**
     * Create payment management header
     * @returns {Element} Header element
     */
    createPaymentHeader() {
        const header = Utils.DOM.create('div', {
            className: 'payment-header'
        });

        const title = Utils.DOM.create('h2', {
            className: 'payment-title'
        }, '💳 Payment Management');

        const subtitle = Utils.DOM.create('p', {
            className: 'payment-subtitle'
        }, 'Monitor payment holds, releases, and audit trails');

        // Navigation tabs
        const navigation = Utils.DOM.create('div', {
            className: 'payment-navigation'
        });

        const navItems = [
            { id: 'overview', label: '📊 Overview', icon: '📊' },
            { id: 'holds', label: '🔒 Payment Holds', icon: '🔒' },
            { id: 'audit', label: '📋 Audit Trail', icon: '📋' },
            { id: 'statistics', label: '📈 Statistics', icon: '📈' }
        ];

        navItems.forEach(item => {
            const navButton = Components.createButton({
                text: item.label,
                variant: this.currentView === item.id ? 'primary' : 'secondary',
                size: 'medium',
                onClick: () => this.handleViewChange(item.id)
            });

            navButton.classList.add('payment-nav-button');
            if (this.currentView === item.id) {
                navButton.classList.add('active');
            }

            navigation.appendChild(navButton);
        });

        header.appendChild(title);
        header.appendChild(subtitle);
        header.appendChild(navigation);

        return header;
    }

    /**
     * Render current view content
     * @param {Element} container - Content container
     */
    renderCurrentView(container) {
        Utils.DOM.empty(container);

        switch (this.currentView) {
            case 'overview':
                this.renderOverview(container);
                break;
            case 'holds':
                this.renderPaymentHolds(container);
                break;
            case 'audit':
                this.renderAuditTrail(container);
                break;
            case 'statistics':
                this.renderStatistics(container);
                break;
            default:
                this.renderOverview(container);
        }
    }

    /**
     * Render payment overview
     * @param {Element} container - Container element
     */
    renderOverview(container) {
        const overview = Utils.DOM.create('div', {
            className: 'payment-overview'
        });

        // Get payment statistics
        const stats = window.PaymentProcessor.getPaymentStatistics();

        // Summary cards
        const summarySection = Utils.DOM.create('div', {
            className: 'payment-summary-section'
        });

        const summaryTitle = Utils.DOM.create('h3', {
            className: 'section-title'
        }, 'Payment Summary');

        const summaryGrid = Utils.DOM.create('div', {
            className: 'payment-summary-grid'
        });

        // Summary cards data
        const summaryCards = [
            {
                title: 'Active Holds',
                value: stats.activeHolds,
                icon: '🔒',
                color: 'warning',
                description: 'Payments currently held'
            },
            {
                title: 'Released Payments',
                value: stats.releasedPayments,
                icon: '✅',
                color: 'success',
                description: 'Successfully processed'
            },
            {
                title: 'Reversed Payments',
                value: stats.reversedPayments,
                icon: '↩️',
                color: 'error',
                description: 'Refunded to buyers'
            },
            {
                title: 'Total Processed',
                value: stats.totalProcessed,
                icon: '📊',
                color: 'info',
                description: 'All completed transactions'
            }
        ];

        summaryCards.forEach(card => {
            const cardElement = this.createSummaryCard(card);
            summaryGrid.appendChild(cardElement);
        });

        summarySection.appendChild(summaryTitle);
        summarySection.appendChild(summaryGrid);

        // Recent activity section
        const activitySection = Utils.DOM.create('div', {
            className: 'payment-activity-section'
        });

        const activityTitle = Utils.DOM.create('h3', {
            className: 'section-title'
        }, 'Recent Payment Activity');

        const activityList = Utils.DOM.create('div', {
            className: 'payment-activity-list'
        });

        // Show recent audit entries
        const recentActivity = stats.recentActivity || [];
        if (recentActivity.length === 0) {
            const emptyState = Utils.DOM.create('div', {
                className: 'empty-state'
            });
            emptyState.innerHTML = `
                <div class="empty-state-icon">💳</div>
                <h4 class="empty-state-title">No Recent Activity</h4>
                <p class="empty-state-message">Payment activity will appear here as orders are processed.</p>
            `;
            activityList.appendChild(emptyState);
        } else {
            recentActivity.forEach(activity => {
                const activityItem = this.createActivityItem(activity);
                activityList.appendChild(activityItem);
            });
        }

        activitySection.appendChild(activityTitle);
        activitySection.appendChild(activityList);

        // Currency breakdown section
        const currencySection = Utils.DOM.create('div', {
            className: 'payment-currency-section'
        });

        const currencyTitle = Utils.DOM.create('h3', {
            className: 'section-title'
        }, 'Payment Breakdown by Currency');

        const currencyGrid = Utils.DOM.create('div', {
            className: 'payment-currency-grid'
        });

        Object.entries(stats.totalAmounts || {}).forEach(([currency, amounts]) => {
            const currencyCard = this.createCurrencyBreakdownCard(currency, amounts);
            currencyGrid.appendChild(currencyCard);
        });

        if (Object.keys(stats.totalAmounts || {}).length === 0) {
            const emptyState = Utils.DOM.create('div', {
                className: 'empty-state'
            });
            emptyState.innerHTML = `
                <div class="empty-state-icon">💰</div>
                <h4 class="empty-state-title">No Payment Data</h4>
                <p class="empty-state-message">Currency breakdown will appear here as payments are processed.</p>
            `;
            currencyGrid.appendChild(emptyState);
        }

        currencySection.appendChild(currencyTitle);
        currencySection.appendChild(currencyGrid);

        overview.appendChild(summarySection);
        overview.appendChild(activitySection);
        overview.appendChild(currencySection);

        container.appendChild(overview);
    }

    /**
     * Create summary card
     * @param {Object} cardData - Card data
     * @returns {Element} Card element
     */
    createSummaryCard(cardData) {
        const card = Utils.DOM.create('div', {
            className: `payment-summary-card card-${cardData.color}`
        });

        card.innerHTML = `
            <div class="card-icon">${cardData.icon}</div>
            <div class="card-content">
                <div class="card-value">${cardData.value}</div>
                <div class="card-title">${cardData.title}</div>
                <div class="card-description">${cardData.description}</div>
            </div>
        `;

        return card;
    }

    /**
     * Create activity item
     * @param {Object} activity - Activity data
     * @returns {Element} Activity item element
     */
    createActivityItem(activity) {
        const item = Utils.DOM.create('div', {
            className: 'payment-activity-item'
        });

        const actionIcons = {
            'payment_held': '🔒',
            'payment_released': '✅',
            'payment_reversed': '↩️',
            'payment_hold_failed': '❌',
            'payment_release_failed': '❌',
            'payment_reversal_failed': '❌'
        };

        const actionLabels = {
            'payment_held': 'Payment Held',
            'payment_released': 'Payment Released',
            'payment_reversed': 'Payment Reversed',
            'payment_hold_failed': 'Hold Failed',
            'payment_release_failed': 'Release Failed',
            'payment_reversal_failed': 'Reversal Failed'
        };

        const icon = actionIcons[activity.action] || '💳';
        const label = actionLabels[activity.action] || activity.action;

        item.innerHTML = `
            <div class="activity-icon">${icon}</div>
            <div class="activity-content">
                <div class="activity-header">
                    <div class="activity-title">${label}</div>
                    <div class="activity-time">${Utils.Format.timeAgo(activity.timestamp)}</div>
                </div>
                <div class="activity-details">
                    Order #${activity.orderId}
                    ${activity.details.amount ? `- ${this.formatCurrency(activity.details.amount, activity.details.currency)}` : ''}
                </div>
            </div>
        `;

        // Add click handler to show details
        item.addEventListener('click', () => {
            this.showActivityDetails(activity);
        });

        return item;
    }

    /**
     * Create currency breakdown card
     * @param {string} currency - Currency type
     * @param {Object} amounts - Amount breakdown
     * @returns {Element} Currency card element
     */
    createCurrencyBreakdownCard(currency, amounts) {
        const card = Utils.DOM.create('div', {
            className: 'payment-currency-card'
        });

        const currencyIcons = {
            'gold': '🪙',
            'usd': '💵',
            'toman': '﷼'
        };

        const icon = currencyIcons[currency] || '💰';
        const total = amounts.held + amounts.released + amounts.reversed;

        card.innerHTML = `
            <div class="currency-header">
                <div class="currency-icon">${icon}</div>
                <div class="currency-name">${currency.toUpperCase()}</div>
            </div>
            <div class="currency-amounts">
                <div class="amount-row">
                    <span class="amount-label">Held:</span>
                    <span class="amount-value held">${this.formatCurrency(amounts.held, currency)}</span>
                </div>
                <div class="amount-row">
                    <span class="amount-label">Released:</span>
                    <span class="amount-value released">${this.formatCurrency(amounts.released, currency)}</span>
                </div>
                <div class="amount-row">
                    <span class="amount-label">Reversed:</span>
                    <span class="amount-value reversed">${this.formatCurrency(amounts.reversed, currency)}</span>
                </div>
                <div class="amount-row total">
                    <span class="amount-label">Total:</span>
                    <span class="amount-value">${this.formatCurrency(total, currency)}</span>
                </div>
            </div>
        `;

        return card;
    }

    /**
     * Render payment holds view
     * @param {Element} container - Container element
     */
    renderPaymentHolds(container) {
        const holdsSection = Utils.DOM.create('div', {
            className: 'payment-holds-section'
        });

        // Filters
        const filtersContainer = this.createHoldsFilters();
        holdsSection.appendChild(filtersContainer);

        // Holds table
        const tableContainer = Utils.DOM.create('div', {
            className: 'payment-holds-table-container'
        });

        const holds = window.PaymentProcessor.getPaymentHolds(this.filters);

        if (holds.length === 0) {
            const emptyState = Utils.DOM.create('div', {
                className: 'empty-state'
            });
            emptyState.innerHTML = `
                <div class="empty-state-icon">🔒</div>
                <h4 class="empty-state-title">No Payment Holds Found</h4>
                <p class="empty-state-message">Payment holds will appear here as orders are assigned to boosters.</p>
            `;
            tableContainer.appendChild(emptyState);
        } else {
            const table = this.createHoldsTable(holds);
            tableContainer.appendChild(table);
        }

        holdsSection.appendChild(tableContainer);
        container.appendChild(holdsSection);
    }

    /**
     * Create holds filters
     * @returns {Element} Filters container
     */
    createHoldsFilters() {
        const filtersContainer = Utils.DOM.create('div', {
            className: 'payment-holds-filters'
        });

        // Status filter
        const statusFilter = Components.createFormGroup({
            label: 'Status',
            type: 'select',
            name: 'statusFilter',
            value: this.filters.status,
            options: [
                { value: 'all', label: 'All Statuses' },
                { value: 'held', label: 'Active Holds' },
                { value: 'released', label: 'Released' },
                { value: 'reversed', label: 'Reversed' }
            ]
        });

        // Currency filter
        const currencyFilter = Components.createFormGroup({
            label: 'Currency',
            type: 'select',
            name: 'currencyFilter',
            value: this.filters.currency,
            options: [
                { value: 'all', label: 'All Currencies' },
                { value: 'gold', label: '🪙 Gold' },
                { value: 'usd', label: '💵 USD' },
                { value: 'toman', label: '﷼ Toman' }
            ]
        });

        // Search input
        const searchInput = Components.createFormGroup({
            label: 'Search',
            type: 'text',
            name: 'searchFilter',
            value: this.filters.search,
            placeholder: 'Search by order ID...'
        });

        // Add event listeners
        statusFilter.querySelector('select').addEventListener('change', (e) => {
            this.filters.status = e.target.value;
            this.handleFilterChange();
        });

        currencyFilter.querySelector('select').addEventListener('change', (e) => {
            this.filters.currency = e.target.value;
            this.handleFilterChange();
        });

        searchInput.querySelector('input').addEventListener('input', Utils.Events.debounce((e) => {
            this.filters.search = e.target.value;
            this.handleFilterChange();
        }, 300));

        filtersContainer.appendChild(statusFilter);
        filtersContainer.appendChild(currencyFilter);
        filtersContainer.appendChild(searchInput);

        return filtersContainer;
    }

    /**
     * Create holds table
     * @param {Array} holds - Payment holds data
     * @returns {Element} Table element
     */
    createHoldsTable(holds) {
        const columns = [
            { key: 'orderId', label: 'Order ID', sortable: true },
            { key: 'amount', label: 'Amount', sortable: true, render: (value, row) => this.formatCurrency(row.amount, row.currency) },
            { key: 'currency', label: 'Currency', sortable: true },
            { key: 'status', label: 'Status', sortable: true, render: (value, row) => this.createStatusBadge(row.status) },
            { key: 'heldAt', label: 'Held At', sortable: true, render: (value, row) => Utils.Format.date(row.heldAt, 'datetime') },
            { key: 'actions', label: 'Actions', sortable: false, render: (value, row) => this.createHoldActions(row) }
        ];

        const table = Components.createTable({
            columns: columns,
            data: holds,
            className: 'payment-holds-table',
            sortable: true
        });

        return table;
    }

    /**
     * Create status badge
     * @param {string} status - Status value
     * @returns {Element} Status badge
     */
    createStatusBadge(status) {
        const statusMap = {
            'held': { text: 'Held', class: 'warning' },
            'released': { text: 'Released', class: 'success' },
            'reversed': { text: 'Reversed', class: 'error' }
        };

        const statusInfo = statusMap[status] || { text: status, class: 'default' };
        
        return Components.createStatusBadge({
            status: statusInfo.class,
            text: statusInfo.text
        });
    }

    /**
     * Create hold actions
     * @param {Object} hold - Payment hold data
     * @returns {Element} Actions container
     */
    createHoldActions(hold) {
        const actions = Utils.DOM.create('div', {
            className: 'hold-actions'
        });

        const viewBtn = Components.createButton({
            text: 'View Details',
            icon: '👁️',
            variant: 'secondary',
            size: 'sm',
            onClick: () => this.showPaymentDetails(hold)
        });

        actions.appendChild(viewBtn);
        return actions;
    }

    /**
     * Render audit trail view
     * @param {Element} container - Container element
     */
    renderAuditTrail(container) {
        const auditSection = Utils.DOM.create('div', {
            className: 'payment-audit-section'
        });

        // Get audit trail data
        const auditEntries = window.PaymentProcessor.getAuditTrail(this.filters);

        // Audit trail header
        const header = Utils.DOM.create('div', {
            className: 'audit-header'
        });

        const title = Utils.DOM.create('h3', {
            className: 'section-title'
        }, 'Payment Audit Trail');

        const exportBtn = Components.createButton({
            text: 'Export Audit Log',
            icon: '📊',
            variant: 'secondary',
            onClick: () => this.exportPaymentData('audit')
        });

        header.appendChild(title);
        header.appendChild(exportBtn);

        // Audit trail list
        const auditList = Utils.DOM.create('div', {
            className: 'payment-audit-list'
        });

        if (auditEntries.length === 0) {
            const emptyState = Utils.DOM.create('div', {
                className: 'empty-state'
            });
            emptyState.innerHTML = `
                <div class="empty-state-icon">📋</div>
                <h4 class="empty-state-title">No Audit Entries Found</h4>
                <p class="empty-state-message">Payment audit entries will appear here as transactions are processed.</p>
            `;
            auditList.appendChild(emptyState);
        } else {
            auditEntries.forEach(entry => {
                const auditItem = this.createAuditItem(entry);
                auditList.appendChild(auditItem);
            });
        }

        auditSection.appendChild(header);
        auditSection.appendChild(auditList);
        container.appendChild(auditSection);
    }

    /**
     * Create audit item
     * @param {Object} entry - Audit entry data
     * @returns {Element} Audit item element
     */
    createAuditItem(entry) {
        const item = Utils.DOM.create('div', {
            className: 'payment-audit-item'
        });

        const actionIcons = {
            'payment_held': '🔒',
            'payment_released': '✅',
            'payment_reversed': '↩️',
            'payment_hold_failed': '❌',
            'payment_release_failed': '❌',
            'payment_reversal_failed': '❌',
            'error': '⚠️'
        };

        const icon = actionIcons[entry.action] || '📋';

        item.innerHTML = `
            <div class="audit-icon">${icon}</div>
            <div class="audit-content">
                <div class="audit-header">
                    <div class="audit-action">${entry.action.replace(/_/g, ' ').toUpperCase()}</div>
                    <div class="audit-timestamp">${Utils.Format.date(entry.timestamp, 'datetime')}</div>
                </div>
                <div class="audit-details">
                    <div class="audit-order">Order: #${entry.orderId}</div>
                    ${entry.details.amount ? `<div class="audit-amount">Amount: ${this.formatCurrency(entry.details.amount, entry.details.currency)}</div>` : ''}
                    ${entry.details.error ? `<div class="audit-error">Error: ${entry.details.error}</div>` : ''}
                </div>
            </div>
        `;

        // Add click handler to show full details
        item.addEventListener('click', () => {
            this.showAuditDetails(entry);
        });

        return item;
    }

    /**
     * Render statistics view
     * @param {Element} container - Container element
     */
    renderStatistics(container) {
        const statsSection = Utils.DOM.create('div', {
            className: 'payment-statistics-section'
        });

        const stats = window.PaymentProcessor.getPaymentStatistics();

        // Statistics header
        const header = Utils.DOM.create('div', {
            className: 'stats-header'
        });

        const title = Utils.DOM.create('h3', {
            className: 'section-title'
        }, 'Payment Statistics');

        const refreshBtn = Components.createButton({
            text: 'Refresh Data',
            icon: '🔄',
            variant: 'secondary',
            onClick: () => this.renderCurrentView(container)
        });

        header.appendChild(title);
        header.appendChild(refreshBtn);

        // Statistics content
        const statsContent = Utils.DOM.create('div', {
            className: 'payment-stats-content'
        });

        // Key metrics
        const metricsGrid = Utils.DOM.create('div', {
            className: 'payment-metrics-grid'
        });

        const metrics = [
            { label: 'Total Payment Holds', value: stats.totalHolds, icon: '🔒' },
            { label: 'Success Rate', value: `${((stats.releasedPayments / Math.max(stats.totalProcessed, 1)) * 100).toFixed(1)}%`, icon: '✅' },
            { label: 'Reversal Rate', value: `${((stats.reversedPayments / Math.max(stats.totalProcessed, 1)) * 100).toFixed(1)}%`, icon: '↩️' },
            { label: 'Processing Volume', value: stats.totalProcessed, icon: '📊' }
        ];

        metrics.forEach(metric => {
            const metricCard = Utils.DOM.create('div', {
                className: 'payment-metric-card'
            });

            metricCard.innerHTML = `
                <div class="metric-icon">${metric.icon}</div>
                <div class="metric-content">
                    <div class="metric-value">${metric.value}</div>
                    <div class="metric-label">${metric.label}</div>
                </div>
            `;

            metricsGrid.appendChild(metricCard);
        });

        statsContent.appendChild(metricsGrid);

        // Currency breakdown chart (simplified)
        const chartSection = Utils.DOM.create('div', {
            className: 'payment-chart-section'
        });

        const chartTitle = Utils.DOM.create('h4', {
            className: 'chart-title'
        }, 'Payment Volume by Currency');

        const chartContainer = Utils.DOM.create('div', {
            className: 'payment-chart-container'
        });

        // Simple bar chart representation
        Object.entries(stats.totalAmounts || {}).forEach(([currency, amounts]) => {
            const total = amounts.held + amounts.released + amounts.reversed;
            const chartBar = Utils.DOM.create('div', {
                className: 'payment-chart-bar'
            });

            const currencyIcons = {
                'gold': '🪙',
                'usd': '💵',
                'toman': '﷼'
            };

            chartBar.innerHTML = `
                <div class="chart-bar-label">
                    ${currencyIcons[currency] || '💰'} ${currency.toUpperCase()}
                </div>
                <div class="chart-bar-visual">
                    <div class="chart-bar-fill" style="width: ${Math.min((total / 10000) * 100, 100)}%"></div>
                </div>
                <div class="chart-bar-value">${this.formatCurrency(total, currency)}</div>
            `;

            chartContainer.appendChild(chartBar);
        });

        if (Object.keys(stats.totalAmounts || {}).length === 0) {
            chartContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📊</div>
                    <p class="empty-state-message">No payment data available for chart.</p>
                </div>
            `;
        }

        chartSection.appendChild(chartTitle);
        chartSection.appendChild(chartContainer);
        statsContent.appendChild(chartSection);

        statsSection.appendChild(header);
        statsSection.appendChild(statsContent);
        container.appendChild(statsSection);
    }

    /**
     * Handle view change
     * @param {string} viewId - New view ID
     */
    handleViewChange(viewId) {
        this.currentView = viewId;
        
        // Update navigation buttons
        const navButtons = document.querySelectorAll('.payment-nav-button');
        navButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.textContent.includes(this.getViewLabel(viewId))) {
                btn.classList.add('active');
            }
        });

        // Re-render content
        const contentArea = document.querySelector('.payment-content-area');
        if (contentArea) {
            this.renderCurrentView(contentArea);
        }
    }

    /**
     * Get view label by ID
     * @param {string} viewId - View ID
     * @returns {string} View label
     */
    getViewLabel(viewId) {
        const labels = {
            'overview': 'Overview',
            'holds': 'Payment Holds',
            'audit': 'Audit Trail',
            'statistics': 'Statistics'
        };
        return labels[viewId] || viewId;
    }

    /**
     * Handle filter change
     */
    handleFilterChange() {
        const contentArea = document.querySelector('.payment-content-area');
        if (contentArea) {
            this.renderCurrentView(contentArea);
        }
    }

    /**
     * Show payment details modal
     * @param {Object} paymentData - Payment data
     */
    showPaymentDetails(paymentData) {
        const content = Utils.DOM.create('div', {
            className: 'payment-details-modal'
        });

        content.innerHTML = `
            <div class="payment-details-header">
                <h4>Payment Hold Details</h4>
                <div class="payment-status ${paymentData.status}">${paymentData.status.toUpperCase()}</div>
            </div>
            
            <div class="payment-details-content">
                <div class="detail-row">
                    <label>Order ID:</label>
                    <span>#${paymentData.orderId}</span>
                </div>
                <div class="detail-row">
                    <label>Amount:</label>
                    <span>${this.formatCurrency(paymentData.amount, paymentData.currency)}</span>
                </div>
                <div class="detail-row">
                    <label>Currency:</label>
                    <span>${paymentData.currency.toUpperCase()}</span>
                </div>
                <div class="detail-row">
                    <label>Status:</label>
                    <span>${paymentData.status}</span>
                </div>
                <div class="detail-row">
                    <label>Held At:</label>
                    <span>${Utils.Format.date(paymentData.heldAt, 'datetime')}</span>
                </div>
                ${paymentData.releasedAt ? `
                    <div class="detail-row">
                        <label>Released At:</label>
                        <span>${Utils.Format.date(paymentData.releasedAt, 'datetime')}</span>
                    </div>
                ` : ''}
                ${paymentData.reversedAt ? `
                    <div class="detail-row">
                        <label>Reversed At:</label>
                        <span>${Utils.Format.date(paymentData.reversedAt, 'datetime')}</span>
                    </div>
                ` : ''}
                <div class="detail-row">
                    <label>Reason:</label>
                    <span>${paymentData.reason}</span>
                </div>
                ${paymentData.netAmount ? `
                    <div class="detail-row">
                        <label>Net Amount:</label>
                        <span>${this.formatCurrency(paymentData.netAmount, paymentData.currency)}</span>
                    </div>
                ` : ''}
                ${paymentData.processingFee ? `
                    <div class="detail-row">
                        <label>Processing Fee:</label>
                        <span>${this.formatCurrency(paymentData.processingFee, paymentData.currency)}</span>
                    </div>
                ` : ''}
            </div>
        `;

        Components.showModal({
            title: 'Payment Details',
            content: content,
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
     * Show activity details modal
     * @param {Object} activity - Activity data
     */
    showActivityDetails(activity) {
        const content = Utils.DOM.create('div', {
            className: 'activity-details-modal'
        });

        content.innerHTML = `
            <div class="activity-details-content">
                <div class="detail-row">
                    <label>Action:</label>
                    <span>${activity.action.replace(/_/g, ' ').toUpperCase()}</span>
                </div>
                <div class="detail-row">
                    <label>Order ID:</label>
                    <span>#${activity.orderId}</span>
                </div>
                <div class="detail-row">
                    <label>Timestamp:</label>
                    <span>${Utils.Format.date(activity.timestamp, 'datetime')}</span>
                </div>
                <div class="detail-row">
                    <label>User ID:</label>
                    <span>${activity.userId}</span>
                </div>
                <div class="detail-section">
                    <label>Details:</label>
                    <pre class="detail-json">${JSON.stringify(activity.details, null, 2)}</pre>
                </div>
            </div>
        `;

        Components.showModal({
            title: 'Activity Details',
            content: content,
            size: 'large',
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
     * Show audit details modal
     * @param {Object} entry - Audit entry data
     */
    showAuditDetails(entry) {
        this.showActivityDetails(entry); // Same structure
    }

    /**
     * Export payment data
     * @param {string} type - Export type ('holds', 'audit', 'stats')
     */
    exportPaymentData(type) {
        try {
            let data;
            let filename;

            switch (type) {
                case 'holds':
                    data = window.PaymentProcessor.getPaymentHolds();
                    filename = `payment_holds_${new Date().toISOString().split('T')[0]}.json`;
                    break;
                case 'audit':
                    data = window.PaymentProcessor.getAuditTrail();
                    filename = `payment_audit_${new Date().toISOString().split('T')[0]}.json`;
                    break;
                case 'stats':
                    data = window.PaymentProcessor.getPaymentStatistics();
                    filename = `payment_stats_${new Date().toISOString().split('T')[0]}.json`;
                    break;
                default:
                    throw new Error('Invalid export type');
            }

            // Create and download file
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            AppState.addNotification({
                type: 'success',
                title: 'Export Successful',
                message: `${type} data exported successfully`
            });

        } catch (error) {
            console.error('Error exporting payment data:', error);
            AppState.addNotification({
                type: 'error',
                title: 'Export Failed',
                message: 'Failed to export payment data'
            });
        }
    }

    /**
     * Format currency amount
     * @param {number} amount - Amount to format
     * @param {string} currency - Currency type
     * @returns {string} Formatted currency
     */
    formatCurrency(amount, currency) {
        const formatters = {
            'gold': (amt) => `${amt.toLocaleString()} G`,
            'usd': (amt) => `$${amt.toFixed(2)}`,
            'toman': (amt) => `${amt.toLocaleString()} ﷼`
        };

        const formatter = formatters[currency.toLowerCase()];
        return formatter ? formatter(amount) : `${amount} ${currency.toUpperCase()}`;
    }
}

// Create global payment manager instance
const PaymentManagerInstance = new PaymentManager();

// Export for use in other modules
window.PaymentManager = PaymentManagerInstance;