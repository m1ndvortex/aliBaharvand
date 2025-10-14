// Mock Data API Layer
// Provides a clean, promise-based API interface for all mock data operations
// Simulates real API responses with realistic delays and error handling

class MockDataAPI {
  constructor() {
    this.manager = new MockDataManager();
    this.baseUrl = '/api/v1'; // Simulated API base URL
    this.version = '1.0.0';
  }

  // Generic API response wrapper
  createResponse(success, data = null, message = '', error = null, statusCode = 200) {
    return {
      success,
      data,
      message,
      error,
      statusCode,
      timestamp: new Date().toISOString(),
      version: this.version
    };
  }

  // Authentication API (simulated)
  async authenticate(credentials) {
    try {
      await this.manager.simulateApiDelay();
      
      // Simulate authentication logic
      if (credentials.discordId) {
        const userResult = await this.manager.getUserByDiscordId(credentials.discordId);
        if (userResult.success) {
          return this.createResponse(true, {
            user: userResult.data,
            token: `mock_token_${Date.now()}`,
            expiresIn: 3600
          }, 'Authentication successful');
        }
      }
      
      return this.createResponse(false, null, 'Authentication failed', 'Invalid credentials', 401);
    } catch (error) {
      return this.createResponse(false, null, 'Authentication error', error.message, 500);
    }
  }

  // User API endpoints
  async getUser(userId) {
    try {
      const result = await this.manager.getUser(userId);
      return this.createResponse(result.success, result.data, result.message, result.error);
    } catch (error) {
      return this.createResponse(false, null, 'Failed to get user', error.message, 500);
    }
  }

  async getUsers(filters = {}) {
    try {
      const result = await this.manager.getAllUsers(filters);
      return this.createResponse(result.success, result.data, result.message, result.error);
    } catch (error) {
      return this.createResponse(false, null, 'Failed to get users', error.message, 500);
    }
  }

  async createUser(userData) {
    try {
      const result = await this.manager.createUser(userData);
      const statusCode = result.success ? 201 : 400;
      return this.createResponse(result.success, result.data, result.message, result.error, statusCode);
    } catch (error) {
      return this.createResponse(false, null, 'Failed to create user', error.message, 500);
    }
  }

  async updateUser(userId, updates) {
    try {
      const result = await this.manager.updateUser(userId, updates);
      return this.createResponse(result.success, result.data, result.message, result.error);
    } catch (error) {
      return this.createResponse(false, null, 'Failed to update user', error.message, 500);
    }
  }

  // Service API endpoints
  async getService(serviceId) {
    try {
      const result = await this.manager.getService(serviceId);
      return this.createResponse(result.success, result.data, result.message, result.error);
    } catch (error) {
      return this.createResponse(false, null, 'Failed to get service', error.message, 500);
    }
  }

  async getServices(ownerId, workspaceType = 'personal', filters = {}) {
    try {
      const result = await this.manager.getServicesByOwner(ownerId, workspaceType, filters);
      return this.createResponse(result.success, result.data, result.message, result.error);
    } catch (error) {
      return this.createResponse(false, null, 'Failed to get services', error.message, 500);
    }
  }

  async createService(serviceData) {
    try {
      const result = await this.manager.createService(serviceData);
      const statusCode = result.success ? 201 : 400;
      return this.createResponse(result.success, result.data, result.message, result.error, statusCode);
    } catch (error) {
      return this.createResponse(false, null, 'Failed to create service', error.message, 500);
    }
  }

  async updateService(serviceId, updates) {
    try {
      const result = await this.manager.updateService(serviceId, updates);
      return this.createResponse(result.success, result.data, result.message, result.error);
    } catch (error) {
      return this.createResponse(false, null, 'Failed to update service', error.message, 500);
    }
  }

  async deleteService(serviceId) {
    try {
      const result = await this.manager.deleteService(serviceId);
      const statusCode = result.success ? 204 : 400;
      return this.createResponse(result.success, result.data, result.message, result.error, statusCode);
    } catch (error) {
      return this.createResponse(false, null, 'Failed to delete service', error.message, 500);
    }
  }

  // Order API endpoints
  async getOrder(orderId) {
    try {
      const result = await this.manager.getOrder(orderId);
      return this.createResponse(result.success, result.data, result.message, result.error);
    } catch (error) {
      return this.createResponse(false, null, 'Failed to get order', error.message, 500);
    }
  }

  async getOrdersByAdvertiser(advertiserId, filters = {}) {
    try {
      const result = await this.manager.getOrdersByAdvertiser(advertiserId, filters);
      return this.createResponse(result.success, result.data, result.message, result.error);
    } catch (error) {
      return this.createResponse(false, null, 'Failed to get advertiser orders', error.message, 500);
    }
  }

  async getOrdersByBooster(boosterId, filters = {}) {
    try {
      const result = await this.manager.getOrdersByBooster(boosterId, filters);
      return this.createResponse(result.success, result.data, result.message, result.error);
    } catch (error) {
      return this.createResponse(false, null, 'Failed to get booster orders', error.message, 500);
    }
  }

  async createOrder(orderData) {
    try {
      const result = await this.manager.createOrder(orderData);
      const statusCode = result.success ? 201 : 400;
      return this.createResponse(result.success, result.data, result.message, result.error, statusCode);
    } catch (error) {
      return this.createResponse(false, null, 'Failed to create order', error.message, 500);
    }
  }

  async assignBooster(orderId, boosterId) {
    try {
      const result = await this.manager.assignBoosterToOrder(orderId, boosterId);
      return this.createResponse(result.success, result.data, result.message, result.error);
    } catch (error) {
      return this.createResponse(false, null, 'Failed to assign booster', error.message, 500);
    }
  }

  async updateOrderStatus(orderId, status, note = '', updatedBy = null) {
    try {
      const result = await this.manager.updateOrderStatus(orderId, status, note, updatedBy);
      return this.createResponse(result.success, result.data, result.message, result.error);
    } catch (error) {
      return this.createResponse(false, null, 'Failed to update order status', error.message, 500);
    }
  }

  async submitEvidence(orderId, evidenceData) {
    try {
      const result = await this.manager.submitOrderEvidence(orderId, evidenceData);
      return this.createResponse(result.success, result.data, result.message, result.error);
    } catch (error) {
      return this.createResponse(false, null, 'Failed to submit evidence', error.message, 500);
    }
  }

  // Team API endpoints
  async getTeam(teamId) {
    try {
      const result = await this.manager.getTeam(teamId);
      return this.createResponse(result.success, result.data, result.message, result.error);
    } catch (error) {
      return this.createResponse(false, null, 'Failed to get team', error.message, 500);
    }
  }

  async getTeamsByUser(userId) {
    try {
      const result = await this.manager.getTeamsByMember(userId);
      return this.createResponse(result.success, result.data, result.message, result.error);
    } catch (error) {
      return this.createResponse(false, null, 'Failed to get user teams', error.message, 500);
    }
  }

  async createTeam(teamData) {
    try {
      const result = await this.manager.createTeam(teamData);
      const statusCode = result.success ? 201 : 400;
      return this.createResponse(result.success, result.data, result.message, result.error, statusCode);
    } catch (error) {
      return this.createResponse(false, null, 'Failed to create team', error.message, 500);
    }
  }

  async inviteTeamMember(teamId, inviterUserId, inviteData) {
    try {
      const result = await this.manager.inviteTeamMember(teamId, inviterUserId, inviteData);
      const statusCode = result.success ? 201 : 400;
      return this.createResponse(result.success, result.data, result.message, result.error, statusCode);
    } catch (error) {
      return this.createResponse(false, null, 'Failed to invite team member', error.message, 500);
    }
  }

  async updateTeam(teamId, teamData) {
    try {
      const result = await this.manager.updateTeam(teamId, teamData);
      return this.createResponse(result.success, result.data, result.message, result.error);
    } catch (error) {
      return this.createResponse(false, null, 'Failed to update team', error.message, 500);
    }
  }

  async removeTeamMember(teamId, userId) {
    try {
      const result = await this.manager.removeTeamMember(teamId, userId);
      return this.createResponse(result.success, result.data, result.message, result.error);
    } catch (error) {
      return this.createResponse(false, null, 'Failed to remove team member', error.message, 500);
    }
  }

  async updateTeamMemberRole(teamId, userId, newRole) {
    try {
      const result = await this.manager.updateTeamMemberRole(teamId, userId, newRole);
      return this.createResponse(result.success, result.data, result.message, result.error);
    } catch (error) {
      return this.createResponse(false, null, 'Failed to update member role', error.message, 500);
    }
  }

  async getTeamActivityLogs(teamId, limit = 50) {
    try {
      const result = await this.manager.getTeamActivityLogs(teamId, limit);
      return this.createResponse(result.success, result.data, result.message, result.error);
    } catch (error) {
      return this.createResponse(false, null, 'Failed to get team activity logs', error.message, 500);
    }
  }

  // Wallet API endpoints
  async getWallet(userId) {
    try {
      const result = await this.manager.getWallet(userId);
      return this.createResponse(result.success, result.data, result.message, result.error);
    } catch (error) {
      return this.createResponse(false, null, 'Failed to get wallet', error.message, 500);
    }
  }

  async deposit(userId, amount, currency, paymentMethodId) {
    try {
      const result = await this.manager.processDeposit(userId, amount, currency, paymentMethodId);
      return this.createResponse(result.success, result.data, result.message, result.error);
    } catch (error) {
      return this.createResponse(false, null, 'Failed to process deposit', error.message, 500);
    }
  }

  async withdraw(userId, amount, currency, paymentMethodId) {
    try {
      const result = await this.manager.requestWithdrawal(userId, amount, currency, paymentMethodId);
      return this.createResponse(result.success, result.data, result.message, result.error);
    } catch (error) {
      return this.createResponse(false, null, 'Failed to request withdrawal', error.message, 500);
    }
  }

  async convertCurrency(userId, fromAmount, fromCurrency, toCurrency) {
    try {
      const result = await this.manager.convertCurrency(userId, fromAmount, fromCurrency, toCurrency);
      return this.createResponse(result.success, result.data, result.message, result.error);
    } catch (error) {
      return this.createResponse(false, null, 'Failed to convert currency', error.message, 500);
    }
  }

  // Admin Raid API endpoints
  async getAdminRaids() {
    try {
      const result = await this.manager.getAdminRaids();
      return this.createResponse(result.success, result.data, result.message, result.error);
    } catch (error) {
      return this.createResponse(false, null, 'Failed to get admin raids', error.message, 500);
    }
  }

  async getAvailableRaids() {
    try {
      const result = await this.manager.getAvailableRaids();
      return this.createResponse(result.success, result.data, result.message, result.error);
    } catch (error) {
      return this.createResponse(false, null, 'Failed to get available raids', error.message, 500);
    }
  }

  async bookRaidSlot(raidId, advertiserId, buyerId) {
    try {
      const result = await this.manager.bookRaidSlot(raidId, advertiserId, buyerId);
      const statusCode = result.success ? 201 : 400;
      return this.createResponse(result.success, result.data, result.message, result.error, statusCode);
    } catch (error) {
      return this.createResponse(false, null, 'Failed to book raid slot', error.message, 500);
    }
  }

  // File upload API endpoints
  async uploadFile(file) {
    try {
      const result = await this.manager.uploadEvidenceFile(file);
      const statusCode = result.success ? 201 : 400;
      return this.createResponse(result.success, result.data, result.message, result.error, statusCode);
    } catch (error) {
      return this.createResponse(false, null, 'Failed to upload file', error.message, 500);
    }
  }

  // Analytics and Statistics API endpoints
  async getDashboardStats(userId, workspaceType = 'personal', workspaceId = null) {
    try {
      const result = await this.manager.getDashboardStats(userId, workspaceType, workspaceId);
      return this.createResponse(result.success, result.data, result.message, result.error);
    } catch (error) {
      return this.createResponse(false, null, 'Failed to get dashboard stats', error.message, 500);
    }
  }

  async getExchangeRates() {
    try {
      const result = await this.manager.getExchangeRates();
      return this.createResponse(result.success, result.data, result.message, result.error);
    } catch (error) {
      return this.createResponse(false, null, 'Failed to get exchange rates', error.message, 500);
    }
  }

  // Search API endpoints
  async search(query, entityTypes = ['users', 'services', 'orders']) {
    try {
      const result = await this.manager.globalSearch(query, entityTypes);
      return this.createResponse(result.success, result.data, result.message, result.error);
    } catch (error) {
      return this.createResponse(false, null, 'Search failed', error.message, 500);
    }
  }

  // System API endpoints
  async healthCheck() {
    try {
      const result = await this.manager.healthCheck();
      return this.createResponse(result.success, result.data, result.message, result.error);
    } catch (error) {
      return this.createResponse(false, null, 'Health check failed', error.message, 500);
    }
  }

  async resetData() {
    try {
      const result = await this.manager.resetMockData();
      return this.createResponse(result.success, result.data, result.message, result.error);
    } catch (error) {
      return this.createResponse(false, null, 'Failed to reset data', error.message, 500);
    }
  }

  // Batch operations API endpoints
  async batchGetOrders(orderIds) {
    try {
      const result = await this.manager.batchGetOrders(orderIds);
      return this.createResponse(result.success, result.data, result.message, result.error);
    } catch (error) {
      return this.createResponse(false, null, 'Failed to batch get orders', error.message, 500);
    }
  }

  async batchUpdateOrders(updates) {
    try {
      const result = await this.manager.batchUpdateOrderStatus(updates);
      return this.createResponse(result.success, result.data, result.message, result.error);
    } catch (error) {
      return this.createResponse(false, null, 'Failed to batch update orders', error.message, 500);
    }
  }

  // Utility methods for easier API usage
  async handleApiCall(apiMethod, ...args) {
    try {
      const result = await apiMethod.apply(this, args);
      
      // Log API calls in development
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log(`API Call: ${apiMethod.name}`, {
          args,
          result,
          timestamp: new Date().toISOString()
        });
      }
      
      return result;
    } catch (error) {
      console.error(`API Error in ${apiMethod.name}:`, error);
      return this.createResponse(false, null, 'API call failed', error.message, 500);
    }
  }

  // Convenience method for handling API responses in UI
  static handleResponse(response, onSuccess, onError = null) {
    if (response.success) {
      if (typeof onSuccess === 'function') {
        onSuccess(response.data, response.message);
      }
    } else {
      if (typeof onError === 'function') {
        onError(response.error, response.message);
      } else {
        console.error('API Error:', response.error, response.message);
        // Show user-friendly error notification
        if (window.showNotification) {
          window.showNotification(response.message || 'An error occurred', 'error');
        }
      }
    }
    return response;
  }
}

// Create global API instance
const mockAPI = new MockDataAPI();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MockDataAPI, mockAPI };
} else if (typeof window !== 'undefined') {
  window.MockDataAPI = MockDataAPI;
  window.mockAPI = mockAPI;
}