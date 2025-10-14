// Mock Data Test and Demonstration
// This file contains tests and examples of how to use the mock data system

class MockDataTest {
  constructor() {
    this.testResults = [];
  }

  // Run all tests
  async runAllTests() {
    console.log('🧪 Starting Mock Data Tests...\n');
    
    this.testMockDataLoading();
    await this.testMockDataManager();
    await this.testMockDataAPI();
    this.testMockDataGenerator();
    this.testMockImages();
    this.testDataRelationships();
    
    this.displayResults();
  }

  // Test MockDataAPI functionality
  async testMockDataAPI() {
    console.log('🌐 Testing Mock Data API...');
    
    try {
      // Test API authentication
      const authResult = await mockAPI.authenticate({ discordId: '123456789012345678' });
      if (!authResult.success) {
        throw new Error('API authentication failed');
      }
      console.log(`✅ API authentication successful, token: ${authResult.data.token.substring(0, 20)}...`);
      
      // Test API user endpoint
      const userResult = await mockAPI.getUser('user_001');
      if (!userResult.success || userResult.statusCode !== 200) {
        throw new Error('API user endpoint failed');
      }
      console.log(`✅ API user endpoint: ${userResult.data.discordUsername}`);
      
      // Test API service creation
      const serviceResult = await mockAPI.createService({
        title: 'API Test Service',
        description: 'Test service created via API',
        serviceType: 'mythic_plus',
        workspaceType: 'personal',
        workspaceOwnerId: 'user_001',
        createdBy: 'user_001',
        priceGold: 200,
        priceUsd: 10.00,
        priceToman: 500000,
        status: 'active'
      });
      
      if (!serviceResult.success || serviceResult.statusCode !== 201) {
        throw new Error('API service creation failed');
      }
      console.log(`✅ API service creation: ${serviceResult.data.title}`);
      
      // Test API error handling
      const invalidUserResult = await mockAPI.getUser('invalid_user_id');
      if (invalidUserResult.success) {
        throw new Error('API should have failed for invalid user ID');
      }
      console.log('✅ API error handling working correctly');
      
      // Test API response format
      if (!userResult.timestamp || !userResult.version) {
        throw new Error('API response missing required fields');
      }
      console.log('✅ API response format is correct');
      
      this.testResults.push({ test: 'Mock Data API', status: 'PASS', details: 'All API endpoints working correctly' });
    } catch (error) {
      console.error('❌ Mock Data API Failed:', error.message);
      this.testResults.push({ test: 'Mock Data API', status: 'FAIL', details: error.message });
    }
    
    console.log('');
  }

  // Test basic mock data loading
  testMockDataLoading() {
    console.log('📊 Testing Mock Data Loading...');
    
    try {
      // Test that MockData is available
      if (typeof MockData === 'undefined') {
        throw new Error('MockData is not defined');
      }
      
      // Test data structure
      const requiredKeys = ['users', 'services', 'orders', 'teams', 'wallets', 'buyers'];
      for (const key of requiredKeys) {
        if (!MockData[key] || !Array.isArray(MockData[key])) {
          throw new Error(`MockData.${key} is missing or not an array`);
        }
      }
      
      // Test data counts
      console.log(`✅ Users: ${MockData.users.length}`);
      console.log(`✅ Services: ${MockData.services.length}`);
      console.log(`✅ Orders: ${MockData.orders.length}`);
      console.log(`✅ Teams: ${MockData.teams.length}`);
      console.log(`✅ Wallets: ${MockData.wallets.length}`);
      console.log(`✅ Buyers: ${MockData.buyers.length}`);
      
      this.testResults.push({ test: 'Mock Data Loading', status: 'PASS', details: 'All data structures loaded correctly' });
    } catch (error) {
      console.error('❌ Mock Data Loading Failed:', error.message);
      this.testResults.push({ test: 'Mock Data Loading', status: 'FAIL', details: error.message });
    }
    
    console.log('');
  }

  // Test MockDataManager functionality
  async testMockDataManager() {
    console.log('🔧 Testing Mock Data Manager...');
    
    try {
      // Test user retrieval (async)
      const userResult = await mockDataManager.getUser('user_001');
      if (!userResult.success || userResult.data.id !== 'user_001') {
        throw new Error('Failed to retrieve user by ID');
      }
      console.log(`✅ Retrieved user: ${userResult.data.discordUsername}`);
      
      // Test service retrieval (async)
      const servicesResult = await mockDataManager.getServicesByOwner('user_001');
      console.log(`✅ Found ${servicesResult.data.length} services for user_001`);
      
      // Test order retrieval (async)
      const ordersResult = await mockDataManager.getOrdersByAdvertiser('user_001');
      console.log(`✅ Found ${ordersResult.data.length} orders for advertiser user_001`);
      
      // Test wallet retrieval (async)
      const walletResult = await mockDataManager.getWallet('user_001');
      if (!walletResult.success) {
        throw new Error('Failed to retrieve wallet');
      }
      console.log(`✅ Retrieved wallet with ${walletResult.data.balanceGold} gold`);
      
      // Test dashboard stats (async)
      const statsResult = await mockDataManager.getDashboardStats('user_001');
      console.log(`✅ Dashboard stats: ${statsResult.data.activeServices} active services, ${statsResult.data.totalOrders} total orders`);
      
      // Test API delay simulation
      const startTime = Date.now();
      await mockDataManager.simulateApiDelay();
      const endTime = Date.now();
      const delay = endTime - startTime;
      console.log(`✅ API delay simulation: ${delay}ms`);
      
      // Test referential integrity
      const invalidServiceResult = await mockDataManager.createService({
        title: 'Invalid Service',
        workspaceOwnerId: 'invalid_user_id',
        createdBy: 'invalid_user_id'
      });
      if (invalidServiceResult.success) {
        throw new Error('Referential integrity check failed - should have rejected invalid user reference');
      }
      console.log('✅ Referential integrity validation working');
      
      this.testResults.push({ test: 'Mock Data Manager', status: 'PASS', details: 'All manager functions working correctly' });
    } catch (error) {
      console.error('❌ Mock Data Manager Failed:', error.message);
      this.testResults.push({ test: 'Mock Data Manager', status: 'FAIL', details: error.message });
    }
    
    console.log('');
  }

  // Test MockDataGenerator functionality
  testMockDataGenerator() {
    console.log('🏭 Testing Mock Data Generator...');
    
    try {
      // Test user generation
      const newUser = mockDataGenerator.generateUser(['advertiser', 'booster']);
      if (!newUser || !newUser.id || !newUser.discordUsername) {
        throw new Error('Failed to generate user');
      }
      console.log(`✅ Generated user: ${newUser.discordUsername} with roles: ${newUser.roles.join(', ')}`);
      
      // Test service generation
      const newService = mockDataGenerator.generateService('user_001');
      if (!newService || !newService.id || !newService.title) {
        throw new Error('Failed to generate service');
      }
      console.log(`✅ Generated service: ${newService.title} (${newService.serviceType})`);
      
      // Test buyer generation
      const newBuyer = mockDataGenerator.generateBuyer();
      if (!newBuyer || !newBuyer.id || !newBuyer.discordUsername) {
        throw new Error('Failed to generate buyer');
      }
      console.log(`✅ Generated buyer: ${newBuyer.discordUsername}`);
      
      // Test team generation
      const newTeam = mockDataGenerator.generateTeam('user_001');
      if (!newTeam || !newTeam.id || !newTeam.name) {
        throw new Error('Failed to generate team');
      }
      console.log(`✅ Generated team: ${newTeam.name}`);
      
      this.testResults.push({ test: 'Mock Data Generator', status: 'PASS', details: 'All generator functions working correctly' });
    } catch (error) {
      console.error('❌ Mock Data Generator Failed:', error.message);
      this.testResults.push({ test: 'Mock Data Generator', status: 'FAIL', details: error.message });
    }
    
    console.log('');
  }

  // Test MockImages functionality
  testMockImages() {
    console.log('🖼️ Testing Mock Images...');
    
    try {
      // Test evidence image retrieval
      const evidenceImage = MockImageHelpers.getRandomEvidenceImage('mythic_plus');
      if (!evidenceImage || !evidenceImage.url) {
        throw new Error('Failed to get evidence image');
      }
      console.log(`✅ Retrieved evidence image: ${evidenceImage.description}`);
      
      // Test avatar retrieval
      const avatar = MockImageHelpers.getRandomAvatar();
      if (!avatar) {
        throw new Error('Failed to get avatar');
      }
      console.log(`✅ Retrieved avatar: ${avatar}`);
      
      // Test icon retrieval
      const serviceIcon = MockImageHelpers.getServiceIcon('mythic_plus');
      const currencyIcon = MockImageHelpers.getCurrencyIcon('gold');
      const statusIcon = MockImageHelpers.getStatusIcon('completed');
      
      console.log(`✅ Icons - Service: ${serviceIcon}, Currency: ${currencyIcon}, Status: ${statusIcon}`);
      
      this.testResults.push({ test: 'Mock Images', status: 'PASS', details: 'All image helper functions working correctly' });
    } catch (error) {
      console.error('❌ Mock Images Failed:', error.message);
      this.testResults.push({ test: 'Mock Images', status: 'FAIL', details: error.message });
    }
    
    console.log('');
  }

  // Test data relationships and integrity
  testDataRelationships() {
    console.log('🔗 Testing Data Relationships...');
    
    try {
      let relationshipErrors = [];
      
      // Test order-service relationships
      MockData.orders.forEach(order => {
        const service = mockDataManager.getService(order.serviceId);
        if (!service) {
          relationshipErrors.push(`Order ${order.id} references non-existent service ${order.serviceId}`);
        }
        
        const buyer = mockDataManager.getBuyer(order.buyerId);
        if (!buyer) {
          relationshipErrors.push(`Order ${order.id} references non-existent buyer ${order.buyerId}`);
        }
        
        const advertiser = mockDataManager.getUser(order.advertiserId);
        if (!advertiser) {
          relationshipErrors.push(`Order ${order.id} references non-existent advertiser ${order.advertiserId}`);
        }
        
        if (order.boosterId) {
          const booster = mockDataManager.getUser(order.boosterId);
          if (!booster) {
            relationshipErrors.push(`Order ${order.id} references non-existent booster ${order.boosterId}`);
          }
        }
      });
      
      // Test team-user relationships
      MockData.teams.forEach(team => {
        const leader = mockDataManager.getUser(team.leaderId);
        if (!leader) {
          relationshipErrors.push(`Team ${team.id} references non-existent leader ${team.leaderId}`);
        }
        
        team.members.forEach(member => {
          const user = mockDataManager.getUser(member.userId);
          if (!user) {
            relationshipErrors.push(`Team ${team.id} references non-existent member ${member.userId}`);
          }
        });
      });
      
      // Test wallet-user relationships
      MockData.wallets.forEach(wallet => {
        const user = mockDataManager.getUser(wallet.userId);
        if (!user) {
          relationshipErrors.push(`Wallet references non-existent user ${wallet.userId}`);
        }
      });
      
      if (relationshipErrors.length > 0) {
        throw new Error(`Found ${relationshipErrors.length} relationship errors: ${relationshipErrors.join(', ')}`);
      }
      
      console.log('✅ All data relationships are valid');
      this.testResults.push({ test: 'Data Relationships', status: 'PASS', details: 'All relationships verified successfully' });
    } catch (error) {
      console.error('❌ Data Relationships Failed:', error.message);
      this.testResults.push({ test: 'Data Relationships', status: 'FAIL', details: error.message });
    }
    
    console.log('');
  }

  // Display test results summary
  displayResults() {
    console.log('📋 Test Results Summary:');
    console.log('========================');
    
    let passCount = 0;
    let failCount = 0;
    
    this.testResults.forEach(result => {
      const status = result.status === 'PASS' ? '✅' : '❌';
      console.log(`${status} ${result.test}: ${result.status}`);
      if (result.status === 'PASS') passCount++;
      else failCount++;
    });
    
    console.log('========================');
    console.log(`Total Tests: ${this.testResults.length}`);
    console.log(`Passed: ${passCount}`);
    console.log(`Failed: ${failCount}`);
    console.log(`Success Rate: ${((passCount / this.testResults.length) * 100).toFixed(1)}%`);
    
    if (failCount === 0) {
      console.log('🎉 All tests passed! Mock data system is ready to use.');
    } else {
      console.log('⚠️ Some tests failed. Please check the errors above.');
    }
  }

  // Demonstrate mock data usage
  demonstrateUsage() {
    console.log('\n🎯 Mock Data Usage Examples:');
    console.log('============================');
    
    // Example 1: Get user dashboard data
    console.log('\n1. Getting user dashboard data:');
    const user = mockDataManager.getUser('user_001');
    const stats = mockDataManager.getDashboardStats(user.id);
    console.log(`User: ${user.discordUsername}`);
    console.log(`Active Services: ${stats.activeServices}`);
    console.log(`Total Orders: ${stats.totalOrders}`);
    console.log(`Completion Rate: ${stats.completionRate}%`);
    
    // Example 2: Get team information
    console.log('\n2. Getting team information:');
    const teams = mockDataManager.getTeamsByLeader('user_003');
    if (teams.length > 0) {
      const team = teams[0];
      console.log(`Team: ${team.name}`);
      console.log(`Members: ${team.members.length}`);
      console.log(`Total Earnings: ${team.stats.totalEarnings}`);
    }
    
    // Example 3: Get pending orders
    console.log('\n3. Getting pending orders:');
    const pendingOrders = mockDataManager.getPendingOrders();
    console.log(`Pending Orders: ${pendingOrders.length}`);
    pendingOrders.slice(0, 2).forEach(order => {
      const service = mockDataManager.getService(order.serviceId);
      console.log(`- Order ${order.id}: ${service.title} (${order.pricePaid} ${order.currencyUsed})`);
    });
    
    // Example 4: Currency conversion
    console.log('\n4. Currency conversion example:');
    try {
      const conversion = mockDataManager.convertCurrency(100, 'usd', 'gold');
      console.log(`$100 USD = ${conversion.convertedAmount} Gold (fee: ${conversion.fee} Gold)`);
    } catch (error) {
      console.log(`Conversion error: ${error.message}`);
    }
    
    // Example 5: Generate new data
    console.log('\n5. Generating new mock data:');
    const newUsers = mockDataGenerator.generateMultipleUsers(3, ['booster']);
    console.log(`Generated ${newUsers.length} new boosters:`);
    newUsers.forEach(user => {
      console.log(`- ${user.discordUsername} (Rating: ${user.stats.rating})`);
    });
  }
}

// Auto-run tests when this file is loaded (if in browser environment)
if (typeof window !== 'undefined') {
  // Wait for DOM and other scripts to load
  window.addEventListener('DOMContentLoaded', () => {
    setTimeout(async () => {
      const tester = new MockDataTest();
      await tester.runAllTests();
      tester.demonstrateUsage();
    }, 100);
  });
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MockDataTest;
} else if (typeof window !== 'undefined') {
  window.MockDataTest = MockDataTest;
}