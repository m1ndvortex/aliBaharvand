/**
 * Global State Management for Service Provider Dashboard
 * Centralized state with reactive updates and persistence
 */

class StateManager {
    constructor() {
        this.state = this.getInitialState();
        this.listeners = new Map();
        this.persistenceKey = 'dashboard_state';
        
        // Load persisted state
        this.loadPersistedState();
        
        // Bind methods
        this.setState = this.setState.bind(this);
        this.getState = this.getState.bind(this);
        this.subscribe = this.subscribe.bind(this);
        this.unsubscribe = this.unsubscribe.bind(this);
    }

    /**
     * Get initial state structure
     * @returns {Object} Initial state
     */
    getInitialState() {
        return {
            // User information
            user: {
                id: 'user123',
                discordId: '123456789012345678',
                discordUsername: 'ProBooster#1234',
                discordAvatarUrl: 'https://cdn.discordapp.com/embed/avatars/0.png',
                email: 'probooster@example.com',
                roles: ['advertiser', 'team_advertiser', 'booster'],
                createdAt: '2024-01-15T10:30:00Z',
                isActive: true
            },

            // Current UI state
            ui: {
                activeRole: 'advertiser',
                activeSidebarItem: 'dashboard',
                workspaceType: 'personal', // 'personal' or 'team'
                workspaceId: 'user123',
                workspaceName: null,
                isMobileNavOpen: false,
                modals: {
                    active: null,
                    data: null
                },
                notifications: [],
                loading: {
                    global: false,
                    components: new Set()
                }
            },

            // Services data
            services: new Map(),

            // Orders data
            orders: new Map(),

            // Teams data
            teams: new Map(),

            // Wallet data
            wallet: {
                balances: {
                    gold: 1500,
                    usd: 250.00,
                    toman: 5000000
                },
                transactions: new Map(),
                paymentMethods: new Map(),
                pendingWithdrawals: new Map()
            },

            // Application settings
            settings: {
                theme: 'dark',
                language: 'en',
                notifications: {
                    email: true,
                    push: true,
                    sound: true
                },
                dashboard: {
                    autoRefresh: true,
                    refreshInterval: 30000
                }
            }
        };
    }

    /**
     * Get current state or specific path
     * @param {string} path - Dot notation path (optional)
     * @returns {*} State value
     */
    getState(path = null) {
        if (!path) return this.state;
        
        return path.split('.').reduce((obj, key) => {
            return obj && obj[key] !== undefined ? obj[key] : undefined;
        }, this.state);
    }

    /**
     * Update state and notify listeners
     * @param {string|Object} pathOrUpdates - Path or updates object
     * @param {*} value - New value (if path provided)
     */
    setState(pathOrUpdates, value = undefined) {
        const updates = typeof pathOrUpdates === 'string' 
            ? { [pathOrUpdates]: value }
            : pathOrUpdates;

        const previousState = JSON.parse(JSON.stringify(this.state));
        
        // Apply updates
        Object.entries(updates).forEach(([path, newValue]) => {
            this.setNestedValue(this.state, path, newValue);
        });

        // Notify listeners
        this.notifyListeners(previousState, this.state, Object.keys(updates));
        
        // Persist state
        this.persistState();
    }

    /**
     * Set nested value using dot notation
     * @param {Object} obj - Target object
     * @param {string} path - Dot notation path
     * @param {*} value - Value to set
     */
    setNestedValue(obj, path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((current, key) => {
            if (!current[key] || typeof current[key] !== 'object') {
                current[key] = {};
            }
            return current[key];
        }, obj);
        
        target[lastKey] = value;
    }

    /**
     * Subscribe to state changes
     * @param {string|Function} pathOrCallback - Path to watch or callback
     * @param {Function} callback - Callback function (if path provided)
     * @returns {Function} Unsubscribe function
     */
    subscribe(pathOrCallback, callback = null) {
        const isGlobalListener = typeof pathOrCallback === 'function';
        const path = isGlobalListener ? '*' : pathOrCallback;
        const cb = isGlobalListener ? pathOrCallback : callback;
        
        if (!this.listeners.has(path)) {
            this.listeners.set(path, new Set());
        }
        
        this.listeners.get(path).add(cb);
        
        // Return unsubscribe function
        return () => this.unsubscribe(path, cb);
    }

    /**
     * Unsubscribe from state changes
     * @param {string} path - Path that was watched
     * @param {Function} callback - Callback to remove
     */
    unsubscribe(path, callback) {
        if (this.listeners.has(path)) {
            this.listeners.get(path).delete(callback);
            if (this.listeners.get(path).size === 0) {
                this.listeners.delete(path);
            }
        }
    }

    /**
     * Notify listeners of state changes
     * @param {Object} previousState - Previous state
     * @param {Object} currentState - Current state
     * @param {Array} changedPaths - Paths that changed
     */
    notifyListeners(previousState, currentState, changedPaths) {
        // Notify global listeners
        if (this.listeners.has('*')) {
            this.listeners.get('*').forEach(callback => {
                callback(currentState, previousState, changedPaths);
            });
        }

        // Notify specific path listeners
        changedPaths.forEach(path => {
            if (this.listeners.has(path)) {
                const newValue = this.getState(path);
                const oldValue = this.getNestedValue(previousState, path);
                
                this.listeners.get(path).forEach(callback => {
                    callback(newValue, oldValue, path);
                });
            }
        });
    }

    /**
     * Get nested value using dot notation
     * @param {Object} obj - Source object
     * @param {string} path - Dot notation path
     * @returns {*} Value at path
     */
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : undefined;
        }, obj);
    }

    /**
     * Load persisted state from localStorage
     */
    loadPersistedState() {
        try {
            const persistedState = localStorage.getItem(this.persistenceKey);
            if (persistedState) {
                const parsed = JSON.parse(persistedState);
                
                // Merge with initial state to handle new properties
                this.state = this.deepMerge(this.state, parsed);
                
                // Convert Maps back from objects
                this.restoreMaps();
            }
        } catch (error) {
            console.warn('Failed to load persisted state:', error);
        }
    }

    /**
     * Persist current state to localStorage
     */
    persistState() {
        try {
            // Convert Maps to objects for serialization
            const serializable = this.prepareMapsForSerialization(this.state);
            localStorage.setItem(this.persistenceKey, JSON.stringify(serializable));
        } catch (error) {
            console.warn('Failed to persist state:', error);
        }
    }

    /**
     * Deep merge two objects
     * @param {Object} target - Target object
     * @param {Object} source - Source object
     * @returns {Object} Merged object
     */
    deepMerge(target, source) {
        const result = { ...target };
        
        Object.keys(source).forEach(key => {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this.deepMerge(target[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        });
        
        return result;
    }

    /**
     * Convert Maps to objects for serialization
     * @param {Object} obj - Object to process
     * @returns {Object} Processed object
     */
    prepareMapsForSerialization(obj) {
        const result = {};
        
        Object.entries(obj).forEach(([key, value]) => {
            if (value instanceof Map) {
                result[key] = Object.fromEntries(value);
            } else if (value && typeof value === 'object' && !Array.isArray(value)) {
                result[key] = this.prepareMapsForSerialization(value);
            } else {
                result[key] = value;
            }
        });
        
        return result;
    }

    /**
     * Restore Maps from serialized objects
     */
    restoreMaps() {
        const mapPaths = [
            'services',
            'orders',
            'teams',
            'wallet.transactions',
            'wallet.paymentMethods',
            'wallet.pendingWithdrawals'
        ];
        
        mapPaths.forEach(path => {
            const value = this.getState(path);
            if (value && typeof value === 'object' && !Array.isArray(value)) {
                this.setNestedValue(this.state, path, new Map(Object.entries(value)));
            }
        });
    }

    /**
     * Clear all persisted state
     */
    clearPersistedState() {
        localStorage.removeItem(this.persistenceKey);
        this.state = this.getInitialState();
        this.notifyListeners({}, this.state, Object.keys(this.state));
    }

    /**
     * Reset state to initial values
     */
    reset() {
        const previousState = JSON.parse(JSON.stringify(this.state));
        this.state = this.getInitialState();
        this.notifyListeners(previousState, this.state, Object.keys(this.state));
        this.persistState();
    }

    /**
     * Get user roles
     * @returns {Array} User roles
     */
    getUserRoles() {
        return this.getState('user.roles') || [];
    }

    /**
     * Check if user has specific role
     * @param {string} role - Role to check
     * @returns {boolean}
     */
    hasRole(role) {
        return this.getUserRoles().includes(role);
    }

    /**
     * Get current workspace context
     * @returns {Object} Workspace info
     */
    getWorkspaceContext() {
        return {
            type: this.getState('ui.workspaceType'),
            id: this.getState('ui.workspaceId'),
            name: this.getState('ui.workspaceName')
        };
    }

    /**
     * Switch workspace
     * @param {string} type - Workspace type ('personal' or 'team')
     * @param {string} id - Workspace ID
     * @param {string} name - Workspace name (optional)
     */
    switchWorkspace(type, id, name = null) {
        this.setState({
            'ui.workspaceType': type,
            'ui.workspaceId': id,
            'ui.workspaceName': name
        });
    }

    /**
     * Add notification
     * @param {Object} notification - Notification object
     */
    addNotification(notification) {
        const notifications = this.getState('ui.notifications') || [];
        const newNotification = {
            id: Date.now() + Math.random(),
            timestamp: new Date().toISOString(),
            ...notification
        };
        
        this.setState('ui.notifications', [...notifications, newNotification]);
        
        // Auto-remove after delay if specified
        if (notification.autoRemove !== false) {
            setTimeout(() => {
                this.removeNotification(newNotification.id);
            }, notification.duration || 5000);
        }
    }

    /**
     * Remove notification
     * @param {string|number} id - Notification ID
     */
    removeNotification(id) {
        const notifications = this.getState('ui.notifications') || [];
        this.setState('ui.notifications', notifications.filter(n => n.id !== id));
    }

    /**
     * Set loading state for component
     * @param {string} component - Component name
     * @param {boolean} isLoading - Loading state
     */
    setLoading(component, isLoading) {
        let loading = this.getState('ui.loading.components');
        
        // Ensure loading is a Set
        if (!(loading instanceof Set)) {
            loading = new Set();
        }
        
        if (isLoading) {
            loading.add(component);
        } else {
            loading.delete(component);
        }
        
        this.setState('ui.loading.components', loading);
        this.setState('ui.loading.global', loading.size > 0);
    }

    /**
     * Check if component is loading
     * @param {string} component - Component name
     * @returns {boolean}
     */
    isLoading(component) {
        let loading = this.getState('ui.loading.components');
        
        // Ensure loading is a Set
        if (!(loading instanceof Set)) {
            loading = new Set();
        }
        
        return loading.has(component);
    }
}

// Create global state manager instance
const AppState = new StateManager();

// Export for use in other modules
window.AppState = AppState;

// Export individual methods for convenience
window.getState = AppState.getState.bind(AppState);
window.setState = AppState.setState.bind(AppState);
window.subscribe = AppState.subscribe.bind(AppState);
window.unsubscribe = AppState.unsubscribe.bind(AppState);