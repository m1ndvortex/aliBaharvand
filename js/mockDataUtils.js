// Mock Data Utilities
// Helper functions for accessing and manipulating mock data with API simulation

class MockDataManager {
  constructor() {
    this.data = window.MockData || MockData;
    this.initializeLocalStorage();
    
    // API simulation settings
    this.apiDelay = {
      min: 200,  // Minimum delay in ms
      max: 800   // Maximum delay in ms
    };
    
    // Track relationships for referential integrity
    this.relationships = {
      services: ['workspaceOwnerId', 'createdBy'],
      orders: ['serviceId', 'buyerId', 'boosterId', 'advertiserId'],
      teams: ['leaderId'],
      teamMembers: ['userId'],
      wallets: ['userId'],
      transactions: ['userId', 'orderId', 'paymentMethodId'],
      teamActivityLogs: ['teamId', 'userId'],
      adminRaidBookings: ['advertiserId', 'buyerId']
    };
  }

  // Initialize localStorage with mock data if not present
  initializeLocalStorage() {
    if (!localStorage.getItem('mockData_initialized')) {
      localStorage.setItem('mockData_users', JSON.stringify(this.data.users));
      localStorage.setItem('mockData_services', JSON.stringify(this.data.services));
      localStorage.setItem('mockData_orders', JSON.stringify(this.data.orders));
      localStorage.setItem('mockData_teams', JSON.stringify(this.data.teams));
      localStorage.setItem('mockData_wallets', JSON.stringify(this.data.wallets));
      localStorage.setItem('mockData_teamActivityLogs', JSON.stringify(this.data.teamActivityLogs));
      localStorage.setItem('mockData_buyers', JSON.stringify(this.data.buyers));
      localStorage.setItem('mockData_adminRaids', JSON.stringify(this.data.adminRaids));
      localStorage.setItem('mockData_exchangeRates', JSON.stringify(this.data.exchangeRates));
      localStorage.setItem('mockData_initialized', 'true');
    }
  }

  // Simulate API delay for realistic user experience
  async simulateApiDelay() {
    const delay = Math.random() * (this.apiDelay.max - this.apiDelay.min) + this.apiDelay.min;
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  // Validate referential integrity for data operations
  validateReferentialIntegrity(entityType, data) {
    const relationships = this.relationships[entityType];
    if (!relationships) return { valid: true };

    const errors = [];
    
    for (const field of relationships) {
      if (data[field]) {
        // Check if referenced entity exists
        const referencedId = data[field];
        let exists = false;
        
        switch (field) {
          case 'userId':
          case 'createdBy':
          case 'leaderId':
          case 'boosterId':
          case 'advertiserId':
          case 'workspaceOwnerId':
            exists = this.getUser(referencedId) !== undefined;
            break;
          case 'serviceId':
            exists = this.getService(referencedId) !== undefined;
            break;
          case 'buyerId':
            exists = this.getBuyer(referencedId) !== undefined;
            break;
          case 'teamId':
            exists = this.getTeam(referencedId) !== undefined;
            break;
          case 'orderId':
            exists = this.getOrder(referencedId) !== undefined;
            break;
        }
        
        if (!exists) {
          errors.push(`Referenced ${field} '${referencedId}' does not exist`);
        }
      }
    }
    
    return {
      valid: errors.length === 0,
      errors: errors
    };
  }

  // Generic CRUD operations with API simulation
  async createEntity(entityType, data) {
    await this.simulateApiDelay();
    
    try {
      // Validate referential integrity
      const validation = this.validateReferentialIntegrity(entityType, data);
      if (!validation.valid) {
        throw new Error(`Referential integrity violation: ${validation.errors.join(', ')}`);
      }
      
      const entities = JSON.parse(localStorage.getItem(`mockData_${entityType}`) || '[]');
      const newEntity = {
        id: `${entityType.slice(0, -1)}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      entities.push(newEntity);
      localStorage.setItem(`mockData_${entityType}`, JSON.stringify(entities));
      
      return {
        success: true,
        data: newEntity,
        message: `${entityType.slice(0, -1)} created successfully`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: `Failed to create ${entityType.slice(0, -1)}`
      };
    }
  }

  async updateEntity(entityType, id, updates) {
    await this.simulateApiDelay();
    
    try {
      const entities = JSON.parse(localStorage.getItem(`mockData_${entityType}`) || '[]');
      const index = entities.findIndex(entity => entity.id === id);
      
      if (index === -1) {
        throw new Error(`${entityType.slice(0, -1)} with id '${id}' not found`);
      }
      
      // Validate referential integrity for updates
      const updatedData = { ...entities[index], ...updates };
      const validation = this.validateReferentialIntegrity(entityType, updatedData);
      if (!validation.valid) {
        throw new Error(`Referential integrity violation: ${validation.errors.join(', ')}`);
      }
      
      entities[index] = {
        ...entities[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      localStorage.setItem(`mockData_${entityType}`, JSON.stringify(entities));
      
      return {
        success: true,
        data: entities[index],
        message: `${entityType.slice(0, -1)} updated successfully`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: `Failed to update ${entityType.slice(0, -1)}`
      };
    }
  }

  async deleteEntity(entityType, id) {
    await this.simulateApiDelay();
    
    try {
      const entities = JSON.parse(localStorage.getItem(`mockData_${entityType}`) || '[]');
      const index = entities.findIndex(entity => entity.id === id);
      
      if (index === -1) {
        throw new Error(`${entityType.slice(0, -1)} with id '${id}' not found`);
      }
      
      // Check for dependent entities before deletion
      const dependentEntities = this.findDependentEntities(entityType, id);
      if (dependentEntities.length > 0) {
        throw new Error(`Cannot delete ${entityType.slice(0, -1)}: has dependent entities (${dependentEntities.join(', ')})`);
      }
      
      const deletedEntity = entities.splice(index, 1)[0];
      localStorage.setItem(`mockData_${entityType}`, JSON.stringify(entities));
      
      return {
        success: true,
        data: deletedEntity,
        message: `${entityType.slice(0, -1)} deleted successfully`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: `Failed to delete ${entityType.slice(0, -1)}`
      };
    }
  }

  // Find entities that depend on the given entity
  findDependentEntities(entityType, id) {
    const dependents = [];
    
    switch (entityType) {
      case 'users':
        // Check for services, orders, teams, wallets created by this user
        if (this.getServicesByOwner(id).length > 0) dependents.push('services');
        if (this.getOrdersByAdvertiser(id).length > 0 || this.getOrdersByBooster(id).length > 0) dependents.push('orders');
        if (this.getTeamsByLeader(id).length > 0) dependents.push('teams');
        if (this.getWallet(id)) dependents.push('wallet');
        break;
      case 'services':
        // Check for orders using this service
        const orders = JSON.parse(localStorage.getItem('mockData_orders') || '[]');
        if (orders.some(order => order.serviceId === id)) dependents.push('orders');
        break;
      case 'teams':
        // Check for services owned by this team
        if (this.getServicesByOwner(id, 'team').length > 0) dependents.push('services');
        break;
    }
    
    return dependents;
  }

  // User-related methods with API simulation
  async getUser(userId) {
    await this.simulateApiDelay();
    const users = JSON.parse(localStorage.getItem('mockData_users') || '[]');
    const user = users.find(user => user.id === userId);
    
    return {
      success: !!user,
      data: user,
      message: user ? 'User found' : 'User not found'
    };
  }

  getUserSync(userId) {
    const users = JSON.parse(localStorage.getItem('mockData_users') || '[]');
    return users.find(user => user.id === userId);
  }

  async getUserByDiscordId(discordId) {
    await this.simulateApiDelay();
    const users = JSON.parse(localStorage.getItem('mockData_users') || '[]');
    const user = users.find(user => user.discordId === discordId);
    
    return {
      success: !!user,
      data: user,
      message: user ? 'User found' : 'User not found'
    };
  }

  async getAllUsers(filters = {}) {
    await this.simulateApiDelay();
    let users = JSON.parse(localStorage.getItem('mockData_users') || '[]');
    
    // Apply filters
    if (filters.role) {
      users = users.filter(user => user.roles.includes(filters.role));
    }
    if (filters.isActive !== undefined) {
      users = users.filter(user => user.isActive === filters.isActive);
    }
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      users = users.filter(user => 
        user.discordUsername.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm)
      );
    }
    
    return {
      success: true,
      data: users,
      total: users.length,
      message: `Found ${users.length} users`
    };
  }

  getUsersByRole(role) {
    const users = JSON.parse(localStorage.getItem('mockData_users') || '[]');
    return users.filter(user => user.roles.includes(role));
  }

  async createUser(userData) {
    return await this.createEntity('users', userData);
  }

  async updateUser(userId, updates) {
    return await this.updateEntity('users', userId, updates);
  }

  // Service-related methods with API simulation
  async getService(serviceId) {
    await this.simulateApiDelay();
    const services = JSON.parse(localStorage.getItem('mockData_services') || '[]');
    const service = services.find(service => service.id === serviceId);
    
    return {
      success: !!service,
      data: service,
      message: service ? 'Service found' : 'Service not found'
    };
  }

  getServiceSync(serviceId) {
    const services = JSON.parse(localStorage.getItem('mockData_services') || '[]');
    return services.find(service => service.id === serviceId);
  }

  async getServicesByOwner(ownerId, workspaceType = 'personal', filters = {}) {
    await this.simulateApiDelay();
    let services = JSON.parse(localStorage.getItem('mockData_services') || '[]');
    
    services = services.filter(service => 
      service.workspaceOwnerId === ownerId && 
      service.workspaceType === workspaceType
    );
    
    // Apply additional filters
    if (filters.status) {
      services = services.filter(service => service.status === filters.status);
    }
    if (filters.serviceType) {
      services = services.filter(service => service.serviceType === filters.serviceType);
    }
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      services = services.filter(service => 
        service.title.toLowerCase().includes(searchTerm) ||
        service.description.toLowerCase().includes(searchTerm)
      );
    }
    
    return {
      success: true,
      data: services,
      total: services.length,
      message: `Found ${services.length} services`
    };
  }

  getServicesByOwnerSync(ownerId, workspaceType = 'personal') {
    const services = JSON.parse(localStorage.getItem('mockData_services') || '[]');
    return services.filter(service => 
      service.workspaceOwnerId === ownerId && 
      service.workspaceType === workspaceType
    );
  }

  async getServicesByType(serviceType) {
    await this.simulateApiDelay();
    const services = JSON.parse(localStorage.getItem('mockData_services') || '[]');
    const filteredServices = services.filter(service => service.serviceType === serviceType);
    
    return {
      success: true,
      data: filteredServices,
      total: filteredServices.length,
      message: `Found ${filteredServices.length} ${serviceType} services`
    };
  }

  async getActiveServices() {
    await this.simulateApiDelay();
    const services = JSON.parse(localStorage.getItem('mockData_services') || '[]');
    const activeServices = services.filter(service => service.status === 'active');
    
    return {
      success: true,
      data: activeServices,
      total: activeServices.length,
      message: `Found ${activeServices.length} active services`
    };
  }

  async createService(serviceData) {
    // Add mock image URL for service if not provided
    if (!serviceData.imageUrl) {
      const serviceTypeImages = {
        mythic_plus: 'M%2B+Dungeon+Service',
        leveling: 'Leveling+Service',
        delves: 'Delve+Service',
        custom_boost: 'Custom+Boost+Service',
        raid: 'Raid+Service',
        pvp: 'PvP+Service'
      };
      const imageText = serviceTypeImages[serviceData.serviceType] || 'Gaming+Service';
      serviceData.imageUrl = `https://via.placeholder.com/400x200/2f3136/ffffff?text=${imageText}`;
    }
    
    return await this.createEntity('services', serviceData);
  }

  async updateService(serviceId, updates) {
    const result = await this.updateEntity('services', serviceId, updates);
    
    // Log activity if this is a team service
    if (result.success && result.data.workspaceType === 'team') {
      const actionMap = {
        status: updates.status === 'active' ? 'service_activated' : 'service_deactivated',
        title: 'service_edited',
        description: 'service_edited',
        priceGold: 'service_edited',
        priceUsd: 'service_edited',
        priceToman: 'service_edited'
      };
      
      const action = Object.keys(updates).find(key => actionMap[key]) || 'service_edited';
      const actionType = actionMap[action] || 'service_edited';
      
      await this.addTeamActivityLog(
        result.data.workspaceOwnerId,
        updates.updatedBy || result.data.createdBy,
        actionType,
        {
          serviceId: serviceId,
          serviceName: result.data.title,
          changes: Object.keys(updates)
        }
      );
    }
    
    return result;
  }

  async deleteService(serviceId) {
    return await this.deleteEntity('services', serviceId);
  }

  // Order-related methods with API simulation
  async getOrder(orderId) {
    await this.simulateApiDelay();
    const orders = JSON.parse(localStorage.getItem('mockData_orders') || '[]');
    const order = orders.find(order => order.id === orderId);
    
    return {
      success: !!order,
      data: order,
      message: order ? 'Order found' : 'Order not found'
    };
  }

  getOrderSync(orderId) {
    const orders = JSON.parse(localStorage.getItem('mockData_orders') || '[]');
    return orders.find(order => order.id === orderId);
  }

  async getOrdersByAdvertiser(advertiserId, filters = {}) {
    await this.simulateApiDelay();
    let orders = JSON.parse(localStorage.getItem('mockData_orders') || '[]');
    
    orders = orders.filter(order => order.advertiserId === advertiserId);
    
    // Apply filters
    if (filters.status) {
      orders = orders.filter(order => order.status === filters.status);
    }
    if (filters.dateFrom) {
      orders = orders.filter(order => new Date(order.createdAt) >= new Date(filters.dateFrom));
    }
    if (filters.dateTo) {
      orders = orders.filter(order => new Date(order.createdAt) <= new Date(filters.dateTo));
    }
    if (filters.currency) {
      orders = orders.filter(order => order.currencyUsed === filters.currency);
    }
    
    return {
      success: true,
      data: orders,
      total: orders.length,
      message: `Found ${orders.length} orders`
    };
  }

  getOrdersByAdvertiserSync(advertiserId) {
    const orders = JSON.parse(localStorage.getItem('mockData_orders') || '[]');
    return orders.filter(order => order.advertiserId === advertiserId);
  }

  async getOrdersByBooster(boosterId, filters = {}) {
    await this.simulateApiDelay();
    let orders = JSON.parse(localStorage.getItem('mockData_orders') || '[]');
    
    orders = orders.filter(order => order.boosterId === boosterId);
    
    // Apply filters
    if (filters.status) {
      orders = orders.filter(order => order.status === filters.status);
    }
    
    return {
      success: true,
      data: orders,
      total: orders.length,
      message: `Found ${orders.length} assigned orders`
    };
  }

  async getOrdersByStatus(status) {
    await this.simulateApiDelay();
    const orders = JSON.parse(localStorage.getItem('mockData_orders') || '[]');
    const filteredOrders = orders.filter(order => order.status === status);
    
    return {
      success: true,
      data: filteredOrders,
      total: filteredOrders.length,
      message: `Found ${filteredOrders.length} ${status} orders`
    };
  }

  async getPendingOrders() {
    return await this.getOrdersByStatus('pending');
  }

  async getOrdersAwaitingEvidence() {
    return await this.getOrdersByStatus('evidence_submitted');
  }

  async createOrder(orderData) {
    // Add timeline initialization
    orderData.timeline = [{
      status: 'pending',
      timestamp: new Date().toISOString(),
      note: 'Order created'
    }];
    orderData.status = 'pending';
    
    return await this.createEntity('orders', orderData);
  }

  async updateOrderStatus(orderId, newStatus, note = '', updatedBy = null) {
    await this.simulateApiDelay();
    
    try {
      const orders = JSON.parse(localStorage.getItem('mockData_orders') || '[]');
      const index = orders.findIndex(order => order.id === orderId);
      
      if (index === -1) {
        throw new Error(`Order with id '${orderId}' not found`);
      }
      
      const order = orders[index];
      const oldStatus = order.status;
      
      // Update status and timeline
      order.status = newStatus;
      order.timeline.push({
        status: newStatus,
        timestamp: new Date().toISOString(),
        note: note || `Status changed from ${oldStatus} to ${newStatus}`,
        updatedBy: updatedBy
      });
      
      // Set timestamps based on status
      switch (newStatus) {
        case 'assigned':
          order.assignedAt = new Date().toISOString();
          break;
        case 'in_progress':
          order.startedAt = new Date().toISOString();
          break;
        case 'completed':
        case 'rejected':
          order.completedAt = new Date().toISOString();
          break;
      }
      
      order.updatedAt = new Date().toISOString();
      
      localStorage.setItem('mockData_orders', JSON.stringify(orders));
      
      // Handle payment processing for completed orders
      if (newStatus === 'completed' && oldStatus === 'evidence_submitted') {
        await this.processOrderPayment(orderId);
      }
      
      return {
        success: true,
        data: order,
        message: `Order status updated to ${newStatus}`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to update order status'
      };
    }
  }

  async assignBoosterToOrder(orderId, boosterId) {
    await this.simulateApiDelay();
    
    try {
      const booster = this.getUserSync(boosterId);
      if (!booster) {
        throw new Error(`Booster with id '${boosterId}' not found`);
      }
      
      const orders = JSON.parse(localStorage.getItem('mockData_orders') || '[]');
      const index = orders.findIndex(order => order.id === orderId);
      
      if (index === -1) {
        throw new Error(`Order with id '${orderId}' not found`);
      }
      
      if (orders[index].status !== 'pending') {
        throw new Error(`Order must be in pending status to assign booster`);
      }
      
      orders[index].boosterId = boosterId;
      orders[index].status = 'assigned';
      orders[index].assignedAt = new Date().toISOString();
      orders[index].updatedAt = new Date().toISOString();
      orders[index].timeline.push({
        status: 'assigned',
        timestamp: new Date().toISOString(),
        note: `Assigned to ${booster.discordUsername}`
      });
      
      localStorage.setItem('mockData_orders', JSON.stringify(orders));
      
      return {
        success: true,
        data: orders[index],
        message: `Order assigned to ${booster.discordUsername}`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to assign booster to order'
      };
    }
  }

  async submitOrderEvidence(orderId, evidenceData) {
    await this.simulateApiDelay();
    
    try {
      const orders = JSON.parse(localStorage.getItem('mockData_orders') || '[]');
      const index = orders.findIndex(order => order.id === orderId);
      
      if (index === -1) {
        throw new Error(`Order with id '${orderId}' not found`);
      }
      
      if (orders[index].status !== 'in_progress') {
        throw new Error(`Order must be in progress to submit evidence`);
      }
      
      // Generate mock evidence image if not provided
      if (!evidenceData.imageUrl) {
        const service = this.getServiceSync(orders[index].serviceId);
        const serviceType = service ? service.serviceType : 'mythic_plus';
        evidenceData.imageUrl = window.MockImageHelpers ? 
          window.MockImageHelpers.generateEvidenceImage(serviceType, orders[index]).url :
          `https://via.placeholder.com/800x600/2f3136/ffffff?text=Evidence+Submitted`;
      }
      
      orders[index].evidence = {
        ...evidenceData,
        uploadedAt: new Date().toISOString()
      };
      orders[index].status = 'evidence_submitted';
      orders[index].updatedAt = new Date().toISOString();
      orders[index].timeline.push({
        status: 'evidence_submitted',
        timestamp: new Date().toISOString(),
        note: 'Evidence submitted for review'
      });
      
      localStorage.setItem('mockData_orders', JSON.stringify(orders));
      
      return {
        success: true,
        data: orders[index],
        message: 'Evidence submitted successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to submit evidence'
      };
    }
  }

  async processOrderPayment(orderId) {
    try {
      const order = this.getOrderSync(orderId);
      if (!order || order.status !== 'completed') {
        return { success: false, message: 'Order not eligible for payment processing' };
      }
      
      // Add earnings to booster wallet
      if (order.boosterId) {
        await this.addWalletTransaction(order.boosterId, {
          type: 'earning',
          amount: order.pricePaid,
          currency: order.currencyUsed,
          status: 'completed',
          description: `Order #${order.id} completed - ${this.getServiceSync(order.serviceId)?.title || 'Service'}`,
          orderId: order.id
        });
        
        await this.updateWalletBalance(order.boosterId, order.currencyUsed, order.pricePaid);
      }
      
      return { success: true, message: 'Payment processed successfully' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Team-related methods with API simulation
  async getTeam(teamId) {
    await this.simulateApiDelay();
    const teams = JSON.parse(localStorage.getItem('mockData_teams') || '[]');
    const team = teams.find(team => team.id === teamId);
    
    return {
      success: !!team,
      data: team,
      message: team ? 'Team found' : 'Team not found'
    };
  }

  getTeamSync(teamId) {
    const teams = JSON.parse(localStorage.getItem('mockData_teams') || '[]');
    return teams.find(team => team.id === teamId);
  }

  async getTeamsByLeader(leaderId) {
    await this.simulateApiDelay();
    const teams = JSON.parse(localStorage.getItem('mockData_teams') || '[]');
    const leaderTeams = teams.filter(team => team.leaderId === leaderId);
    
    return {
      success: true,
      data: leaderTeams,
      total: leaderTeams.length,
      message: `Found ${leaderTeams.length} teams led by user`
    };
  }

  getTeamsByLeaderSync(leaderId) {
    const teams = JSON.parse(localStorage.getItem('mockData_teams') || '[]');
    return teams.filter(team => team.leaderId === leaderId);
  }

  async getTeamsByMember(userId) {
    await this.simulateApiDelay();
    const teams = JSON.parse(localStorage.getItem('mockData_teams') || '[]');
    const memberTeams = teams.filter(team => 
      team.members.some(member => member.userId === userId && member.status === 'active')
    );
    
    return {
      success: true,
      data: memberTeams,
      total: memberTeams.length,
      message: `Found ${memberTeams.length} teams for user`
    };
  }

  getTeamsByMemberSync(userId) {
    const teams = JSON.parse(localStorage.getItem('mockData_teams') || '[]');
    return teams.filter(team => 
      team.members.some(member => member.userId === userId && member.status === 'active')
    );
  }

  async getTeamActivityLogs(teamId, limit = 50) {
    await this.simulateApiDelay();
    const logs = JSON.parse(localStorage.getItem('mockData_teamActivityLogs') || '[]');
    const teamLogs = logs
      .filter(log => log.teamId === teamId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
    
    return {
      success: true,
      data: teamLogs,
      total: teamLogs.length,
      message: `Found ${teamLogs.length} activity logs`
    };
  }

  async addTeamActivityLog(teamId, userId, action, details) {
    await this.simulateApiDelay();
    
    try {
      const logs = JSON.parse(localStorage.getItem('mockData_teamActivityLogs') || '[]');
      const newLog = {
        id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        teamId,
        userId,
        action,
        details,
        timestamp: new Date().toISOString()
      };
      
      logs.push(newLog);
      localStorage.setItem('mockData_teamActivityLogs', JSON.stringify(logs));
      
      return {
        success: true,
        data: newLog,
        message: 'Activity logged successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to log activity'
      };
    }
  }

  async createTeam(teamData) {
    const result = await this.createEntity('teams', {
      ...teamData,
      members: [{
        userId: teamData.leaderId,
        role: 'leader',
        status: 'active',
        joinedAt: new Date().toISOString(),
        permissions: ['manage_team', 'manage_services', 'assign_orders', 'view_analytics'],
        contributionStats: {
          servicesCreated: 0,
          ordersGenerated: 0,
          totalEarnings: 0
        }
      }],
      settings: {
        autoApproveMembers: false,
        earningsDistribution: 'leader_wallet',
        requireApprovalForServices: true,
        allowMemberInvites: false
      },
      isActive: true,
      stats: {
        totalMembers: 1,
        activeMembers: 1,
        totalServices: 0,
        totalOrders: 0,
        totalEarnings: 0,
        averageRating: 0
      }
    });
    
    if (result.success) {
      // Log team creation activity
      await this.addTeamActivityLog(
        result.data.id,
        teamData.leaderId,
        'team_created',
        { teamName: teamData.name }
      );
    }
    
    return result;
  }

  async inviteTeamMember(teamId, inviterUserId, inviteData) {
    await this.simulateApiDelay();
    
    try {
      const teams = JSON.parse(localStorage.getItem('mockData_teams') || '[]');
      const teamIndex = teams.findIndex(team => team.id === teamId);
      
      if (teamIndex === -1) {
        throw new Error(`Team with id '${teamId}' not found`);
      }
      
      const team = teams[teamIndex];
      
      // Check if user already exists
      const existingMember = team.members.find(member => 
        member.userId === inviteData.userId || member.email === inviteData.email
      );
      
      if (existingMember) {
        throw new Error('User is already a team member');
      }
      
      // Add new member
      const newMember = {
        userId: inviteData.userId || null,
        email: inviteData.email || null,
        role: inviteData.role || 'member',
        status: 'invited',
        joinedAt: new Date().toISOString(),
        permissions: inviteData.permissions || ['create_services'],
        contributionStats: {
          servicesCreated: 0,
          ordersGenerated: 0,
          totalEarnings: 0
        }
      };
      
      team.members.push(newMember);
      team.stats.totalMembers = team.members.length;
      team.updatedAt = new Date().toISOString();
      
      localStorage.setItem('mockData_teams', JSON.stringify(teams));
      
      // Log invitation activity
      await this.addTeamActivityLog(
        teamId,
        inviterUserId,
        'member_invited',
        {
          invitedUser: inviteData.email || inviteData.userId,
          role: newMember.role
        }
      );
      
      return {
        success: true,
        data: newMember,
        message: 'Team member invited successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to invite team member'
      };
    }
  }

  async updateTeam(teamId, teamData) {
    await this.simulateApiDelay();
    
    try {
      const teams = JSON.parse(localStorage.getItem('mockData_teams') || '[]');
      const teamIndex = teams.findIndex(team => team.id === teamId);
      
      if (teamIndex === -1) {
        throw new Error(`Team with id '${teamId}' not found`);
      }
      
      // Update team data
      teams[teamIndex] = {
        ...teams[teamIndex],
        ...teamData,
        updatedAt: new Date().toISOString()
      };
      
      localStorage.setItem('mockData_teams', JSON.stringify(teams));
      
      // Log update activity
      await this.addTeamActivityLog(
        teamId,
        teamData.leaderId || teams[teamIndex].leaderId,
        'team_updated',
        { changes: Object.keys(teamData) }
      );
      
      return {
        success: true,
        data: teams[teamIndex],
        message: 'Team updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to update team'
      };
    }
  }

  async removeTeamMember(teamId, userId) {
    await this.simulateApiDelay();
    
    try {
      const teams = JSON.parse(localStorage.getItem('mockData_teams') || '[]');
      const teamIndex = teams.findIndex(team => team.id === teamId);
      
      if (teamIndex === -1) {
        throw new Error(`Team with id '${teamId}' not found`);
      }
      
      const team = teams[teamIndex];
      const memberIndex = team.members.findIndex(member => member.userId === userId);
      
      if (memberIndex === -1) {
        throw new Error('Member not found in team');
      }
      
      const removedMember = team.members[memberIndex];
      
      // Don't allow removing the team leader
      if (removedMember.role === 'leader') {
        throw new Error('Cannot remove team leader');
      }
      
      // Remove member
      team.members.splice(memberIndex, 1);
      team.stats.totalMembers = team.members.length;
      team.stats.activeMembers = team.members.filter(m => m.status === 'active').length;
      team.updatedAt = new Date().toISOString();
      
      localStorage.setItem('mockData_teams', JSON.stringify(teams));
      
      // Log removal activity
      await this.addTeamActivityLog(
        teamId,
        team.leaderId,
        'member_removed',
        { removedUser: removedMember.userId || removedMember.email }
      );
      
      return {
        success: true,
        data: team,
        message: 'Team member removed successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to remove team member'
      };
    }
  }

  async updateTeamMemberRole(teamId, userId, newRole) {
    await this.simulateApiDelay();
    
    try {
      const teams = JSON.parse(localStorage.getItem('mockData_teams') || '[]');
      const teamIndex = teams.findIndex(team => team.id === teamId);
      
      if (teamIndex === -1) {
        throw new Error(`Team with id '${teamId}' not found`);
      }
      
      const team = teams[teamIndex];
      const memberIndex = team.members.findIndex(member => member.userId === userId);
      
      if (memberIndex === -1) {
        throw new Error('Member not found in team');
      }
      
      const member = team.members[memberIndex];
      const oldRole = member.role;
      
      // Don't allow changing leader role
      if (member.role === 'leader' || newRole === 'leader') {
        throw new Error('Cannot change leader role');
      }
      
      // Update member role
      member.role = newRole;
      member.updatedAt = new Date().toISOString();
      
      // Update permissions based on role
      switch (newRole) {
        case 'moderator':
          member.permissions = ['create_services', 'manage_orders', 'view_analytics'];
          break;
        case 'member':
          member.permissions = ['create_services'];
          break;
        default:
          member.permissions = ['create_services'];
      }
      
      team.updatedAt = new Date().toISOString();
      localStorage.setItem('mockData_teams', JSON.stringify(teams));
      
      // Log role change activity
      await this.addTeamActivityLog(
        teamId,
        team.leaderId,
        'member_role_changed',
        { 
          userId: userId,
          oldRole: oldRole,
          newRole: newRole
        }
      );
      
      return {
        success: true,
        data: member,
        message: 'Member role updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to update member role'
      };
    }
  }

  // Wallet-related methods with API simulation
  async getWallet(userId) {
    await this.simulateApiDelay();
    const wallets = JSON.parse(localStorage.getItem('mockData_wallets') || '[]');
    let wallet = wallets.find(wallet => wallet.userId === userId);
    
    // Create wallet if it doesn't exist
    if (!wallet) {
      wallet = {
        userId: userId,
        balanceGold: 0,
        balanceUsd: 0.00,
        balanceToman: 0,
        totalEarnings: {
          gold: 0,
          usd: 0.00,
          toman: 0
        },
        paymentMethods: [],
        transactions: []
      };
      wallets.push(wallet);
      localStorage.setItem('mockData_wallets', JSON.stringify(wallets));
    }
    
    return {
      success: true,
      data: wallet,
      message: 'Wallet retrieved successfully'
    };
  }

  getWalletSync(userId) {
    const wallets = JSON.parse(localStorage.getItem('mockData_wallets') || '[]');
    return wallets.find(wallet => wallet.userId === userId);
  }

  async updateWalletBalance(userId, currency, amount) {
    await this.simulateApiDelay();
    
    try {
      const wallets = JSON.parse(localStorage.getItem('mockData_wallets') || '[]');
      const index = wallets.findIndex(wallet => wallet.userId === userId);
      
      if (index === -1) {
        throw new Error(`Wallet for user '${userId}' not found`);
      }
      
      const balanceKey = `balance${currency.charAt(0).toUpperCase() + currency.slice(1)}`;
      const oldBalance = wallets[index][balanceKey];
      wallets[index][balanceKey] += amount;
      
      // Ensure balance doesn't go negative
      if (wallets[index][balanceKey] < 0) {
        wallets[index][balanceKey] = oldBalance;
        throw new Error(`Insufficient ${currency} balance`);
      }
      
      localStorage.setItem('mockData_wallets', JSON.stringify(wallets));
      
      return {
        success: true,
        data: wallets[index],
        message: `Wallet balance updated: ${amount > 0 ? '+' : ''}${amount} ${currency.toUpperCase()}`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to update wallet balance'
      };
    }
  }

  async addWalletTransaction(userId, transactionData) {
    await this.simulateApiDelay();
    
    try {
      const wallets = JSON.parse(localStorage.getItem('mockData_wallets') || '[]');
      const index = wallets.findIndex(wallet => wallet.userId === userId);
      
      if (index === -1) {
        throw new Error(`Wallet for user '${userId}' not found`);
      }
      
      const newTransaction = {
        id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...transactionData,
        createdAt: new Date().toISOString(),
        completedAt: transactionData.status === 'completed' ? new Date().toISOString() : null
      };
      
      wallets[index].transactions.push(newTransaction);
      localStorage.setItem('mockData_wallets', JSON.stringify(wallets));
      
      return {
        success: true,
        data: newTransaction,
        message: 'Transaction added successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to add transaction'
      };
    }
  }

  async processDeposit(userId, amount, currency, paymentMethodId) {
    await this.simulateApiDelay();
    
    try {
      // Add transaction
      const transactionResult = await this.addWalletTransaction(userId, {
        type: 'deposit',
        amount: amount,
        currency: currency,
        status: 'completed',
        description: `Deposit via payment method`,
        paymentMethodId: paymentMethodId
      });
      
      if (!transactionResult.success) {
        throw new Error(transactionResult.error);
      }
      
      // Update balance
      const balanceResult = await this.updateWalletBalance(userId, currency, amount);
      
      if (!balanceResult.success) {
        throw new Error(balanceResult.error);
      }
      
      return {
        success: true,
        data: {
          transaction: transactionResult.data,
          wallet: balanceResult.data
        },
        message: `Deposit of ${amount} ${currency.toUpperCase()} processed successfully`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to process deposit'
      };
    }
  }

  async requestWithdrawal(userId, amount, currency, paymentMethodId) {
    await this.simulateApiDelay();
    
    try {
      // Check balance
      const wallet = this.getWalletSync(userId);
      const balanceKey = `balance${currency.charAt(0).toUpperCase() + currency.slice(1)}`;
      
      if (!wallet || wallet[balanceKey] < amount) {
        throw new Error(`Insufficient ${currency} balance for withdrawal`);
      }
      
      // Add pending transaction
      const transactionResult = await this.addWalletTransaction(userId, {
        type: 'withdrawal',
        amount: -amount,
        currency: currency,
        status: 'pending',
        description: `Withdrawal request - pending admin approval`,
        paymentMethodId: paymentMethodId
      });
      
      return {
        success: true,
        data: transactionResult.data,
        message: `Withdrawal request of ${amount} ${currency.toUpperCase()} submitted for approval`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to request withdrawal'
      };
    }
  }

  async convertCurrency(userId, fromAmount, fromCurrency, toCurrency) {
    await this.simulateApiDelay();
    
    try {
      const rates = this.getExchangeRatesSync();
      const conversion = this.convertCurrencySync(fromAmount, fromCurrency, toCurrency);
      
      // Check balance
      const wallet = this.getWalletSync(userId);
      const fromBalanceKey = `balance${fromCurrency.charAt(0).toUpperCase() + fromCurrency.slice(1)}`;
      
      if (!wallet || wallet[fromBalanceKey] < fromAmount) {
        throw new Error(`Insufficient ${fromCurrency} balance for conversion`);
      }
      
      // Deduct from source currency
      await this.updateWalletBalance(userId, fromCurrency, -fromAmount);
      
      // Add to target currency
      await this.updateWalletBalance(userId, toCurrency, conversion.convertedAmount);
      
      // Add conversion transactions
      await this.addWalletTransaction(userId, {
        type: 'conversion',
        amount: -fromAmount,
        currency: fromCurrency,
        status: 'completed',
        description: `Converted ${fromAmount} ${fromCurrency.toUpperCase()} to ${conversion.convertedAmount} ${toCurrency.toUpperCase()}`,
        conversionDetails: {
          fromAmount: fromAmount,
          fromCurrency: fromCurrency,
          toAmount: conversion.convertedAmount,
          toCurrency: toCurrency,
          exchangeRate: conversion.rate,
          fee: conversion.fee
        }
      });
      
      await this.addWalletTransaction(userId, {
        type: 'conversion',
        amount: conversion.convertedAmount,
        currency: toCurrency,
        status: 'completed',
        description: `Received ${conversion.convertedAmount} ${toCurrency.toUpperCase()} from ${fromCurrency.toUpperCase()} conversion`,
        conversionDetails: {
          fromAmount: fromAmount,
          fromCurrency: fromCurrency,
          toAmount: conversion.convertedAmount,
          toCurrency: toCurrency,
          exchangeRate: conversion.rate,
          fee: conversion.fee
        }
      });
      
      return {
        success: true,
        data: conversion,
        message: `Converted ${fromAmount} ${fromCurrency.toUpperCase()} to ${conversion.convertedAmount} ${toCurrency.toUpperCase()}`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to convert currency'
      };
    }
  }

  // Buyer-related methods with API simulation
  async getBuyer(buyerId) {
    await this.simulateApiDelay();
    const buyers = JSON.parse(localStorage.getItem('mockData_buyers') || '[]');
    const buyer = buyers.find(buyer => buyer.id === buyerId);
    
    return {
      success: !!buyer,
      data: buyer,
      message: buyer ? 'Buyer found' : 'Buyer not found'
    };
  }

  getBuyerSync(buyerId) {
    const buyers = JSON.parse(localStorage.getItem('mockData_buyers') || '[]');
    return buyers.find(buyer => buyer.id === buyerId);
  }

  // Admin Raid-related methods with API simulation
  async getAdminRaids() {
    await this.simulateApiDelay();
    const raids = JSON.parse(localStorage.getItem('mockData_adminRaids') || '[]');
    
    return {
      success: true,
      data: raids,
      total: raids.length,
      message: `Found ${raids.length} admin raids`
    };
  }

  getAdminRaidsSync() {
    return JSON.parse(localStorage.getItem('mockData_adminRaids') || '[]');
  }

  async getAvailableRaids() {
    await this.simulateApiDelay();
    const raids = this.getAdminRaidsSync();
    const availableRaids = raids.filter(raid => 
      raid.status === 'open_for_booking' && 
      raid.availableSlots > 0 &&
      new Date(raid.scheduledDate) > new Date()
    );
    
    return {
      success: true,
      data: availableRaids,
      total: availableRaids.length,
      message: `Found ${availableRaids.length} available raids`
    };
  }

  async bookRaidSlot(raidId, advertiserId, buyerId) {
    await this.simulateApiDelay();
    
    try {
      const raids = JSON.parse(localStorage.getItem('mockData_adminRaids') || '[]');
      const raidIndex = raids.findIndex(raid => raid.id === raidId);
      
      if (raidIndex === -1) {
        throw new Error(`Raid with id '${raidId}' not found`);
      }
      
      const raid = raids[raidIndex];
      
      if (raid.availableSlots <= 0) {
        throw new Error('No available slots for this raid');
      }
      
      if (new Date(raid.scheduledDate) <= new Date()) {
        throw new Error('Cannot book slots for past raids');
      }
      
      // Create booking
      const newBooking = {
        id: `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        advertiserId: advertiserId,
        buyerId: buyerId,
        slotNumber: raid.maxSlots - raid.availableSlots + 1,
        status: 'confirmed',
        bookedAt: new Date().toISOString()
      };
      
      raid.bookings.push(newBooking);
      raid.availableSlots -= 1;
      
      localStorage.setItem('mockData_adminRaids', JSON.stringify(raids));
      
      return {
        success: true,
        data: newBooking,
        message: 'Raid slot booked successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to book raid slot'
      };
    }
  }

  // Exchange rate methods with API simulation
  async getExchangeRates() {
    await this.simulateApiDelay();
    const rates = JSON.parse(localStorage.getItem('mockData_exchangeRates') || '{}');
    
    return {
      success: true,
      data: rates,
      message: 'Exchange rates retrieved successfully'
    };
  }

  getExchangeRatesSync() {
    return JSON.parse(localStorage.getItem('mockData_exchangeRates') || '{}');
  }

  convertCurrencySync(amount, fromCurrency, toCurrency) {
    const rates = this.getExchangeRatesSync();
    const rateKey = `${fromCurrency}_to_${toCurrency}`;
    const rate = rates.rates[rateKey];
    
    if (!rate) {
      throw new Error(`Exchange rate not found for ${fromCurrency} to ${toCurrency}`);
    }
    
    const convertedAmount = amount * rate;
    const feePercentage = rates.conversionFees.percentage / 100;
    const fee = Math.max(convertedAmount * feePercentage, rates.conversionFees.minimum[toCurrency] || 0);
    
    return {
      originalAmount: amount,
      convertedAmount: convertedAmount - fee,
      fee: fee,
      rate: rate,
      total: convertedAmount
    };
  }

  // File upload simulation for evidence
  async uploadEvidenceFile(file) {
    await this.simulateApiDelay();
    
    try {
      // Validate file
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Only PNG and JPEG images are allowed');
      }
      
      if (file.size > 10 * 1024 * 1024) { // 10MB
        throw new Error('Image size must be less than 10MB');
      }
      
      // Simulate file upload and return mock URL
      const mockUrl = `https://via.placeholder.com/800x600/2f3136/ffffff?text=Evidence+${Date.now()}`;
      
      return {
        success: true,
        data: {
          url: mockUrl,
          filename: file.name,
          size: file.size,
          type: file.type,
          uploadedAt: new Date().toISOString()
        },
        message: 'File uploaded successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to upload file'
      };
    }
  }

  // Batch operations for better performance
  async batchGetOrders(orderIds) {
    await this.simulateApiDelay();
    const orders = JSON.parse(localStorage.getItem('mockData_orders') || '[]');
    const foundOrders = orders.filter(order => orderIds.includes(order.id));
    
    return {
      success: true,
      data: foundOrders,
      total: foundOrders.length,
      message: `Found ${foundOrders.length} of ${orderIds.length} requested orders`
    };
  }

  async batchUpdateOrderStatus(updates) {
    await this.simulateApiDelay();
    
    try {
      const results = [];
      for (const update of updates) {
        const result = await this.updateOrderStatus(update.orderId, update.status, update.note, update.updatedBy);
        results.push(result);
      }
      
      const successCount = results.filter(r => r.success).length;
      
      return {
        success: successCount === updates.length,
        data: results,
        message: `Updated ${successCount} of ${updates.length} orders`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to batch update orders'
      };
    }
  }

  // Utility methods for generating additional mock data
  async generateRandomOrder(serviceId, buyerId) {
    const service = this.getServiceSync(serviceId);
    const buyer = this.getBuyerSync(buyerId);
    
    if (!service || !buyer) {
      return {
        success: false,
        error: 'Service or buyer not found',
        message: 'Cannot generate order'
      };
    }
    
    const currencies = ['gold', 'usd', 'toman'];
    const selectedCurrency = currencies[Math.floor(Math.random() * currencies.length)];
    const priceKey = `price${selectedCurrency.charAt(0).toUpperCase() + selectedCurrency.slice(1)}`;
    
    return await this.createOrder({
      serviceId: serviceId,
      buyerId: buyerId,
      advertiserId: service.createdBy,
      pricePaid: service[priceKey],
      currencyUsed: selectedCurrency,
      gameCredentials: {
        username: `${buyer.discordUsername.split('#')[0]}Char`,
        realm: ['Stormrage', 'Area-52', 'Tichondrius', 'Mal\'Ganis', 'Illidan'][Math.floor(Math.random() * 5)],
        characterClass: ['Death Knight', 'Warrior', 'Demon Hunter', 'Mage', 'Paladin', 'Hunter', 'Priest'][Math.floor(Math.random() * 7)],
        characterLevel: 80
      },
      specialInstructions: [
        'Please be careful with my character.',
        'Looking for specific loot drops.',
        'Need this completed quickly.',
        'First time using boost service.',
        'Will tip extra for good service.'
      ][Math.floor(Math.random() * 5)]
    });
  }

  // Generate mock data for testing
  async generateMockDataSet(count = 10) {
    await this.simulateApiDelay();
    
    try {
      const results = {
        services: [],
        orders: [],
        users: []
      };
      
      // Generate additional users
      for (let i = 0; i < count; i++) {
        const userData = {
          discordId: `${Date.now()}${i}`,
          discordUsername: `MockUser${i}#${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`,
          discordAvatarUrl: window.MockImageHelpers ? 
            window.MockImageHelpers.getRandomAvatar() : 
            `https://via.placeholder.com/128x128/7289da/ffffff?text=U${i}`,
          email: `mockuser${i}@example.com`,
          roles: ['booster'],
          isActive: true,
          stats: {
            completedOrders: Math.floor(Math.random() * 50),
            rating: 4.0 + Math.random(),
            totalEarnings: Math.floor(Math.random() * 5000)
          }
        };
        
        const result = await this.createUser(userData);
        if (result.success) {
          results.users.push(result.data);
        }
      }
      
      return {
        success: true,
        data: results,
        message: `Generated ${count} mock data entries`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to generate mock data'
      };
    }
  }

  // Reset mock data to original state
  async resetMockData() {
    await this.simulateApiDelay();
    
    try {
      localStorage.removeItem('mockData_initialized');
      localStorage.removeItem('mockData_users');
      localStorage.removeItem('mockData_services');
      localStorage.removeItem('mockData_orders');
      localStorage.removeItem('mockData_teams');
      localStorage.removeItem('mockData_wallets');
      localStorage.removeItem('mockData_teamActivityLogs');
      localStorage.removeItem('mockData_buyers');
      localStorage.removeItem('mockData_adminRaids');
      localStorage.removeItem('mockData_exchangeRates');
      this.initializeLocalStorage();
      
      return {
        success: true,
        message: 'Mock data reset to original state'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to reset mock data'
      };
    }
  }

  // Get comprehensive statistics for dashboard
  async getDashboardStats(userId, workspaceType = 'personal', workspaceId = null) {
    await this.simulateApiDelay();
    
    try {
      const actualWorkspaceId = workspaceId || userId;
      const servicesResult = await this.getServicesByOwner(actualWorkspaceId, workspaceType);
      const ordersResult = workspaceType === 'personal' 
        ? await this.getOrdersByAdvertiser(userId)
        : await this.getOrdersByAdvertiser(actualWorkspaceId);
      
      const services = servicesResult.data || [];
      const orders = ordersResult.data || [];
      
      const activeServices = services.filter(s => s.status === 'active').length;
      const totalOrders = orders.length;
      const completedOrders = orders.filter(o => o.status === 'completed').length;
      const pendingOrders = orders.filter(o => o.status === 'pending').length;
      const ordersAwaitingReview = orders.filter(o => o.status === 'evidence_submitted').length;
      const inProgressOrders = orders.filter(o => o.status === 'in_progress').length;
      
      // Calculate earnings
      const completedOrdersWithEarnings = orders.filter(o => o.status === 'completed');
      const earnings = {
        gold: completedOrdersWithEarnings.filter(o => o.currencyUsed === 'gold').reduce((sum, o) => sum + o.pricePaid, 0),
        usd: completedOrdersWithEarnings.filter(o => o.currencyUsed === 'usd').reduce((sum, o) => sum + o.pricePaid, 0),
        toman: completedOrdersWithEarnings.filter(o => o.currencyUsed === 'toman').reduce((sum, o) => sum + o.pricePaid, 0)
      };
      
      // Calculate pending earnings
      const pendingOrdersWithEarnings = orders.filter(o => o.status === 'evidence_submitted');
      const pendingEarnings = {
        gold: pendingOrdersWithEarnings.filter(o => o.currencyUsed === 'gold').reduce((sum, o) => sum + o.pricePaid, 0),
        usd: pendingOrdersWithEarnings.filter(o => o.currencyUsed === 'usd').reduce((sum, o) => sum + o.pricePaid, 0),
        toman: pendingOrdersWithEarnings.filter(o => o.currencyUsed === 'toman').reduce((sum, o) => sum + o.pricePaid, 0)
      };
      
      const stats = {
        activeServices,
        totalServices: services.length,
        totalOrders,
        completedOrders,
        pendingOrders,
        inProgressOrders,
        ordersAwaitingReview,
        earnings,
        pendingEarnings,
        completionRate: totalOrders > 0 ? (completedOrders / totalOrders * 100).toFixed(1) : 0,
        averageOrderValue: {
          gold: completedOrders > 0 ? (earnings.gold / completedOrders).toFixed(0) : 0,
          usd: completedOrders > 0 ? (earnings.usd / completedOrders).toFixed(2) : 0,
          toman: completedOrders > 0 ? (earnings.toman / completedOrders).toFixed(0) : 0
        }
      };
      
      return {
        success: true,
        data: stats,
        message: 'Dashboard statistics calculated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to calculate dashboard statistics'
      };
    }
  }

  // Search functionality across all entities
  async globalSearch(query, entityTypes = ['users', 'services', 'orders']) {
    await this.simulateApiDelay();
    
    try {
      const results = {};
      const searchTerm = query.toLowerCase();
      
      for (const entityType of entityTypes) {
        const entities = JSON.parse(localStorage.getItem(`mockData_${entityType}`) || '[]');
        
        switch (entityType) {
          case 'users':
            results.users = entities.filter(user => 
              user.discordUsername.toLowerCase().includes(searchTerm) ||
              user.email.toLowerCase().includes(searchTerm)
            );
            break;
          case 'services':
            results.services = entities.filter(service => 
              service.title.toLowerCase().includes(searchTerm) ||
              service.description.toLowerCase().includes(searchTerm)
            );
            break;
          case 'orders':
            results.orders = entities.filter(order => 
              order.id.toLowerCase().includes(searchTerm) ||
              (order.gameCredentials && order.gameCredentials.username.toLowerCase().includes(searchTerm))
            );
            break;
        }
      }
      
      const totalResults = Object.values(results).reduce((sum, arr) => sum + arr.length, 0);
      
      return {
        success: true,
        data: results,
        total: totalResults,
        message: `Found ${totalResults} results for "${query}"`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Search failed'
      };
    }
  }

  // Health check for the mock data system
  async healthCheck() {
    await this.simulateApiDelay();
    
    try {
      const entities = ['users', 'services', 'orders', 'teams', 'wallets', 'buyers', 'adminRaids'];
      const health = {};
      
      for (const entity of entities) {
        const data = JSON.parse(localStorage.getItem(`mockData_${entity}`) || '[]');
        health[entity] = {
          count: data.length,
          lastModified: localStorage.getItem(`mockData_${entity}_lastModified`) || 'unknown'
        };
      }
      
      return {
        success: true,
        data: {
          status: 'healthy',
          entities: health,
          initialized: !!localStorage.getItem('mockData_initialized'),
          timestamp: new Date().toISOString()
        },
        message: 'Mock data system is healthy'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Health check failed'
      };
    }
  }
}

// Create global instance
const mockDataManager = new MockDataManager();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MockDataManager, mockDataManager };
} else if (typeof window !== 'undefined') {
  window.MockDataManager = MockDataManager;
  window.mockDataManager = mockDataManager;
}