/**
 * Payment Processing System for Service Provider Dashboard
 * Handles payment holds, releases, reversals, and audit trails
 */

class PaymentProcessor {
    constructor() {
        this.initialized = false;
        this.processingQueue = new Map();
        this.paymentHolds = new Map();
        this.auditTrail = new Map();
        
        // Payment processing fees (configurable)
        this.processingFees = {
            percentage: 0.05, // 5% platform fee
            minimum: {
                gold: 10,
                usd: 0.50,
                toman: 25000
            }
        };
        
        // Bind methods
        this.init = this.init.bind(this);
        this.holdPayment = this.holdPayment.bind(this);
        this.releasePayment = this.releasePayment.bind(this);
        this.reversePayment = this.reversePayment.bind(this);
        this.processPaymentDistribution = this.processPaymentDistribution.bind(this);
        this.createAuditEntry = this.createAuditEntry.bind(this);
        this.sendPaymentNotification = this.sendPaymentNotification.bind(this);
        this.calculateProcessingFee = this.calculateProcessingFee.bind(this);
        this.validatePaymentOperation = this.validatePaymentOperation.bind(this);
    }

    /**
     * Initialize payment processor
     */
    async init() {
        if (this.initialized) return;

        try {
            // Load existing payment holds from state
            this.loadPaymentHolds();
            
            // Load audit trail
            this.loadAuditTrail();
            
            // Set up state subscriptions for order status changes
            this.setupOrderStatusSubscriptions();
            
            this.initialized = true;
            console.log('Payment Processor initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize Payment Processor:', error);
            throw error;
        }
    }

    /**
     * Load existing payment holds from state
     */
    loadPaymentHolds() {
        const orders = AppState.getState('orders');
        if (orders instanceof Map) {
            orders.forEach(order => {
                if (order.status === 'assigned' || order.status === 'in_progress' || 
                    order.status === 'evidence_submitted' || order.status === 'under_review') {
                    this.paymentHolds.set(order.id, {
                        orderId: order.id,
                        amount: order.pricePaid,
                        currency: order.currencyUsed,
                        buyerId: order.buyerId,
                        boosterId: order.boosterId,
                        advertiserId: order.advertiserId,
                        status: 'held',
                        heldAt: order.assignedAt || order.createdAt,
                        reason: 'Order in progress - payment held until completion'
                    });
                }
            });
        }
    }

    /**
     * Load audit trail from localStorage
     */
    loadAuditTrail() {
        try {
            const stored = localStorage.getItem('payment_audit_trail');
            if (stored) {
                const auditData = JSON.parse(stored);
                this.auditTrail = new Map(Object.entries(auditData));
            }
        } catch (error) {
            console.warn('Failed to load payment audit trail:', error);
        }
    }

    /**
     * Save audit trail to localStorage
     */
    saveAuditTrail() {
        try {
            const auditData = Object.fromEntries(this.auditTrail);
            localStorage.setItem('payment_audit_trail', JSON.stringify(auditData));
        } catch (error) {
            console.warn('Failed to save payment audit trail:', error);
        }
    }

    /**
     * Set up subscriptions for order status changes
     */
    setupOrderStatusSubscriptions() {
        // Subscribe to order status changes to trigger payment processing
        AppState.subscribe('orders', (newOrders, oldOrders) => {
            if (oldOrders instanceof Map && newOrders instanceof Map) {
                newOrders.forEach((newOrder, orderId) => {
                    const oldOrder = oldOrders.get(orderId);
                    if (oldOrder && oldOrder.status !== newOrder.status) {
                        this.handleOrderStatusChange(newOrder, oldOrder);
                    }
                });
            }
        });
    }

    /**
     * Handle order status changes for payment processing
     * @param {Object} newOrder - Updated order
     * @param {Object} oldOrder - Previous order state
     */
    async handleOrderStatusChange(newOrder, oldOrder) {
        try {
            switch (newOrder.status) {
                case 'assigned':
                    if (oldOrder.status === 'pending') {
                        await this.holdPayment(newOrder);
                    }
                    break;
                    
                case 'completed':
                    if (oldOrder.status === 'under_review') {
                        await this.releasePayment(newOrder);
                    }
                    break;
                    
                case 'rejected':
                    if (['evidence_submitted', 'under_review'].includes(oldOrder.status)) {
                        await this.reversePayment(newOrder);
                    }
                    break;
            }
        } catch (error) {
            console.error('Error handling order status change for payment:', error);
            this.createAuditEntry(newOrder.id, 'error', {
                error: error.message,
                oldStatus: oldOrder.status,
                newStatus: newOrder.status
            });
        }
    }

    /**
     * Hold payment when order is assigned to booster
     * @param {Object} order - Order object
     * @returns {Promise<Object>} Payment hold result
     */
    async holdPayment(order) {
        try {
            // Validate payment operation
            const validation = this.validatePaymentOperation(order, 'hold');
            if (!validation.valid) {
                throw new Error(validation.error);
            }

            // Create payment hold record
            const holdId = `hold_${order.id}_${Date.now()}`;
            const paymentHold = {
                id: holdId,
                orderId: order.id,
                amount: order.pricePaid,
                currency: order.currencyUsed,
                buyerId: order.buyerId,
                boosterId: order.boosterId,
                advertiserId: order.advertiserId,
                status: 'held',
                heldAt: new Date().toISOString(),
                reason: 'Order assigned to booster - payment held until completion',
                expiresAt: this.calculateHoldExpiration(order)
            };

            // Store payment hold
            this.paymentHolds.set(order.id, paymentHold);

            // Create audit entry
            this.createAuditEntry(order.id, 'payment_held', {
                holdId: holdId,
                amount: order.pricePaid,
                currency: order.currencyUsed,
                boosterId: order.boosterId,
                reason: paymentHold.reason
            });

            // Send notifications
            await this.sendPaymentNotification('payment_held', order, paymentHold);

            console.log(`Payment held for order ${order.id}: ${order.pricePaid} ${order.currencyUsed}`);
            
            return {
                success: true,
                holdId: holdId,
                paymentHold: paymentHold
            };

        } catch (error) {
            console.error('Error holding payment:', error);
            this.createAuditEntry(order.id, 'payment_hold_failed', {
                error: error.message,
                amount: order.pricePaid,
                currency: order.currencyUsed
            });
            throw error;
        }
    }

    /**
     * Release payment to booster when order is completed
     * @param {Object} order - Order object
     * @returns {Promise<Object>} Payment release result
     */
    async releasePayment(order) {
        try {
            // Validate payment operation
            const validation = this.validatePaymentOperation(order, 'release');
            if (!validation.valid) {
                throw new Error(validation.error);
            }

            // Get payment hold
            const paymentHold = this.paymentHolds.get(order.id);
            if (!paymentHold) {
                throw new Error(`No payment hold found for order ${order.id}`);
            }

            // Calculate processing fee
            const processingFee = this.calculateProcessingFee(order.pricePaid, order.currencyUsed);
            const netAmount = order.pricePaid - processingFee;

            // Process payment distribution
            const distributionResult = await this.processPaymentDistribution(order, netAmount, processingFee);

            // Update payment hold status
            paymentHold.status = 'released';
            paymentHold.releasedAt = new Date().toISOString();
            paymentHold.netAmount = netAmount;
            paymentHold.processingFee = processingFee;
            paymentHold.distributionResult = distributionResult;

            // Create audit entry
            this.createAuditEntry(order.id, 'payment_released', {
                holdId: paymentHold.id,
                grossAmount: order.pricePaid,
                processingFee: processingFee,
                netAmount: netAmount,
                currency: order.currencyUsed,
                boosterId: order.boosterId,
                distributionResult: distributionResult
            });

            // Send notifications
            await this.sendPaymentNotification('payment_released', order, {
                ...paymentHold,
                netAmount: netAmount,
                processingFee: processingFee
            });

            console.log(`Payment released for order ${order.id}: ${netAmount} ${order.currencyUsed} (after ${processingFee} fee)`);
            
            return {
                success: true,
                grossAmount: order.pricePaid,
                processingFee: processingFee,
                netAmount: netAmount,
                distributionResult: distributionResult
            };

        } catch (error) {
            console.error('Error releasing payment:', error);
            this.createAuditEntry(order.id, 'payment_release_failed', {
                error: error.message,
                amount: order.pricePaid,
                currency: order.currencyUsed
            });
            throw error;
        }
    }

    /**
     * Reverse payment when order is rejected
     * @param {Object} order - Order object
     * @returns {Promise<Object>} Payment reversal result
     */
    async reversePayment(order) {
        try {
            // Validate payment operation
            const validation = this.validatePaymentOperation(order, 'reverse');
            if (!validation.valid) {
                throw new Error(validation.error);
            }

            // Get payment hold
            const paymentHold = this.paymentHolds.get(order.id);
            if (!paymentHold) {
                throw new Error(`No payment hold found for order ${order.id}`);
            }

            // Process refund to buyer
            const refundResult = await this.processRefund(order);

            // Update payment hold status
            paymentHold.status = 'reversed';
            paymentHold.reversedAt = new Date().toISOString();
            paymentHold.refundResult = refundResult;
            paymentHold.reversalReason = order.reviewNotes || 'Order rejected - service not completed satisfactorily';

            // Create audit entry
            this.createAuditEntry(order.id, 'payment_reversed', {
                holdId: paymentHold.id,
                amount: order.pricePaid,
                currency: order.currencyUsed,
                buyerId: order.buyerId,
                boosterId: order.boosterId,
                reason: paymentHold.reversalReason,
                refundResult: refundResult
            });

            // Send notifications
            await this.sendPaymentNotification('payment_reversed', order, {
                ...paymentHold,
                refundResult: refundResult
            });

            console.log(`Payment reversed for order ${order.id}: ${order.pricePaid} ${order.currencyUsed} refunded to buyer`);
            
            return {
                success: true,
                amount: order.pricePaid,
                currency: order.currencyUsed,
                refundResult: refundResult,
                reason: paymentHold.reversalReason
            };

        } catch (error) {
            console.error('Error reversing payment:', error);
            this.createAuditEntry(order.id, 'payment_reversal_failed', {
                error: error.message,
                amount: order.pricePaid,
                currency: order.currencyUsed
            });
            throw error;
        }
    }

    /**
     * Process payment distribution to booster wallet
     * @param {Object} order - Order object
     * @param {number} netAmount - Net amount after fees
     * @param {number} processingFee - Processing fee amount
     * @returns {Promise<Object>} Distribution result
     */
    async processPaymentDistribution(order, netAmount, processingFee) {
        try {
            // Determine target wallet (booster or team leader)
            const targetUserId = await this.determinePaymentRecipient(order);
            
            // Get current wallet balances
            const currentWallet = AppState.getState('wallet');
            const currentBalances = currentWallet.balances || {};
            const currentTransactions = currentWallet.transactions || new Map();

            // Create earning transaction for booster/team
            const earningTransactionId = `tx_earning_${order.id}_${Date.now()}`;
            const earningTransaction = {
                id: earningTransactionId,
                type: order.workspaceType === 'team' ? 'team_earning' : 'earning',
                amount: netAmount,
                currency: order.currencyUsed,
                status: 'completed',
                description: `Order #${order.id} completed - ${this.getServiceTitle(order.serviceId)}`,
                orderId: order.id,
                boosterId: order.boosterId,
                advertiserId: order.advertiserId,
                teamId: order.workspaceType === 'team' ? order.workspaceOwnerId : null,
                processingFee: processingFee,
                createdAt: new Date().toISOString(),
                completedAt: new Date().toISOString()
            };

            // Create platform fee transaction
            const feeTransactionId = `tx_fee_${order.id}_${Date.now()}`;
            const feeTransaction = {
                id: feeTransactionId,
                type: 'platform_fee',
                amount: -processingFee,
                currency: order.currencyUsed,
                status: 'completed',
                description: `Platform fee for order #${order.id}`,
                orderId: order.id,
                feePercentage: this.processingFees.percentage,
                createdAt: new Date().toISOString(),
                completedAt: new Date().toISOString()
            };

            // Update wallet balance
            const newBalances = { ...currentBalances };
            newBalances[order.currencyUsed] = (newBalances[order.currencyUsed] || 0) + netAmount;

            // Add transactions
            const newTransactions = new Map(currentTransactions);
            newTransactions.set(earningTransactionId, earningTransaction);
            newTransactions.set(feeTransactionId, feeTransaction);

            // Update state
            AppState.setState({
                'wallet.balances': newBalances,
                'wallet.transactions': newTransactions
            });

            return {
                success: true,
                targetUserId: targetUserId,
                earningTransaction: earningTransaction,
                feeTransaction: feeTransaction,
                newBalance: newBalances[order.currencyUsed]
            };

        } catch (error) {
            console.error('Error processing payment distribution:', error);
            throw error;
        }
    }

    /**
     * Process refund to buyer
     * @param {Object} order - Order object
     * @returns {Promise<Object>} Refund result
     */
    async processRefund(order) {
        try {
            // In a real system, this would process the actual refund
            // For the prototype, we simulate the refund process
            
            const refundTransactionId = `tx_refund_${order.id}_${Date.now()}`;
            const refundTransaction = {
                id: refundTransactionId,
                type: 'refund',
                amount: order.pricePaid,
                currency: order.currencyUsed,
                status: 'completed',
                description: `Refund for order #${order.id} - Service rejected`,
                orderId: order.id,
                buyerId: order.buyerId,
                reason: order.reviewNotes || 'Service not completed satisfactorily',
                createdAt: new Date().toISOString(),
                completedAt: new Date().toISOString()
            };

            // In a real system, we would:
            // 1. Process refund through payment gateway
            // 2. Update buyer's account balance
            // 3. Send refund confirmation

            return {
                success: true,
                refundTransaction: refundTransaction,
                refundMethod: 'original_payment_method',
                estimatedArrival: '3-5 business days'
            };

        } catch (error) {
            console.error('Error processing refund:', error);
            throw error;
        }
    }

    /**
     * Determine payment recipient (booster or team leader)
     * @param {Object} order - Order object
     * @returns {Promise<string>} Target user ID
     */
    async determinePaymentRecipient(order) {
        // Check if this is a team service
        if (order.workspaceType === 'team') {
            // Find team and return leader ID
            const teams = AppState.getState('teams');
            if (teams instanceof Map) {
                const team = teams.get(order.workspaceOwnerId);
                if (team) {
                    return team.leaderId;
                }
            }
            
            // Fallback to advertiser if team not found
            return order.advertiserId;
        }
        
        // For personal services, payment goes to the booster
        return order.boosterId;
    }

    /**
     * Get service title by ID
     * @param {string} serviceId - Service ID
     * @returns {string} Service title
     */
    getServiceTitle(serviceId) {
        if (typeof MockData !== 'undefined' && MockData.services) {
            const service = MockData.services.find(s => s.id === serviceId);
            return service ? service.title : 'Unknown Service';
        }
        return 'Unknown Service';
    }

    /**
     * Calculate processing fee
     * @param {number} amount - Payment amount
     * @param {string} currency - Currency type
     * @returns {number} Processing fee
     */
    calculateProcessingFee(amount, currency) {
        const percentageFee = amount * this.processingFees.percentage;
        const minimumFee = this.processingFees.minimum[currency] || 0;
        
        return Math.max(percentageFee, minimumFee);
    }

    /**
     * Calculate payment hold expiration
     * @param {Object} order - Order object
     * @returns {string} Expiration timestamp
     */
    calculateHoldExpiration(order) {
        // Hold expires after 7 days by default
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 7);
        return expirationDate.toISOString();
    }

    /**
     * Validate payment operation
     * @param {Object} order - Order object
     * @param {string} operation - Operation type ('hold', 'release', 'reverse')
     * @returns {Object} Validation result
     */
    validatePaymentOperation(order, operation) {
        if (!order) {
            return { valid: false, error: 'Order is required' };
        }

        if (!order.pricePaid || order.pricePaid <= 0) {
            return { valid: false, error: 'Invalid payment amount' };
        }

        if (!order.currencyUsed) {
            return { valid: false, error: 'Currency is required' };
        }

        switch (operation) {
            case 'hold':
                if (!order.boosterId) {
                    return { valid: false, error: 'Booster ID is required for payment hold' };
                }
                if (this.paymentHolds.has(order.id)) {
                    return { valid: false, error: 'Payment already held for this order' };
                }
                break;

            case 'release':
                if (!this.paymentHolds.has(order.id)) {
                    return { valid: false, error: 'No payment hold found for this order' };
                }
                const holdForRelease = this.paymentHolds.get(order.id);
                if (holdForRelease.status !== 'held') {
                    return { valid: false, error: `Payment hold status is ${holdForRelease.status}, cannot release` };
                }
                break;

            case 'reverse':
                if (!this.paymentHolds.has(order.id)) {
                    return { valid: false, error: 'No payment hold found for this order' };
                }
                const holdForReverse = this.paymentHolds.get(order.id);
                if (holdForReverse.status !== 'held') {
                    return { valid: false, error: `Payment hold status is ${holdForReverse.status}, cannot reverse` };
                }
                break;
        }

        return { valid: true };
    }

    /**
     * Create audit trail entry
     * @param {string} orderId - Order ID
     * @param {string} action - Action type
     * @param {Object} details - Action details
     */
    createAuditEntry(orderId, action, details) {
        const auditId = `audit_${orderId}_${action}_${Date.now()}`;
        const auditEntry = {
            id: auditId,
            orderId: orderId,
            action: action,
            details: details,
            timestamp: new Date().toISOString(),
            userId: AppState.getState('user.id'),
            userAgent: navigator.userAgent,
            ipAddress: 'simulated' // In real system, would get actual IP
        };

        this.auditTrail.set(auditId, auditEntry);
        this.saveAuditTrail();

        console.log(`Payment audit entry created: ${action} for order ${orderId}`);
    }

    /**
     * Send payment notification to relevant parties
     * @param {string} type - Notification type
     * @param {Object} order - Order object
     * @param {Object} paymentData - Payment data
     */
    async sendPaymentNotification(type, order, paymentData) {
        try {
            const notifications = this.createPaymentNotifications(type, order, paymentData);
            
            // Send notifications through the app's notification system
            notifications.forEach(notification => {
                AppState.addNotification(notification);
            });

            // In a real system, would also send:
            // - Email notifications
            // - Discord notifications
            // - Push notifications

        } catch (error) {
            console.error('Error sending payment notifications:', error);
        }
    }

    /**
     * Create payment notifications for different parties
     * @param {string} type - Notification type
     * @param {Object} order - Order object
     * @param {Object} paymentData - Payment data
     * @returns {Array} Array of notifications
     */
    createPaymentNotifications(type, order, paymentData) {
        const notifications = [];
        const serviceTitle = this.getServiceTitle(order.serviceId);

        switch (type) {
            case 'payment_held':
                notifications.push({
                    type: 'info',
                    title: 'Payment Held',
                    message: `Payment of ${paymentData.amount} ${paymentData.currency} has been held for order #${order.id}`,
                    userId: order.buyerId,
                    orderId: order.id
                });
                
                notifications.push({
                    type: 'success',
                    title: 'Order Assigned',
                    message: `You've been assigned order #${order.id}. Payment is held securely until completion.`,
                    userId: order.boosterId,
                    orderId: order.id
                });
                break;

            case 'payment_released':
                notifications.push({
                    type: 'success',
                    title: 'Payment Released',
                    message: `Payment of ${paymentData.netAmount} ${paymentData.currency} has been released to your wallet for order #${order.id}`,
                    userId: order.boosterId,
                    orderId: order.id
                });
                
                notifications.push({
                    type: 'success',
                    title: 'Order Completed',
                    message: `Order #${order.id} has been completed and payment has been processed.`,
                    userId: order.buyerId,
                    orderId: order.id
                });
                break;

            case 'payment_reversed':
                notifications.push({
                    type: 'info',
                    title: 'Payment Reversed',
                    message: `Payment for order #${order.id} has been reversed. Refund is being processed.`,
                    userId: order.buyerId,
                    orderId: order.id
                });
                
                notifications.push({
                    type: 'warning',
                    title: 'Order Rejected',
                    message: `Order #${order.id} was rejected. Payment has been returned to the buyer.`,
                    userId: order.boosterId,
                    orderId: order.id
                });
                break;
        }

        return notifications;
    }

    /**
     * Get payment holds for display
     * @param {Object} filters - Filter options
     * @returns {Array} Array of payment holds
     */
    getPaymentHolds(filters = {}) {
        let holds = Array.from(this.paymentHolds.values());

        // Apply filters
        if (filters.status) {
            holds = holds.filter(hold => hold.status === filters.status);
        }

        if (filters.currency) {
            holds = holds.filter(hold => hold.currency === filters.currency);
        }

        if (filters.orderId) {
            holds = holds.filter(hold => hold.orderId === filters.orderId);
        }

        // Sort by creation date (newest first)
        holds.sort((a, b) => new Date(b.heldAt) - new Date(a.heldAt));

        return holds;
    }

    /**
     * Get audit trail entries
     * @param {Object} filters - Filter options
     * @returns {Array} Array of audit entries
     */
    getAuditTrail(filters = {}) {
        let entries = Array.from(this.auditTrail.values());

        // Apply filters
        if (filters.orderId) {
            entries = entries.filter(entry => entry.orderId === filters.orderId);
        }

        if (filters.action) {
            entries = entries.filter(entry => entry.action === filters.action);
        }

        if (filters.dateFrom) {
            entries = entries.filter(entry => new Date(entry.timestamp) >= new Date(filters.dateFrom));
        }

        if (filters.dateTo) {
            entries = entries.filter(entry => new Date(entry.timestamp) <= new Date(filters.dateTo));
        }

        // Sort by timestamp (newest first)
        entries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        return entries;
    }

    /**
     * Get payment statistics
     * @returns {Object} Payment statistics
     */
    getPaymentStatistics() {
        const holds = Array.from(this.paymentHolds.values());
        const auditEntries = Array.from(this.auditTrail.values());

        const stats = {
            totalHolds: holds.length,
            activeHolds: holds.filter(h => h.status === 'held').length,
            releasedPayments: holds.filter(h => h.status === 'released').length,
            reversedPayments: holds.filter(h => h.status === 'reversed').length,
            totalProcessed: holds.filter(h => h.status !== 'held').length,
            auditEntries: auditEntries.length,
            recentActivity: auditEntries.slice(0, 10)
        };

        // Calculate total amounts by currency
        stats.totalAmounts = {};
        holds.forEach(hold => {
            if (!stats.totalAmounts[hold.currency]) {
                stats.totalAmounts[hold.currency] = {
                    held: 0,
                    released: 0,
                    reversed: 0
                };
            }
            
            if (hold.status === 'held') {
                stats.totalAmounts[hold.currency].held += hold.amount;
            } else if (hold.status === 'released') {
                stats.totalAmounts[hold.currency].released += hold.netAmount || hold.amount;
            } else if (hold.status === 'reversed') {
                stats.totalAmounts[hold.currency].reversed += hold.amount;
            }
        });

        return stats;
    }
}

// Create global payment processor instance
const PaymentProcessorInstance = new PaymentProcessor();

// Export for use in other modules
window.PaymentProcessor = PaymentProcessorInstance;

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        PaymentProcessorInstance.init().catch(console.error);
    });
} else {
    PaymentProcessorInstance.init().catch(console.error);
}