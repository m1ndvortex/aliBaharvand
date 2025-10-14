/**
 * Wallet Management System for Service Provider Dashboard
 * Handles multi-currency wallet operations, transactions, and conversions
 */

class WalletManager {
    constructor() {
        this.initialized = false;
        this.exchangeRates = null;
        this.animationDuration = 300;
        
        // Bind methods
        this.init = this.init.bind(this);
        this.renderWalletInterface = this.renderWalletInterface.bind(this);
        this.updateConversionPreview = this.updateConversionPreview.bind(this);
        this.showDepositModal = this.showDepositModal.bind(this);
        this.showWithdrawModal = this.showWithdrawModal.bind(this);
        this.showConvertModal = this.showConvertModal.bind(this);
        this.processDeposit = this.processDeposit.bind(this);
        this.processWithdrawal = this.processWithdrawal.bind(this);
        this.showPaymentMethodModal = this.showPaymentMethodModal.bind(this);
        this.addPaymentMethod = this.addPaymentMethod.bind(this);
        this.updatePaymentMethodFields = this.updatePaymentMethodFields.bind(this);
        this.updateWithdrawLimits = this.updateWithdrawLimits.bind(this);
        this.calculateConversion = this.calculateConversion.bind(this);
        this.formatCurrency = this.formatCurrency.bind(this);
        this.animateBalanceChange = this.animateBalanceChange.bind(this);
    }

    /**
     * Initialize wallet manager
     */
    async init() {
        if (this.initialized) return;

        try {
            // Load exchange rates from mock data
            this.exchangeRates = MockData.exchangeRates;
            
            // Initialize wallet data in state if not exists
            this.initializeWalletState();
            
            // Set up state subscriptions
            this.setupStateSubscriptions();
            
            this.initialized = true;
            console.log('Wallet Manager initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize Wallet Manager:', error);
            throw error;
        }
    }

    /**
     * Initialize wallet state from mock data
     */
    initializeWalletState() {
        const userId = AppState.getState('user.id');
        const userWallet = MockData.wallets.find(w => w.userId === userId);
        
        if (userWallet) {
            // Update state with wallet data
            AppState.setState('wallet', {
                balances: {
                    gold: userWallet.balanceGold,
                    usd: userWallet.balanceUsd,
                    toman: userWallet.balanceToman
                },
                totalEarnings: userWallet.totalEarnings,
                transactions: new Map(userWallet.transactions.map(tx => [tx.id, tx])),
                paymentMethods: new Map(userWallet.paymentMethods.map(pm => [pm.id, pm]))
            });
        }
    }

    /**
     * Set up state subscriptions
     */
    setupStateSubscriptions() {
        // Subscribe to wallet balance changes
        AppState.subscribe('wallet.balances', (newBalances, oldBalances) => {
            if (oldBalances) {
                this.handleBalanceChange(newBalances, oldBalances);
            }
        });
        
        // Subscribe to transaction changes
        AppState.subscribe('wallet.transactions', (newTransactions) => {
            this.updateTransactionHistory();
        });
    }

    /**
     * Render wallet interface
     * @param {Element} container - Container element
     */
    renderWalletInterface(container) {
        if (!container) return;

        // Clear container
        Utils.DOM.empty(container);

        // Create wallet layout
        const walletContainer = Utils.DOM.create('div', {
            className: 'wallet-container'
        });

        // Wallet header
        const header = this.createWalletHeader();
        walletContainer.appendChild(header);

        // Balance cards
        const balanceSection = this.createBalanceSection();
        walletContainer.appendChild(balanceSection);

        // Action buttons
        const actionsSection = this.createActionsSection();
        walletContainer.appendChild(actionsSection);

        // Currency converter
        const converterSection = this.createConverterSection();
        walletContainer.appendChild(converterSection);

        // Transaction history
        const historySection = this.createTransactionHistorySection();
        walletContainer.appendChild(historySection);

        // Conversion history section
        const conversionHistorySection = this.createConversionHistorySection();
        walletContainer.appendChild(conversionHistorySection);

        container.appendChild(walletContainer);
    }

    /**
     * Create wallet header
     * @returns {Element} Header element
     */
    createWalletHeader() {
        const header = Utils.DOM.create('div', {
            className: 'wallet-header'
        });

        const title = Utils.DOM.create('h2', {
            className: 'wallet-title'
        }, '💳 Wallet Management');

        const subtitle = Utils.DOM.create('p', {
            className: 'wallet-subtitle'
        }, 'Manage your multi-currency earnings and transactions');

        // Total value display
        const totalValue = this.calculateTotalValue();
        const totalDisplay = Utils.DOM.create('div', {
            className: 'wallet-total-value'
        });

        const totalLabel = Utils.DOM.create('span', {
            className: 'total-label'
        }, 'Total Portfolio Value:');

        const totalAmount = Utils.DOM.create('span', {
            className: 'total-amount'
        }, `$${totalValue.toFixed(2)} USD`);

        totalDisplay.appendChild(totalLabel);
        totalDisplay.appendChild(totalAmount);

        header.appendChild(title);
        header.appendChild(subtitle);
        header.appendChild(totalDisplay);

        return header;
    }

    /**
     * Create balance section with currency cards
     * @returns {Element} Balance section element
     */
    createBalanceSection() {
        const section = Utils.DOM.create('div', {
            className: 'wallet-balance-section'
        });

        const sectionTitle = Utils.DOM.create('h3', {
            className: 'section-title'
        }, 'Current Balances');

        const balancesGrid = Utils.DOM.create('div', {
            className: 'wallet-balances-grid'
        });

        const balances = AppState.getState('wallet.balances');

        // Gold balance card
        const goldCard = this.createBalanceCard({
            currency: 'gold',
            amount: balances.gold,
            icon: '🪙',
            color: 'gold',
            label: 'Gold'
        });

        // USD balance card
        const usdCard = this.createBalanceCard({
            currency: 'usd',
            amount: balances.usd,
            icon: '💵',
            color: 'usd',
            label: 'US Dollar'
        });

        // Toman balance card
        const tomanCard = this.createBalanceCard({
            currency: 'toman',
            amount: balances.toman,
            icon: '﷼',
            color: 'toman',
            label: 'Iranian Toman'
        });

        balancesGrid.appendChild(goldCard);
        balancesGrid.appendChild(usdCard);
        balancesGrid.appendChild(tomanCard);

        section.appendChild(sectionTitle);
        section.appendChild(balancesGrid);

        return section;
    }

    /**
     * Create individual balance card
     * @param {Object} options - Card options
     * @returns {Element} Balance card element
     */
    createBalanceCard(options) {
        const { currency, amount, icon, color, label } = options;

        const card = Utils.DOM.create('div', {
            className: `balance-card balance-card-${color}`
        });

        const cardHeader = Utils.DOM.create('div', {
            className: 'balance-card-header'
        });

        const currencyIcon = Utils.DOM.create('span', {
            className: 'currency-icon'
        }, icon);

        const currencyLabel = Utils.DOM.create('span', {
            className: 'currency-label'
        }, label);

        cardHeader.appendChild(currencyIcon);
        cardHeader.appendChild(currencyLabel);

        const cardBody = Utils.DOM.create('div', {
            className: 'balance-card-body'
        });

        const amountDisplay = Utils.DOM.create('div', {
            className: 'balance-amount',
            id: `balance-${currency}`
        }, this.formatCurrency(amount, currency));

        const usdEquivalent = Utils.DOM.create('div', {
            className: 'balance-usd-equivalent'
        }, `≈ $${this.convertToUSD(amount, currency).toFixed(2)}`);

        cardBody.appendChild(amountDisplay);
        cardBody.appendChild(usdEquivalent);

        card.appendChild(cardHeader);
        card.appendChild(cardBody);

        return card;
    }

    /**
     * Create actions section with deposit, withdraw, convert buttons
     * @returns {Element} Actions section element
     */
    createActionsSection() {
        const section = Utils.DOM.create('div', {
            className: 'wallet-actions-section'
        });

        const sectionTitle = Utils.DOM.create('h3', {
            className: 'section-title'
        }, 'Quick Actions');

        const actionsGrid = Utils.DOM.create('div', {
            className: 'wallet-actions-grid'
        });

        // Deposit button
        const depositBtn = Components.createButton({
            text: 'Deposit Funds',
            icon: '💵',
            variant: 'success',
            onClick: () => this.showDepositModal()
        });

        // Withdraw button
        const withdrawBtn = Components.createButton({
            text: 'Withdraw Funds',
            icon: '💸',
            variant: 'warning',
            onClick: () => this.showWithdrawModal()
        });

        // Convert button
        const convertBtn = Components.createButton({
            text: 'Convert Currency',
            icon: '🔄',
            variant: 'info',
            onClick: () => this.showConvertModal()
        });

        actionsGrid.appendChild(depositBtn);
        actionsGrid.appendChild(withdrawBtn);
        actionsGrid.appendChild(convertBtn);

        section.appendChild(sectionTitle);
        section.appendChild(actionsGrid);

        return section;
    }

    /**
     * Create currency converter section
     * @returns {Element} Converter section element
     */
    createConverterSection() {
        const section = Utils.DOM.create('div', {
            className: 'wallet-converter-section'
        });

        const sectionTitle = Utils.DOM.create('h3', {
            className: 'section-title'
        }, 'Currency Converter');

        const converterCard = Utils.DOM.create('div', {
            className: 'converter-card'
        });

        const converterForm = Utils.DOM.create('div', {
            className: 'converter-form'
        });

        // From currency selection
        const fromGroup = Utils.DOM.create('div', {
            className: 'converter-group'
        });

        const fromLabel = Utils.DOM.create('label', {
            className: 'converter-label'
        }, 'From:');

        const fromSelect = Utils.DOM.create('select', {
            className: 'converter-select',
            id: 'fromCurrency',
            onchange: () => this.updateConversionPreview()
        });

        const fromAmount = Utils.DOM.create('input', {
            className: 'converter-input',
            type: 'number',
            id: 'fromAmount',
            placeholder: '0.00',
            min: '0',
            step: 'any',
            oninput: () => this.updateConversionPreview()
        });

        // Currency options
        const currencies = [
            { value: 'gold', label: '🪙 Gold' },
            { value: 'usd', label: '💵 USD' },
            { value: 'toman', label: '﷼ Toman' }
        ];

        currencies.forEach(currency => {
            const option = Utils.DOM.create('option', {
                value: currency.value
            }, currency.label);
            fromSelect.appendChild(option);
        });

        fromGroup.appendChild(fromLabel);
        fromGroup.appendChild(fromSelect);
        fromGroup.appendChild(fromAmount);

        // Conversion arrow
        const arrow = Utils.DOM.create('div', {
            className: 'converter-arrow'
        }, '⬇️');

        // To currency selection
        const toGroup = Utils.DOM.create('div', {
            className: 'converter-group'
        });

        const toLabel = Utils.DOM.create('label', {
            className: 'converter-label'
        }, 'To:');

        const toSelect = Utils.DOM.create('select', {
            className: 'converter-select',
            id: 'toCurrency',
            onchange: () => this.updateConversionPreview()
        });

        currencies.forEach(currency => {
            const option = Utils.DOM.create('option', {
                value: currency.value
            }, currency.label);
            toSelect.appendChild(option);
        });

        // Set default to different currency
        toSelect.value = 'usd';

        const toAmount = Utils.DOM.create('div', {
            className: 'converter-result',
            id: 'toAmount'
        }, '0.00');

        toGroup.appendChild(toLabel);
        toGroup.appendChild(toSelect);
        toGroup.appendChild(toAmount);

        // Exchange rate display
        const rateDisplay = Utils.DOM.create('div', {
            className: 'exchange-rate-display',
            id: 'exchangeRate'
        });

        converterForm.appendChild(fromGroup);
        converterForm.appendChild(arrow);
        converterForm.appendChild(toGroup);
        converterForm.appendChild(rateDisplay);

        converterCard.appendChild(converterForm);
        section.appendChild(sectionTitle);
        section.appendChild(converterCard);

        // Initialize conversion preview
        setTimeout(() => this.updateConversionPreview(), 100);

        return section;
    }

    /**
     * Create transaction history section
     * @returns {Element} Transaction history section element
     */
    createTransactionHistorySection() {
        const section = Utils.DOM.create('div', {
            className: 'wallet-history-section'
        });

        const sectionHeader = Utils.DOM.create('div', {
            className: 'section-header'
        });

        const sectionTitle = Utils.DOM.create('h3', {
            className: 'section-title'
        }, 'Transaction History');

        // Transaction filters
        const filtersContainer = Utils.DOM.create('div', {
            className: 'transaction-filters'
        });

        const typeFilter = Utils.DOM.create('select', {
            className: 'filter-select',
            id: 'transactionTypeFilter',
            onchange: () => this.filterTransactions()
        });

        const typeOptions = [
            { value: 'all', label: 'All Types' },
            { value: 'earning', label: 'Earnings' },
            { value: 'deposit', label: 'Deposits' },
            { value: 'withdrawal', label: 'Withdrawals' },
            { value: 'conversion', label: 'Conversions' }
        ];

        typeOptions.forEach(option => {
            const optionEl = Utils.DOM.create('option', {
                value: option.value
            }, option.label);
            typeFilter.appendChild(optionEl);
        });

        const currencyFilter = Utils.DOM.create('select', {
            className: 'filter-select',
            id: 'transactionCurrencyFilter',
            onchange: () => this.filterTransactions()
        });

        const currencyOptions = [
            { value: 'all', label: 'All Currencies' },
            { value: 'gold', label: '🪙 Gold' },
            { value: 'usd', label: '💵 USD' },
            { value: 'toman', label: '﷼ Toman' }
        ];

        currencyOptions.forEach(option => {
            const optionEl = Utils.DOM.create('option', {
                value: option.value
            }, option.label);
            currencyFilter.appendChild(optionEl);
        });

        filtersContainer.appendChild(typeFilter);
        filtersContainer.appendChild(currencyFilter);

        sectionHeader.appendChild(sectionTitle);
        sectionHeader.appendChild(filtersContainer);

        // Transaction list
        const transactionList = Utils.DOM.create('div', {
            className: 'transaction-list',
            id: 'transactionList'
        });

        section.appendChild(sectionHeader);
        section.appendChild(transactionList);

        // Load transactions
        this.loadTransactionHistory();

        return section;
    }

    /**
     * Create conversion history section
     * @returns {Element} Conversion history section element
     */
    createConversionHistorySection() {
        const section = Utils.DOM.create('div', {
            className: 'wallet-conversion-history-section'
        });

        const sectionHeader = Utils.DOM.create('div', {
            className: 'section-header'
        });

        const sectionTitle = Utils.DOM.create('h3', {
            className: 'section-title'
        }, 'Recent Conversions');

        const viewAllBtn = Components.createButton({
            text: 'View All',
            variant: 'secondary',
            size: 'small',
            onClick: () => this.showAllConversions()
        });

        sectionHeader.appendChild(sectionTitle);
        sectionHeader.appendChild(viewAllBtn);

        // Conversion list
        const conversionList = Utils.DOM.create('div', {
            className: 'conversion-history-list',
            id: 'conversionHistoryList'
        });

        section.appendChild(sectionHeader);
        section.appendChild(conversionList);

        // Load recent conversions
        this.loadRecentConversions();

        return section;
    }

    /**
     * Load recent conversions (last 5)
     */
    loadRecentConversions() {
        const conversionList = Utils.DOM.select('#conversionHistoryList');
        if (!conversionList) return;

        const transactions = Array.from(AppState.getState('wallet.transactions').values());
        
        // Filter conversion transactions and group by conversionId
        const conversions = transactions
            .filter(tx => tx.type === 'conversion' && tx.conversionDetails)
            .reduce((acc, tx) => {
                const conversionId = tx.conversionId || tx.id;
                if (!acc[conversionId]) {
                    acc[conversionId] = {
                        id: conversionId,
                        timestamp: tx.createdAt,
                        details: tx.conversionDetails,
                        transactions: []
                    };
                }
                acc[conversionId].transactions.push(tx);
                return acc;
            }, {});

        // Sort by date (newest first) and take last 5
        const recentConversions = Object.values(conversions)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 5);

        Utils.DOM.empty(conversionList);

        if (recentConversions.length === 0) {
            const emptyState = Utils.DOM.create('div', {
                className: 'empty-state'
            });

            emptyState.innerHTML = `
                <div class="empty-state-icon">🔄</div>
                <h4 class="empty-state-title">No Conversions Yet</h4>
                <p class="empty-state-message">Your currency conversions will appear here.</p>
            `;

            conversionList.appendChild(emptyState);
            return;
        }

        recentConversions.forEach(conversion => {
            const conversionItem = this.createConversionHistoryItem(conversion);
            conversionList.appendChild(conversionItem);
        });
    }

    /**
     * Create individual conversion history item
     * @param {Object} conversion - Conversion data
     * @returns {Element} Conversion item element
     */
    createConversionHistoryItem(conversion) {
        const item = Utils.DOM.create('div', {
            className: 'conversion-history-item'
        });

        const details = conversion.details || {};
        const fromCurrency = details.fromCurrency || 'unknown';
        const toCurrency = details.toCurrency || 'unknown';
        const originalAmount = details.originalAmount || 0;
        const receivedAmount = details.toAmount || 0;
        const fee = details.fee || 0;

        item.innerHTML = `
            <div class="conversion-icon">🔄</div>
            <div class="conversion-content">
                <div class="conversion-header">
                    <div class="conversion-description">
                        ${this.formatCurrency(originalAmount, fromCurrency)} → ${this.formatCurrency(receivedAmount, toCurrency)}
                    </div>
                    <div class="conversion-timestamp">
                        ${Utils.Format.timeAgo(conversion.timestamp)}
                    </div>
                </div>
                <div class="conversion-details">
                    <div class="conversion-rate">
                        Rate: 1 ${fromCurrency.toUpperCase()} = ${(details.exchangeRate || 0).toFixed(6)} ${toCurrency.toUpperCase()}
                    </div>
                    <div class="conversion-fee">
                        Fee: ${this.formatCurrency(fee, fromCurrency)}
                    </div>
                </div>
            </div>
        `;

        return item;
    }

    /**
     * Show all conversions in a modal
     */
    showAllConversions() {
        const modalContent = Utils.DOM.create('div', {
            className: 'all-conversions-modal'
        });

        const transactions = Array.from(AppState.getState('wallet.transactions').values());
        
        // Filter and group conversion transactions
        const conversions = transactions
            .filter(tx => tx.type === 'conversion' && tx.conversionDetails)
            .reduce((acc, tx) => {
                const conversionId = tx.conversionId || tx.id;
                if (!acc[conversionId]) {
                    acc[conversionId] = {
                        id: conversionId,
                        timestamp: tx.createdAt,
                        details: tx.conversionDetails,
                        transactions: []
                    };
                }
                acc[conversionId].transactions.push(tx);
                return acc;
            }, {});

        const allConversions = Object.values(conversions)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        if (allConversions.length === 0) {
            modalContent.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🔄</div>
                    <h4 class="empty-state-title">No Conversions Found</h4>
                    <p class="empty-state-message">You haven't made any currency conversions yet.</p>
                </div>
            `;
        } else {
            const conversionsList = Utils.DOM.create('div', {
                className: 'all-conversions-list'
            });

            allConversions.forEach(conversion => {
                const item = this.createDetailedConversionItem(conversion);
                conversionsList.appendChild(item);
            });

            modalContent.appendChild(conversionsList);
        }

        Components.showModal({
            title: '🔄 All Currency Conversions',
            content: modalContent,
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
     * Create detailed conversion item for modal
     * @param {Object} conversion - Conversion data
     * @returns {Element} Detailed conversion item element
     */
    createDetailedConversionItem(conversion) {
        const item = Utils.DOM.create('div', {
            className: 'detailed-conversion-item'
        });

        const details = conversion.details || {};
        const fromCurrency = details.fromCurrency || 'unknown';
        const toCurrency = details.toCurrency || 'unknown';
        const originalAmount = details.originalAmount || 0;
        const receivedAmount = details.toAmount || 0;
        const fee = details.fee || 0;
        const rate = details.exchangeRate || 0;

        item.innerHTML = `
            <div class="conversion-summary">
                <div class="conversion-main">
                    <div class="conversion-flow">
                        <span class="from-amount">${this.formatCurrency(originalAmount, fromCurrency)}</span>
                        <span class="conversion-arrow">→</span>
                        <span class="to-amount">${this.formatCurrency(receivedAmount, toCurrency)}</span>
                    </div>
                    <div class="conversion-date">
                        ${Utils.Format.date(conversion.timestamp, 'datetime')}
                    </div>
                </div>
                <div class="conversion-breakdown">
                    <div class="breakdown-row">
                        <span class="label">Exchange Rate:</span>
                        <span class="value">1 ${fromCurrency.toUpperCase()} = ${rate.toFixed(6)} ${toCurrency.toUpperCase()}</span>
                    </div>
                    <div class="breakdown-row">
                        <span class="label">Conversion Fee:</span>
                        <span class="value">${this.formatCurrency(fee, fromCurrency)}</span>
                    </div>
                    <div class="breakdown-row">
                        <span class="label">Total Deducted:</span>
                        <span class="value">${this.formatCurrency(originalAmount + fee, fromCurrency)}</span>
                    </div>
                    <div class="breakdown-row highlight">
                        <span class="label">Amount Received:</span>
                        <span class="value">${this.formatCurrency(receivedAmount, toCurrency)}</span>
                    </div>
                </div>
            </div>
        `;

        return item;
    }

    /**
     * Load and display transaction history
     */
    loadTransactionHistory() {
        const transactionList = Utils.DOM.select('#transactionList');
        if (!transactionList) return;

        const transactions = Array.from(AppState.getState('wallet.transactions').values());
        
        // Sort by date (newest first)
        transactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        Utils.DOM.empty(transactionList);

        if (transactions.length === 0) {
            const emptyState = Utils.DOM.create('div', {
                className: 'empty-state'
            });

            emptyState.innerHTML = `
                <div class="empty-state-icon">📊</div>
                <h4 class="empty-state-title">No Transactions Yet</h4>
                <p class="empty-state-message">Your transaction history will appear here once you start using your wallet.</p>
            `;

            transactionList.appendChild(emptyState);
            return;
        }

        transactions.forEach(transaction => {
            const transactionItem = this.createTransactionItem(transaction);
            transactionList.appendChild(transactionItem);
        });
    }

    /**
     * Create individual transaction item
     * @param {Object} transaction - Transaction data
     * @returns {Element} Transaction item element
     */
    createTransactionItem(transaction) {
        const item = Utils.DOM.create('div', {
            className: `transaction-item transaction-${transaction.type} transaction-${transaction.status}`
        });

        const icon = Utils.DOM.create('div', {
            className: 'transaction-icon'
        }, this.getTransactionIcon(transaction.type));

        const content = Utils.DOM.create('div', {
            className: 'transaction-content'
        });

        const header = Utils.DOM.create('div', {
            className: 'transaction-header'
        });

        const description = Utils.DOM.create('div', {
            className: 'transaction-description'
        }, transaction.description);

        const timestamp = Utils.DOM.create('div', {
            className: 'transaction-timestamp'
        }, Utils.Format.timeAgo(transaction.createdAt));

        header.appendChild(description);
        header.appendChild(timestamp);

        const details = Utils.DOM.create('div', {
            className: 'transaction-details'
        });

        const amount = Utils.DOM.create('div', {
            className: `transaction-amount ${transaction.amount >= 0 ? 'positive' : 'negative'}`
        }, `${transaction.amount >= 0 ? '+' : ''}${this.formatCurrency(Math.abs(transaction.amount), transaction.currency)}`);

        const status = Components.createStatusBadge({
            status: transaction.status,
            text: transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)
        });

        details.appendChild(amount);
        details.appendChild(status);

        content.appendChild(header);
        content.appendChild(details);

        item.appendChild(icon);
        item.appendChild(content);

        return item;
    }

    /**
     * Get transaction type icon
     * @param {string} type - Transaction type
     * @returns {string} Icon emoji
     */
    getTransactionIcon(type) {
        const icons = {
            earning: '💰',
            deposit: '💵',
            withdrawal: '💸',
            conversion: '🔄',
            team_earning: '👥'
        };
        return icons[type] || '📊';
    }

    /**
     * Update conversion preview in real-time
     */
    updateConversionPreview() {
        const fromCurrency = Utils.DOM.select('#fromCurrency')?.value;
        const toCurrency = Utils.DOM.select('#toCurrency')?.value;
        const fromAmount = parseFloat(Utils.DOM.select('#fromAmount')?.value) || 0;
        const toAmountEl = Utils.DOM.select('#toAmount');
        const exchangeRateEl = Utils.DOM.select('#exchangeRate');

        if (!fromCurrency || !toCurrency || !toAmountEl || !exchangeRateEl) return;

        if (fromCurrency === toCurrency) {
            toAmountEl.textContent = this.formatCurrency(fromAmount, toCurrency);
            exchangeRateEl.textContent = 'Same currency selected';
            return;
        }

        const conversion = this.calculateConversion(fromAmount, fromCurrency, toCurrency);
        
        toAmountEl.textContent = this.formatCurrency(conversion.toAmount, toCurrency);
        
        const rate = this.getExchangeRate(fromCurrency, toCurrency);
        exchangeRateEl.innerHTML = `
            <span class="rate-info">1 ${fromCurrency.toUpperCase()} = ${rate} ${toCurrency.toUpperCase()}</span>
            <span class="fee-info">Fee: ${this.formatCurrency(conversion.fee, fromCurrency)}</span>
        `;
    } 
   /**
     * Calculate currency conversion
     * @param {number} amount - Amount to convert
     * @param {string} fromCurrency - Source currency
     * @param {string} toCurrency - Target currency
     * @returns {Object} Conversion result
     */
    calculateConversion(amount, fromCurrency, toCurrency) {
        if (fromCurrency === toCurrency) {
            return {
                fromAmount: amount,
                toAmount: amount,
                fee: 0,
                exchangeRate: 1
            };
        }

        const rate = this.getExchangeRate(fromCurrency, toCurrency);
        const toAmount = amount * rate;
        
        // Calculate fee
        const feePercentage = this.exchangeRates.conversionFees.percentage / 100;
        const fee = Math.max(
            amount * feePercentage,
            this.exchangeRates.conversionFees.minimum[fromCurrency] || 0
        );

        return {
            fromAmount: amount,
            toAmount: toAmount,
            fee: fee,
            exchangeRate: rate,
            netAmount: toAmount // In real implementation, would subtract fee from source
        };
    }

    /**
     * Get exchange rate between currencies
     * @param {string} fromCurrency - Source currency
     * @param {string} toCurrency - Target currency
     * @returns {number} Exchange rate
     */
    getExchangeRate(fromCurrency, toCurrency) {
        const rateKey = `${fromCurrency}_to_${toCurrency}`;
        return this.exchangeRates.rates[rateKey] || 1;
    }

    /**
     * Convert amount to USD for comparison
     * @param {number} amount - Amount to convert
     * @param {string} currency - Source currency
     * @returns {number} USD equivalent
     */
    convertToUSD(amount, currency) {
        if (currency === 'usd') return amount;
        const rate = this.getExchangeRate(currency, 'usd');
        return amount * rate;
    }

    /**
     * Calculate total portfolio value in USD
     * @returns {number} Total value in USD
     */
    calculateTotalValue() {
        const balances = AppState.getState('wallet.balances');
        let total = 0;

        Object.entries(balances).forEach(([currency, amount]) => {
            total += this.convertToUSD(amount, currency);
        });

        return total;
    }

    /**
     * Format currency amount
     * @param {number} amount - Amount to format
     * @param {string} currency - Currency type
     * @returns {string} Formatted amount
     */
    formatCurrency(amount, currency) {
        // Handle null/undefined values
        if (amount === null || amount === undefined || isNaN(amount)) {
            amount = 0;
        }
        
        if (!currency || typeof currency !== 'string') {
            return `${amount}`;
        }

        const formatters = {
            gold: (amt) => `${amt.toLocaleString()} G`,
            usd: (amt) => `$${amt.toFixed(2)}`,
            toman: (amt) => `${amt.toLocaleString()} ﷼`
        };

        const formatter = formatters[currency.toLowerCase()];
        return formatter ? formatter(amount) : `${amount} ${currency.toUpperCase()}`;
    }

    /**
     * Handle balance changes with animations
     * @param {Object} newBalances - New balance values
     * @param {Object} oldBalances - Previous balance values
     */
    handleBalanceChange(newBalances, oldBalances) {
        Object.entries(newBalances).forEach(([currency, newAmount]) => {
            const oldAmount = oldBalances[currency];
            if (oldAmount !== newAmount) {
                this.animateBalanceChange(currency, oldAmount, newAmount);
            }
        });

        // Update total value
        this.updateTotalValue();
    }

    /**
     * Animate balance change
     * @param {string} currency - Currency type
     * @param {number} oldAmount - Previous amount
     * @param {number} newAmount - New amount
     */
    animateBalanceChange(currency, oldAmount, newAmount) {
        const balanceEl = Utils.DOM.select(`#balance-${currency}`);
        if (!balanceEl) return;

        // Add animation class
        Utils.DOM.addClass(balanceEl, 'balance-updating');

        // Animate the number change
        const startTime = performance.now();
        const duration = this.animationDuration;
        const difference = newAmount - oldAmount;

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smooth animation
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            
            const currentAmount = oldAmount + (difference * easeProgress);
            balanceEl.textContent = this.formatCurrency(currentAmount, currency);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                balanceEl.textContent = this.formatCurrency(newAmount, currency);
                Utils.DOM.removeClass(balanceEl, 'balance-updating');
                
                // Add flash effect for positive changes
                if (difference > 0) {
                    Utils.DOM.addClass(balanceEl, 'balance-increased');
                    setTimeout(() => {
                        Utils.DOM.removeClass(balanceEl, 'balance-increased');
                    }, 1000);
                }
            }
        };

        requestAnimationFrame(animate);
    }

    /**
     * Update total portfolio value display
     */
    updateTotalValue() {
        const totalValueEl = Utils.DOM.select('.total-amount');
        if (totalValueEl) {
            const totalValue = this.calculateTotalValue();
            totalValueEl.textContent = `$${totalValue.toFixed(2)} USD`;
        }
    }

    /**
     * Show deposit modal
     */
    showDepositModal() {
        const modalContent = Utils.DOM.create('div', {
            className: 'deposit-modal'
        });

        modalContent.innerHTML = `
            <div class="deposit-form">
                <div class="form-group">
                    <label class="form-label">Currency</label>
                    <select class="form-input" id="depositCurrency">
                        <option value="usd">💵 US Dollar</option>
                        <option value="toman">﷼ Iranian Toman</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Amount</label>
                    <input type="number" class="form-input" id="depositAmount" placeholder="0.00" min="1" step="any">
                </div>
                <div class="form-group">
                    <label class="form-label">Payment Method</label>
                    <select class="form-input" id="depositPaymentMethod">
                        <option value="credit_card">💳 Credit Card</option>
                        <option value="paypal">🅿️ PayPal</option>
                        <option value="bank_transfer">🏦 Bank Transfer</option>
                    </select>
                </div>
                <div class="deposit-info">
                    <p><strong>Note:</strong> Deposits are processed instantly. A small processing fee may apply depending on the payment method.</p>
                </div>
            </div>
        `;

        Components.showModal({
            title: '💵 Deposit Funds',
            content: modalContent,
            size: 'medium',
            footer: [
                Components.createButton({
                    text: 'Cancel',
                    variant: 'secondary',
                    onClick: () => Components.closeModal()
                }),
                Components.createButton({
                    text: 'Deposit',
                    variant: 'success',
                    onClick: () => this.processDeposit()
                })
            ]
        });
    }    
/**
     * Show withdrawal modal
     */
    showWithdrawModal() {
        const balances = AppState.getState('wallet.balances');
        
        const modalContent = Utils.DOM.create('div', {
            className: 'withdraw-modal'
        });

        modalContent.innerHTML = `
            <div class="withdraw-form">
                <div class="form-group">
                    <label class="form-label">Currency</label>
                    <select class="form-input" id="withdrawCurrency" onchange="window.walletManager.updateWithdrawLimits()">
                        <option value="usd">💵 US Dollar (Available: $${balances.usd.toFixed(2)})</option>
                        <option value="toman">﷼ Iranian Toman (Available: ${balances.toman.toLocaleString()} ﷼)</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Amount</label>
                    <input type="number" class="form-input" id="withdrawAmount" placeholder="0.00" min="1" step="any">
                    <div class="form-help" id="withdrawLimits">Minimum withdrawal: $10 USD</div>
                </div>
                <div class="form-group">
                    <label class="form-label">Withdrawal Method</label>
                    <select class="form-input" id="withdrawPaymentMethod">
                        <option value="paypal">🅿️ PayPal</option>
                        <option value="bank_transfer">🏦 Bank Transfer</option>
                        <option value="crypto">₿ Cryptocurrency</option>
                    </select>
                </div>
                <div class="withdraw-info">
                    <p><strong>Note:</strong> Withdrawal requests require admin approval and may take 1-3 business days to process.</p>
                </div>
            </div>
        `;

        Components.showModal({
            title: '💸 Withdraw Funds',
            content: modalContent,
            size: 'medium',
            footer: [
                Components.createButton({
                    text: 'Cancel',
                    variant: 'secondary',
                    onClick: () => Components.closeModal()
                }),
                Components.createButton({
                    text: 'Request Withdrawal',
                    variant: 'warning',
                    onClick: () => this.processWithdrawal()
                })
            ]
        });

        // Set reference for method access
        window.walletManager = this;
    }

    /**
     * Show enhanced currency conversion modal
     */
    showConvertModal() {
        const modalContent = Utils.DOM.create('div', {
            className: 'convert-modal'
        });

        const balances = AppState.getState('wallet.balances');

        modalContent.innerHTML = `
            <div class="convert-form">
                <div class="conversion-header">
                    <h4>💱 Currency Conversion</h4>
                    <div class="exchange-rate-info">
                        <span class="rate-update">Last updated: ${Utils.Format.timeAgo(this.exchangeRates.lastUpdated)}</span>
                        <button class="refresh-rates-btn" id="refreshRatesBtn" title="Refresh Exchange Rates">🔄</button>
                    </div>
                </div>

                <div class="conversion-section">
                    <div class="form-group">
                        <label class="form-label">From Currency</label>
                        <select class="form-input currency-select" id="convertFromCurrency">
                            <option value="gold">🪙 Gold (Balance: ${this.formatCurrency(balances.gold, 'gold')})</option>
                            <option value="usd">💵 US Dollar (Balance: $${balances.usd.toFixed(2)})</option>
                            <option value="toman">﷼ Iranian Toman (Balance: ${this.formatCurrency(balances.toman, 'toman')})</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Amount to Convert</label>
                        <div class="amount-input-group">
                            <input type="number" class="form-input" id="convertFromAmount" placeholder="0.00" min="1" step="any">
                            <button class="max-amount-btn" id="maxAmountBtn">MAX</button>
                        </div>
                        <div class="balance-info" id="availableBalance">Available: ${this.formatCurrency(balances.gold, 'gold')}</div>
                    </div>

                    <div class="conversion-arrow">
                        <button class="swap-currencies-btn" id="swapCurrenciesBtn" title="Swap currencies">⇅</button>
                    </div>

                    <div class="form-group">
                        <label class="form-label">To Currency</label>
                        <select class="form-input currency-select" id="convertToCurrency">
                            <option value="usd">💵 US Dollar</option>
                            <option value="gold">🪙 Gold</option>
                            <option value="toman">﷼ Iranian Toman</option>
                        </select>
                    </div>
                </div>

                <div class="conversion-preview" id="conversionPreview">
                    <div class="preview-header">
                        <h5>Conversion Preview</h5>
                    </div>
                    <div class="preview-details">
                        <div class="preview-item">
                            <span class="preview-label">Exchange Rate:</span>
                            <span class="preview-value" id="previewRate">-</span>
                        </div>
                        <div class="preview-item">
                            <span class="preview-label">Conversion Fee (${this.exchangeRates.conversionFees.percentage}%):</span>
                            <span class="preview-value" id="previewFee">-</span>
                        </div>
                        <div class="preview-item">
                            <span class="preview-label">Amount after fee:</span>
                            <span class="preview-value" id="previewAfterFee">-</span>
                        </div>
                        <div class="preview-item total">
                            <span class="preview-label">You will receive:</span>
                            <span class="preview-value" id="previewTotal">-</span>
                        </div>
                    </div>
                </div>

                <div class="conversion-limits" id="conversionLimits">
                    <h5>Conversion Limits & Fees</h5>
                    <div class="limits-info">
                        <div class="limit-item">
                            <span>Minimum conversion fee:</span>
                            <span id="minFeeDisplay">-</span>
                        </div>
                        <div class="limit-item">
                            <span>Daily conversion limit:</span>
                            <span>$10,000 USD equivalent</span>
                        </div>
                    </div>
                </div>

                <div class="conversion-warnings" id="conversionWarnings" style="display: none;">
                    <div class="warning-message">
                        <span class="warning-icon">⚠️</span>
                        <span class="warning-text" id="warningText"></span>
                    </div>
                </div>
            </div>
        `;

        // Store reference to convert button
        this.convertButton = Components.createButton({
            text: 'Convert Currency',
            variant: 'info',
            id: 'convertButton',
            disabled: true,
            onClick: () => this.processConversion()
        });

        Components.showModal({
            title: '🔄 Convert Currency',
            content: modalContent,
            size: 'large',
            footer: [
                Components.createButton({
                    text: 'Cancel',
                    variant: 'secondary',
                    onClick: () => Components.closeModal()
                }),
                this.convertButton
            ]
        });

        // Set up event listeners
        this.setupConversionModalEvents();

        // Initial preview update
        setTimeout(() => this.updateConversionModalPreview(), 100);
    }

    /**
     * Set up event listeners for conversion modal
     */
    setupConversionModalEvents() {
        const fromAmountInput = Utils.DOM.select('#convertFromAmount');
        const fromCurrencySelect = Utils.DOM.select('#convertFromCurrency');
        const toCurrencySelect = Utils.DOM.select('#convertToCurrency');
        const maxAmountBtn = Utils.DOM.select('#maxAmountBtn');
        const swapBtn = Utils.DOM.select('#swapCurrenciesBtn');
        const refreshBtn = Utils.DOM.select('#refreshRatesBtn');

        const updatePreview = () => this.updateConversionModalPreview();

        // Input and selection changes
        fromAmountInput?.addEventListener('input', updatePreview);
        fromCurrencySelect?.addEventListener('change', () => {
            this.updateAvailableBalance();
            updatePreview();
        });
        toCurrencySelect?.addEventListener('change', updatePreview);

        // Max amount button
        maxAmountBtn?.addEventListener('click', () => {
            const fromCurrency = fromCurrencySelect.value;
            const balances = AppState.getState('wallet.balances');
            const maxAmount = balances[fromCurrency];
            fromAmountInput.value = maxAmount;
            updatePreview();
        });

        // Swap currencies button
        swapBtn?.addEventListener('click', () => {
            const fromValue = fromCurrencySelect.value;
            const toValue = toCurrencySelect.value;
            
            fromCurrencySelect.value = toValue;
            toCurrencySelect.value = fromValue;
            
            this.updateAvailableBalance();
            updatePreview();
        });

        // Refresh rates button
        refreshBtn?.addEventListener('click', () => {
            this.refreshExchangeRates();
        });
    }

    /**
     * Update available balance display
     */
    updateAvailableBalance() {
        const fromCurrency = Utils.DOM.select('#convertFromCurrency')?.value;
        const balanceInfo = Utils.DOM.select('#availableBalance');
        const minFeeDisplay = Utils.DOM.select('#minFeeDisplay');
        
        if (fromCurrency && balanceInfo) {
            const balances = AppState.getState('wallet.balances');
            const balance = balances[fromCurrency];
            balanceInfo.textContent = `Available: ${this.formatCurrency(balance, fromCurrency)}`;
            
            // Update minimum fee display
            const minFee = this.exchangeRates.conversionFees.minimum[fromCurrency] || 0;
            if (minFeeDisplay) {
                minFeeDisplay.textContent = this.formatCurrency(minFee, fromCurrency);
            }
        }
    }

    /**
     * Refresh exchange rates (simulate API call)
     */
    refreshExchangeRates() {
        const refreshBtn = Utils.DOM.select('#refreshRatesBtn');
        if (refreshBtn) {
            refreshBtn.innerHTML = '⏳';
            refreshBtn.disabled = true;
        }

        // Simulate API delay
        setTimeout(() => {
            // Update timestamp
            this.exchangeRates.lastUpdated = new Date().toISOString();
            
            // Simulate small rate fluctuations (±2%)
            Object.keys(this.exchangeRates.rates).forEach(rateKey => {
                const currentRate = this.exchangeRates.rates[rateKey];
                const fluctuation = (Math.random() - 0.5) * 0.04; // ±2%
                this.exchangeRates.rates[rateKey] = currentRate * (1 + fluctuation);
            });

            if (refreshBtn) {
                refreshBtn.innerHTML = '🔄';
                refreshBtn.disabled = false;
            }

            // Update rate info
            const rateUpdate = Utils.DOM.select('.rate-update');
            if (rateUpdate) {
                rateUpdate.textContent = `Last updated: ${Utils.Format.timeAgo(this.exchangeRates.lastUpdated)}`;
            }

            // Update preview
            this.updateConversionModalPreview();

            Components.showNotification({
                type: 'success',
                title: 'Exchange Rates Updated',
                message: 'Latest exchange rates have been loaded.',
                duration: 2000
            });
        }, 1000);
    } 
    /**
     * Update conversion preview in enhanced modal
     */
    updateConversionModalPreview() {
        const fromCurrency = Utils.DOM.select('#convertFromCurrency')?.value;
        const toCurrency = Utils.DOM.select('#convertToCurrency')?.value;
        const amount = parseFloat(Utils.DOM.select('#convertFromAmount')?.value) || 0;
        
        const previewRate = Utils.DOM.select('#previewRate');
        const previewFee = Utils.DOM.select('#previewFee');
        const previewAfterFee = Utils.DOM.select('#previewAfterFee');
        const previewTotal = Utils.DOM.select('#previewTotal');
        const convertButton = this.convertButton;
        const warningsDiv = Utils.DOM.select('#conversionWarnings');
        const warningText = Utils.DOM.select('#warningText');

        if (!fromCurrency || !toCurrency || !previewRate) return;

        // Reset warnings
        if (warningsDiv) warningsDiv.style.display = 'none';

        if (amount <= 0) {
            previewRate.textContent = '-';
            previewFee.textContent = '-';
            previewAfterFee.textContent = '-';
            previewTotal.textContent = '-';
            if (convertButton) convertButton.disabled = true;
            return;
        }

        // Check if same currency
        if (fromCurrency === toCurrency) {
            previewRate.textContent = '1:1 (Same currency)';
            previewFee.textContent = 'N/A';
            previewAfterFee.textContent = 'N/A';
            previewTotal.textContent = 'N/A';
            if (convertButton) convertButton.disabled = true;
            if (warningsDiv && warningText) {
                warningText.textContent = 'Please select different currencies for conversion.';
                warningsDiv.style.display = 'block';
            }
            return;
        }

        // Check balance
        const balances = AppState.getState('wallet.balances');
        const availableBalance = balances[fromCurrency];
        
        if (amount > availableBalance) {
            if (warningsDiv && warningText) {
                warningText.textContent = `Insufficient balance. Available: ${this.formatCurrency(availableBalance, fromCurrency)}`;
                warningsDiv.style.display = 'block';
            }
            if (convertButton) convertButton.disabled = true;
            return;
        }

        // Calculate conversion
        const conversion = this.calculateConversion(amount, fromCurrency, toCurrency);
        const rate = this.getExchangeRate(fromCurrency, toCurrency);
        
        // Update preview
        previewRate.textContent = `1 ${fromCurrency.toUpperCase()} = ${rate.toFixed(6)} ${toCurrency.toUpperCase()}`;
        previewFee.textContent = this.formatCurrency(conversion.fee, fromCurrency);
        previewAfterFee.textContent = this.formatCurrency(amount - conversion.fee, fromCurrency);
        previewTotal.textContent = this.formatCurrency(conversion.toAmount, toCurrency);

        // Check minimum conversion amount
        const minFee = this.exchangeRates.conversionFees.minimum[fromCurrency] || 0;
        if (conversion.fee < minFee) {
            if (warningsDiv && warningText) {
                warningText.textContent = `Minimum conversion fee of ${this.formatCurrency(minFee, fromCurrency)} will be applied.`;
                warningsDiv.style.display = 'block';
            }
        }

        // Enable convert button if all validations pass
        if (convertButton) {
            convertButton.disabled = false;
        }
    }

    /**
     * Legacy method for backward compatibility
     */
    updateConvertPreview() {
        this.updateConversionModalPreview();
    }

    /**
     * Update withdrawal limits based on selected currency
     */
    updateWithdrawLimits() {
        const currency = Utils.DOM.select('#withdrawCurrency')?.value;
        const limitsEl = Utils.DOM.select('#withdrawLimits');
        
        if (!limitsEl) return;

        const limits = {
            usd: 'Minimum withdrawal: $10 USD',
            toman: 'Minimum withdrawal: 500,000 ﷼'
        };

        limitsEl.textContent = limits[currency] || 'Minimum withdrawal applies';
    }

    /**
     * Process deposit transaction
     */
    processDeposit() {
        const currency = Utils.DOM.select('#depositCurrency')?.value;
        const amount = parseFloat(Utils.DOM.select('#depositAmount')?.value);
        const paymentMethod = Utils.DOM.select('#depositPaymentMethod')?.value;

        if (!currency || !amount || amount <= 0) {
            Components.showNotification({
                type: 'error',
                title: 'Invalid Input',
                message: 'Please enter a valid amount to deposit.'
            });
            return;
        }

        // Simulate deposit processing
        const transaction = {
            id: 'tx_' + Date.now(),
            type: 'deposit',
            amount: amount,
            currency: currency,
            status: 'completed',
            description: `Deposit via ${paymentMethod}`,
            paymentMethodId: paymentMethod,
            createdAt: new Date().toISOString(),
            completedAt: new Date().toISOString()
        };

        // Update balance
        const currentBalances = AppState.getState('wallet.balances');
        const newBalances = { ...currentBalances };
        newBalances[currency] += amount;

        // Update transactions
        const transactions = AppState.getState('wallet.transactions');
        transactions.set(transaction.id, transaction);

        // Update state
        AppState.setState({
            'wallet.balances': newBalances,
            'wallet.transactions': transactions
        });

        Components.closeModal();
        Components.showNotification({
            type: 'success',
            title: 'Deposit Successful',
            message: `Successfully deposited ${this.formatCurrency(amount, currency)} to your wallet.`
        });

        // Refresh transaction history
        this.loadTransactionHistory();
    }

    /**
     * Process withdrawal request
     */
    processWithdrawal() {
        const currency = Utils.DOM.select('#withdrawCurrency')?.value;
        const amount = parseFloat(Utils.DOM.select('#withdrawAmount')?.value);
        const paymentMethod = Utils.DOM.select('#withdrawPaymentMethod')?.value;

        if (!currency || !amount || amount <= 0) {
            Components.showNotification({
                type: 'error',
                title: 'Invalid Input',
                message: 'Please enter a valid amount to withdraw.'
            });
            return;
        }

        const currentBalances = AppState.getState('wallet.balances');
        
        // Check if sufficient balance
        if (currentBalances[currency] < amount) {
            Components.showNotification({
                type: 'error',
                title: 'Insufficient Balance',
                message: `You don't have enough ${currency.toUpperCase()} to withdraw this amount.`
            });
            return;
        }

        // Create withdrawal transaction
        const transaction = {
            id: 'tx_' + Date.now(),
            type: 'withdrawal',
            amount: -amount,
            currency: currency,
            status: 'pending',
            description: `Withdrawal request to ${paymentMethod}`,
            paymentMethodId: paymentMethod,
            createdAt: new Date().toISOString(),
            completedAt: null
        };

        // Update transactions (balance will be deducted when approved)
        const transactions = AppState.getState('wallet.transactions');
        transactions.set(transaction.id, transaction);

        AppState.setState('wallet.transactions', transactions);

        Components.closeModal();
        Components.showNotification({
            type: 'info',
            title: 'Withdrawal Requested',
            message: `Withdrawal request for ${this.formatCurrency(amount, currency)} has been submitted for admin approval.`
        });

        // Refresh transaction history
        this.loadTransactionHistory();
    }

    /**
     * Process enhanced currency conversion with validation and limits
     */
    processConversion() {
        const fromCurrency = Utils.DOM.select('#convertFromCurrency')?.value;
        const toCurrency = Utils.DOM.select('#convertToCurrency')?.value;
        const amount = parseFloat(Utils.DOM.select('#convertFromAmount')?.value);

        // Enhanced validation
        if (!fromCurrency || !toCurrency || !amount || amount <= 0) {
            Components.showNotification({
                type: 'error',
                title: 'Invalid Input',
                message: 'Please enter a valid amount to convert.'
            });
            return;
        }

        if (fromCurrency === toCurrency) {
            Components.showNotification({
                type: 'error',
                title: 'Same Currency',
                message: 'Please select different currencies for conversion.'
            });
            return;
        }

        const currentBalances = AppState.getState('wallet.balances');
        
        // Check if sufficient balance
        if (currentBalances[fromCurrency] < amount) {
            Components.showNotification({
                type: 'error',
                title: 'Insufficient Balance',
                message: `You don't have enough ${fromCurrency.toUpperCase()} to convert this amount.`
            });
            return;
        }

        // Check daily conversion limits (simulate)
        const dailyLimitUSD = 10000;
        const amountInUSD = this.convertToUSD(amount, fromCurrency);
        
        if (amountInUSD > dailyLimitUSD) {
            Components.showNotification({
                type: 'error',
                title: 'Daily Limit Exceeded',
                message: `Conversion amount exceeds daily limit of $${dailyLimitUSD.toLocaleString()} USD.`
            });
            return;
        }

        const conversion = this.calculateConversion(amount, fromCurrency, toCurrency);

        // Apply minimum fee if necessary
        const minFee = this.exchangeRates.conversionFees.minimum[fromCurrency] || 0;
        const actualFee = Math.max(conversion.fee, minFee);
        
        // Recalculate with actual fee
        const finalConversion = {
            ...conversion,
            fee: actualFee,
            netAmount: conversion.toAmount // Amount received remains the same, fee is deducted from source
        };

        // Show confirmation dialog
        this.showConversionConfirmation(amount, fromCurrency, toCurrency, finalConversion);
    }

    /**
     * Show conversion confirmation dialog
     */
    showConversionConfirmation(amount, fromCurrency, toCurrency, conversion) {
        const confirmContent = Utils.DOM.create('div', {
            className: 'conversion-confirmation'
        });

        confirmContent.innerHTML = `
            <div class="confirmation-details">
                <h4>Confirm Currency Conversion</h4>
                <div class="conversion-summary">
                    <div class="summary-row">
                        <span class="label">Converting:</span>
                        <span class="value">${this.formatCurrency(amount, fromCurrency)}</span>
                    </div>
                    <div class="summary-row">
                        <span class="label">Conversion Fee:</span>
                        <span class="value fee">${this.formatCurrency(conversion.fee, fromCurrency)}</span>
                    </div>
                    <div class="summary-row">
                        <span class="label">Total Deducted:</span>
                        <span class="value total-deducted">${this.formatCurrency(amount + conversion.fee, fromCurrency)}</span>
                    </div>
                    <div class="summary-row highlight">
                        <span class="label">You will receive:</span>
                        <span class="value received">${this.formatCurrency(conversion.toAmount, toCurrency)}</span>
                    </div>
                    <div class="summary-row">
                        <span class="label">Exchange Rate:</span>
                        <span class="value">1 ${fromCurrency.toUpperCase()} = ${conversion.exchangeRate.toFixed(6)} ${toCurrency.toUpperCase()}</span>
                    </div>
                </div>
                <div class="confirmation-warning">
                    <span class="warning-icon">ℹ️</span>
                    <span>This conversion is final and cannot be undone.</span>
                </div>
            </div>
        `;

        Components.showModal({
            title: '🔄 Confirm Conversion',
            content: confirmContent,
            size: 'medium',
            footer: [
                Components.createButton({
                    text: 'Cancel',
                    variant: 'secondary',
                    onClick: () => Components.closeModal()
                }),
                Components.createButton({
                    text: 'Confirm Conversion',
                    variant: 'success',
                    onClick: () => this.executeConversion(amount, fromCurrency, toCurrency, conversion)
                })
            ]
        });
    }

    /**
     * Execute the actual conversion
     */
    executeConversion(amount, fromCurrency, toCurrency, conversion) {
        try {
            // Create conversion transactions with detailed tracking
            const timestamp = new Date().toISOString();
            const conversionId = 'conv_' + Date.now();

            const debitTransaction = {
                id: `tx_${Date.now()}_debit`,
                type: 'conversion',
                amount: -(amount + conversion.fee),
                currency: fromCurrency,
                status: 'completed',
                description: `Converted ${this.formatCurrency(amount, fromCurrency)} to ${toCurrency.toUpperCase()}`,
                conversionId: conversionId,
                conversionDetails: {
                    ...conversion,
                    originalAmount: amount,
                    fromCurrency: fromCurrency,
                    toCurrency: toCurrency,
                    timestamp: timestamp
                },
                createdAt: timestamp,
                completedAt: timestamp
            };

            const creditTransaction = {
                id: `tx_${Date.now() + 1}_credit`,
                type: 'conversion',
                amount: conversion.toAmount,
                currency: toCurrency,
                status: 'completed',
                description: `Received ${this.formatCurrency(conversion.toAmount, toCurrency)} from ${fromCurrency.toUpperCase()} conversion`,
                conversionId: conversionId,
                conversionDetails: {
                    ...conversion,
                    originalAmount: amount,
                    fromCurrency: fromCurrency,
                    toCurrency: toCurrency,
                    timestamp: timestamp
                },
                createdAt: timestamp,
                completedAt: timestamp
            };

            // Update balances
            const currentBalances = AppState.getState('wallet.balances');
            const newBalances = { ...currentBalances };
            newBalances[fromCurrency] -= (amount + conversion.fee);
            newBalances[toCurrency] += conversion.toAmount;

            // Update transactions
            const transactions = AppState.getState('wallet.transactions');
            transactions.set(debitTransaction.id, debitTransaction);
            transactions.set(creditTransaction.id, creditTransaction);

            // Update state
            AppState.setState({
                'wallet.balances': newBalances,
                'wallet.transactions': transactions
            });

            // Close modal and show success
            Components.closeModal();
            
            Components.showNotification({
                type: 'success',
                title: 'Conversion Successful',
                message: `Successfully converted ${this.formatCurrency(amount, fromCurrency)} to ${this.formatCurrency(conversion.toAmount, toCurrency)}.`,
                duration: 5000
            });

            // Update conversion history in main interface
            this.updateConversionHistory();

        } catch (error) {
            console.error('Conversion failed:', error);
            Components.showNotification({
                type: 'error',
                title: 'Conversion Failed',
                message: 'An error occurred during the conversion. Please try again.',
                duration: 5000
            });
        }
    }

    /**
     * Update conversion history display
     */
    updateConversionHistory() {
        // This will trigger the transaction history update through state subscription
        this.loadTransactionHistory();
    }

    /**
     * Filter transactions based on selected filters
     */
    filterTransactions() {
        const typeFilter = Utils.DOM.select('#transactionTypeFilter')?.value;
        const currencyFilter = Utils.DOM.select('#transactionCurrencyFilter')?.value;
        
        let transactions = Array.from(AppState.getState('wallet.transactions').values());

        // Apply filters
        if (typeFilter && typeFilter !== 'all') {
            transactions = transactions.filter(tx => tx.type === typeFilter);
        }

        if (currencyFilter && currencyFilter !== 'all') {
            transactions = transactions.filter(tx => tx.currency === currencyFilter);
        }

        // Sort by date (newest first)
        transactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Update display
        const transactionList = Utils.DOM.select('#transactionList');
        if (transactionList) {
            Utils.DOM.empty(transactionList);

            if (transactions.length === 0) {
                const emptyState = Utils.DOM.create('div', {
                    className: 'empty-state'
                });

                emptyState.innerHTML = `
                    <div class="empty-state-icon">🔍</div>
                    <h4 class="empty-state-title">No Matching Transactions</h4>
                    <p class="empty-state-message">No transactions match your current filter criteria.</p>
                `;

                transactionList.appendChild(emptyState);
                return;
            }

            transactions.forEach(transaction => {
                const transactionItem = this.createTransactionItem(transaction);
                transactionList.appendChild(transactionItem);
            });
        }
    }

    /**
     * Update transaction history display
     */
    updateTransactionHistory() {
        this.loadTransactionHistory();
    }

    /**
     * Process deposit
     */
    async processDeposit() {
        const currency = Utils.DOM.select('#depositCurrency')?.value;
        const amount = parseFloat(Utils.DOM.select('#depositAmount')?.value);
        const paymentMethodId = Utils.DOM.select('#depositPaymentMethod')?.value;

        // Validation
        if (!currency || !amount || amount <= 0) {
            Components.showNotification({
                type: 'error',
                title: 'Invalid Input',
                message: 'Please enter a valid amount greater than 0.',
                duration: 3000
            });
            return;
        }

        if (!paymentMethodId) {
            Components.showNotification({
                type: 'error',
                title: 'Payment Method Required',
                message: 'Please select a payment method.',
                duration: 3000
            });
            return;
        }

        try {
            // Close modal
            Components.closeModal();

            // Show processing notification
            Components.showNotification({
                type: 'info',
                title: 'Processing Deposit',
                message: 'Your deposit is being processed...',
                duration: 2000
            });

            // Simulate processing delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Update balance
            const currentBalances = AppState.getState('wallet.balances');
            const newBalances = { ...currentBalances };
            newBalances[currency] += amount;

            AppState.setState('wallet.balances', newBalances);

            // Create transaction record
            const transaction = {
                id: `tx_${Date.now()}`,
                type: 'deposit',
                amount: amount,
                currency: currency,
                status: 'completed',
                description: `Deposit via ${this.getPaymentMethodName(paymentMethodId)}`,
                paymentMethodId: paymentMethodId,
                createdAt: new Date().toISOString(),
                completedAt: new Date().toISOString()
            };

            // Add transaction to state
            const transactions = AppState.getState('wallet.transactions');
            transactions.set(transaction.id, transaction);
            AppState.setState('wallet.transactions', transactions);

            // Show success notification
            Components.showNotification({
                type: 'success',
                title: 'Deposit Successful',
                message: `Successfully deposited ${this.formatCurrency(amount, currency)} to your wallet.`,
                duration: 4000
            });

            // Update transaction history display
            this.loadTransactionHistory();

        } catch (error) {
            console.error('Deposit processing failed:', error);
            Components.showNotification({
                type: 'error',
                title: 'Deposit Failed',
                message: 'Failed to process deposit. Please try again.',
                duration: 4000
            });
        }
    }

    /**
     * Complete withdrawal modal implementation
     */
    completeWithdrawModal() {
        const balances = AppState.getState('wallet.balances');
        
        const modalContent = Utils.DOM.create('div', {
            className: 'withdraw-modal'
        });

        modalContent.innerHTML = `
            <div class="withdraw-form">
                <div class="form-group">
                    <label class="form-label">Currency</label>
                    <select class="form-input" id="withdrawCurrency" onchange="window.walletManager.updateWithdrawLimits()">
                        <option value="usd" ${balances.usd > 0 ? '' : 'disabled'}>💵 US Dollar (${this.formatCurrency(balances.usd, 'usd')} available)</option>
                        <option value="toman" ${balances.toman > 0 ? '' : 'disabled'}>﷼ Iranian Toman (${this.formatCurrency(balances.toman, 'toman')} available)</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Amount</label>
                    <input type="number" class="form-input" id="withdrawAmount" placeholder="0.00" min="1" step="any">
                    <small class="form-help" id="withdrawLimits">Minimum withdrawal: $10 USD or 500,000 Toman</small>
                </div>
                <div class="form-group">
                    <label class="form-label">Withdrawal Method</label>
                    <select class="form-input" id="withdrawPaymentMethod">
                        <option value="">Select payment method...</option>
                    </select>
                    <button type="button" class="btn-link" onclick="walletManager.showPaymentMethodModal()">+ Add New Payment Method</button>
                </div>
                <div class="withdraw-info">
                    <p><strong>Note:</strong> Withdrawal requests require admin approval and may take 1-3 business days to process. A small processing fee may apply.</p>
                </div>
            </div>
        `;

        // Populate payment methods
        this.populateWithdrawalPaymentMethods();

        Components.showModal({
            title: '💸 Withdraw Funds',
            content: modalContent,
            size: 'medium',
            footer: [
                Components.createButton({
                    text: 'Cancel',
                    variant: 'secondary',
                    onClick: () => Components.closeModal()
                }),
                Components.createButton({
                    text: 'Request Withdrawal',
                    variant: 'warning',
                    onClick: () => this.processWithdrawal()
                })
            ]
        });
    }

    /**
     * Update withdrawal limits based on selected currency
     */
    updateWithdrawLimits() {
        const currency = Utils.DOM.select('#withdrawCurrency')?.value;
        const limitsEl = Utils.DOM.select('#withdrawLimits');
        
        if (!limitsEl || !currency) return;

        const limits = {
            usd: 'Minimum withdrawal: $10 USD',
            toman: 'Minimum withdrawal: 500,000 Toman'
        };

        limitsEl.textContent = limits[currency] || 'Select currency to see limits';
    }

    /**
     * Populate withdrawal payment methods
     */
    populateWithdrawalPaymentMethods() {
        const select = Utils.DOM.select('#withdrawPaymentMethod');
        if (!select) return;

        const paymentMethods = Array.from(AppState.getState('wallet.paymentMethods').values());
        
        // Clear existing options except first
        while (select.children.length > 1) {
            select.removeChild(select.lastChild);
        }

        paymentMethods.forEach(method => {
            if (method.isVerified) {
                const option = Utils.DOM.create('option', {
                    value: method.id
                }, this.getPaymentMethodDisplayName(method));
                select.appendChild(option);
            }
        });

        if (paymentMethods.filter(m => m.isVerified).length === 0) {
            const option = Utils.DOM.create('option', {
                value: '',
                disabled: true
            }, 'No verified payment methods available');
            select.appendChild(option);
        }
    }

    /**
     * Process withdrawal request
     */
    async processWithdrawal() {
        const currency = Utils.DOM.select('#withdrawCurrency')?.value;
        const amount = parseFloat(Utils.DOM.select('#withdrawAmount')?.value);
        const paymentMethodId = Utils.DOM.select('#withdrawPaymentMethod')?.value;

        // Validation
        if (!currency || !amount || amount <= 0) {
            Components.showNotification({
                type: 'error',
                title: 'Invalid Input',
                message: 'Please enter a valid amount greater than 0.',
                duration: 3000
            });
            return;
        }

        // Check minimum withdrawal amounts
        const minimums = { usd: 10, toman: 500000 };
        if (amount < minimums[currency]) {
            Components.showNotification({
                type: 'error',
                title: 'Amount Too Low',
                message: `Minimum withdrawal is ${this.formatCurrency(minimums[currency], currency)}.`,
                duration: 3000
            });
            return;
        }

        if (!paymentMethodId) {
            Components.showNotification({
                type: 'error',
                title: 'Payment Method Required',
                message: 'Please select a payment method.',
                duration: 3000
            });
            return;
        }

        // Check sufficient balance
        const currentBalances = AppState.getState('wallet.balances');
        if (currentBalances[currency] < amount) {
            Components.showNotification({
                type: 'error',
                title: 'Insufficient Balance',
                message: `You only have ${this.formatCurrency(currentBalances[currency], currency)} available.`,
                duration: 3000
            });
            return;
        }

        try {
            // Close modal
            Components.closeModal();

            // Show processing notification
            Components.showNotification({
                type: 'info',
                title: 'Processing Withdrawal Request',
                message: 'Your withdrawal request is being submitted...',
                duration: 2000
            });

            // Simulate processing delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Create withdrawal transaction (pending status)
            const transaction = {
                id: `tx_${Date.now()}`,
                type: 'withdrawal',
                amount: -amount, // Negative for withdrawal
                currency: currency,
                status: 'pending',
                description: `Withdrawal request to ${this.getPaymentMethodName(paymentMethodId)}`,
                paymentMethodId: paymentMethodId,
                createdAt: new Date().toISOString(),
                completedAt: null,
                adminNotes: null
            };

            // Add transaction to state
            const transactions = AppState.getState('wallet.transactions');
            transactions.set(transaction.id, transaction);
            AppState.setState('wallet.transactions', transactions);

            // Show success notification
            Components.showNotification({
                type: 'success',
                title: 'Withdrawal Request Submitted',
                message: `Withdrawal request for ${this.formatCurrency(amount, currency)} has been submitted for admin approval.`,
                duration: 5000
            });

            // Update transaction history display
            this.loadTransactionHistory();

        } catch (error) {
            console.error('Withdrawal request failed:', error);
            Components.showNotification({
                type: 'error',
                title: 'Withdrawal Request Failed',
                message: 'Failed to submit withdrawal request. Please try again.',
                duration: 4000
            });
        }
    }

    /**
     * Show payment method management modal
     */
    showPaymentMethodModal() {
        const modalContent = Utils.DOM.create('div', {
            className: 'payment-method-modal'
        });

        modalContent.innerHTML = `
            <div class="payment-method-form">
                <div class="form-group">
                    <label class="form-label">Payment Method Type</label>
                    <select class="form-input" id="paymentMethodType" onchange="window.walletManager.updatePaymentMethodFields()">
                        <option value="">Select type...</option>
                        <option value="credit_card">💳 Credit Card</option>
                        <option value="paypal">🅿️ PayPal</option>
                        <option value="bank_account">🏦 Bank Account</option>
                        <option value="crypto">₿ Cryptocurrency</option>
                    </select>
                </div>
                <div id="paymentMethodFields">
                    <p class="form-help">Select a payment method type to continue.</p>
                </div>
            </div>
        `;

        Components.showModal({
            title: '💳 Add Payment Method',
            content: modalContent,
            size: 'medium',
            footer: [
                Components.createButton({
                    text: 'Cancel',
                    variant: 'secondary',
                    onClick: () => Components.closeModal()
                }),
                Components.createButton({
                    text: 'Add Payment Method',
                    variant: 'primary',
                    onClick: () => this.addPaymentMethod()
                })
            ]
        });
    }

    /**
     * Update payment method fields based on selected type
     */
    updatePaymentMethodFields() {
        const type = Utils.DOM.select('#paymentMethodType')?.value;
        const fieldsContainer = Utils.DOM.select('#paymentMethodFields');
        
        if (!fieldsContainer || !type) return;

        let fieldsHTML = '';

        switch (type) {
            case 'credit_card':
                fieldsHTML = `
                    <div class="form-group">
                        <label class="form-label">Card Number</label>
                        <input type="text" class="form-input" id="cardNumber" placeholder="1234 5678 9012 3456" maxlength="19">
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Expiry Month</label>
                            <select class="form-input" id="expiryMonth">
                                ${Array.from({length: 12}, (_, i) => `<option value="${i + 1}">${String(i + 1).padStart(2, '0')}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Expiry Year</label>
                            <select class="form-input" id="expiryYear">
                                ${Array.from({length: 10}, (_, i) => {
                                    const year = new Date().getFullYear() + i;
                                    return `<option value="${year}">${year}</option>`;
                                }).join('')}
                            </select>
                        </div>
                    </div>
                `;
                break;
            case 'paypal':
                fieldsHTML = `
                    <div class="form-group">
                        <label class="form-label">PayPal Email</label>
                        <input type="email" class="form-input" id="paypalEmail" placeholder="your@email.com">
                    </div>
                `;
                break;
            case 'bank_account':
                fieldsHTML = `
                    <div class="form-group">
                        <label class="form-label">Bank Name</label>
                        <input type="text" class="form-input" id="bankName" placeholder="Bank Name">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Account Number</label>
                        <input type="text" class="form-input" id="accountNumber" placeholder="Account Number">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Routing Number</label>
                        <input type="text" class="form-input" id="routingNumber" placeholder="Routing Number">
                    </div>
                `;
                break;
            case 'crypto':
                fieldsHTML = `
                    <div class="form-group">
                        <label class="form-label">Cryptocurrency</label>
                        <select class="form-input" id="cryptoType">
                            <option value="bitcoin">₿ Bitcoin</option>
                            <option value="ethereum">Ξ Ethereum</option>
                            <option value="usdt">₮ USDT</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Wallet Address</label>
                        <input type="text" class="form-input" id="walletAddress" placeholder="Wallet Address">
                    </div>
                `;
                break;
        }

        fieldsContainer.innerHTML = fieldsHTML;
    }

    /**
     * Add new payment method
     */
    async addPaymentMethod() {
        const type = Utils.DOM.select('#paymentMethodType')?.value;
        
        if (!type) {
            Components.showNotification({
                type: 'error',
                title: 'Invalid Input',
                message: 'Please select a payment method type.',
                duration: 3000
            });
            return;
        }

        let paymentMethodData = {
            id: `pm_${Date.now()}`,
            type: type,
            isDefault: false,
            isVerified: false, // Would require verification in real system
            addedAt: new Date().toISOString()
        };

        // Collect type-specific data
        switch (type) {
            case 'credit_card':
                const cardNumber = Utils.DOM.select('#cardNumber')?.value;
                const expiryMonth = Utils.DOM.select('#expiryMonth')?.value;
                const expiryYear = Utils.DOM.select('#expiryYear')?.value;
                
                if (!cardNumber || cardNumber.length < 16) {
                    Components.showNotification({
                        type: 'error',
                        title: 'Invalid Card Number',
                        message: 'Please enter a valid card number.',
                        duration: 3000
                    });
                    return;
                }
                
                paymentMethodData = {
                    ...paymentMethodData,
                    provider: 'visa', // Would detect from card number
                    lastFour: cardNumber.slice(-4),
                    expiryMonth: parseInt(expiryMonth),
                    expiryYear: parseInt(expiryYear)
                };
                break;
                
            case 'paypal':
                const email = Utils.DOM.select('#paypalEmail')?.value;
                if (!email || !email.includes('@')) {
                    Components.showNotification({
                        type: 'error',
                        title: 'Invalid Email',
                        message: 'Please enter a valid PayPal email.',
                        duration: 3000
                    });
                    return;
                }
                
                paymentMethodData = {
                    ...paymentMethodData,
                    provider: 'paypal',
                    email: email
                };
                break;
                
            case 'bank_account':
                const bankName = Utils.DOM.select('#bankName')?.value;
                const accountNumber = Utils.DOM.select('#accountNumber')?.value;
                const routingNumber = Utils.DOM.select('#routingNumber')?.value;
                
                if (!bankName || !accountNumber || !routingNumber) {
                    Components.showNotification({
                        type: 'error',
                        title: 'Missing Information',
                        message: 'Please fill in all bank account fields.',
                        duration: 3000
                    });
                    return;
                }
                
                paymentMethodData = {
                    ...paymentMethodData,
                    provider: 'bank_transfer',
                    bankName: bankName,
                    accountNumber: `****${accountNumber.slice(-4)}`,
                    routingNumber: routingNumber
                };
                break;
                
            case 'crypto':
                const cryptoType = Utils.DOM.select('#cryptoType')?.value;
                const walletAddress = Utils.DOM.select('#walletAddress')?.value;
                
                if (!walletAddress || walletAddress.length < 20) {
                    Components.showNotification({
                        type: 'error',
                        title: 'Invalid Wallet Address',
                        message: 'Please enter a valid wallet address.',
                        duration: 3000
                    });
                    return;
                }
                
                paymentMethodData = {
                    ...paymentMethodData,
                    provider: cryptoType,
                    walletAddress: walletAddress
                };
                break;
        }

        try {
            // Close modal
            Components.closeModal();

            // Show processing notification
            Components.showNotification({
                type: 'info',
                title: 'Adding Payment Method',
                message: 'Your payment method is being added...',
                duration: 2000
            });

            // Simulate processing delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // In real system, would verify payment method
            paymentMethodData.isVerified = true; // Auto-verify for demo

            // Add to state
            const paymentMethods = AppState.getState('wallet.paymentMethods');
            paymentMethods.set(paymentMethodData.id, paymentMethodData);
            AppState.setState('wallet.paymentMethods', paymentMethods);

            // Show success notification
            Components.showNotification({
                type: 'success',
                title: 'Payment Method Added',
                message: 'Your payment method has been added and verified.',
                duration: 4000
            });

            // Refresh payment method dropdowns if they exist
            this.populateWithdrawalPaymentMethods();

        } catch (error) {
            console.error('Failed to add payment method:', error);
            Components.showNotification({
                type: 'error',
                title: 'Failed to Add Payment Method',
                message: 'Failed to add payment method. Please try again.',
                duration: 4000
            });
        }
    }

    /**
     * Get payment method name for display
     * @param {string} paymentMethodId - Payment method ID
     * @returns {string} Display name
     */
    getPaymentMethodName(paymentMethodId) {
        const paymentMethods = AppState.getState('wallet.paymentMethods');
        const method = paymentMethods.get(paymentMethodId);
        
        if (!method) return 'Unknown Payment Method';
        
        switch (method.type) {
            case 'credit_card':
                return `Credit Card ending in ${method.lastFour}`;
            case 'paypal':
                return `PayPal (${method.email})`;
            case 'bank_account':
                return `${method.bankName} ${method.accountNumber}`;
            case 'crypto':
                return `${method.provider.toUpperCase()} Wallet`;
            default:
                return method.type;
        }
    }

    /**
     * Get payment method display name for dropdown
     * @param {Object} method - Payment method object
     * @returns {string} Display name
     */
    getPaymentMethodDisplayName(method) {
        switch (method.type) {
            case 'credit_card':
                return `💳 ${method.provider.toUpperCase()} ****${method.lastFour}`;
            case 'paypal':
                return `🅿️ PayPal (${method.email})`;
            case 'bank_account':
                return `🏦 ${method.bankName} ${method.accountNumber}`;
            case 'crypto':
                return `₿ ${method.provider.toUpperCase()} Wallet`;
            default:
                return method.type;
        }
    }

    /**
     * Show withdrawal status tracking
     */
    showWithdrawalStatus() {
        const transactions = Array.from(AppState.getState('wallet.transactions').values());
        const withdrawals = transactions.filter(tx => tx.type === 'withdrawal');
        
        const modalContent = Utils.DOM.create('div', {
            className: 'withdrawal-status-modal'
        });

        if (withdrawals.length === 0) {
            modalContent.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">💸</div>
                    <h4 class="empty-state-title">No Withdrawal Requests</h4>
                    <p class="empty-state-message">You haven't made any withdrawal requests yet.</p>
                </div>
            `;
        } else {
            const withdrawalList = Utils.DOM.create('div', {
                className: 'withdrawal-list'
            });

            withdrawals.forEach(withdrawal => {
                const item = Utils.DOM.create('div', {
                    className: `withdrawal-item withdrawal-${withdrawal.status}`
                });

                const statusIcon = {
                    pending: '⏳',
                    approved: '✅',
                    rejected: '❌',
                    completed: '💰'
                }[withdrawal.status] || '📋';

                item.innerHTML = `
                    <div class="withdrawal-header">
                        <span class="withdrawal-status-icon">${statusIcon}</span>
                        <span class="withdrawal-amount">${this.formatCurrency(Math.abs(withdrawal.amount), withdrawal.currency)}</span>
                        <span class="withdrawal-date">${Utils.Format.timeAgo(withdrawal.createdAt)}</span>
                    </div>
                    <div class="withdrawal-details">
                        <p class="withdrawal-description">${withdrawal.description}</p>
                        <div class="withdrawal-status-badge">
                            ${Components.createStatusBadge({
                                status: withdrawal.status,
                                text: withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)
                            }).outerHTML}
                        </div>
                    </div>
                    ${withdrawal.adminNotes ? `<div class="withdrawal-notes">Admin Notes: ${withdrawal.adminNotes}</div>` : ''}
                `;

                withdrawalList.appendChild(item);
            });

            modalContent.appendChild(withdrawalList);
        }

        Components.showModal({
            title: '💸 Withdrawal Status',
            content: modalContent,
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
     * Filter transactions by type and currency
     */
    filterTransactions() {
        const typeFilter = Utils.DOM.select('#transactionTypeFilter')?.value || 'all';
        const currencyFilter = Utils.DOM.select('#transactionCurrencyFilter')?.value || 'all';
        
        const allTransactions = Array.from(AppState.getState('wallet.transactions').values());
        
        let filteredTransactions = allTransactions;
        
        // Filter by type
        if (typeFilter !== 'all') {
            filteredTransactions = filteredTransactions.filter(tx => tx.type === typeFilter);
        }
        
        // Filter by currency
        if (currencyFilter !== 'all') {
            filteredTransactions = filteredTransactions.filter(tx => tx.currency === currencyFilter);
        }
        
        // Sort by date (newest first)
        filteredTransactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        // Update display
        const transactionList = Utils.DOM.select('#transactionList');
        if (!transactionList) return;
        
        Utils.DOM.empty(transactionList);
        
        if (filteredTransactions.length === 0) {
            const emptyState = Utils.DOM.create('div', {
                className: 'empty-state'
            });

            emptyState.innerHTML = `
                <div class="empty-state-icon">🔍</div>
                <h4 class="empty-state-title">No Matching Transactions</h4>
                <p class="empty-state-message">No transactions match your current filter criteria.</p>
            `;

            transactionList.appendChild(emptyState);
            return;
        }

        filteredTransactions.forEach(transaction => {
            const transactionItem = this.createTransactionItem(transaction);
            transactionList.appendChild(transactionItem);
        });
    }
}

// Create global wallet manager instance
const walletManager = new WalletManager();

// Export for use in other modules
window.WalletManager = WalletManager;
window.walletManager = walletManager;