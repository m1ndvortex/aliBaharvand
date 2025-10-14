/**
 * Team Analytics Dashboard for Service Provider Dashboard
 * Handles team performance metrics, member contribution analysis, earnings visualization,
 * productivity metrics, and reporting system
 */

class TeamAnalytics {
    constructor() {
        this.initialized = false;
        this.currentTeam = null;
        this.analyticsData = null;
        this.currentFilters = {
            dateRange: 'month', // 'week', 'month', 'quarter', 'year', 'all'
            metric: 'all', // 'earnings', 'orders', 'completion_rate', 'all'
            member: 'all' // 'all' or specific member ID
        };
        
        // Bind methods
        this.init = this.init.bind(this);
        this.renderTeamAnalytics = this.renderTeamAnalytics.bind(this);
        this.generateAnalyticsData = this.generateAnalyticsData.bind(this);
        this.exportReport = this.exportReport.bind(this);
    }

    /**
     * Initialize team analytics system
     */
    async init() {
        if (this.initialized) return;

        try {
            this.mockDataManager = new MockDataManager();
            this.initialized = true;
            console.log('Team Analytics system initialized');
        } catch (error) {
            console.error('Failed to initialize Team Analytics:', error);
        }
    }

    /**
     * Render team analytics dashboard
     */
    async renderTeamAnalytics() {
        const contentArea = Utils.DOM.select('.content-area');
        if (!contentArea) return;

        // Clear existing content
        Utils.DOM.empty(contentArea);

        // Load current team data
        await this.loadCurrentTeam();

        if (!this.currentTeam) {
            this.renderNoTeamState(contentArea);
            return;
        }

        // Generate analytics data
        this.analyticsData = await this.generateAnalyticsData();

        // Create analytics container
        const analyticsContainer = Utils.DOM.create('div', {
            className: 'team-analytics-dashboard'
        });

        // Create header
        const header = this.createAnalyticsHeader();
        analyticsContainer.appendChild(header);

        // Create filters
        const filters = this.createAnalyticsFilters();
        analyticsContainer.appendChild(filters);

        // Create overview metrics
        const overview = this.createOverviewMetrics();
        analyticsContainer.appendChild(overview);

        // Create main analytics grid
        const mainGrid = Utils.DOM.create('div', {
            className: 'analytics-main-grid'
        });

        // Create performance metrics
        const performanceMetrics = this.createPerformanceMetrics();
        mainGrid.appendChild(performanceMetrics);

        // Create member contribution analysis
        const memberContributions = this.createMemberContributionAnalysis();
        mainGrid.appendChild(memberContributions);

        // Create earnings visualization
        const earningsVisualization = this.createEarningsVisualization();
        mainGrid.appendChild(earningsVisualization);

        // Create productivity metrics
        const productivityMetrics = this.createProductivityMetrics();
        mainGrid.appendChild(productivityMetrics);

        // Create performance comparisons
        const performanceComparisons = this.createPerformanceComparisons();
        mainGrid.appendChild(performanceComparisons);

        // Create reporting section
        const reportingSection = this.createReportingSection();
        mainGrid.appendChild(reportingSection);

        analyticsContainer.appendChild(mainGrid);
        contentArea.appendChild(analyticsContainer);

        // Set up event listeners
        this.setupEventListeners();
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
            // Check if user has any teams as leader
            const userId = AppState.getState('user.id');
            const teams = AppState.getState('teams');
            
            if (teams && teams.size > 0) {
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
     * Render no team state
     */
    renderNoTeamState(contentArea) {
        const noTeamContainer = Utils.DOM.create('div', {
            className: 'no-team-analytics'
        });

        const card = Components.createCard({
            title: '📊 Team Analytics',
            content: `
                <div class="empty-state">
                    <div class="empty-state-icon">📊</div>
                    <h3 class="empty-state-title">No Team Analytics Available</h3>
                    <p class="empty-state-message">
                        You need to be in a team workspace or have a team to view analytics.
                        Team analytics provide insights into performance, earnings, and member contributions.
                    </p>
                </div>
            `,
            className: 'no-team-analytics-card'
        });

        noTeamContainer.appendChild(card);
        contentArea.appendChild(noTeamContainer);
    }

    /**
     * Create analytics header
     */
    createAnalyticsHeader() {
        const header = Utils.DOM.create('div', {
            className: 'analytics-header'
        });

        const title = Utils.DOM.create('h1', {
            className: 'analytics-title'
        }, `📊 Team Analytics - ${this.currentTeam.name}`);

        const subtitle = Utils.DOM.create('p', {
            className: 'analytics-subtitle'
        }, 'Comprehensive team performance metrics, member contributions, and business insights');

        const headerActions = Utils.DOM.create('div', {
            className: 'header-actions'
        });

        const refreshBtn = Components.createButton({
            text: 'Refresh Data',
            icon: '🔄',
            variant: 'secondary',
            size: 'sm',
            onClick: () => this.refreshAnalytics()
        });

        const exportBtn = Components.createButton({
            text: 'Export Report',
            icon: '📊',
            variant: 'primary',
            size: 'sm',
            onClick: () => this.exportReport()
        });

        headerActions.appendChild(refreshBtn);
        headerActions.appendChild(exportBtn);

        header.appendChild(title);
        header.appendChild(subtitle);
        header.appendChild(headerActions);

        return header;
    }

    /**
     * Create analytics filters
     */
    createAnalyticsFilters() {
        const filters = Utils.DOM.create('div', {
            className: 'analytics-filters'
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

        // Metric filter
        const metricFilter = Components.createFormGroup({
            label: 'Focus Metric',
            type: 'select',
            name: 'metric',
            value: this.currentFilters.metric,
            options: [
                { value: 'all', label: 'All Metrics' },
                { value: 'earnings', label: 'Earnings Focus' },
                { value: 'orders', label: 'Order Volume' },
                { value: 'completion_rate', label: 'Completion Rate' },
                { value: 'productivity', label: 'Productivity' }
            ]
        });

        // Member filter
        const memberOptions = [{ value: 'all', label: 'All Members' }];
        this.currentTeam.members.forEach(member => {
            memberOptions.push({
                value: member.userId,
                label: member.discordUsername || 'Unknown User'
            });
        });

        const memberFilter = Components.createFormGroup({
            label: 'Team Member',
            type: 'select',
            name: 'member',
            value: this.currentFilters.member,
            options: memberOptions
        });

        filters.appendChild(dateRangeFilter);
        filters.appendChild(metricFilter);
        filters.appendChild(memberFilter);

        return filters;
    }

    /**
     * Create overview metrics
     */
    createOverviewMetrics() {
        const overview = Utils.DOM.create('div', {
            className: 'analytics-overview'
        });

        const metrics = [
            {
                icon: '💰',
                label: 'Total Team Earnings',
                value: this.formatCurrency(this.analyticsData.totalEarnings, 'usd'),
                trend: '+15.2%',
                trendType: 'positive'
            },
            {
                icon: '📦',
                label: 'Orders Completed',
                value: this.analyticsData.totalOrders.toString(),
                trend: '+8.7%',
                trendType: 'positive'
            },
            {
                icon: '✅',
                label: 'Completion Rate',
                value: `${this.analyticsData.completionRate}%`,
                trend: '+2.1%',
                trendType: 'positive'
            },
            {
                icon: '👥',
                label: 'Active Members',
                value: this.analyticsData.activeMembers.toString(),
                trend: 'Stable',
                trendType: 'neutral'
            },
            {
                icon: '📈',
                label: 'Avg Order Value',
                value: this.formatCurrency(this.analyticsData.averageOrderValue, 'usd'),
                trend: '+5.3%',
                trendType: 'positive'
            },
            {
                icon: '⚡',
                label: 'Productivity Score',
                value: `${this.analyticsData.productivityScore}/100`,
                trend: '+12.4%',
                trendType: 'positive'
            }
        ];

        metrics.forEach(metric => {
            const metricCard = Components.createCard({
                className: 'overview-metric-card',
                content: `
                    <div class="metric-content">
                        <div class="metric-icon">${metric.icon}</div>
                        <div class="metric-info">
                            <div class="metric-value">${metric.value}</div>
                            <div class="metric-label">${metric.label}</div>
                        </div>
                        <div class="metric-trend ${metric.trendType}">
                            <span class="trend-value">${metric.trend}</span>
                        </div>
                    </div>
                `
            });

            overview.appendChild(metricCard);
        });

        return overview;
    }

    /**
     * Create performance metrics section
     */
    createPerformanceMetrics() {
        const section = Components.createCard({
            title: '🎯 Team Performance Metrics',
            className: 'performance-metrics-card'
        });

        const content = Utils.DOM.create('div', {
            className: 'performance-metrics-content'
        });

        // Performance timeline chart
        const timelineChart = this.createPerformanceTimelineChart();
        content.appendChild(timelineChart);

        // Performance breakdown
        const performanceBreakdown = this.createPerformanceBreakdown();
        content.appendChild(performanceBreakdown);

        const cardBody = section.querySelector('.card-body');
        cardBody.appendChild(content);

        return section;
    }

    /**
     * Create performance timeline chart
     */
    createPerformanceTimelineChart() {
        const chartContainer = Utils.DOM.create('div', {
            className: 'performance-timeline-chart'
        });

        const chartTitle = Utils.DOM.create('h4', {
            className: 'chart-title'
        }, 'Performance Timeline');

        const chartArea = Utils.DOM.create('div', {
            className: 'chart-area'
        });

        // Create simple timeline visualization
        const timelineData = this.analyticsData.performanceTimeline;
        const maxValue = Math.max(...timelineData.map(d => d.value));

        timelineData.forEach((dataPoint, index) => {
            const bar = Utils.DOM.create('div', {
                className: 'timeline-bar'
            });

            const barHeight = (dataPoint.value / maxValue) * 100;
            bar.style.height = `${barHeight}%`;
            bar.title = `${dataPoint.period}: ${dataPoint.value}`;

            const barLabel = Utils.DOM.create('div', {
                className: 'bar-label'
            }, dataPoint.period);

            const barContainer = Utils.DOM.create('div', {
                className: 'bar-container'
            });

            barContainer.appendChild(bar);
            barContainer.appendChild(barLabel);
            chartArea.appendChild(barContainer);
        });

        chartContainer.appendChild(chartTitle);
        chartContainer.appendChild(chartArea);

        return chartContainer;
    }

    /**
     * Create performance breakdown
     */
    createPerformanceBreakdown() {
        const breakdown = Utils.DOM.create('div', {
            className: 'performance-breakdown'
        });

        const breakdownTitle = Utils.DOM.create('h4', {
            className: 'breakdown-title'
        }, 'Performance Breakdown by Service Type');

        const breakdownGrid = Utils.DOM.create('div', {
            className: 'breakdown-grid'
        });

        this.analyticsData.serviceTypePerformance.forEach(service => {
            const serviceItem = Utils.DOM.create('div', {
                className: 'service-performance-item'
            });

            serviceItem.innerHTML = `
                <div class="service-info">
                    <span class="service-name">${service.type}</span>
                    <span class="service-orders">${service.orders} orders</span>
                </div>
                <div class="service-metrics">
                    <div class="metric-item">
                        <span class="metric-label">Earnings:</span>
                        <span class="metric-value">${this.formatCurrency(service.earnings, 'usd')}</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">Completion:</span>
                        <span class="metric-value">${service.completionRate}%</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">Avg Time:</span>
                        <span class="metric-value">${service.avgCompletionTime}</span>
                    </div>
                </div>
                <div class="service-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${service.completionRate}%"></div>
                    </div>
                </div>
            `;

            breakdownGrid.appendChild(serviceItem);
        });

        breakdown.appendChild(breakdownTitle);
        breakdown.appendChild(breakdownGrid);

        return breakdown;
    }

    /**
     * Create member contribution analysis
     */
    createMemberContributionAnalysis() {
        const section = Components.createCard({
            title: '👥 Member Contribution Analysis',
            className: 'member-contribution-card'
        });

        const content = Utils.DOM.create('div', {
            className: 'member-contribution-content'
        });

        // Member contribution table
        const contributionTable = this.createMemberContributionTable();
        content.appendChild(contributionTable);

        // Member performance comparison
        const performanceComparison = this.createMemberPerformanceComparison();
        content.appendChild(performanceComparison);

        const cardBody = section.querySelector('.card-body');
        cardBody.appendChild(content);

        return section;
    }

    /**
     * Create member contribution table
     */
    createMemberContributionTable() {
        const tableContainer = Utils.DOM.create('div', {
            className: 'contribution-table-container'
        });

        const tableTitle = Utils.DOM.create('h4', {
            className: 'table-title'
        }, 'Detailed Member Contributions');

        const table = Components.createTable({
            columns: [
                { key: 'member', label: 'Member' },
                { key: 'services', label: 'Services Created' },
                { key: 'orders', label: 'Orders Generated' },
                { key: 'earnings', label: 'Total Earnings' },
                { key: 'completionRate', label: 'Completion Rate' },
                { key: 'avgOrderValue', label: 'Avg Order Value' },
                { key: 'productivity', label: 'Productivity Score' }
            ],
            data: this.analyticsData.memberContributions.map(member => ({
                member: `
                    <div class="member-info">
                        <img src="${member.avatar}" alt="${member.name}" class="member-avatar-small" />
                        <span class="member-name">${member.name}</span>
                        ${member.role === 'leader' ? '<span class="leader-badge">👑</span>' : ''}
                    </div>
                `,
                services: member.servicesCreated,
                orders: member.ordersGenerated,
                earnings: this.formatCurrency(member.totalEarnings, 'usd'),
                completionRate: `${member.completionRate}%`,
                avgOrderValue: this.formatCurrency(member.avgOrderValue, 'usd'),
                productivity: `${member.productivityScore}/100`
            })),
            className: 'member-contribution-table'
        });

        tableContainer.appendChild(tableTitle);
        tableContainer.appendChild(table);

        return tableContainer;
    }

    /**
     * Create member performance comparison
     */
    createMemberPerformanceComparison() {
        const comparison = Utils.DOM.create('div', {
            className: 'member-performance-comparison'
        });

        const comparisonTitle = Utils.DOM.create('h4', {
            className: 'comparison-title'
        }, 'Member Performance Comparison');

        const comparisonChart = Utils.DOM.create('div', {
            className: 'comparison-chart'
        });

        // Create radar-style comparison chart (simplified)
        this.analyticsData.memberContributions.forEach(member => {
            const memberBar = Utils.DOM.create('div', {
                className: 'member-comparison-bar'
            });

            const memberInfo = Utils.DOM.create('div', {
                className: 'member-comparison-info'
            });

            memberInfo.innerHTML = `
                <img src="${member.avatar}" alt="${member.name}" class="member-avatar-tiny" />
                <span class="member-name">${member.name}</span>
            `;

            const performanceBar = Utils.DOM.create('div', {
                className: 'performance-bar'
            });

            const performanceFill = Utils.DOM.create('div', {
                className: 'performance-fill'
            });

            performanceFill.style.width = `${member.productivityScore}%`;
            performanceFill.style.backgroundColor = this.getPerformanceColor(member.productivityScore);

            const performanceValue = Utils.DOM.create('div', {
                className: 'performance-value'
            }, `${member.productivityScore}/100`);

            performanceBar.appendChild(performanceFill);
            memberBar.appendChild(memberInfo);
            memberBar.appendChild(performanceBar);
            memberBar.appendChild(performanceValue);

            comparisonChart.appendChild(memberBar);
        });

        comparison.appendChild(comparisonTitle);
        comparison.appendChild(comparisonChart);

        return comparison;
    }

    /**
     * Create earnings visualization
     */
    createEarningsVisualization() {
        const section = Components.createCard({
            title: '💰 Team Earnings Visualization',
            className: 'earnings-visualization-card'
        });

        const content = Utils.DOM.create('div', {
            className: 'earnings-visualization-content'
        });

        // Earnings trend chart
        const trendChart = this.createEarningsTrendChart();
        content.appendChild(trendChart);

        // Earnings distribution
        const distribution = this.createEarningsDistribution();
        content.appendChild(distribution);

        const cardBody = section.querySelector('.card-body');
        cardBody.appendChild(content);

        return section;
    }

    /**
     * Create earnings trend chart
     */
    createEarningsTrendChart() {
        const chartContainer = Utils.DOM.create('div', {
            className: 'earnings-trend-chart'
        });

        const chartTitle = Utils.DOM.create('h4', {
            className: 'chart-title'
        }, 'Earnings Trend Over Time');

        const chartArea = Utils.DOM.create('div', {
            className: 'trend-chart-area'
        });

        // Create line chart representation
        const earningsData = this.analyticsData.earningsTrend;
        const maxEarnings = Math.max(...earningsData.map(d => d.earnings));

        earningsData.forEach((dataPoint, index) => {
            const point = Utils.DOM.create('div', {
                className: 'trend-point'
            });

            const pointHeight = (dataPoint.earnings / maxEarnings) * 100;
            point.style.bottom = `${pointHeight}%`;
            point.style.left = `${(index / (earningsData.length - 1)) * 100}%`;
            point.title = `${dataPoint.period}: ${this.formatCurrency(dataPoint.earnings, 'usd')}`;

            chartArea.appendChild(point);

            // Add connecting line (simplified)
            if (index > 0) {
                const line = Utils.DOM.create('div', {
                    className: 'trend-line'
                });
                
                const prevPoint = earningsData[index - 1];
                const prevHeight = (prevPoint.earnings / maxEarnings) * 100;
                const currentHeight = pointHeight;
                
                line.style.left = `${((index - 1) / (earningsData.length - 1)) * 100}%`;
                line.style.width = `${(1 / (earningsData.length - 1)) * 100}%`;
                line.style.bottom = `${Math.min(prevHeight, currentHeight)}%`;
                line.style.height = `${Math.abs(currentHeight - prevHeight)}%`;
                
                chartArea.appendChild(line);
            }
        });

        // Add axis labels
        const xAxis = Utils.DOM.create('div', {
            className: 'x-axis'
        });

        earningsData.forEach((dataPoint, index) => {
            const label = Utils.DOM.create('div', {
                className: 'axis-label'
            }, dataPoint.period);
            label.style.left = `${(index / (earningsData.length - 1)) * 100}%`;
            xAxis.appendChild(label);
        });

        chartContainer.appendChild(chartTitle);
        chartContainer.appendChild(chartArea);
        chartContainer.appendChild(xAxis);

        return chartContainer;
    }

    /**
     * Create earnings distribution
     */
    createEarningsDistribution() {
        const distribution = Utils.DOM.create('div', {
            className: 'earnings-distribution'
        });

        const distributionTitle = Utils.DOM.create('h4', {
            className: 'distribution-title'
        }, 'Earnings Distribution by Member');

        const distributionChart = Utils.DOM.create('div', {
            className: 'distribution-chart'
        });

        const totalEarnings = this.analyticsData.totalEarnings;

        this.analyticsData.memberContributions.forEach(member => {
            const percentage = ((member.totalEarnings / totalEarnings) * 100).toFixed(1);
            
            const memberSlice = Utils.DOM.create('div', {
                className: 'distribution-slice'
            });

            memberSlice.innerHTML = `
                <div class="slice-info">
                    <img src="${member.avatar}" alt="${member.name}" class="member-avatar-tiny" />
                    <span class="member-name">${member.name}</span>
                    <span class="slice-percentage">${percentage}%</span>
                </div>
                <div class="slice-bar">
                    <div class="slice-fill" style="width: ${percentage}%"></div>
                </div>
                <div class="slice-amount">${this.formatCurrency(member.totalEarnings, 'usd')}</div>
            `;

            distributionChart.appendChild(memberSlice);
        });

        distribution.appendChild(distributionTitle);
        distribution.appendChild(distributionChart);

        return distribution;
    }

    /**
     * Create productivity metrics
     */
    createProductivityMetrics() {
        const section = Components.createCard({
            title: '⚡ Team Productivity Metrics',
            className: 'productivity-metrics-card'
        });

        const content = Utils.DOM.create('div', {
            className: 'productivity-metrics-content'
        });

        // Productivity overview
        const productivityOverview = this.createProductivityOverview();
        content.appendChild(productivityOverview);

        // Efficiency metrics
        const efficiencyMetrics = this.createEfficiencyMetrics();
        content.appendChild(efficiencyMetrics);

        const cardBody = section.querySelector('.card-body');
        cardBody.appendChild(content);

        return section;
    }

    /**
     * Create productivity overview
     */
    createProductivityOverview() {
        const overview = Utils.DOM.create('div', {
            className: 'productivity-overview'
        });

        const overviewTitle = Utils.DOM.create('h4', {
            className: 'overview-title'
        }, 'Productivity Overview');

        const metricsGrid = Utils.DOM.create('div', {
            className: 'productivity-metrics-grid'
        });

        const productivityMetrics = [
            {
                label: 'Services per Member',
                value: this.analyticsData.productivityMetrics.servicesPerMember.toFixed(1),
                icon: '📝'
            },
            {
                label: 'Orders per Day',
                value: this.analyticsData.productivityMetrics.ordersPerDay.toFixed(1),
                icon: '📦'
            },
            {
                label: 'Avg Completion Time',
                value: this.analyticsData.productivityMetrics.avgCompletionTime,
                icon: '⏱️'
            },
            {
                label: 'Response Time',
                value: this.analyticsData.productivityMetrics.avgResponseTime,
                icon: '⚡'
            }
        ];

        productivityMetrics.forEach(metric => {
            const metricItem = Utils.DOM.create('div', {
                className: 'productivity-metric-item'
            });

            metricItem.innerHTML = `
                <div class="metric-icon">${metric.icon}</div>
                <div class="metric-info">
                    <div class="metric-value">${metric.value}</div>
                    <div class="metric-label">${metric.label}</div>
                </div>
            `;

            metricsGrid.appendChild(metricItem);
        });

        overview.appendChild(overviewTitle);
        overview.appendChild(metricsGrid);

        return overview;
    }

    /**
     * Create efficiency metrics
     */
    createEfficiencyMetrics() {
        const efficiency = Utils.DOM.create('div', {
            className: 'efficiency-metrics'
        });

        const efficiencyTitle = Utils.DOM.create('h4', {
            className: 'efficiency-title'
        }, 'Team Efficiency Analysis');

        const efficiencyChart = Utils.DOM.create('div', {
            className: 'efficiency-chart'
        });

        const efficiencyData = this.analyticsData.efficiencyMetrics;

        efficiencyData.forEach(metric => {
            const efficiencyItem = Utils.DOM.create('div', {
                className: 'efficiency-item'
            });

            efficiencyItem.innerHTML = `
                <div class="efficiency-info">
                    <span class="efficiency-name">${metric.name}</span>
                    <span class="efficiency-score">${metric.score}%</span>
                </div>
                <div class="efficiency-bar">
                    <div class="efficiency-fill" style="width: ${metric.score}%; background-color: ${this.getEfficiencyColor(metric.score)}"></div>
                </div>
                <div class="efficiency-description">${metric.description}</div>
            `;

            efficiencyChart.appendChild(efficiencyItem);
        });

        efficiency.appendChild(efficiencyTitle);
        efficiency.appendChild(efficiencyChart);

        return efficiency;
    }

    /**
     * Create performance comparisons
     */
    createPerformanceComparisons() {
        const section = Components.createCard({
            title: '📈 Performance Comparisons',
            className: 'performance-comparisons-card'
        });

        const content = Utils.DOM.create('div', {
            className: 'performance-comparisons-content'
        });

        // Period comparisons
        const periodComparisons = this.createPeriodComparisons();
        content.appendChild(periodComparisons);

        // Benchmark comparisons
        const benchmarkComparisons = this.createBenchmarkComparisons();
        content.appendChild(benchmarkComparisons);

        const cardBody = section.querySelector('.card-body');
        cardBody.appendChild(content);

        return section;
    }

    /**
     * Create period comparisons
     */
    createPeriodComparisons() {
        const comparisons = Utils.DOM.create('div', {
            className: 'period-comparisons'
        });

        const comparisonsTitle = Utils.DOM.create('h4', {
            className: 'comparisons-title'
        }, 'Period-over-Period Comparison');

        const comparisonGrid = Utils.DOM.create('div', {
            className: 'comparison-grid'
        });

        const periodData = this.analyticsData.periodComparisons;

        periodData.forEach(comparison => {
            const comparisonItem = Utils.DOM.create('div', {
                className: 'comparison-item'
            });

            const trendClass = comparison.change >= 0 ? 'positive' : 'negative';
            const trendIcon = comparison.change >= 0 ? '↗️' : '↘️';

            comparisonItem.innerHTML = `
                <div class="comparison-metric">
                    <span class="metric-name">${comparison.metric}</span>
                    <span class="metric-period">${comparison.period}</span>
                </div>
                <div class="comparison-values">
                    <div class="current-value">${comparison.current}</div>
                    <div class="previous-value">vs ${comparison.previous}</div>
                </div>
                <div class="comparison-change ${trendClass}">
                    <span class="change-icon">${trendIcon}</span>
                    <span class="change-value">${Math.abs(comparison.change)}%</span>
                </div>
            `;

            comparisonGrid.appendChild(comparisonItem);
        });

        comparisons.appendChild(comparisonsTitle);
        comparisons.appendChild(comparisonGrid);

        return comparisons;
    }

    /**
     * Create benchmark comparisons
     */
    createBenchmarkComparisons() {
        const benchmarks = Utils.DOM.create('div', {
            className: 'benchmark-comparisons'
        });

        const benchmarksTitle = Utils.DOM.create('h4', {
            className: 'benchmarks-title'
        }, 'Industry Benchmark Comparison');

        const benchmarkChart = Utils.DOM.create('div', {
            className: 'benchmark-chart'
        });

        const benchmarkData = this.analyticsData.benchmarkComparisons;

        benchmarkData.forEach(benchmark => {
            const benchmarkItem = Utils.DOM.create('div', {
                className: 'benchmark-item'
            });

            const performanceRatio = (benchmark.teamValue / benchmark.industryAverage) * 100;
            const performanceClass = performanceRatio >= 100 ? 'above-average' : 'below-average';

            benchmarkItem.innerHTML = `
                <div class="benchmark-info">
                    <span class="benchmark-name">${benchmark.metric}</span>
                    <span class="benchmark-status ${performanceClass}">
                        ${performanceRatio >= 100 ? 'Above Average' : 'Below Average'}
                    </span>
                </div>
                <div class="benchmark-values">
                    <div class="team-value">Team: ${benchmark.teamValue}</div>
                    <div class="industry-value">Industry: ${benchmark.industryAverage}</div>
                </div>
                <div class="benchmark-bar">
                    <div class="team-bar" style="width: ${Math.min(performanceRatio, 200)}%"></div>
                    <div class="industry-line"></div>
                </div>
            `;

            benchmarkChart.appendChild(benchmarkItem);
        });

        benchmarks.appendChild(benchmarksTitle);
        benchmarks.appendChild(benchmarkChart);

        return benchmarks;
    }

    /**
     * Create reporting section
     */
    createReportingSection() {
        const section = Components.createCard({
            title: '📊 Team Reporting System',
            className: 'reporting-section-card'
        });

        const content = Utils.DOM.create('div', {
            className: 'reporting-content'
        });

        // Report templates
        const reportTemplates = this.createReportTemplates();
        content.appendChild(reportTemplates);

        // Export options
        const exportOptions = this.createExportOptions();
        content.appendChild(exportOptions);

        const cardBody = section.querySelector('.card-body');
        cardBody.appendChild(content);

        return section;
    }

    /**
     * Create report templates
     */
    createReportTemplates() {
        const templates = Utils.DOM.create('div', {
            className: 'report-templates'
        });

        const templatesTitle = Utils.DOM.create('h4', {
            className: 'templates-title'
        }, 'Available Report Templates');

        const templateGrid = Utils.DOM.create('div', {
            className: 'template-grid'
        });

        const reportTemplates = [
            {
                name: 'Performance Summary',
                description: 'Overall team performance metrics and trends',
                icon: '📈',
                type: 'performance'
            },
            {
                name: 'Member Contributions',
                description: 'Detailed breakdown of individual member contributions',
                icon: '👥',
                type: 'contributions'
            },
            {
                name: 'Financial Report',
                description: 'Earnings, revenue, and financial analytics',
                icon: '💰',
                type: 'financial'
            },
            {
                name: 'Productivity Analysis',
                description: 'Team efficiency and productivity metrics',
                icon: '⚡',
                type: 'productivity'
            }
        ];

        reportTemplates.forEach(template => {
            const templateCard = Utils.DOM.create('div', {
                className: 'report-template-card'
            });

            templateCard.innerHTML = `
                <div class="template-icon">${template.icon}</div>
                <div class="template-info">
                    <h5 class="template-name">${template.name}</h5>
                    <p class="template-description">${template.description}</p>
                </div>
                <div class="template-actions">
                    <button class="btn btn-secondary btn-sm" onclick="TeamAnalytics_Instance.generateReport('${template.type}')">
                        Generate
                    </button>
                </div>
            `;

            templateGrid.appendChild(templateCard);
        });

        templates.appendChild(templatesTitle);
        templates.appendChild(templateGrid);

        return templates;
    }

    /**
     * Create export options
     */
    createExportOptions() {
        const exportOptions = Utils.DOM.create('div', {
            className: 'export-options'
        });

        const exportTitle = Utils.DOM.create('h4', {
            className: 'export-title'
        }, 'Export Options');

        const exportGrid = Utils.DOM.create('div', {
            className: 'export-grid'
        });

        const exportFormats = [
            { format: 'pdf', label: 'PDF Report', icon: '📄' },
            { format: 'excel', label: 'Excel Spreadsheet', icon: '📊' },
            { format: 'csv', label: 'CSV Data', icon: '📋' },
            { format: 'json', label: 'JSON Data', icon: '🔧' }
        ];

        exportFormats.forEach(format => {
            const exportBtn = Components.createButton({
                text: format.label,
                icon: format.icon,
                variant: 'secondary',
                size: 'sm',
                onClick: () => this.exportReport(format.format)
            });

            exportGrid.appendChild(exportBtn);
        });

        exportOptions.appendChild(exportTitle);
        exportOptions.appendChild(exportGrid);

        return exportOptions;
    }

    /**
     * Generate analytics data
     */
    async generateAnalyticsData() {
        if (!this.currentTeam) return null;

        // Get team services and orders
        const teamServices = await this.getTeamServices();
        const teamOrders = await this.getTeamOrders();
        const memberContributions = await this.calculateMemberContributions();

        // Calculate totals
        const totalEarnings = teamOrders
            .filter(order => order.status === 'completed')
            .reduce((sum, order) => sum + this.convertToUSD(order.pricePaid, order.currencyUsed), 0);

        const totalOrders = teamOrders.length;
        const completedOrders = teamOrders.filter(order => order.status === 'completed').length;
        const completionRate = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;
        const averageOrderValue = completedOrders > 0 ? totalEarnings / completedOrders : 0;
        const activeMembers = this.currentTeam.members.filter(member => member.status === 'active').length;

        // Calculate productivity score (composite metric)
        const productivityScore = this.calculateProductivityScore(teamServices, teamOrders, memberContributions);

        return {
            totalEarnings,
            totalOrders,
            completionRate,
            averageOrderValue,
            activeMembers,
            productivityScore,
            memberContributions,
            performanceTimeline: this.generatePerformanceTimeline(teamOrders),
            serviceTypePerformance: this.generateServiceTypePerformance(teamServices, teamOrders),
            earningsTrend: this.generateEarningsTrend(teamOrders),
            productivityMetrics: this.calculateProductivityMetrics(teamServices, teamOrders),
            efficiencyMetrics: this.calculateEfficiencyMetrics(teamOrders),
            periodComparisons: this.generatePeriodComparisons(teamOrders),
            benchmarkComparisons: this.generateBenchmarkComparisons(teamOrders)
        };
    }

    /**
     * Get team services
     */
    async getTeamServices() {
        try {
            const result = await this.mockDataManager.getServicesByOwner(this.currentTeam.id, 'team');
            return result.success ? result.data : [];
        } catch (error) {
            console.error('Failed to get team services:', error);
            return [];
        }
    }

    /**
     * Get team orders
     */
    async getTeamOrders() {
        try {
            const teamServices = await this.getTeamServices();
            const serviceIds = teamServices.map(service => service.id);
            
            const allOrders = JSON.parse(localStorage.getItem('mockData_orders') || '[]');
            return allOrders.filter(order => serviceIds.includes(order.serviceId));
        } catch (error) {
            console.error('Failed to get team orders:', error);
            return [];
        }
    }

    /**
     * Calculate member contributions
     */
    async calculateMemberContributions() {
        const contributions = [];
        
        for (const member of this.currentTeam.members) {
            if (member.status !== 'active') continue;
            
            const user = this.mockDataManager.getUserSync(member.userId);
            const memberServices = await this.getMemberServices(member.userId);
            const memberOrders = await this.getMemberOrders(member.userId);
            
            const completedOrders = memberOrders.filter(order => order.status === 'completed');
            const totalEarnings = completedOrders.reduce((sum, order) => 
                sum + this.convertToUSD(order.pricePaid, order.currencyUsed), 0);
            
            const completionRate = memberOrders.length > 0 ? 
                Math.round((completedOrders.length / memberOrders.length) * 100) : 0;
            
            const avgOrderValue = completedOrders.length > 0 ? totalEarnings / completedOrders.length : 0;
            const productivityScore = this.calculateMemberProductivityScore(member, memberServices, memberOrders);
            
            contributions.push({
                userId: member.userId,
                name: user?.discordUsername || 'Unknown User',
                avatar: user?.discordAvatarUrl || 'https://cdn.discordapp.com/embed/avatars/0.png',
                role: member.role,
                servicesCreated: memberServices.length,
                ordersGenerated: memberOrders.length,
                totalEarnings,
                completionRate,
                avgOrderValue,
                productivityScore
            });
        }
        
        return contributions.sort((a, b) => b.totalEarnings - a.totalEarnings);
    }

    /**
     * Get member services
     */
    async getMemberServices(userId) {
        try {
            const teamServices = await this.getTeamServices();
            return teamServices.filter(service => service.createdBy === userId);
        } catch (error) {
            console.error('Failed to get member services:', error);
            return [];
        }
    }

    /**
     * Get member orders
     */
    async getMemberOrders(userId) {
        try {
            const memberServices = await this.getMemberServices(userId);
            const serviceIds = memberServices.map(service => service.id);
            
            const allOrders = JSON.parse(localStorage.getItem('mockData_orders') || '[]');
            return allOrders.filter(order => serviceIds.includes(order.serviceId));
        } catch (error) {
            console.error('Failed to get member orders:', error);
            return [];
        }
    }

    /**
     * Calculate productivity score
     */
    calculateProductivityScore(services, orders, contributions) {
        if (services.length === 0 || orders.length === 0) return 0;
        
        const completionRate = orders.filter(order => order.status === 'completed').length / orders.length;
        const serviceUtilization = services.filter(service => service.status === 'active').length / services.length;
        const memberEngagement = contributions.filter(member => member.servicesCreated > 0).length / contributions.length;
        
        return Math.round((completionRate * 0.4 + serviceUtilization * 0.3 + memberEngagement * 0.3) * 100);
    }

    /**
     * Calculate member productivity score
     */
    calculateMemberProductivityScore(member, services, orders) {
        if (services.length === 0 && orders.length === 0) return 0;
        
        const serviceScore = Math.min(services.length * 10, 50); // Max 50 points for services
        const orderScore = Math.min(orders.length * 2, 30); // Max 30 points for orders
        const completionScore = orders.length > 0 ? 
            (orders.filter(order => order.status === 'completed').length / orders.length) * 20 : 0; // Max 20 points
        
        return Math.round(serviceScore + orderScore + completionScore);
    }

    /**
     * Generate performance timeline
     */
    generatePerformanceTimeline(orders) {
        const timeline = [];
        const periods = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
        
        periods.forEach(period => {
            // Simulate performance data
            const value = Math.floor(Math.random() * 100) + 50;
            timeline.push({ period, value });
        });
        
        return timeline;
    }

    /**
     * Generate service type performance
     */
    generateServiceTypePerformance(services, orders) {
        const serviceTypes = {};
        
        services.forEach(service => {
            const type = service.serviceType;
            if (!serviceTypes[type]) {
                serviceTypes[type] = {
                    type: this.formatServiceType(type),
                    orders: 0,
                    earnings: 0,
                    completionRate: 0,
                    avgCompletionTime: '0h'
                };
            }
        });
        
        orders.forEach(order => {
            const service = services.find(s => s.id === order.serviceId);
            if (service) {
                const type = service.serviceType;
                serviceTypes[type].orders++;
                
                if (order.status === 'completed') {
                    serviceTypes[type].earnings += this.convertToUSD(order.pricePaid, order.currencyUsed);
                }
            }
        });
        
        // Calculate completion rates and times
        Object.values(serviceTypes).forEach(type => {
            const typeOrders = orders.filter(order => {
                const service = services.find(s => s.id === order.serviceId);
                return service && this.formatServiceType(service.serviceType) === type.type;
            });
            
            const completed = typeOrders.filter(order => order.status === 'completed');
            type.completionRate = typeOrders.length > 0 ? 
                Math.round((completed.length / typeOrders.length) * 100) : 0;
            
            // Simulate completion time
            type.avgCompletionTime = `${Math.floor(Math.random() * 4) + 1}h`;
        });
        
        return Object.values(serviceTypes);
    }

    /**
     * Generate earnings trend
     */
    generateEarningsTrend(orders) {
        const trend = [];
        const periods = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        
        periods.forEach(period => {
            // Simulate earnings data with growth trend
            const baseEarnings = 1000;
            const growth = Math.random() * 500;
            const earnings = baseEarnings + growth;
            trend.push({ period, earnings });
        });
        
        return trend;
    }

    /**
     * Calculate productivity metrics
     */
    calculateProductivityMetrics(services, orders) {
        const activeMembers = this.currentTeam.members.filter(member => member.status === 'active').length;
        
        return {
            servicesPerMember: activeMembers > 0 ? services.length / activeMembers : 0,
            ordersPerDay: orders.length / 30, // Assuming 30-day period
            avgCompletionTime: '2.5 hours',
            avgResponseTime: '15 minutes'
        };
    }

    /**
     * Calculate efficiency metrics
     */
    calculateEfficiencyMetrics(orders) {
        return [
            {
                name: 'Order Processing',
                score: 85,
                description: 'Time from order creation to assignment'
            },
            {
                name: 'Completion Rate',
                score: 92,
                description: 'Percentage of orders completed successfully'
            },
            {
                name: 'Customer Satisfaction',
                score: 88,
                description: 'Based on order reviews and feedback'
            },
            {
                name: 'Response Time',
                score: 76,
                description: 'Average time to respond to customer inquiries'
            }
        ];
    }

    /**
     * Generate period comparisons
     */
    generatePeriodComparisons(orders) {
        return [
            {
                metric: 'Total Earnings',
                period: 'vs Last Month',
                current: '$2,450',
                previous: '$2,130',
                change: 15.0
            },
            {
                metric: 'Orders Completed',
                period: 'vs Last Month',
                current: '47',
                previous: '43',
                change: 9.3
            },
            {
                metric: 'Completion Rate',
                period: 'vs Last Month',
                current: '92%',
                previous: '89%',
                change: 3.4
            },
            {
                metric: 'Active Services',
                period: 'vs Last Month',
                current: '12',
                previous: '10',
                change: 20.0
            }
        ];
    }

    /**
     * Generate benchmark comparisons
     */
    generateBenchmarkComparisons(orders) {
        return [
            {
                metric: 'Completion Rate',
                teamValue: '92%',
                industryAverage: '85%'
            },
            {
                metric: 'Avg Order Value',
                teamValue: '$52.13',
                industryAverage: '$48.50'
            },
            {
                metric: 'Response Time',
                teamValue: '15 min',
                industryAverage: '22 min'
            },
            {
                metric: 'Customer Rating',
                teamValue: '4.8/5',
                industryAverage: '4.3/5'
            }
        ];
    }

    /**
     * Convert currency to USD
     */
    convertToUSD(amount, currency) {
        const exchangeRates = {
            usd: 1,
            gold: 0.05,
            toman: 0.00002
        };
        
        return amount * (exchangeRates[currency] || 1);
    }

    /**
     * Format currency
     */
    formatCurrency(amount, currency) {
        switch (currency) {
            case 'gold':
                return `${amount.toLocaleString()}G`;
            case 'usd':
                return `$${amount.toFixed(2)}`;
            case 'toman':
                return `${amount.toLocaleString()}﷼`;
            default:
                return `$${amount.toFixed(2)}`;
        }
    }

    /**
     * Format service type
     */
    formatServiceType(type) {
        const typeMap = {
            'mythic_plus': 'Mythic+',
            'leveling': 'Leveling',
            'delves': 'Delves',
            'custom_boost': 'Custom Boost',
            'raid': 'Raid Booking'
        };
        return typeMap[type] || type;
    }

    /**
     * Get performance color
     */
    getPerformanceColor(score) {
        if (score >= 80) return '#4CAF50'; // Green
        if (score >= 60) return '#FF9800'; // Orange
        return '#F44336'; // Red
    }

    /**
     * Get efficiency color
     */
    getEfficiencyColor(score) {
        if (score >= 90) return '#4CAF50'; // Green
        if (score >= 75) return '#8BC34A'; // Light Green
        if (score >= 60) return '#FF9800'; // Orange
        return '#F44336'; // Red
    }

    /**
     * Format date
     */
    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString();
    }

    /**
     * Refresh analytics data
     */
    async refreshAnalytics() {
        Components.showNotification({
            type: 'info',
            title: 'Refreshing Analytics',
            message: 'Updating team analytics data...',
            duration: 2000
        });

        // Re-render the analytics dashboard
        await this.renderTeamAnalytics();

        Components.showNotification({
            type: 'success',
            title: 'Analytics Updated',
            message: 'Team analytics data has been refreshed',
            duration: 3000
        });
    }

    /**
     * Generate report
     */
    generateReport(type) {
        Components.showNotification({
            type: 'info',
            title: 'Generating Report',
            message: `Creating ${type} report...`,
            duration: 3000
        });

        // Simulate report generation
        setTimeout(() => {
            Components.showNotification({
                type: 'success',
                title: 'Report Generated',
                message: `${type} report has been generated and is ready for download`,
                duration: 5000
            });
        }, 2000);
    }

    /**
     * Export report
     */
    exportReport(format = 'pdf') {
        const reportData = {
            teamName: this.currentTeam.name,
            generatedAt: new Date().toISOString(),
            dateRange: this.currentFilters.dateRange,
            analytics: this.analyticsData
        };

        switch (format) {
            case 'pdf':
                this.exportToPDF(reportData);
                break;
            case 'excel':
                this.exportToExcel(reportData);
                break;
            case 'csv':
                this.exportToCSV(reportData);
                break;
            case 'json':
                this.exportToJSON(reportData);
                break;
            default:
                this.exportToPDF(reportData);
        }

        Components.showNotification({
            type: 'success',
            title: 'Export Complete',
            message: `Team analytics exported as ${format.toUpperCase()}`,
            duration: 3000
        });
    }

    /**
     * Export to PDF (simulated)
     */
    exportToPDF(data) {
        console.log('Exporting to PDF:', data);
        // In a real implementation, this would generate a PDF file
    }

    /**
     * Export to Excel (simulated)
     */
    exportToExcel(data) {
        console.log('Exporting to Excel:', data);
        // In a real implementation, this would generate an Excel file
    }

    /**
     * Export to CSV
     */
    exportToCSV(data) {
        const csvContent = this.convertToCSV(data.analytics.memberContributions);
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `team-analytics-${data.teamName}-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    /**
     * Export to JSON
     */
    exportToJSON(data) {
        const jsonContent = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `team-analytics-${data.teamName}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    /**
     * Convert data to CSV format
     */
    convertToCSV(data) {
        const headers = ['Member', 'Services Created', 'Orders Generated', 'Total Earnings', 'Completion Rate', 'Avg Order Value', 'Productivity Score'];
        const rows = data.map(member => [
            member.name,
            member.servicesCreated,
            member.ordersGenerated,
            member.totalEarnings.toFixed(2),
            `${member.completionRate}%`,
            member.avgOrderValue.toFixed(2),
            member.productivityScore
        ]);

        const csvContent = [headers, ...rows]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n');

        return csvContent;
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Filter change handlers
        const filterSelects = Utils.DOM.selectAll('.analytics-filters select');
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
     * Apply filters and re-render
     */
    async applyFilters() {
        // Show loading state
        AppState.setLoading('analytics', true);
        
        // Re-generate analytics data with filters
        this.analyticsData = await this.generateAnalyticsData();
        
        // Re-render analytics dashboard
        setTimeout(async () => {
            await this.renderTeamAnalytics();
            AppState.setLoading('analytics', false);
            
            Components.showNotification({
                type: 'success',
                title: 'Filters Applied',
                message: 'Analytics updated with new filters',
                duration: 2000
            });
        }, 500);
    }
}

// Create global instance
const TeamAnalytics_Instance = new TeamAnalytics();

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.TeamAnalytics = TeamAnalytics;
    window.TeamAnalytics_Instance = TeamAnalytics_Instance;
}