/**
 * Earnings Management System for Service Provider Dashboard
 * Handles earnings overview, history, analytics, and service breakdowns
 */

class EarningsManager {
    constructor() {
        this.initialized = false;
        this.currentFilters = {
            dateRange: 'all', // 'week', 'month', 'quarter', 'year', 'all'
            serviceType: 'all',
            currency: 'all',
            status: 'all' // 'completed', 'pending', 'all'
        };
        
        // Bind methods
        this.init = this.init.bind(this);
        this.renderEarnings = this.renderEarnings.bind(this);
        this.generateEarningsData = this.generateEarningsData.bind(this);
    }

    /**
     * Initialize the earnings manager
     */
    init() {
        if (this.initialized) return;
        
        // Load mock data
        this.loadMockData();
        
        this.initialized = true;
        console.log('EarningsManager initialized');
    }

    /**
     * Load and process mock data for earnings
     */
    loadMockData() {
        // Load mock data from global MockData
        if (typeof MockData !== 'undefined') {
            this.mockOrders = MockData.orders || [];
            this.mockServices = MockData.services || [];
            this.mockWallets = MockData.wallets || [];
            this.mockUsers = MockData.users || [];
        } else {
            console.warn('MockData not available, using empty data');
            this.mockOrders = [];
            this.mockServices = [];
            this.mockWallets = [];
            this.mockUsers = [];
        }
    }

    /**
     * Render earnings dashboard
     */
    renderEarnings() {
        const contentArea = Utils.DOM.select('.content-area');
        if (!contentArea) return;

        // Clear existing content
        Utils.DOM.empty(contentArea);

        // Create earnings container
        const earningsContainer = Utils.DOM.create('div', {
            className: 'earnings-dashboard'
        });

        // Generate earnings data
        const earningsData = this.generateEarningsData();

        // Create header
        const header = this.createEarningsHeader();
        earningsContainer.appendChild(header);

        // Create overview cards
        const overview = this.createEarningsOverview(earningsData);
        earningsContainer.appendChild(overview);

        // Create filters
        const filters = this.createEarningsFilters();
        earningsContainer.appendChild(filters);

        // Create main content grid
        const mainGrid = Utils.DOM.create('div', {
            className: 'earnings-main-grid'
        });

        // Create earnings history
        const history = this.createEarningsHistory(earningsData);
        mainGrid.appendChild(history);

        // Create analytics charts
        const analytics = this.createEarningsAnalytics(earningsData);
        mainGrid.appendChild(analytics);

        // Create service breakdown
        const serviceBreakdown = this.createServiceBreakdown(earningsData);
        mainGrid.appendChild(serviceBreakdown);

        // Create pending earnings
        const pendingEarnings = this.createPendingEarnings(earningsData);
        mainGrid.appendChild(pendingEarnings);

        earningsContainer.appendChild(mainGrid);
        contentArea.appendChild(earningsContainer);

        // Set up event listeners
        this.setupEventListeners();
    }

    /**
     * Create earnings header
     */
    createEarningsHeader() {
        const header = Utils.DOM.create('div', {
            className: 'earnings-header'
        });

        const title = Utils.DOM.create('h1', {
            className: 'earnings-title'
        }, '💰 Earnings Dashboard');

        const subtitle = Utils.DOM.create('p', {
            className: 'earnings-subtitle'
        }, 'Track your earnings, performance metrics, and financial analytics');

        header.appendChild(title);
        header.appendChild(subtitle);

        return header;
    }

    /**
     * Create earnings overview cards
     */
    createEarningsOverview(earningsData) {
        const overview = Utils.DOM.create('div', {
            className: 'earnings-overview'
        });

        // Total earnings cards
        const totalEarnings = earningsData.totalEarnings;
        const currencies = [
            { key: 'gold', icon: '🪙', label: 'Gold', suffix: 'G' },
            { key: 'usd', icon: '💵', label: 'USD', prefix: '$' },
            { key: 'toman', icon: '﷼', label: 'Toman', suffix: '' }
        ];

        currencies.forEach(currency => {
            const amount = totalEarnings[currency.key] || 0;
            const formattedAmount = this.formatCurrency(amount, currency.key);
            
            const card = Components.createCard({
                className: `earnings-card ${currency.key}`,
                content: `
                    <div class="earnings-card-content">
                        <div class="earnings-icon">${currency.icon}</div>
                        <div class="earnings-info">
                            <div class="earnings-amount">${formattedAmount}</div>
                            <div class="earnings-label">Total ${currency.label}</div>
                        </div>
                        <div class="earnings-trend">
                            <span class="trend-indicator positive">↗️ +12%</span>
                            <span class="trend-period">vs last month</span>
                        </div>
                    </div>
                `
            });

            overview.appendChild(card);
        });

        // Performance metrics card
        const metricsCard = Components.createCard({
            className: 'earnings-metrics-card',
            title: '📊 Performance Metrics',
            content: `
                <div class="metrics-grid">
                    <div class="metric-item">
                        <div class="metric-value">${earningsData.completedOrders}</div>
                        <div class="metric-label">Completed Orders</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-value">${earningsData.averageOrderValue.toFixed(2)}</div>
                        <div class="metric-label">Avg Order Value (USD)</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-value">${earningsData.completionRate}%</div>
                        <div class="metric-label">Completion Rate</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-value">${earningsData.activeServices}</div>
                        <div class="metric-label">Active Services</div>
                    </div>
                </div>
            `
        });

        overview.appendChild(metricsCard);

        return overview;
    }

    /**
     * Create earnings filters
     */
    createEarningsFilters() {
        const filters = Utils.DOM.create('div', {
            className: 'earnings-filters'
        });

        // Date range filter
        const dateRangeFilter = Components.createFormGroup({
            label: 'Date Range',
            type: 'select',
            name: 'dateRange',
            value: this.currentFilters.dateRange,
            options: [
                { value: 'week', label: 'Last 7 Days' },
                { value: 'month', label: 'Last 30 Days' },
                { value: 'quarter', label: 'Last 3 Months' },
                { value: 'year', label: 'Last Year' },
                { value: 'all', label: 'All Time' }
            ]
        });

        // Service type filter
        const serviceTypeFilter = Components.createFormGroup({
            label: 'Service Type',
            type: 'select',
            name: 'serviceType',
            value: this.currentFilters.serviceType,
            options: [
                { value: 'all', label: 'All Services' },
                { value: 'mythic_plus', label: 'Mythic+' },
                { value: 'leveling', label: 'Leveling' },
                { value: 'delves', label: 'Delves' },
                { value: 'custom_boost', label: 'Custom Boost' },
                { value: 'raid', label: 'Raid Booking' }
            ]
        });

        // Currency filter
        const currencyFilter = Components.createFormGroup({
            label: 'Currency',
            type: 'select',
            name: 'currency',
            value: this.currentFilters.currency,
            options: [
                { value: 'all', label: 'All Currencies' },
                { value: 'gold', label: 'Gold' },
                { value: 'usd', label: 'USD' },
                { value: 'toman', label: 'Toman' }
            ]
        });

        // Status filter
        const statusFilter = Components.createFormGroup({
            label: 'Status',
            type: 'select',
            name: 'status',
            value: this.currentFilters.status,
            options: [
                { value: 'all', label: 'All Earnings' },
                { value: 'completed', label: 'Completed' },
                { value: 'pending', label: 'Pending Approval' }
            ]
        });

        filters.appendChild(dateRangeFilter);
        filters.appendChild(serviceTypeFilter);
        filters.appendChild(currencyFilter);
        filters.appendChild(statusFilter);

        return filters;
    }

    /**
     * Create earnings history table
     */
    createEarningsHistory(earningsData) {
        const historyCard = Components.createCard({
            title: '📈 Earnings History',
            className: 'earnings-history-card'
        });

        const historyTable = Components.createTable({
            columns: [
                { key: 'date', label: 'Date' },
                { key: 'service', label: 'Service' },
                { key: 'order', label: 'Order ID' },
                { key: 'amount', label: 'Amount' },
                { key: 'currency', label: 'Currency' },
                { key: 'status', label: 'Status' }
            ],
            data: earningsData.earningsHistory.map(earning => ({
                date: new Date(earning.date).toLocaleDateString(),
                service: earning.serviceName,
                order: earning.orderId,
                amount: this.formatCurrency(earning.amount, earning.currency),
                currency: earning.currency.toUpperCase(),
                status: earning.status
            })),
            className: 'earnings-history-table'
        });

        const cardBody = historyCard.querySelector('.card-body');
        cardBody.appendChild(historyTable);

        return historyCard;
    }

    /**
     * Create earnings analytics charts
     */
    createEarningsAnalytics(earningsData) {
        const analyticsCard = Components.createCard({
            title: '📊 Earnings Analytics',
            className: 'earnings-analytics-card'
        });

        const analyticsContent = Utils.DOM.create('div', {
            className: 'analytics-content'
        });

        // Monthly earnings chart (simplified representation)
        const monthlyChart = Utils.DOM.create('div', {
            className: 'chart-container'
        });

        const chartTitle = Utils.DOM.create('h4', {
            className: 'chart-title'
        }, 'Monthly Earnings Trend');

        const chartPlaceholder = Utils.DOM.create('div', {
            className: 'chart-placeholder'
        });

        // Create simple bar chart representation
        const monthlyData = earningsData.monthlyEarnings;
        const maxEarning = Math.max(...monthlyData.map(m => m.total));

        monthlyData.forEach(month => {
            const bar = Utils.DOM.create('div', {
                className: 'chart-bar'
            });

            const barHeight = (month.total / maxEarning) * 100;
            bar.style.height = `${barHeight}%`;
            bar.title = `${month.month}: $${month.total.toFixed(2)}`;

            const barLabel = Utils.DOM.create('div', {
                className: 'bar-label'
            }, month.month.substring(0, 3));

            const barContainer = Utils.DOM.create('div', {
                className: 'bar-container'
            });

            barContainer.appendChild(bar);
            barContainer.appendChild(barLabel);
            chartPlaceholder.appendChild(barContainer);
        });

        monthlyChart.appendChild(chartTitle);
        monthlyChart.appendChild(chartPlaceholder);
        analyticsContent.appendChild(monthlyChart);

        // Service type distribution
        const distributionChart = Utils.DOM.create('div', {
            className: 'distribution-chart'
        });

        const distributionTitle = Utils.DOM.create('h4', {
            className: 'chart-title'
        }, 'Earnings by Service Type');

        const distributionList = Utils.DOM.create('div', {
            className: 'distribution-list'
        });

        earningsData.serviceTypeDistribution.forEach(service => {
            const item = Utils.DOM.create('div', {
                className: 'distribution-item'
            });

            const percentage = ((service.earnings / earningsData.totalEarnings.usd) * 100).toFixed(1);

            item.innerHTML = `
                <div class="service-info">
                    <span class="service-name">${service.type}</span>
                    <span class="service-percentage">${percentage}%</span>
                </div>
                <div class="service-bar">
                    <div class="service-fill" style="width: ${percentage}%"></div>
                </div>
                <div class="service-amount">$${service.earnings.toFixed(2)}</div>
            `;

            distributionList.appendChild(item);
        });

        distributionChart.appendChild(distributionTitle);
        distributionChart.appendChild(distributionList);
        analyticsContent.appendChild(distributionChart);

        const cardBody = analyticsCard.querySelector('.card-body');
        cardBody.appendChild(analyticsContent);

        return analyticsCard;
    }

    /**
     * Create service breakdown
     */
    createServiceBreakdown(earningsData) {
        const breakdownCard = Components.createCard({
            title: '🎯 Service Performance Breakdown',
            className: 'service-breakdown-card'
        });

        const breakdownTable = Components.createTable({
            columns: [
                { key: 'service', label: 'Service' },
                { key: 'orders', label: 'Orders' },
                { key: 'earnings', label: 'Total Earnings' },
                { key: 'avgOrder', label: 'Avg per Order' },
                { key: 'completion', label: 'Completion Rate' }
            ],
            data: earningsData.serviceBreakdown.map(service => ({
                service: service.name,
                orders: service.totalOrders,
                earnings: `$${service.totalEarnings.toFixed(2)}`,
                avgOrder: `$${service.averageOrderValue.toFixed(2)}`,
                completion: `${service.completionRate}%`
            })),
            className: 'service-breakdown-table'
        });

        const cardBody = breakdownCard.querySelector('.card-body');
        cardBody.appendChild(breakdownTable);

        return breakdownCard;
    }

    /**
     * Create pending earnings section
     */
    createPendingEarnings(earningsData) {
        const pendingCard = Components.createCard({
            title: '⏳ Pending Earnings',
            className: 'pending-earnings-card'
        });

        const pendingContent = Utils.DOM.create('div', {
            className: 'pending-content'
        });

        // Pending summary
        const pendingSummary = Utils.DOM.create('div', {
            className: 'pending-summary'
        });

        const totalPending = earningsData.pendingEarnings.reduce((sum, earning) => sum + earning.amount, 0);

        pendingSummary.innerHTML = `
            <div class="pending-total">
                <span class="pending-amount">$${totalPending.toFixed(2)}</span>
                <span class="pending-label">Total Pending</span>
            </div>
            <div class="pending-count">
                <span class="pending-number">${earningsData.pendingEarnings.length}</span>
                <span class="pending-text">Orders Awaiting Approval</span>
            </div>
        `;

        pendingContent.appendChild(pendingSummary);

        // Pending orders list
        if (earningsData.pendingEarnings.length > 0) {
            const pendingList = Utils.DOM.create('div', {
                className: 'pending-list'
            });

            earningsData.pendingEarnings.forEach(earning => {
                const item = Utils.DOM.create('div', {
                    className: 'pending-item'
                });

                item.innerHTML = `
                    <div class="pending-item-info">
                        <div class="pending-service">${earning.serviceName}</div>
                        <div class="pending-order">Order #${earning.orderId}</div>
                    </div>
                    <div class="pending-item-details">
                        <div class="pending-amount">$${earning.amount.toFixed(2)}</div>
                        <div class="pending-date">${new Date(earning.submittedAt).toLocaleDateString()}</div>
                    </div>
                    <div class="pending-status">
                        <span class="status-badge evidence-submitted">Evidence Submitted</span>
                    </div>
                `;

                pendingList.appendChild(item);
            });

            pendingContent.appendChild(pendingList);
        } else {
            const noPending = Utils.DOM.create('div', {
                className: 'no-pending'
            }, 'No pending earnings at this time.');

            pendingContent.appendChild(noPending);
        }

        const cardBody = pendingCard.querySelector('.card-body');
        cardBody.appendChild(pendingContent);

        return pendingCard;
    }

    /**
     * Generate earnings data from mock data
     */
    generateEarningsData() {
        const currentUserId = AppState.getState('user.id');
        const workspaceContext = AppState.getWorkspaceContext();

        // Filter orders based on current user and workspace
        const relevantOrders = this.mockOrders.filter(order => {
            if (workspaceContext.type === 'personal') {
                return order.advertiserId === currentUserId || order.boosterId === currentUserId;
            } else {
                // Team workspace - include team orders
                return order.advertiserId === currentUserId || order.boosterId === currentUserId;
            }
        });

        // Calculate total earnings
        const totalEarnings = {
            gold: 0,
            usd: 0,
            toman: 0
        };

        const completedOrders = relevantOrders.filter(order => order.status === 'completed');
        const pendingOrders = relevantOrders.filter(order => order.status === 'evidence_submitted');

        completedOrders.forEach(order => {
            const currency = order.currencyUsed;
            totalEarnings[currency] += order.pricePaid;
        });

        // Convert all to USD for calculations
        const exchangeRates = MockData.exchangeRates?.rates || {
            gold_to_usd: 0.05,
            toman_to_usd: 0.00002
        };

        const totalUsdValue = totalEarnings.usd + 
                             (totalEarnings.gold * exchangeRates.gold_to_usd) + 
                             (totalEarnings.toman * exchangeRates.toman_to_usd);

        // Generate earnings history
        const earningsHistory = completedOrders.map(order => {
            const service = this.mockServices.find(s => s.id === order.serviceId);
            return {
                date: order.completedAt,
                serviceName: service?.title || 'Unknown Service',
                orderId: order.id,
                amount: order.pricePaid,
                currency: order.currencyUsed,
                status: 'completed'
            };
        }).sort((a, b) => new Date(b.date) - new Date(a.date));

        // Generate monthly earnings
        const monthlyEarnings = this.generateMonthlyEarnings(completedOrders);

        // Generate service type distribution
        const serviceTypeDistribution = this.generateServiceTypeDistribution(completedOrders);

        // Generate service breakdown
        const serviceBreakdown = this.generateServiceBreakdown(completedOrders);

        // Generate pending earnings
        const pendingEarnings = pendingOrders.map(order => {
            const service = this.mockServices.find(s => s.id === order.serviceId);
            return {
                orderId: order.id,
                serviceName: service?.title || 'Unknown Service',
                amount: order.pricePaid,
                currency: order.currencyUsed,
                submittedAt: order.evidence?.uploadedAt || order.createdAt
            };
        });

        return {
            totalEarnings,
            totalUsdValue,
            completedOrders: completedOrders.length,
            averageOrderValue: completedOrders.length > 0 ? totalUsdValue / completedOrders.length : 0,
            completionRate: relevantOrders.length > 0 ? Math.round((completedOrders.length / relevantOrders.length) * 100) : 100,
            activeServices: this.mockServices.filter(s => s.status === 'active' && s.createdBy === currentUserId).length,
            earningsHistory,
            monthlyEarnings,
            serviceTypeDistribution,
            serviceBreakdown,
            pendingEarnings
        };
    }

    /**
     * Generate monthly earnings data
     */
    generateMonthlyEarnings(orders) {
        const monthlyData = {};
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        // Initialize last 6 months
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthKey = `${months[date.getMonth()]} ${date.getFullYear()}`;
            monthlyData[monthKey] = 0;
        }

        // Calculate earnings per month
        orders.forEach(order => {
            if (order.completedAt) {
                const date = new Date(order.completedAt);
                const monthKey = `${months[date.getMonth()]} ${date.getFullYear()}`;
                
                if (monthlyData.hasOwnProperty(monthKey)) {
                    // Convert to USD for consistency
                    let usdAmount = order.pricePaid;
                    if (order.currencyUsed === 'gold') {
                        usdAmount *= 0.05; // gold to USD rate
                    } else if (order.currencyUsed === 'toman') {
                        usdAmount *= 0.00002; // toman to USD rate
                    }
                    monthlyData[monthKey] += usdAmount;
                }
            }
        });

        return Object.entries(monthlyData).map(([month, total]) => ({
            month,
            total
        }));
    }

    /**
     * Generate service type distribution
     */
    generateServiceTypeDistribution(orders) {
        const distribution = {};

        orders.forEach(order => {
            const service = this.mockServices.find(s => s.id === order.serviceId);
            const serviceType = service?.serviceType || 'unknown';
            
            if (!distribution[serviceType]) {
                distribution[serviceType] = 0;
            }

            // Convert to USD
            let usdAmount = order.pricePaid;
            if (order.currencyUsed === 'gold') {
                usdAmount *= 0.05;
            } else if (order.currencyUsed === 'toman') {
                usdAmount *= 0.00002;
            }

            distribution[serviceType] += usdAmount;
        });

        return Object.entries(distribution)
            .map(([type, earnings]) => ({ type: this.formatServiceType(type), earnings }))
            .sort((a, b) => b.earnings - a.earnings);
    }

    /**
     * Generate service breakdown
     */
    generateServiceBreakdown(orders) {
        const breakdown = {};

        orders.forEach(order => {
            const service = this.mockServices.find(s => s.id === order.serviceId);
            const serviceName = service?.title || 'Unknown Service';
            
            if (!breakdown[serviceName]) {
                breakdown[serviceName] = {
                    name: serviceName,
                    totalOrders: 0,
                    totalEarnings: 0,
                    completedOrders: 0
                };
            }

            breakdown[serviceName].totalOrders++;
            
            if (order.status === 'completed') {
                breakdown[serviceName].completedOrders++;
                
                // Convert to USD
                let usdAmount = order.pricePaid;
                if (order.currencyUsed === 'gold') {
                    usdAmount *= 0.05;
                } else if (order.currencyUsed === 'toman') {
                    usdAmount *= 0.00002;
                }
                
                breakdown[serviceName].totalEarnings += usdAmount;
            }
        });

        return Object.values(breakdown)
            .map(service => ({
                ...service,
                averageOrderValue: service.completedOrders > 0 ? service.totalEarnings / service.completedOrders : 0,
                completionRate: service.totalOrders > 0 ? Math.round((service.completedOrders / service.totalOrders) * 100) : 0
            }))
            .sort((a, b) => b.totalEarnings - a.totalEarnings);
    }

    /**
     * Format currency amount
     */
    formatCurrency(amount, currency) {
        switch (currency) {
            case 'gold':
                return `${amount.toLocaleString()}G`;
            case 'usd':
                return `$${amount.toFixed(2)}`;
            case 'toman':
                return `${amount.toLocaleString()}`;
            default:
                return amount.toString();
        }
    }

    /**
     * Format service type for display
     */
    formatServiceType(type) {
        const typeMap = {
            'mythic_plus': 'Mythic+',
            'leveling': 'Leveling',
            'delves': 'Delves',
            'custom_boost': 'Custom Boost',
            'raid': 'Raid Booking',
            'unknown': 'Other'
        };
        return typeMap[type] || type;
    }

    /**
     * Set up event listeners for filters
     */
    setupEventListeners() {
        // Filter change handlers
        const filterSelects = Utils.DOM.selectAll('.earnings-filters select');
        filterSelects.forEach(select => {
            select.addEventListener('change', (e) => {
                const filterName = e.target.name;
                const filterValue = e.target.value;
                
                this.currentFilters[filterName] = filterValue;
                this.applyFilters();
            });
        });
    }

    /**
     * Apply current filters and re-render
     */
    applyFilters() {
        // Show loading state
        AppState.setLoading('earnings', true);
        
        // Re-render with filters applied
        setTimeout(() => {
            this.renderEarnings();
            AppState.setLoading('earnings', false);
            
            Components.showNotification({
                type: 'success',
                title: 'Filters Applied',
                message: 'Earnings data updated with new filters',
                duration: 2000
            });
        }, 500);
    }
}

// Create global instance
const EarningsManager_Instance = new EarningsManager();

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.EarningsManager = EarningsManager;
    window.EarningsManager_Instance = EarningsManager_Instance;
}