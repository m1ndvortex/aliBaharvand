// Mock data for the client dashboard prototype

// User profile data
const mockUserProfile = {
    id: 1,
    discordId: "123456789012345678",
    discordUsername: "GamerPro#1234",
    discordAvatar: "assets/images/default-avatar.png",
    email: "gamer@example.com",
    firstName: "John",
    lastName: "Doe",
    country: "United States",
    preferredCurrency: "usd",
    joinDate: "2024-01-15T00:00:00Z",
    roles: ["client"],
    isVerified: true
};

// Wallet data
const mockWalletData = {
    balances: {
        gold: 1500.50,
        usd: 250.00,
        toman: 5000000
    },
    exchangeRates: {
        goldToUsd: 0.10,
        usdToToman: 50000,
        goldToToman: 5000
    },
    lastUpdated: "2024-01-15T12:00:00Z"
};

// WoW services data
const mockServices = [
    {
        id: 1,
        title: "Mythic+20 Necrotic Wake",
        category: "mythic_plus",
        game: "World of Warcraft",
        description: "Professional +20 key completion with guaranteed success. Experienced booster will complete your key within the estimated time frame.",
        prices: { 
            gold: 500, 
            usd: 50, 
            toman: 2500000 
        },
        estimatedTime: "2 hours",
        difficulty: "Mythic+20",
        requirements: "Level 80, Item Level 470+",
        booster: {
            id: 1,
            username: "BoosterPro#1234",
            avatar: "assets/images/booster1.png",
            rating: 4.8,
            reviews: 127,
            completedOrders: 245,
            responseTime: "< 5 minutes"
        },
        features: [
            "Guaranteed completion",
            "No account sharing",
            "Professional booster",
            "24/7 support"
        ],
        image: "assets/images/mythic-plus-icon.png",
        isAvailable: true,
        createdAt: "2024-01-10T00:00:00Z"
    },
    {
        id: 2,
        title: "Heroic Vault of the Incarnates Full Clear",
        category: "raid",
        game: "World of Warcraft",
        description: "Complete heroic raid clear with all bosses defeated. Includes all loot that drops for your class and spec.",
        prices: { 
            gold: 2000, 
            usd: 200, 
            toman: 10000000 
        },
        estimatedTime: "4-6 hours",
        difficulty: "Heroic",
        requirements: "Level 80, Item Level 480+",
        booster: {
            id: 2,
            username: "RaidMaster#5678",
            avatar: "assets/images/booster2.png",
            rating: 4.9,
            reviews: 89,
            completedOrders: 156,
            responseTime: "< 10 minutes"
        },
        features: [
            "All bosses included",
            "Loot priority",
            "Experienced raid team",
            "Flexible scheduling"
        ],
        image: "assets/images/raid-icon.png",
        isAvailable: true,
        createdAt: "2024-01-12T00:00:00Z"
    },
    {
        id: 3,
        title: "1-80 Leveling Boost",
        category: "leveling",
        game: "World of Warcraft",
        description: "Fast and safe character leveling from level 1 to 80. Includes basic gear and gold.",
        prices: { 
            gold: 1200, 
            usd: 120, 
            toman: 6000000 
        },
        estimatedTime: "3-5 days",
        difficulty: "Any Level",
        requirements: "New or existing character",
        booster: {
            id: 3,
            username: "LevelMaster#9999",
            avatar: "assets/images/booster3.png",
            rating: 4.7,
            reviews: 203,
            completedOrders: 312,
            responseTime: "< 15 minutes"
        },
        features: [
            "Safe leveling methods",
            "Includes basic gear",
            "Gold bonus included",
            "Progress updates"
        ],
        image: "assets/images/leveling-icon.png",
        isAvailable: true,
        createdAt: "2024-01-08T00:00:00Z"
    },
    {
        id: 4,
        title: "Tier 11 Delves Completion",
        category: "delves",
        game: "World of Warcraft",
        description: "Complete Tier 11 delves for maximum rewards and achievements.",
        prices: { 
            gold: 800, 
            usd: 80, 
            toman: 4000000 
        },
        estimatedTime: "3-4 hours",
        difficulty: "Tier 11",
        requirements: "Level 80, Item Level 460+",
        booster: {
            id: 4,
            username: "DelveExpert#4321",
            avatar: "assets/images/booster4.png",
            rating: 4.6,
            reviews: 67,
            completedOrders: 98,
            responseTime: "< 20 minutes"
        },
        features: [
            "All tier 11 delves",
            "Achievement completion",
            "Gear rewards",
            "Fast completion"
        ],
        image: "assets/images/delves-icon.png",
        isAvailable: true,
        createdAt: "2024-01-14T00:00:00Z"
    }
];

// Orders data
const mockOrders = [
    {
        id: 12345,
        serviceId: 1,
        serviceTitle: "Mythic+20 Necrotic Wake",
        status: "in_progress",
        booster: {
            id: 1,
            username: "BoosterPro#1234",
            avatar: "assets/images/booster1.png",
            rating: 4.8
        },
        price: { 
            amount: 500, 
            currency: "gold" 
        },
        createdAt: "2024-01-15T10:30:00Z",
        assignedAt: "2024-01-15T10:35:00Z",
        estimatedCompletion: "2024-01-15T14:30:00Z",
        progress: [
            { 
                step: "Order placed", 
                completed: true, 
                timestamp: "2024-01-15T10:30:00Z",
                description: "Order successfully created and payment processed"
            },
            { 
                step: "Order accepted", 
                completed: true, 
                timestamp: "2024-01-15T10:35:00Z",
                description: "Booster accepted the order and will start soon"
            },
            { 
                step: "Booster started dungeon", 
                completed: true, 
                timestamp: "2024-01-15T12:00:00Z",
                description: "Booster has entered the dungeon and begun the run"
            },
            { 
                step: "In progress", 
                completed: false, 
                timestamp: null,
                description: "Dungeon run is currently in progress"
            },
            { 
                step: "Evidence submission", 
                completed: false, 
                timestamp: null,
                description: "Booster will submit completion evidence"
            },
            { 
                step: "Order completed", 
                completed: false, 
                timestamp: null,
                description: "Order will be marked as completed"
            }
        ],
        notes: "Customer requested specific time slot. Booster confirmed availability.",
        customerNotes: "Please complete during evening hours if possible."
    },
    {
        id: 12344,
        serviceId: 3,
        serviceTitle: "1-80 Leveling Boost",
        status: "completed",
        booster: {
            id: 3,
            username: "LevelMaster#9999",
            avatar: "assets/images/booster3.png",
            rating: 4.7
        },
        price: { 
            amount: 120, 
            currency: "usd" 
        },
        createdAt: "2024-01-10T08:00:00Z",
        assignedAt: "2024-01-10T08:15:00Z",
        completedAt: "2024-01-13T16:30:00Z",
        estimatedCompletion: "2024-01-15T08:00:00Z",
        actualCompletion: "2024-01-13T16:30:00Z",
        progress: [
            { 
                step: "Order placed", 
                completed: true, 
                timestamp: "2024-01-10T08:00:00Z",
                description: "Order successfully created and payment processed"
            },
            { 
                step: "Order accepted", 
                completed: true, 
                timestamp: "2024-01-10T08:15:00Z",
                description: "Booster accepted the order"
            },
            { 
                step: "Leveling started", 
                completed: true, 
                timestamp: "2024-01-10T09:00:00Z",
                description: "Character leveling has begun"
            },
            { 
                step: "Progress updates", 
                completed: true, 
                timestamp: "2024-01-12T12:00:00Z",
                description: "Regular progress updates provided"
            },
            { 
                step: "Evidence submission", 
                completed: true, 
                timestamp: "2024-01-13T16:00:00Z",
                description: "Completion screenshots submitted"
            },
            { 
                step: "Order completed", 
                completed: true, 
                timestamp: "2024-01-13T16:30:00Z",
                description: "Order successfully completed ahead of schedule"
            }
        ],
        rating: 5,
        review: "Excellent service! Completed 2 days early and kept me updated throughout.",
        evidence: [
            "assets/images/evidence1.png",
            "assets/images/evidence2.png"
        ]
    },
    {
        id: 12343,
        serviceId: 2,
        serviceTitle: "Heroic Vault of the Incarnates Full Clear",
        status: "pending",
        booster: null,
        price: { 
            amount: 10000000, 
            currency: "toman" 
        },
        createdAt: "2024-01-15T14:00:00Z",
        estimatedCompletion: null,
        progress: [
            { 
                step: "Order placed", 
                completed: true, 
                timestamp: "2024-01-15T14:00:00Z",
                description: "Order created and awaiting booster assignment"
            },
            { 
                step: "Awaiting assignment", 
                completed: false, 
                timestamp: null,
                description: "Looking for available booster"
            }
        ],
        notes: "High priority order - customer is a VIP member."
    }
];

// Transaction history data
const mockTransactions = [
    {
        id: 1001,
        type: "deposit",
        method: "credit_card",
        amount: 100,
        currency: "usd",
        status: "completed",
        timestamp: "2024-01-15T09:00:00Z",
        description: "Deposit via Credit Card",
        reference: "CC_20240115_001",
        fee: 0
    },
    {
        id: 1002,
        type: "purchase",
        method: "wallet",
        amount: 500,
        currency: "gold",
        status: "completed",
        timestamp: "2024-01-15T10:30:00Z",
        description: "Purchase: Mythic+20 Necrotic Wake",
        reference: "ORDER_12345",
        relatedOrderId: 12345,
        fee: 0
    },
    {
        id: 1003,
        type: "conversion",
        method: "wallet",
        amount: 50,
        currency: "usd",
        convertedAmount: 500,
        convertedCurrency: "gold",
        status: "completed",
        timestamp: "2024-01-14T15:20:00Z",
        description: "Currency Conversion: USD to Gold",
        reference: "CONV_20240114_001",
        exchangeRate: 0.10,
        fee: 0
    },
    {
        id: 1004,
        type: "refund",
        method: "wallet",
        amount: 80,
        currency: "usd",
        status: "completed",
        timestamp: "2024-01-13T11:45:00Z",
        description: "Refund: Cancelled Order #12340",
        reference: "REFUND_12340",
        relatedOrderId: 12340,
        fee: 0
    },
    {
        id: 1005,
        type: "withdrawal",
        method: "bank_transfer",
        amount: 2500000,
        currency: "toman",
        status: "pending",
        timestamp: "2024-01-12T16:30:00Z",
        description: "Withdrawal to Iranian Bank Account",
        reference: "WD_20240112_001",
        fee: 50000,
        adminNote: "Awaiting admin approval"
    }
];

// Shop products data
const mockShopProducts = [
    {
        id: 1,
        name: "WoW - 30 Days Game Time",
        category: "game_time",
        game: "World of Warcraft",
        description: "30 days of World of Warcraft game time",
        prices: {
            gold: 500,
            usd: 15,
            toman: 750000
        },
        image: "assets/images/wow-30days.png",
        isAvailable: true,
        deliveryMethod: "game_code",
        estimatedDelivery: "Instant"
    },
    {
        id: 2,
        name: "WoW - 60 Days Game Time",
        category: "game_time",
        game: "World of Warcraft",
        description: "60 days of World of Warcraft game time",
        prices: {
            gold: 950,
            usd: 28,
            toman: 1400000
        },
        image: "assets/images/wow-60days.png",
        isAvailable: true,
        deliveryMethod: "game_code",
        estimatedDelivery: "Instant",
        discount: 7 // 7% discount compared to 2x 30 days
    },
    {
        id: 3,
        name: "WoW - 90 Days Game Time",
        category: "game_time",
        game: "World of Warcraft",
        description: "90 days of World of Warcraft game time",
        prices: {
            gold: 1350,
            usd: 40,
            toman: 2000000
        },
        image: "assets/images/wow-90days.png",
        isAvailable: true,
        deliveryMethod: "game_code",
        estimatedDelivery: "Instant",
        discount: 11 // 11% discount compared to 3x 30 days
    }
];

// Service categories
const serviceCategories = [
    {
        id: "all",
        name: "All Services",
        icon: "fas fa-th-large",
        description: "Browse all available services"
    },
    {
        id: "mythic_plus",
        name: "Mythic+",
        icon: "fas fa-dungeon",
        description: "Mythic+ dungeon completions"
    },
    {
        id: "raid",
        name: "Raids",
        icon: "fas fa-users",
        description: "Raid completions and carries"
    },
    {
        id: "leveling",
        name: "Leveling",
        icon: "fas fa-arrow-up",
        description: "Character leveling services"
    },
    {
        id: "delves",
        name: "Delves",
        icon: "fas fa-map",
        description: "Delve completions"
    },
    {
        id: "custom",
        name: "Custom",
        icon: "fas fa-cog",
        description: "Custom boost services"
    }
];

// Status definitions
const orderStatuses = {
    pending: {
        name: "Pending",
        color: "pending",
        description: "Order is waiting for booster assignment"
    },
    assigned: {
        name: "Assigned",
        color: "info",
        description: "Order has been assigned to a booster"
    },
    in_progress: {
        name: "In Progress",
        color: "warning",
        description: "Booster is currently working on the order"
    },
    evidence_submitted: {
        name: "Evidence Submitted",
        color: "info",
        description: "Booster has submitted completion evidence"
    },
    under_review: {
        name: "Under Review",
        color: "warning",
        description: "Order is being reviewed by admin"
    },
    completed: {
        name: "Completed",
        color: "success",
        description: "Order has been successfully completed"
    },
    rejected: {
        name: "Rejected",
        color: "danger",
        description: "Order was rejected or cancelled"
    }
};

// Payment methods
const paymentMethods = {
    credit_card: {
        name: "Credit Card",
        icon: "fas fa-credit-card",
        description: "Visa, Mastercard, American Express",
        processingTime: "Instant",
        fees: "2.9% + $0.30"
    },
    crypto: {
        name: "Cryptocurrency",
        icon: "fab fa-bitcoin",
        description: "Bitcoin, Ethereum, USDT",
        processingTime: "5-30 minutes",
        fees: "1.5%"
    },
    iranian_bank: {
        name: "Iranian Bank Card",
        icon: "fas fa-university",
        description: "Saman, Parsian, Mellat Banks",
        processingTime: "Instant",
        fees: "Free"
    }
};

// Utility functions for data manipulation
function getServiceById(id) {
    return mockServices.find(service => service.id === id);
}

function getOrderById(id) {
    return mockOrders.find(order => order.id === id);
}

function getTransactionById(id) {
    return mockTransactions.find(transaction => transaction.id === id);
}

function getServicesByCategory(category) {
    if (category === 'all') {
        return mockServices;
    }
    return mockServices.filter(service => service.category === category);
}

function getOrdersByStatus(status) {
    return mockOrders.filter(order => order.status === status);
}

function getTransactionsByType(type) {
    return mockTransactions.filter(transaction => transaction.type === type);
}

function formatPrice(amount, currency) {
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

function convertCurrency(amount, fromCurrency, toCurrency) {
    const rates = mockWalletData.exchangeRates;
    
    // Convert to USD first as base currency
    let usdAmount = amount;
    
    switch (fromCurrency.toLowerCase()) {
        case 'gold':
            usdAmount = amount * rates.goldToUsd;
            break;
        case 'toman':
            usdAmount = amount / rates.usdToToman;
            break;
        case 'usd':
            usdAmount = amount;
            break;
    }
    
    // Convert from USD to target currency
    switch (toCurrency.toLowerCase()) {
        case 'gold':
            return usdAmount / rates.goldToUsd;
        case 'toman':
            return usdAmount * rates.usdToToman;
        case 'usd':
            return usdAmount;
        default:
            return usdAmount;
    }
}

// Export data for use in other files
if (typeof window !== 'undefined') {
    window.mockData = {
        userProfile: mockUserProfile,
        walletData: mockWalletData,
        services: mockServices,
        orders: mockOrders,
        transactions: mockTransactions,
        shopProducts: mockShopProducts,
        serviceCategories: serviceCategories,
        orderStatuses: orderStatuses,
        paymentMethods: paymentMethods,
        
        // Utility functions
        getServiceById,
        getOrderById,
        getTransactionById,
        getServicesByCategory,
        getOrdersByStatus,
        getTransactionsByType,
        formatPrice,
        convertCurrency
    };
}