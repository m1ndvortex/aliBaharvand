// Main JavaScript file for client dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initializeApp();
});

function initializeApp() {
    // Check if we're on the login page
    if (document.body.classList.contains('login-page')) {
        initializeLoginPage();
    } else if (document.body.classList.contains('dashboard-page')) {
        initializeDashboard();
    }
}

// Login page functionality
function initializeLoginPage() {
    const discordLoginBtn = document.getElementById('discordLoginBtn');
    
    if (discordLoginBtn) {
        discordLoginBtn.addEventListener('click', handleDiscordLogin);
    }
}

function handleDiscordLogin() {
    // Prevent multiple clicks
    const btn = document.getElementById('discordLoginBtn');
    if (btn.classList.contains('loading')) {
        return;
    }
    
    // Show loading state
    showLoadingState();
    
    // Simulate Discord OAuth login process
    setTimeout(() => {
        showLoginProgress('Connecting to Discord...', 1);
    }, 500);
    
    setTimeout(() => {
        showLoginProgress('Authenticating...', 2);
    }, 1500);
    
    setTimeout(() => {
        showLoginProgress('Setting up your account...', 3);
    }, 2500);
    
    setTimeout(() => {
        // Store mock user data with more realistic information
        const mockUser = {
            discordId: "123456789012345678",
            username: "GamerPro#1234",
            discriminator: "1234",
            avatar: "https://cdn.discordapp.com/embed/avatars/1.png",
            email: "gamer@example.com",
            verified: true,
            loginTime: new Date().toISOString()
        };
        
        localStorage.setItem('currentUser', JSON.stringify(mockUser));
        
        // Show success state
        showLoginSuccess();
        
        // Redirect to dashboard with smooth transition
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
    }, 3500);
}

function showLoadingState() {
    const btn = document.getElementById('discordLoginBtn');
    const btnContent = btn.querySelector('.btn-content');
    
    btn.classList.add('loading');
    btn.disabled = true;
    
    // Update button content
    btnContent.innerHTML = `
        <i class="fas fa-spinner fa-spin"></i>
        <span>Connecting...</span>
    `;
}

function showLoginProgress(message, step) {
    const btn = document.getElementById('discordLoginBtn');
    const btnContent = btn.querySelector('.btn-content');
    
    // Update progress message
    btnContent.innerHTML = `
        <i class="fas fa-spinner fa-spin"></i>
        <span>${message}</span>
    `;
    
    // Add progress indicator
    const progressSteps = ['Connecting...', 'Authenticating...', 'Setting up...'];
    console.log(`Login Progress (${step}/3): ${message}`);
}

function showLoginSuccess() {
    const btn = document.getElementById('discordLoginBtn');
    const btnContent = btn.querySelector('.btn-content');
    
    // Show success state
    btnContent.innerHTML = `
        <i class="fas fa-check"></i>
        <span>Success! Redirecting...</span>
    `;
    
    // Add success styling
    btn.style.background = 'var(--success)';
    btn.style.boxShadow = '0 8px 25px rgba(40, 167, 69, 0.3)';
}

// Dashboard functionality
function initializeDashboard() {
    // Load user data
    loadUserData();
    
    // Initialize navigation
    initializeNavigation();
    
    // Initialize sidebar toggle
    initializeSidebarToggle();
    
    // Load initial page content
    loadPage('dashboard');
    
    // Initialize wallet data
    if (typeof updateWalletDisplay === 'function') {
        updateWalletDisplay();
    }
}

function loadUserData() {
    const userData = localStorage.getItem('currentUser');
    
    if (!userData) {
        // Redirect to login if no user data
        window.location.href = 'index.html';
        return;
    }
    
    const user = JSON.parse(userData);
    
    // Update user profile in header
    const usernameElement = document.getElementById('username');
    const userAvatarElement = document.getElementById('userAvatar');
    
    if (usernameElement) {
        usernameElement.textContent = user.username;
    }
    
    if (userAvatarElement) {
        userAvatarElement.src = user.avatar;
        userAvatarElement.alt = `${user.username} Avatar`;
    }
}

function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const page = this.getAttribute('data-page');
            if (page) {
                loadPage(page);
                setActiveNavItem(this);
            }
        });
    });
}

function setActiveNavItem(activeLink) {
    // Remove active class from all nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Add active class to parent nav item
    activeLink.closest('.nav-item').classList.add('active');
}

function initializeSidebarToggle() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('open');
        });
        
        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', function(e) {
            if (window.innerWidth <= 768) {
                if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
                    sidebar.classList.remove('open');
                }
            }
        });
    }
}

function loadPage(pageName) {
    const pageContent = document.getElementById('pageContent');
    
    if (!pageContent) return;
    
    // Show loading state
    pageContent.innerHTML = '<div class="loading-container"><div class="loading-spinner"></div><p>Loading...</p></div>';
    
    // Simulate page loading
    setTimeout(() => {
        let content = '';
        
        switch (pageName) {
            case 'dashboard':
                content = getDashboardContent();
                break;
            case 'marketplace':
                content = getMarketplaceContent();
                break;
            case 'orders':
                content = getOrdersContent();
                break;
            case 'wallet':
                content = getWalletContent();
                break;
            case 'shop':
                content = getShopContent();
                break;
            case 'profile':
                content = getProfileContent();
                break;
            case 'support':
                content = getSupportContent();
                break;
            default:
                content = '<div class="error-message"><h2>Page Not Found</h2><p>The requested page could not be found.</p></div>';
        }
        
        pageContent.innerHTML = content;
        
        // Initialize page-specific functionality
        initializePageFunctionality(pageName);
        
    }, 500);
}

function getDashboardContent() {
    const walletData = window.mockData?.walletData || {
        balances: { gold: 1500.50, usd: 250.00, toman: 5000000 },
        exchangeRates: { goldToUsd: 0.10, usdToToman: 50000, goldToToman: 5000 }
    };
    
    return `
        <div class="dashboard-home">
            <div class="page-header">
                <h1>Welcome Back, GamerPro!</h1>
                <p>Here's an overview of your gaming services account</p>
            </div>
            
            <div class="dashboard-grid">
                <div class="wallet-cards">
                    <h2>Wallet Balance</h2>
                    <div class="balance-cards">
                        <div class="balance-card gold" data-currency="gold">
                            <div class="card-icon">
                                <i class="fas fa-coins"></i>
                            </div>
                            <div class="card-content">
                                <h3>Gold</h3>
                                <p class="balance">${formatCurrency(walletData.balances.gold, 'gold')}</p>
                                <p class="exchange-rate">≈ ${formatCurrency(walletData.balances.gold * walletData.exchangeRates.goldToUsd, 'usd')}</p>
                            </div>
                            <div class="card-actions">
                                <button class="btn btn-sm btn-success deposit-btn" data-currency="gold">
                                    <i class="fas fa-plus"></i>
                                </button>
                                <button class="btn btn-sm btn-primary convert-btn" data-currency="gold">
                                    <i class="fas fa-exchange-alt"></i>
                                </button>
                            </div>
                        </div>
                        
                        <div class="balance-card usd" data-currency="usd">
                            <div class="card-icon">
                                <i class="fas fa-dollar-sign"></i>
                            </div>
                            <div class="card-content">
                                <h3>USD</h3>
                                <p class="balance">$${walletData.balances.usd.toFixed(2)}</p>
                                <p class="exchange-rate">≈ ${formatCurrency(walletData.balances.usd / walletData.exchangeRates.goldToUsd, 'gold')}</p>
                            </div>
                            <div class="card-actions">
                                <button class="btn btn-sm btn-success deposit-btn" data-currency="usd">
                                    <i class="fas fa-plus"></i>
                                </button>
                                <button class="btn btn-sm btn-primary convert-btn" data-currency="usd">
                                    <i class="fas fa-exchange-alt"></i>
                                </button>
                            </div>
                        </div>
                        
                        <div class="balance-card toman" data-currency="toman">
                            <div class="card-icon">
                                <i class="fas fa-money-bill"></i>
                            </div>
                            <div class="card-content">
                                <h3>Toman</h3>
                                <p class="balance">${formatCurrency(walletData.balances.toman, 'toman')}</p>
                                <p class="exchange-rate">≈ $${(walletData.balances.toman / walletData.exchangeRates.usdToToman).toFixed(2)}</p>
                            </div>
                            <div class="card-actions">
                                <button class="btn btn-sm btn-success deposit-btn" data-currency="toman">
                                    <i class="fas fa-plus"></i>
                                </button>
                                <button class="btn btn-sm btn-primary convert-btn" data-currency="toman">
                                    <i class="fas fa-exchange-alt"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="exchange-rates">
                        <h4><i class="fas fa-chart-line"></i> Current Exchange Rates</h4>
                        <div class="rates-grid">
                            <div class="rate-item">
                                <span>1 Gold =</span>
                                <span class="rate-value">$${walletData.exchangeRates.goldToUsd.toFixed(2)}</span>
                            </div>
                            <div class="rate-item">
                                <span>1 USD =</span>
                                <span class="rate-value">${walletData.exchangeRates.usdToToman.toLocaleString()}﷼</span>
                            </div>
                            <div class="rate-item">
                                <span>1 Gold =</span>
                                <span class="rate-value">${walletData.exchangeRates.goldToToman.toLocaleString()}﷼</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="quick-actions">
                    <h2>Quick Actions</h2>
                    <div class="action-buttons">
                        <button class="btn btn-success deposit-btn">
                            <i class="fas fa-plus"></i>
                            Deposit
                            <span class="badge">INSTANT</span>
                        </button>
                        <button class="btn btn-warning withdraw-btn">
                            <i class="fas fa-minus"></i>
                            Withdraw
                            <span class="badge">APPROVAL</span>
                        </button>
                        <button class="btn btn-primary convert-btn">
                            <i class="fas fa-exchange-alt"></i>
                            Convert
                            <span class="badge">FREE</span>
                        </button>
                    </div>
                </div>
                
                <div class="recent-orders">
                    <h2>Recent Orders</h2>
                    <div class="orders-list">
                        <div class="order-item">
                            <div class="order-info">
                                <h4>Mythic+20 Necrotic Wake</h4>
                                <p>Order #12345 • BoosterPro#1234</p>
                            </div>
                            <div class="order-status">
                                <span class="badge badge-warning">In Progress</span>
                            </div>
                        </div>
                        
                        <div class="order-item">
                            <div class="order-info">
                                <h4>1-80 Leveling Boost</h4>
                                <p>Order #12344 • LevelMaster#9999</p>
                            </div>
                            <div class="order-status">
                                <span class="badge badge-success">Completed</span>
                            </div>
                        </div>
                        
                        <div class="order-item">
                            <div class="order-info">
                                <h4>Heroic Vault Full Clear</h4>
                                <p>Order #12343 • Awaiting Assignment</p>
                            </div>
                            <div class="order-status">
                                <span class="badge badge-pending">Pending</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="recent-transactions">
                    <h2>Recent Transactions</h2>
                    <div class="transactions-list">
                        <div class="transaction-item">
                            <div class="transaction-info">
                                <h4>Deposit</h4>
                                <p>Credit Card • ${new Date().toLocaleDateString()}</p>
                            </div>
                            <div class="transaction-amount">
                                <span class="amount positive">+$100.00</span>
                            </div>
                        </div>
                        
                        <div class="transaction-item">
                            <div class="transaction-info">
                                <h4>Purchase</h4>
                                <p>Mythic+20 Service • ${new Date().toLocaleDateString()}</p>
                            </div>
                            <div class="transaction-amount">
                                <span class="amount negative">-500 G</span>
                            </div>
                        </div>
                        
                        <div class="transaction-item">
                            <div class="transaction-info">
                                <h4>Currency Conversion</h4>
                                <p>USD to Gold • ${new Date(Date.now() - 86400000).toLocaleDateString()}</p>
                            </div>
                            <div class="transaction-amount">
                                <span class="amount positive">+500 G</span>
                            </div>
                        </div>
                        
                        <div class="transaction-item">
                            <div class="transaction-info">
                                <h4>Withdrawal Request</h4>
                                <p>Iranian Bank • ${new Date(Date.now() - 172800000).toLocaleDateString()}</p>
                            </div>
                            <div class="transaction-amount">
                                <span class="amount negative badge-pending">PENDING</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function getMarketplaceContent() {
    return `
        <div class="marketplace-page">
            <div class="page-header">
                <h1>Marketplace</h1>
                <p>Browse and purchase World of Warcraft services</p>
            </div>
            <div class="marketplace-content">
                <p>Marketplace functionality will be implemented in the next task.</p>
            </div>
        </div>
    `;
}

function getOrdersContent() {
    return `
        <div class="orders-page">
            <div class="page-header">
                <h1>My Orders</h1>
                <p>Track your service orders and progress</p>
            </div>
            <div class="orders-content">
                <p>Orders tracking functionality will be implemented in a future task.</p>
            </div>
        </div>
    `;
}

function getWalletContent() {
    return `
        <div class="wallet-page">
            <div class="page-header">
                <h1>Wallet Management</h1>
                <p>Manage your multi-currency wallet</p>
            </div>
            <div class="wallet-content">
                <p>Wallet management functionality will be implemented in a future task.</p>
            </div>
        </div>
    `;
}

function getShopContent() {
    return `
        <div class="shop-page">
            <div class="page-header">
                <h1>Shop</h1>
                <p>Purchase WoW game time and other products</p>
            </div>
            <div class="shop-content">
                <p>Shop functionality will be implemented in a future task.</p>
            </div>
        </div>
    `;
}

function getProfileContent() {
    return `
        <div class="profile-page">
            <div class="page-header">
                <h1>Profile Settings</h1>
                <p>Manage your account and preferences</p>
            </div>
            <div class="profile-content">
                <p>Profile management functionality will be implemented in a future task.</p>
            </div>
        </div>
    `;
}

function getSupportContent() {
    return `
        <div class="support-page">
            <div class="page-header">
                <h1>Help & Support</h1>
                <p>Get help and contact support</p>
            </div>
            <div class="support-content">
                <p>Support functionality will be implemented in a future task.</p>
            </div>
        </div>
    `;
}

function initializePageFunctionality(pageName) {
    // Initialize page-specific functionality based on the loaded page
    switch (pageName) {
        case 'dashboard':
            initializeDashboardPage();
            break;
        case 'marketplace':
            if (typeof initializeMarketplace === 'function') {
                initializeMarketplace();
            }
            break;
        case 'wallet':
            if (typeof initializeWallet === 'function') {
                initializeWallet();
            }
            break;
        // Add more cases as needed
    }
}

function initializeDashboardPage() {
    // Update wallet display with current data
    if (typeof updateWalletDisplay === 'function') {
        updateWalletDisplay();
    }
    
    // Add event listeners for wallet action buttons
    const depositButtons = document.querySelectorAll('.deposit-btn');
    const withdrawButtons = document.querySelectorAll('.withdraw-btn');
    const convertButtons = document.querySelectorAll('.convert-btn');
    
    depositButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (typeof window.showDepositModal === 'function') {
                window.showDepositModal();
            } else {
                showToast('Opening deposit interface...', 'info');
                // Fallback if wallet.js functions aren't loaded
                setTimeout(() => {
                    showToast('Deposit functionality will be available soon!', 'info');
                }, 1000);
            }
        });
    });
    
    withdrawButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (typeof window.showWithdrawModal === 'function') {
                window.showWithdrawModal();
            } else {
                showToast('Opening withdrawal interface...', 'info');
                setTimeout(() => {
                    showToast('Withdrawal requires admin approval. Feature coming soon!', 'warning');
                }, 1000);
            }
        });
    });
    
    convertButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (typeof window.showConvertModal === 'function') {
                window.showConvertModal();
            } else {
                showToast('Opening currency converter...', 'info');
                setTimeout(() => {
                    showToast('Currency conversion feature coming soon!', 'info');
                }, 1000);
            }
        });
    });
    
    // Add hover effects for balance cards
    const balanceCards = document.querySelectorAll('.balance-card');
    balanceCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Add click handlers for order and transaction items
    const orderItems = document.querySelectorAll('.order-item');
    const transactionItems = document.querySelectorAll('.transaction-item');
    
    orderItems.forEach(item => {
        item.addEventListener('click', function() {
            showToast('Order details will be available in the Orders page!', 'info');
        });
    });
    
    transactionItems.forEach(item => {
        item.addEventListener('click', function() {
            showToast('Transaction details will be available in the Wallet page!', 'info');
        });
    });
}

// Utility functions
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function formatCurrency(amount, currency) {
    switch (currency.toLowerCase()) {
        case 'gold':
            return `${amount.toLocaleString()} G`;
        case 'usd':
            return `$${amount.toFixed(2)}`;
        case 'toman':
            return `${amount.toLocaleString()}﷼`;
        default:
            return amount.toString();
    }
}

// Handle window resize for responsive behavior
window.addEventListener('resize', function() {
    const sidebar = document.getElementById('sidebar');
    
    if (window.innerWidth > 768 && sidebar) {
        sidebar.classList.remove('open');
    }
});

// Export functions for use in other files
window.loadPage = loadPage;
window.showToast = showToast;
window.formatCurrency = formatCurrency;