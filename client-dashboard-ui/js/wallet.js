// Wallet management functionality

// Initialize wallet functionality
function initializeWallet() {
    updateWalletDisplay();
    setupWalletEventListeners();
}

// Update wallet balance display in header and pages
function updateWalletDisplay() {
    const walletData = window.mockData?.walletData || {
        balances: { gold: 1500.50, usd: 250.00, toman: 5000000 }
    };
    
    // Update header wallet summary
    updateHeaderWalletDisplay(walletData.balances);
    
    // Update dashboard balance cards if they exist
    updateDashboardBalanceCards(walletData.balances);
}

function updateHeaderWalletDisplay(balances) {
    const goldElement = document.getElementById('headerGoldBalance');
    const usdElement = document.getElementById('headerUsdBalance');
    const tomanElement = document.getElementById('headerTomanBalance');
    
    if (goldElement) {
        goldElement.textContent = formatCurrency(balances.gold, 'gold');
    }
    
    if (usdElement) {
        usdElement.textContent = formatCurrency(balances.usd, 'usd');
    }
    
    if (tomanElement) {
        tomanElement.textContent = formatCurrency(balances.toman, 'toman');
    }
}

function updateDashboardBalanceCards(balances) {
    // Update balance cards on dashboard
    const balanceCards = document.querySelectorAll('.balance-card');
    
    balanceCards.forEach(card => {
        const balanceElement = card.querySelector('.balance');
        
        if (card.classList.contains('gold') && balanceElement) {
            balanceElement.textContent = formatCurrency(balances.gold, 'gold');
        } else if (card.classList.contains('usd') && balanceElement) {
            balanceElement.textContent = formatCurrency(balances.usd, 'usd');
        } else if (card.classList.contains('toman') && balanceElement) {
            balanceElement.textContent = formatCurrency(balances.toman, 'toman');
        }
    });
}

function setupWalletEventListeners() {
    // Add event listeners for wallet-related buttons
    document.addEventListener('click', function(e) {
        if (e.target.matches('.deposit-btn, .btn:contains("Deposit")')) {
            handleDepositClick();
        } else if (e.target.matches('.withdraw-btn, .btn:contains("Withdraw")')) {
            handleWithdrawClick();
        } else if (e.target.matches('.convert-btn, .btn:contains("Convert")')) {
            handleConvertClick();
        }
    });
}

function handleDepositClick() {
    showDepositModal();
}

function handleWithdrawClick() {
    showWithdrawModal();
}

function handleConvertClick() {
    showConvertModal();
}

function showDepositModal() {
    const modalHTML = `
        <div class="modal-backdrop" id="depositModal">
            <div class="modal">
                <div class="modal-header">
                    <h3 class="modal-title">Deposit Funds</h3>
                    <button class="modal-close" onclick="closeModal('depositModal')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="deposit-form">
                        <div class="form-group">
                            <label class="form-label">Currency</label>
                            <select class="form-input" id="depositCurrency">
                                <option value="usd">USD ($)</option>
                                <option value="gold">Gold (G)</option>
                                <option value="toman">Toman (﷼)</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Amount</label>
                            <input type="number" class="form-input" id="depositAmount" placeholder="Enter amount" min="1">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Payment Method</label>
                            <div class="payment-methods">
                                <div class="payment-method" data-method="credit_card">
                                    <i class="fas fa-credit-card"></i>
                                    <div class="method-info">
                                        <h4>Credit Card</h4>
                                        <p>Visa, Mastercard - Instant</p>
                                    </div>
                                </div>
                                <div class="payment-method" data-method="crypto">
                                    <i class="fab fa-bitcoin"></i>
                                    <div class="method-info">
                                        <h4>Cryptocurrency</h4>
                                        <p>Bitcoin, Ethereum - 5-30 min</p>
                                    </div>
                                </div>
                                <div class="payment-method" data-method="iranian_bank">
                                    <i class="fas fa-university"></i>
                                    <div class="method-info">
                                        <h4>Iranian Bank Card</h4>
                                        <p>Local banks - Instant</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="deposit-summary" style="display: none;">
                            <div class="summary-item">
                                <span>Amount:</span>
                                <span id="summaryAmount">-</span>
                            </div>
                            <div class="summary-item">
                                <span>Processing Fee:</span>
                                <span id="summaryFee">Free</span>
                            </div>
                            <div class="summary-item total">
                                <span>Total:</span>
                                <span id="summaryTotal">-</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" onclick="closeModal('depositModal')">Cancel</button>
                    <button class="btn btn-success" id="confirmDeposit" disabled>
                        <i class="fas fa-plus"></i>
                        Deposit Funds
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    setupDepositModalEvents();
}

function setupDepositModalEvents() {
    const currencySelect = document.getElementById('depositCurrency');
    const amountInput = document.getElementById('depositAmount');
    const confirmBtn = document.getElementById('confirmDeposit');
    const paymentMethods = document.querySelectorAll('.payment-method');
    
    let selectedMethod = null;
    
    // Payment method selection
    paymentMethods.forEach(method => {
        method.addEventListener('click', function() {
            paymentMethods.forEach(m => m.classList.remove('selected'));
            this.classList.add('selected');
            selectedMethod = this.dataset.method;
            updateDepositSummary();
        });
    });
    
    // Amount input validation
    amountInput.addEventListener('input', updateDepositSummary);
    currencySelect.addEventListener('change', updateDepositSummary);
    
    function updateDepositSummary() {
        const amount = parseFloat(amountInput.value);
        const currency = currencySelect.value;
        
        if (amount > 0 && selectedMethod) {
            confirmBtn.disabled = false;
            showDepositSummary(amount, currency, selectedMethod);
        } else {
            confirmBtn.disabled = true;
            document.querySelector('.deposit-summary').style.display = 'none';
        }
    }
    
    // Confirm deposit
    confirmBtn.addEventListener('click', function() {
        const amount = parseFloat(amountInput.value);
        const currency = currencySelect.value;
        
        processDeposit(amount, currency, selectedMethod);
    });
}

function showDepositSummary(amount, currency, method) {
    const summaryDiv = document.querySelector('.deposit-summary');
    const amountSpan = document.getElementById('summaryAmount');
    const feeSpan = document.getElementById('summaryFee');
    const totalSpan = document.getElementById('summaryTotal');
    
    const formattedAmount = formatCurrency(amount, currency);
    let fee = 0;
    
    // Calculate fees based on payment method
    if (method === 'credit_card') {
        fee = amount * 0.029 + (currency === 'usd' ? 0.30 : 0);
    } else if (method === 'crypto') {
        fee = amount * 0.015;
    }
    
    const total = amount + fee;
    
    amountSpan.textContent = formattedAmount;
    feeSpan.textContent = fee > 0 ? formatCurrency(fee, currency) : 'Free';
    totalSpan.textContent = formatCurrency(total, currency);
    
    summaryDiv.style.display = 'block';
}

function processDeposit(amount, currency, method) {
    const confirmBtn = document.getElementById('confirmDeposit');
    const originalText = confirmBtn.innerHTML;
    
    // Show loading state
    confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    confirmBtn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        // Update wallet balance
        const walletData = window.mockData.walletData;
        walletData.balances[currency] += amount;
        
        // Update display
        updateWalletDisplay();
        
        // Close modal
        closeModal('depositModal');
        
        // Show success message
        showToast(`Successfully deposited ${formatCurrency(amount, currency)}!`, 'success');
        
        // Add transaction to history
        addTransaction({
            type: 'deposit',
            method: method,
            amount: amount,
            currency: currency,
            status: 'completed',
            description: `Deposit via ${getPaymentMethodName(method)}`
        });
        
    }, 2000);
}

function showWithdrawModal() {
    const modalHTML = `
        <div class="modal-backdrop" id="withdrawModal">
            <div class="modal">
                <div class="modal-header">
                    <h3 class="modal-title">Withdraw Funds</h3>
                    <button class="modal-close" onclick="closeModal('withdrawModal')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="admin-notice">
                        <i class="fas fa-exclamation-triangle"></i>
                        <div>
                            <h4>Admin Approval Required</h4>
                            <p>All withdrawal requests require admin approval for security purposes. Processing time: 1-3 business days.</p>
                        </div>
                    </div>
                    
                    <div class="withdraw-form">
                        <div class="form-group">
                            <label class="form-label">Currency</label>
                            <select class="form-input" id="withdrawCurrency">
                                <option value="usd">USD ($) - Available: $250.00</option>
                                <option value="gold">Gold (G) - Available: 1,500.50 G</option>
                                <option value="toman">Toman (﷼) - Available: 5,000,000﷼</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Amount</label>
                            <input type="number" class="form-input" id="withdrawAmount" placeholder="Enter amount" min="1">
                            <small class="form-help">Minimum withdrawal: $10 USD equivalent</small>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Withdrawal Method</label>
                            <select class="form-input" id="withdrawMethod">
                                <option value="">Select withdrawal method</option>
                                <option value="bank_transfer">Bank Transfer</option>
                                <option value="crypto_wallet">Crypto Wallet</option>
                                <option value="iranian_bank">Iranian Bank Account</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Notes (Optional)</label>
                            <textarea class="form-input" id="withdrawNotes" placeholder="Any special instructions..." rows="3"></textarea>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" onclick="closeModal('withdrawModal')">Cancel</button>
                    <button class="btn btn-warning" id="confirmWithdraw" disabled>
                        <i class="fas fa-clock"></i>
                        Submit for Approval
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    setupWithdrawModalEvents();
}

function setupWithdrawModalEvents() {
    const amountInput = document.getElementById('withdrawAmount');
    const currencySelect = document.getElementById('withdrawCurrency');
    const methodSelect = document.getElementById('withdrawMethod');
    const confirmBtn = document.getElementById('confirmWithdraw');
    
    function validateWithdraw() {
        const amount = parseFloat(amountInput.value);
        const method = methodSelect.value;
        
        confirmBtn.disabled = !(amount > 0 && method);
    }
    
    amountInput.addEventListener('input', validateWithdraw);
    methodSelect.addEventListener('change', validateWithdraw);
    
    confirmBtn.addEventListener('click', function() {
        const amount = parseFloat(amountInput.value);
        const currency = currencySelect.value;
        const method = methodSelect.value;
        const notes = document.getElementById('withdrawNotes').value;
        
        processWithdraw(amount, currency, method, notes);
    });
}

function processWithdraw(amount, currency, method, notes) {
    const confirmBtn = document.getElementById('confirmWithdraw');
    
    // Show loading state
    confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    confirmBtn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        // Close modal
        closeModal('withdrawModal');
        
        // Show success message
        showToast('Withdrawal request submitted for admin approval!', 'info');
        
        // Add transaction to history
        addTransaction({
            type: 'withdrawal',
            method: method,
            amount: amount,
            currency: currency,
            status: 'pending',
            description: `Withdrawal via ${getPaymentMethodName(method)}`,
            adminNote: 'Awaiting admin approval'
        });
        
    }, 1500);
}

function showConvertModal() {
    const modalHTML = `
        <div class="modal-backdrop" id="convertModal">
            <div class="modal">
                <div class="modal-header">
                    <h3 class="modal-title">Convert Currency</h3>
                    <button class="modal-close" onclick="closeModal('convertModal')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="convert-form">
                        <div class="conversion-row">
                            <div class="form-group">
                                <label class="form-label">From</label>
                                <select class="form-input" id="fromCurrency">
                                    <option value="gold">Gold (G)</option>
                                    <option value="usd">USD ($)</option>
                                    <option value="toman">Toman (﷼)</option>
                                </select>
                            </div>
                            
                            <div class="conversion-arrow">
                                <i class="fas fa-arrow-right"></i>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">To</label>
                                <select class="form-input" id="toCurrency">
                                    <option value="usd">USD ($)</option>
                                    <option value="gold">Gold (G)</option>
                                    <option value="toman">Toman (﷼)</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Amount to Convert</label>
                            <input type="number" class="form-input" id="convertAmount" placeholder="Enter amount" min="0.01" step="0.01">
                        </div>
                        
                        <div class="conversion-preview" style="display: none;">
                            <div class="preview-item">
                                <span>Exchange Rate:</span>
                                <span id="exchangeRate">-</span>
                            </div>
                            <div class="preview-item">
                                <span>You will receive:</span>
                                <span id="convertedAmount">-</span>
                            </div>
                            <div class="preview-item">
                                <span>Processing Fee:</span>
                                <span class="text-success">Free (Instant)</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" onclick="closeModal('convertModal')">Cancel</button>
                    <button class="btn btn-primary" id="confirmConvert" disabled>
                        <i class="fas fa-exchange-alt"></i>
                        Convert Now
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    setupConvertModalEvents();
}

function setupConvertModalEvents() {
    const fromSelect = document.getElementById('fromCurrency');
    const toSelect = document.getElementById('toCurrency');
    const amountInput = document.getElementById('convertAmount');
    const confirmBtn = document.getElementById('confirmConvert');
    
    function updateConversion() {
        const amount = parseFloat(amountInput.value);
        const fromCurrency = fromSelect.value;
        const toCurrency = toSelect.value;
        
        if (amount > 0 && fromCurrency !== toCurrency) {
            showConversionPreview(amount, fromCurrency, toCurrency);
            confirmBtn.disabled = false;
        } else {
            document.querySelector('.conversion-preview').style.display = 'none';
            confirmBtn.disabled = true;
        }
    }
    
    fromSelect.addEventListener('change', updateConversion);
    toSelect.addEventListener('change', updateConversion);
    amountInput.addEventListener('input', updateConversion);
    
    confirmBtn.addEventListener('click', function() {
        const amount = parseFloat(amountInput.value);
        const fromCurrency = fromSelect.value;
        const toCurrency = toSelect.value;
        
        processConversion(amount, fromCurrency, toCurrency);
    });
}

function showConversionPreview(amount, fromCurrency, toCurrency) {
    const previewDiv = document.querySelector('.conversion-preview');
    const rateSpan = document.getElementById('exchangeRate');
    const convertedSpan = document.getElementById('convertedAmount');
    
    const convertedAmount = window.mockData.convertCurrency(amount, fromCurrency, toCurrency);
    const rate = convertedAmount / amount;
    
    rateSpan.textContent = `1 ${fromCurrency.toUpperCase()} = ${rate.toFixed(6)} ${toCurrency.toUpperCase()}`;
    convertedSpan.textContent = formatCurrency(convertedAmount, toCurrency);
    
    previewDiv.style.display = 'block';
}

function processConversion(amount, fromCurrency, toCurrency) {
    const confirmBtn = document.getElementById('confirmConvert');
    
    // Show loading state
    confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Converting...';
    confirmBtn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        const convertedAmount = window.mockData.convertCurrency(amount, fromCurrency, toCurrency);
        
        // Update wallet balances
        const walletData = window.mockData.walletData;
        walletData.balances[fromCurrency] -= amount;
        walletData.balances[toCurrency] += convertedAmount;
        
        // Update display
        updateWalletDisplay();
        
        // Close modal
        closeModal('convertModal');
        
        // Show success message
        showToast(`Successfully converted ${formatCurrency(amount, fromCurrency)} to ${formatCurrency(convertedAmount, toCurrency)}!`, 'success');
        
        // Add transaction to history
        addTransaction({
            type: 'conversion',
            method: 'wallet',
            amount: amount,
            currency: fromCurrency,
            convertedAmount: convertedAmount,
            convertedCurrency: toCurrency,
            status: 'completed',
            description: `Currency Conversion: ${fromCurrency.toUpperCase()} to ${toCurrency.toUpperCase()}`
        });
        
    }, 1500);
}

// Utility functions
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.remove();
    }
}

function getPaymentMethodName(method) {
    const methods = {
        credit_card: 'Credit Card',
        crypto: 'Cryptocurrency',
        iranian_bank: 'Iranian Bank Card',
        bank_transfer: 'Bank Transfer',
        crypto_wallet: 'Crypto Wallet'
    };
    
    return methods[method] || method;
}

function addTransaction(transactionData) {
    const transaction = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        reference: `${transactionData.type.toUpperCase()}_${Date.now()}`,
        fee: 0,
        ...transactionData
    };
    
    window.mockData.transactions.unshift(transaction);
}

// Export functions
if (typeof window !== 'undefined') {
    window.initializeWallet = initializeWallet;
    window.updateWalletDisplay = updateWalletDisplay;
    window.closeModal = closeModal;
    window.showDepositModal = showDepositModal;
    window.showWithdrawModal = showWithdrawModal;
    window.showConvertModal = showConvertModal;
}