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
     * Show currency conversion modal
     */
    showConvertModal() {
        const modalContent = Utils.DOM.create('div', {
            className: 'convert-modal'
        });

        modalContent.innerHTML = `
            <div class="convert-form">
                <div class="conversion-row">
                    <div class="form-group">
                        <label class="form-label">From Currency</label>
                        <select class="form-input" id="convertFromCurrency" onchange="window.walletManager.updateConvertPreview()">
                            <option value="gold">🪙 Gold</option>
                            <option value="usd">💵 US Dollar</option>
                            <option value="toman">﷼ Iranian Toman</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Amount</label>
                        <input type="number" class="form-input" id="convertAmount" placeholder="0.00" min="0" step="any" oninput="window.walletManager.updateConvertPreview()">
                    </div>
                </div>
                
                <div class="conversion-arrow">⬇️</div>
                
                <div class="conversion-row">
                    <div class="form-group">
                        <label class="form-label">To Currency</label>
                        <select class="form-input" id="convertToCurrency" onchange="window.walletManager.updateConvertPreview()">
                            <option value="usd">💵 US Dollar</option>
                            <option value="gold">🪙 Gold</option>
                            <option value="toman">﷼ Iranian Toman</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">You'll Receive</label>
                        <div class="form-input readonly" id="convertResult">0.00</div>
                    </div>
                </div>
                
                <div class="conversion-details" id="conversionDetails">
                    <div class="detail-row">
                        <span>Exchange Rate:</span>
                        <span id="conversionRate">-</span>
                    </div>
                    <div class="detail-row">
                        <span>Conversion Fee (2%):</span>
                        <span id="conversionFee">-</span>
                    </div>
                </div>
            </div>
        `;

        Components.showModal({
            title: '🔄 Convert Currency',
            content: modalContent,
            size: 'medium',
            footer: [
                Components.createButton({
                    text: 'Cancel',
                    variant: 'secondary',
                    onClick: () => Components.closeModal()
                }),
                Components.createButton({
                    text: 'Convert',
                    variant: 'info',
                    onClick: () => this.processConversion()
                })
            ]
        });

        // Set reference and initialize
        window.walletManager = this;
        setTimeout(() => this.updateConvertPreview(), 100);
    } 
   /**
     * Update conversion preview in modal
     */
    updateConvertPreview() {
        const fromCurrency = Utils.DOM.select('#convertFromCurrency')?.value;
        const toCurrency = Utils.DOM.select('#convertToCurrency')?.value;
        const amount = parseFloat(Utils.DOM.select('#convertAmount')?.value) || 0;
        
        const resultEl = Utils.DOM.select('#convertResult');
        const rateEl = Utils.DOM.select('#conversionRate');
        const feeEl = Utils.DOM.select('#conversionFee');

        if (!fromCurrency || !toCurrency || !resultEl) return;

        if (amount <= 0) {
            resultEl.textContent = '0.00';
            rateEl.textContent = '-';
            feeEl.textContent = '-';
            return;
        }

        const conversion = this.calculateConversion(amount, fromCurrency, toCurrency);
        
        resultEl.textContent = this.formatCurrency(conversion.toAmount, toCurrency);
        rateEl.textContent = `1 ${fromCurrency.toUpperCase()} = ${conversion.exchangeRate} ${toCurrency.toUpperCase()}`;
        feeEl.textContent = this.formatCurrency(conversion.fee, fromCurrency);
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
     * Process currency conversion
     */
    processConversion() {
        const fromCurrency = Utils.DOM.select('#convertFromCurrency')?.value;
        const toCurrency = Utils.DOM.select('#convertToCurrency')?.value;
        const amount = parseFloat(Utils.DOM.select('#convertAmount')?.value);

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

        const conversion = this.calculateConversion(amount, fromCurrency, toCurrency);

        // Create conversion transactions
        const debitTransaction = {
            id: 'tx_' + Date.now() + '_debit',
            type: 'conversion',
            amount: -(amount + conversion.fee),
            currency: fromCurrency,
            status: 'completed',
            description: `Converted ${this.formatCurrency(amount, fromCurrency)} to ${toCurrency.toUpperCase()}`,
            conversionDetails: conversion,
            createdAt: new Date().toISOString(),
            completedAt: new Date().toISOString()
        };

        const creditTransaction = {
            id: 'tx_' + Date.now() + '_credit',
            type: 'conversion',
            amount: conversion.toAmount,
            currency: toCurrency,
            status: 'completed',
            description: `Received ${this.formatCurrency(conversion.toAmount, toCurrency)} from ${fromCurrency.toUpperCase()} conversion`,
            conversionDetails: conversion,
            createdAt: new Date().toISOString(),
            completedAt: new Date().toISOString()
        };

        // Update balances
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

        Components.closeModal();
        Components.showNotification({
            type: 'success',
            title: 'Conversion Successful',
            message: `Successfully converted ${this.formatCurrency(amount, fromCurrency)} to ${this.formatCurrency(conversion.toAmount, toCurrency)}.`
        });

        // Refresh transaction history
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
}

// Create global wallet manager instance
const walletManager = new WalletManager();

// Export for use in other modules
window.WalletManager = WalletManager;
window.walletManager = walletManager;