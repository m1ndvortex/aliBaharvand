// Mock Data for Service Provider Dashboard
// This file contains realistic mock data for all entities in the system

const MockData = {
  // Mock Users with Discord usernames, avatars, and multiple roles
  users: [
    {
      id: 'user_001',
      discordId: '123456789012345678',
      discordUsername: 'ProBooster#1234',
      discordAvatarUrl: 'https://cdn.discordapp.com/avatars/123456789012345678/a1b2c3d4e5f6g7h8i9j0.png',
      email: 'probooster@example.com',
      roles: ['advertiser', 'team_advertiser', 'booster'],
      createdAt: '2024-01-15T10:30:00Z',
      isActive: true,
      stats: {
        completedOrders: 156,
        rating: 4.9,
        totalEarnings: 15600
      }
    },
    {
      id: 'user_002',
      discordId: '234567890123456789',
      discordUsername: 'MythicMaster#5678',
      discordAvatarUrl: 'https://cdn.discordapp.com/avatars/234567890123456789/b2c3d4e5f6g7h8i9j0k1.png',
      email: 'mythicmaster@example.com',
      roles: ['advertiser', 'booster'],
      createdAt: '2024-02-01T14:20:00Z',
      isActive: true,
      stats: {
        completedOrders: 89,
        rating: 4.8,
        totalEarnings: 8900
      }
    },
    {
      id: 'user_003',
      discordId: '345678901234567890',
      discordUsername: 'TeamLeader#9999',
      discordAvatarUrl: 'https://cdn.discordapp.com/avatars/345678901234567890/c3d4e5f6g7h8i9j0k1l2.png',
      email: 'teamleader@example.com',
      roles: ['team_advertiser', 'advertiser'],
      createdAt: '2024-01-10T09:15:00Z',
      isActive: true,
      stats: {
        completedOrders: 234,
        rating: 4.95,
        totalEarnings: 23400
      }
    },
    {
      id: 'user_004',
      discordId: '456789012345678901',
      discordUsername: 'RaidExpert#7777',
      discordAvatarUrl: 'https://cdn.discordapp.com/avatars/456789012345678901/d4e5f6g7h8i9j0k1l2m3.png',
      email: 'raidexpert@example.com',
      roles: ['booster'],
      createdAt: '2024-02-15T16:45:00Z',
      isActive: true,
      stats: {
        completedOrders: 67,
        rating: 4.7,
        totalEarnings: 6700
      }
    },
    {
      id: 'user_005',
      discordId: '567890123456789012',
      discordUsername: 'DelveSpecialist#3333',
      discordAvatarUrl: 'https://cdn.discordapp.com/avatars/567890123456789012/e5f6g7h8i9j0k1l2m3n4.png',
      email: 'delvespec@example.com',
      roles: ['advertiser', 'booster'],
      createdAt: '2024-03-01T11:30:00Z',
      isActive: true,
      stats: {
        completedOrders: 45,
        rating: 4.6,
        totalEarnings: 4500
      }
    }
  ],

  // Mock Services with realistic titles, descriptions, and pricing across all service types
  services: [
    {
      id: 'service_001',
      title: 'Mythic+20 Dungeon Boost - Timed Run Guaranteed',
      description: 'Professional M+20 completion with guaranteed timing. Includes all loot and weekly chest rewards. Our experienced team ensures smooth runs with optimal routes and strategies.',
      gameId: 'wow',
      serviceType: 'mythic_plus',
      workspaceType: 'personal',
      workspaceOwnerId: 'user_001',
      createdBy: 'user_001',
      priceGold: 500,
      priceUsd: 25.00,
      priceToman: 1250000,
      estimatedTime: '45-60 minutes',
      requirements: 'Level 80, Item Level 580+, Discord for communication',
      status: 'active',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T11:00:00Z',
      tags: ['mythic+', 'timed', 'loot', 'weekly']
    },
    {
      id: 'service_002',
      title: 'Level 70-80 Power Leveling - Fast & Safe',
      description: 'Quick and secure leveling service from 70 to 80. We use optimal questing routes and dungeon spam for maximum efficiency. Account sharing or self-play options available.',
      gameId: 'wow',
      serviceType: 'leveling',
      workspaceType: 'team',
      workspaceOwnerId: 'team_001',
      createdBy: 'user_003',
      priceGold: 800,
      priceUsd: 40.00,
      priceToman: 2000000,
      estimatedTime: '8-12 hours',
      requirements: 'Level 70 character, account credentials if account sharing',
      status: 'active',
      createdAt: '2024-02-01T14:20:00Z',
      updatedAt: '2024-02-05T09:15:00Z',
      tags: ['leveling', 'fast', 'safe', 'questing']
    },
    {
      id: 'service_003',
      title: 'Tier 11 Delve Completion - All Rewards',
      description: 'Complete Tier 11 Delve runs with all possible rewards including rare mounts, pets, and high-level gear. Perfect for players looking to maximize their delve rewards efficiently.',
      gameId: 'wow',
      serviceType: 'delves',
      workspaceType: 'personal',
      workspaceOwnerId: 'user_005',
      createdBy: 'user_005',
      priceGold: 300,
      priceUsd: 15.00,
      priceToman: 750000,
      estimatedTime: '30-45 minutes',
      requirements: 'Level 80, Item Level 570+, Delve key',
      status: 'active',
      createdAt: '2024-03-01T11:30:00Z',
      updatedAt: '2024-03-01T11:30:00Z',
      tags: ['delves', 'tier11', 'rewards', 'mounts']
    },
    {
      id: 'service_004',
      title: 'Custom PvP Rating Boost - Arena/RBG',
      description: 'Personalized PvP rating boost for Arena or Rated Battlegrounds. Choose your target rating and we will get you there safely. Includes coaching and gear optimization tips.',
      gameId: 'wow',
      serviceType: 'custom_boost',
      workspaceType: 'personal',
      workspaceOwnerId: 'user_002',
      createdBy: 'user_002',
      priceGold: 1000,
      priceUsd: 50.00,
      priceToman: 2500000,
      estimatedTime: '3-5 hours',
      requirements: 'Level 80, PvP gear recommended, Discord required',
      status: 'active',
      createdAt: '2024-02-15T16:45:00Z',
      updatedAt: '2024-02-20T10:30:00Z',
      tags: ['pvp', 'arena', 'rbg', 'rating', 'coaching']
    },
    {
      id: 'service_005',
      title: 'Mythic+15 Weekly Chest - Multiple Dungeons',
      description: 'Complete multiple M+15 dungeons for your weekly chest. We run 4-8 dungeons depending on your needs. Great for consistent weekly rewards and valor points.',
      gameId: 'wow',
      serviceType: 'mythic_plus',
      workspaceType: 'team',
      workspaceOwnerId: 'team_001',
      createdBy: 'user_001',
      priceGold: 200,
      priceUsd: 10.00,
      priceToman: 500000,
      estimatedTime: '2-3 hours',
      requirements: 'Level 80, Item Level 570+, Own key preferred',
      status: 'inactive',
      createdAt: '2024-01-20T08:00:00Z',
      updatedAt: '2024-03-10T15:20:00Z',
      tags: ['mythic+', 'weekly', 'chest', 'valor']
    },
    {
      id: 'service_006',
      title: 'Achievement Hunting - Rare & Meta Achievements',
      description: 'Professional achievement completion service for rare and meta achievements. Includes mount rewards, titles, and feat of strength achievements that require specific strategies.',
      gameId: 'wow',
      serviceType: 'custom_boost',
      workspaceType: 'personal',
      workspaceOwnerId: 'user_004',
      createdBy: 'user_004',
      priceGold: 600,
      priceUsd: 30.00,
      priceToman: 1500000,
      estimatedTime: '1-4 hours',
      requirements: 'Varies by achievement, Level 80 recommended',
      status: 'active',
      createdAt: '2024-02-28T13:15:00Z',
      updatedAt: '2024-03-05T11:45:00Z',
      tags: ['achievements', 'mounts', 'titles', 'rare']
    }
  ],

  // Mock Orders with various statuses and realistic progression
  orders: [
    {
      id: 'order_001',
      serviceId: 'service_001',
      buyerId: 'buyer_001',
      boosterId: 'user_001',
      advertiserId: 'user_001',
      status: 'completed',
      pricePaid: 500,
      currencyUsed: 'gold',
      gameCredentials: { 
        username: 'BuyerChar', 
        realm: 'Stormrage',
        characterClass: 'Death Knight',
        characterLevel: 80
      },
      specialInstructions: 'Please be careful with my character. Need the trinket from last boss.',
      evidence: {
        imageUrl: '/mock-images/evidence_001.png',
        notes: 'Completed M+20 Necrotic Wake in time (18:45). Got 3 items including the requested trinket. Character is safe in Dornogal.',
        uploadedAt: '2024-03-15T14:30:00Z'
      },
      reviewNotes: 'Excellent work! Fast completion and good communication.',
      createdAt: '2024-03-15T10:00:00Z',
      assignedAt: '2024-03-15T10:15:00Z',
      startedAt: '2024-03-15T12:00:00Z',
      completedAt: '2024-03-15T15:00:00Z',
      timeline: [
        { status: 'pending', timestamp: '2024-03-15T10:00:00Z', note: 'Order created' },
        { status: 'assigned', timestamp: '2024-03-15T10:15:00Z', note: 'Assigned to ProBooster#1234' },
        { status: 'in_progress', timestamp: '2024-03-15T12:00:00Z', note: 'Booster started the service' },
        { status: 'evidence_submitted', timestamp: '2024-03-15T14:30:00Z', note: 'Evidence uploaded' },
        { status: 'completed', timestamp: '2024-03-15T15:00:00Z', note: 'Order approved and completed' }
      ]
    },
    {
      id: 'order_002',
      serviceId: 'service_002',
      buyerId: 'buyer_002',
      boosterId: 'user_003',
      advertiserId: 'user_003',
      status: 'evidence_submitted',
      pricePaid: 40.00,
      currencyUsed: 'usd',
      gameCredentials: { 
        username: 'LevelMeUp', 
        realm: 'Area-52',
        characterClass: 'Warrior',
        characterLevel: 70
      },
      specialInstructions: 'I want to learn the optimal leveling route. Please explain as you go.',
      evidence: {
        imageUrl: '/mock-images/evidence_002.png',
        notes: 'Character leveled from 70 to 80. Used optimal questing in Khaz Algar zones. Explained route and shared addon recommendations. Character has full quest gear.',
        uploadedAt: '2024-03-16T09:45:00Z'
      },
      reviewNotes: null,
      createdAt: '2024-03-14T16:30:00Z',
      assignedAt: '2024-03-14T17:00:00Z',
      startedAt: '2024-03-15T08:00:00Z',
      completedAt: null,
      timeline: [
        { status: 'pending', timestamp: '2024-03-14T16:30:00Z', note: 'Order created' },
        { status: 'assigned', timestamp: '2024-03-14T17:00:00Z', note: 'Assigned to TeamLeader#9999' },
        { status: 'in_progress', timestamp: '2024-03-15T08:00:00Z', note: 'Leveling started' },
        { status: 'evidence_submitted', timestamp: '2024-03-16T09:45:00Z', note: 'Leveling completed, evidence submitted' }
      ]
    },
    {
      id: 'order_003',
      serviceId: 'service_003',
      buyerId: 'buyer_003',
      boosterId: 'user_005',
      advertiserId: 'user_005',
      status: 'in_progress',
      pricePaid: 750000,
      currencyUsed: 'toman',
      gameCredentials: { 
        username: 'DelveRunner', 
        realm: 'Tichondrius',
        characterClass: 'Demon Hunter',
        characterLevel: 80
      },
      specialInstructions: 'Looking for the rare mount drop. Will tip extra if it drops!',
      evidence: null,
      reviewNotes: null,
      createdAt: '2024-03-16T11:20:00Z',
      assignedAt: '2024-03-16T11:35:00Z',
      startedAt: '2024-03-16T14:00:00Z',
      completedAt: null,
      timeline: [
        { status: 'pending', timestamp: '2024-03-16T11:20:00Z', note: 'Order created' },
        { status: 'assigned', timestamp: '2024-03-16T11:35:00Z', note: 'Assigned to DelveSpecialist#3333' },
        { status: 'in_progress', timestamp: '2024-03-16T14:00:00Z', note: 'Delve runs started' }
      ]
    },
    {
      id: 'order_004',
      serviceId: 'service_004',
      buyerId: 'buyer_004',
      boosterId: null,
      advertiserId: 'user_002',
      status: 'pending',
      pricePaid: 1000,
      currencyUsed: 'gold',
      gameCredentials: { 
        username: 'PvPNoob', 
        realm: 'Mal\'Ganis',
        characterClass: 'Mage',
        characterLevel: 80
      },
      specialInstructions: 'Complete beginner to PvP. Need coaching and patience. Target rating is 1800.',
      evidence: null,
      reviewNotes: null,
      createdAt: '2024-03-16T15:45:00Z',
      assignedAt: null,
      startedAt: null,
      completedAt: null,
      timeline: [
        { status: 'pending', timestamp: '2024-03-16T15:45:00Z', note: 'Order created, awaiting booster assignment' }
      ]
    },
    {
      id: 'order_005',
      serviceId: 'service_001',
      buyerId: 'buyer_005',
      boosterId: 'user_004',
      advertiserId: 'user_001',
      status: 'rejected',
      pricePaid: 25.00,
      currencyUsed: 'usd',
      gameCredentials: { 
        username: 'FailedRun', 
        realm: 'Illidan',
        characterClass: 'Paladin',
        characterLevel: 80
      },
      specialInstructions: 'Need this for weekly chest. Any M+20 is fine.',
      evidence: {
        imageUrl: '/mock-images/evidence_005.png',
        notes: 'Run failed at 19:30. Key was depleted. Will retry with better group.',
        uploadedAt: '2024-03-15T16:20:00Z'
      },
      reviewNotes: 'Key was depleted and service not completed as promised. Refund issued.',
      createdAt: '2024-03-15T13:00:00Z',
      assignedAt: '2024-03-15T13:15:00Z',
      startedAt: '2024-03-15T15:30:00Z',
      completedAt: null,
      timeline: [
        { status: 'pending', timestamp: '2024-03-15T13:00:00Z', note: 'Order created' },
        { status: 'assigned', timestamp: '2024-03-15T13:15:00Z', note: 'Assigned to RaidExpert#7777' },
        { status: 'in_progress', timestamp: '2024-03-15T15:30:00Z', note: 'M+20 run started' },
        { status: 'evidence_submitted', timestamp: '2024-03-15T16:20:00Z', note: 'Evidence submitted - run failed' },
        { status: 'rejected', timestamp: '2024-03-15T16:45:00Z', note: 'Order rejected due to service failure' }
      ]
    }
  ],

  // Mock Team Data with members, roles, and activity logs
  teams: [
    {
      id: 'team_001',
      name: 'Elite Boosting Crew',
      description: 'Professional WoW boosting team specializing in high-end content. We focus on Mythic+ dungeons, raid carries, and PvP rating boosts.',
      leaderId: 'user_003',
      members: [
        {
          userId: 'user_003',
          role: 'leader',
          status: 'active',
          joinedAt: '2024-01-01T00:00:00Z',
          permissions: ['manage_team', 'manage_services', 'assign_orders', 'view_analytics'],
          contributionStats: {
            servicesCreated: 15,
            ordersGenerated: 89,
            totalEarnings: 8900
          }
        },
        {
          userId: 'user_001',
          role: 'senior_member',
          status: 'active',
          joinedAt: '2024-01-10T12:00:00Z',
          permissions: ['create_services', 'manage_orders'],
          contributionStats: {
            servicesCreated: 8,
            ordersGenerated: 45,
            totalEarnings: 4500
          }
        },
        {
          userId: 'user_002',
          role: 'member',
          status: 'active',
          joinedAt: '2024-02-01T09:30:00Z',
          permissions: ['create_services'],
          contributionStats: {
            servicesCreated: 3,
            ordersGenerated: 12,
            totalEarnings: 1200
          }
        },
        {
          userId: 'user_006',
          role: 'member',
          status: 'inactive',
          joinedAt: '2024-01-15T14:20:00Z',
          permissions: ['create_services'],
          contributionStats: {
            servicesCreated: 1,
            ordersGenerated: 2,
            totalEarnings: 200
          }
        }
      ],
      settings: {
        autoApproveMembers: false,
        earningsDistribution: 'leader_wallet',
        requireApprovalForServices: true,
        allowMemberInvites: false
      },
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      stats: {
        totalMembers: 4,
        activeMembers: 3,
        totalServices: 27,
        totalOrders: 148,
        totalEarnings: 14800,
        averageRating: 4.85
      }
    },
    {
      id: 'team_002',
      name: 'Mythic Plus Masters',
      description: 'Specialized team focusing exclusively on Mythic+ dungeon content. We guarantee timed runs and optimal routes.',
      leaderId: 'user_007',
      members: [
        {
          userId: 'user_007',
          role: 'leader',
          status: 'active',
          joinedAt: '2024-02-01T00:00:00Z',
          permissions: ['manage_team', 'manage_services', 'assign_orders', 'view_analytics'],
          contributionStats: {
            servicesCreated: 12,
            ordersGenerated: 67,
            totalEarnings: 6700
          }
        },
        {
          userId: 'user_004',
          role: 'member',
          status: 'active',
          joinedAt: '2024-02-15T10:00:00Z',
          permissions: ['create_services'],
          contributionStats: {
            servicesCreated: 5,
            ordersGenerated: 23,
            totalEarnings: 2300
          }
        }
      ],
      settings: {
        autoApproveMembers: true,
        earningsDistribution: 'leader_wallet',
        requireApprovalForServices: false,
        allowMemberInvites: true
      },
      isActive: true,
      createdAt: '2024-02-01T00:00:00Z',
      stats: {
        totalMembers: 2,
        activeMembers: 2,
        totalServices: 17,
        totalOrders: 90,
        totalEarnings: 9000,
        averageRating: 4.9
      }
    }
  ],

  // Activity logs for teams
  teamActivityLogs: [
    {
      id: 'activity_001',
      teamId: 'team_001',
      userId: 'user_001',
      action: 'service_created',
      details: {
        serviceId: 'service_001',
        serviceName: 'Mythic+20 Dungeon Boost - Timed Run Guaranteed'
      },
      timestamp: '2024-03-16T10:30:00Z'
    },
    {
      id: 'activity_002',
      teamId: 'team_001',
      userId: 'user_003',
      action: 'order_assigned',
      details: {
        orderId: 'order_002',
        boosterId: 'user_003',
        serviceName: 'Level 70-80 Power Leveling - Fast & Safe'
      },
      timestamp: '2024-03-14T17:00:00Z'
    },
    {
      id: 'activity_003',
      teamId: 'team_001',
      userId: 'user_002',
      action: 'service_activated',
      details: {
        serviceId: 'service_004',
        serviceName: 'Custom PvP Rating Boost - Arena/RBG'
      },
      timestamp: '2024-03-16T09:15:00Z'
    },
    {
      id: 'activity_004',
      teamId: 'team_001',
      userId: 'user_003',
      action: 'member_invited',
      details: {
        invitedUser: 'newmember@example.com',
        role: 'member'
      },
      timestamp: '2024-03-15T14:20:00Z'
    },
    {
      id: 'activity_005',
      teamId: 'team_001',
      userId: 'user_001',
      action: 'order_completed',
      details: {
        orderId: 'order_001',
        earnings: 500,
        currency: 'gold'
      },
      timestamp: '2024-03-15T15:00:00Z'
    }
  ],

  // Mock Wallet Data with transactions, balances, and payment methods
  wallets: [
    {
      userId: 'user_001',
      balanceGold: 2450,
      balanceUsd: 387.50,
      balanceToman: 8750000,
      totalEarnings: {
        gold: 15600,
        usd: 2340.00,
        toman: 58500000
      },
      paymentMethods: [
        {
          id: 'pm_001',
          type: 'credit_card',
          provider: 'visa',
          lastFour: '4532',
          expiryMonth: 12,
          expiryYear: 2026,
          isDefault: true,
          isVerified: true,
          addedAt: '2024-01-15T10:30:00Z'
        },
        {
          id: 'pm_002',
          type: 'paypal',
          provider: 'paypal',
          email: 'probooster@example.com',
          isDefault: false,
          isVerified: true,
          addedAt: '2024-02-01T14:20:00Z'
        }
      ],
      transactions: [
        {
          id: 'tx_001',
          type: 'earning',
          amount: 500,
          currency: 'gold',
          status: 'completed',
          description: 'Order #order_001 completed - M+20 Boost',
          orderId: 'order_001',
          createdAt: '2024-03-15T15:00:00Z',
          completedAt: '2024-03-15T15:00:00Z'
        },
        {
          id: 'tx_002',
          type: 'deposit',
          amount: 100.00,
          currency: 'usd',
          status: 'completed',
          description: 'Deposit via Credit Card ending in 4532',
          paymentMethodId: 'pm_001',
          createdAt: '2024-03-14T12:30:00Z',
          completedAt: '2024-03-14T12:30:00Z'
        },
        {
          id: 'tx_003',
          type: 'conversion',
          amount: -50.00,
          currency: 'usd',
          status: 'completed',
          description: 'Converted $50 USD to 2,500,000 Toman',
          conversionDetails: {
            fromAmount: 50.00,
            fromCurrency: 'usd',
            toAmount: 2500000,
            toCurrency: 'toman',
            exchangeRate: 50000,
            fee: 1.00
          },
          createdAt: '2024-03-13T16:45:00Z',
          completedAt: '2024-03-13T16:45:00Z'
        },
        {
          id: 'tx_004',
          type: 'conversion',
          amount: 2500000,
          currency: 'toman',
          status: 'completed',
          description: 'Received 2,500,000 Toman from USD conversion',
          conversionDetails: {
            fromAmount: 50.00,
            fromCurrency: 'usd',
            toAmount: 2500000,
            toCurrency: 'toman',
            exchangeRate: 50000,
            fee: 1.00
          },
          createdAt: '2024-03-13T16:45:00Z',
          completedAt: '2024-03-13T16:45:00Z'
        },
        {
          id: 'tx_005',
          type: 'withdrawal',
          amount: -200.00,
          currency: 'usd',
          status: 'pending',
          description: 'Withdrawal request to PayPal',
          paymentMethodId: 'pm_002',
          createdAt: '2024-03-16T10:15:00Z',
          completedAt: null
        }
      ]
    },
    {
      userId: 'user_003',
      balanceGold: 3200,
      balanceUsd: 520.00,
      balanceToman: 12000000,
      totalEarnings: {
        gold: 23400,
        usd: 3510.00,
        toman: 87750000
      },
      paymentMethods: [
        {
          id: 'pm_003',
          type: 'bank_account',
          provider: 'bank_transfer',
          accountNumber: '****1234',
          bankName: 'Chase Bank',
          isDefault: true,
          isVerified: true,
          addedAt: '2024-01-10T09:15:00Z'
        }
      ],
      transactions: [
        {
          id: 'tx_006',
          type: 'earning',
          amount: 40.00,
          currency: 'usd',
          status: 'pending',
          description: 'Order #order_002 - Leveling Service (Pending Approval)',
          orderId: 'order_002',
          createdAt: '2024-03-16T09:45:00Z',
          completedAt: null
        },
        {
          id: 'tx_007',
          type: 'team_earning',
          amount: 1200,
          currency: 'gold',
          status: 'completed',
          description: 'Team earnings from Elite Boosting Crew services',
          teamId: 'team_001',
          createdAt: '2024-03-15T18:00:00Z',
          completedAt: '2024-03-15T18:00:00Z'
        }
      ]
    }
  ],

  // Exchange rates for currency conversion
  exchangeRates: {
    lastUpdated: '2024-03-16T12:00:00Z',
    rates: {
      gold_to_usd: 0.05,      // 1 Gold = $0.05 USD
      usd_to_gold: 20,        // 1 USD = 20 Gold
      usd_to_toman: 50000,    // 1 USD = 50,000 Toman
      toman_to_usd: 0.00002,  // 1 Toman = $0.00002 USD
      gold_to_toman: 2500,    // 1 Gold = 2,500 Toman
      toman_to_gold: 0.0004   // 1 Toman = 0.0004 Gold
    },
    conversionFees: {
      percentage: 2,          // 2% fee on conversions
      minimum: {
        usd: 1.00,
        gold: 20,
        toman: 50000
      }
    }
  },

  // Mock buyers for orders
  buyers: [
    {
      id: 'buyer_001',
      discordUsername: 'GamerBoy#1111',
      discordAvatarUrl: 'https://cdn.discordapp.com/avatars/111111111111111111/buyer1.png',
      joinedAt: '2024-02-01T00:00:00Z',
      totalOrders: 5,
      completedOrders: 4,
      rating: 4.8
    },
    {
      id: 'buyer_002',
      discordUsername: 'CasualPlayer#2222',
      discordAvatarUrl: 'https://cdn.discordapp.com/avatars/222222222222222222/buyer2.png',
      joinedAt: '2024-01-15T00:00:00Z',
      totalOrders: 3,
      completedOrders: 2,
      rating: 4.5
    },
    {
      id: 'buyer_003',
      discordUsername: 'MountCollector#3333',
      discordAvatarUrl: 'https://cdn.discordapp.com/avatars/333333333333333333/buyer3.png',
      joinedAt: '2024-03-01T00:00:00Z',
      totalOrders: 8,
      completedOrders: 7,
      rating: 4.9
    },
    {
      id: 'buyer_004',
      discordUsername: 'PvPNewbie#4444',
      discordAvatarUrl: 'https://cdn.discordapp.com/avatars/444444444444444444/buyer4.png',
      joinedAt: '2024-03-10T00:00:00Z',
      totalOrders: 1,
      completedOrders: 0,
      rating: null
    },
    {
      id: 'buyer_005',
      discordUsername: 'WeeklyChest#5555',
      discordAvatarUrl: 'https://cdn.discordapp.com/avatars/555555555555555555/buyer5.png',
      joinedAt: '2024-02-20T00:00:00Z',
      totalOrders: 2,
      completedOrders: 1,
      rating: 3.5
    }
  ],

  // Admin-created raids for booking (Advertisers can book slots for buyers)
  adminRaids: [
    {
      id: 'raid_001',
      title: 'Mythic Nerub-ar Palace - Full Clear',
      description: 'Complete mythic raid clear with all bosses. Loot distribution via loot council. Experienced raiders only.',
      difficulty: 'mythic',
      raidName: 'Nerub-ar Palace',
      scheduledDate: '2024-03-20T19:00:00Z',
      duration: '3-4 hours',
      maxSlots: 20,
      availableSlots: 3,
      pricePerSlot: {
        gold: 2000,
        usd: 100.00,
        toman: 5000000
      },
      requirements: 'Item Level 630+, Discord required, Mythic raid experience',
      lootSystem: 'loot_council',
      status: 'open_for_booking',
      createdBy: 'admin_001',
      createdAt: '2024-03-10T10:00:00Z',
      bookings: [
        {
          id: 'booking_001',
          advertiserId: 'user_001',
          buyerId: 'buyer_001',
          slotNumber: 1,
          status: 'confirmed',
          bookedAt: '2024-03-12T14:30:00Z'
        },
        {
          id: 'booking_002',
          advertiserId: 'user_003',
          buyerId: 'buyer_003',
          slotNumber: 2,
          status: 'confirmed',
          bookedAt: '2024-03-14T09:15:00Z'
        }
      ]
    },
    {
      id: 'raid_002',
      title: 'Heroic Nerub-ar Palace - AOTC Run',
      description: 'Ahead of the Curve achievement run. Guaranteed kill and achievement. Perfect for players looking to get AOTC.',
      difficulty: 'heroic',
      raidName: 'Nerub-ar Palace',
      scheduledDate: '2024-03-18T20:00:00Z',
      duration: '2-3 hours',
      maxSlots: 30,
      availableSlots: 8,
      pricePerSlot: {
        gold: 800,
        usd: 40.00,
        toman: 2000000
      },
      requirements: 'Item Level 610+, Discord required',
      lootSystem: 'personal_loot',
      status: 'open_for_booking',
      createdBy: 'admin_001',
      createdAt: '2024-03-08T15:20:00Z',
      bookings: []
    }
  ]
};

// Export the mock data for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MockData;
} else if (typeof window !== 'undefined') {
  window.MockData = MockData;
}