// Mock Data Generator
// Functions to generate additional realistic mock data on demand

class MockDataGenerator {
  constructor() {
    this.discordUsernames = [
      'ShadowHunter', 'MythicMaster', 'RaidLeader', 'PvPChamp', 'BoostPro',
      'EliteGamer', 'DungeonKing', 'LootHunter', 'AchievementSeeker', 'ProPlayer',
      'GuildMaster', 'TopBooster', 'RatingClimber', 'KeyMaster', 'LegendaryPlayer',
      'SkillfulGamer', 'ExpertBooster', 'ChampionPlayer', 'MasterRaider', 'PvPLegend'
    ];

    this.discordDiscriminators = Array.from({length: 100}, (_, i) => 
      String(i + 1).padStart(4, '0')
    );

    this.characterNames = [
      'Shadowbane', 'Frostmourne', 'Lightbringer', 'Doomhammer', 'Stormrage',
      'Nightfall', 'Bloodfang', 'Ironforge', 'Goldshire', 'Darkshore',
      'Thunderfury', 'Ashbringer', 'Sulfuras', 'Benediction', 'Anathema',
      'Thunderstrike', 'Flamestrike', 'Frostbolt', 'Shadowbolt', 'Holylight'
    ];

    this.realms = [
      'Stormrage', 'Area-52', 'Tichondrius', 'Mal\'Ganis', 'Illidan',
      'Kil\'jaeden', 'Arthas', 'Dalaran', 'Sargeras', 'Emerald Dream',
      'Bleeding Hollow', 'Darkspear', 'Frostmourne', 'Barthilas', 'Jubei\'Thos'
    ];

    this.characterClasses = [
      'Death Knight', 'Warrior', 'Demon Hunter', 'Mage', 'Paladin',
      'Hunter', 'Priest', 'Rogue', 'Shaman', 'Warlock', 'Monk', 'Druid', 'Evoker'
    ];

    this.serviceTemplates = {
      mythic_plus: [
        {
          titleTemplate: 'Mythic+{level} {dungeon} - {guarantee}',
          dungeons: ['Necrotic Wake', 'Mists of Tirna Scithe', 'Siege of Boralus', 'The Dawnbreaker', 'Ara-Kara', 'City of Threads', 'Grim Batol', 'Stonevault'],
          guarantees: ['Timed Run Guaranteed', 'Loot Included', 'Weekly Chest', 'Fast Completion', 'Professional Service'],
          levels: [15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25],
          basePrice: { gold: 200, usd: 10, toman: 500000 }
        }
      ],
      leveling: [
        {
          titleTemplate: 'Level {startLevel}-{endLevel} Power Leveling - {method}',
          startLevels: [70, 75, 78],
          endLevels: [80],
          methods: ['Fast & Safe', 'Dungeon Spam', 'Quest Optimization', 'Mixed Method', 'Speed Run'],
          basePrice: { gold: 600, usd: 30, toman: 1500000 }
        }
      ],
      delves: [
        {
          titleTemplate: 'Tier {tier} Delve Completion - {reward}',
          tiers: [8, 9, 10, 11],
          rewards: ['All Rewards', 'Mount Farming', 'Gear Focus', 'Achievement Hunt', 'Weekly Clear'],
          basePrice: { gold: 250, usd: 12, toman: 600000 }
        }
      ],
      custom_boost: [
        {
          titleTemplate: '{type} Boost - {specialization}',
          types: ['PvP Rating', 'Achievement Hunting', 'Reputation Grind', 'Gear Farming', 'Mount Collection'],
          specializations: ['Arena Focus', 'RBG Specialist', 'Rare Achievements', 'Meta Completion', 'Speed Service'],
          basePrice: { gold: 800, usd: 40, toman: 2000000 }
        }
      ]
    };

    this.orderStatuses = ['pending', 'assigned', 'in_progress', 'evidence_submitted', 'completed', 'rejected'];
    this.currencies = ['gold', 'usd', 'toman'];
  }

  // Generate a random Discord username
  generateDiscordUsername() {
    const username = this.discordUsernames[Math.floor(Math.random() * this.discordUsernames.length)];
    const discriminator = this.discordDiscriminators[Math.floor(Math.random() * this.discordDiscriminators.length)];
    return `${username}#${discriminator}`;
  }

  // Generate a random Discord ID
  generateDiscordId() {
    return Math.floor(Math.random() * 900000000000000000) + 100000000000000000;
  }

  // Generate a random user
  generateUser(roles = ['booster']) {
    const id = `user_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const discordId = this.generateDiscordId().toString();
    const discordUsername = this.generateDiscordUsername();
    
    return {
      id,
      discordId,
      discordUsername,
      discordAvatarUrl: MockImageHelpers.getRandomAvatar(),
      email: `${discordUsername.split('#')[0].toLowerCase()}@example.com`,
      roles: Array.isArray(roles) ? roles : [roles],
      createdAt: this.generateRandomDate(30).toISOString(),
      isActive: Math.random() > 0.1, // 90% active users
      stats: {
        completedOrders: Math.floor(Math.random() * 200),
        rating: (Math.random() * 1.5 + 3.5).toFixed(1), // 3.5-5.0 rating
        totalEarnings: Math.floor(Math.random() * 50000)
      }
    };
  }

  // Generate a random service
  generateService(createdBy, workspaceType = 'personal', workspaceOwnerId = null) {
    const serviceTypes = Object.keys(this.serviceTemplates);
    const serviceType = serviceTypes[Math.floor(Math.random() * serviceTypes.length)];
    const template = this.serviceTemplates[serviceType][0];
    
    let title = template.titleTemplate;
    let description = '';
    let pricing = { ...template.basePrice };
    
    // Customize based on service type
    switch (serviceType) {
      case 'mythic_plus':
        const level = template.levels[Math.floor(Math.random() * template.levels.length)];
        const dungeon = template.dungeons[Math.floor(Math.random() * template.dungeons.length)];
        const guarantee = template.guarantees[Math.floor(Math.random() * template.guarantees.length)];
        
        title = title.replace('{level}', level).replace('{dungeon}', dungeon).replace('{guarantee}', guarantee);
        description = `Professional M+${level} ${dungeon} completion. ${guarantee.toLowerCase()}. Experienced team with optimal routes and strategies.`;
        
        // Adjust pricing based on level
        const levelMultiplier = (level - 14) * 0.2 + 1;
        pricing.gold = Math.floor(pricing.gold * levelMultiplier);
        pricing.usd = Math.floor(pricing.usd * levelMultiplier * 100) / 100;
        pricing.toman = Math.floor(pricing.toman * levelMultiplier);
        break;
        
      case 'leveling':
        const startLevel = template.startLevels[Math.floor(Math.random() * template.startLevels.length)];
        const endLevel = template.endLevels[0];
        const method = template.methods[Math.floor(Math.random() * template.methods.length)];
        
        title = title.replace('{startLevel}', startLevel).replace('{endLevel}', endLevel).replace('{method}', method);
        description = `Quick and secure leveling service from ${startLevel} to ${endLevel}. Using ${method.toLowerCase()} for maximum efficiency.`;
        
        // Adjust pricing based on level range
        const levelRange = endLevel - startLevel;
        const rangeMultiplier = levelRange / 10;
        pricing.gold = Math.floor(pricing.gold * rangeMultiplier);
        pricing.usd = Math.floor(pricing.usd * rangeMultiplier * 100) / 100;
        pricing.toman = Math.floor(pricing.toman * rangeMultiplier);
        break;
        
      case 'delves':
        const tier = template.tiers[Math.floor(Math.random() * template.tiers.length)];
        const reward = template.rewards[Math.floor(Math.random() * template.rewards.length)];
        
        title = title.replace('{tier}', tier).replace('{reward}', reward);
        description = `Complete Tier ${tier} Delve runs focusing on ${reward.toLowerCase()}. Professional service with guaranteed completion.`;
        
        // Adjust pricing based on tier
        const tierMultiplier = (tier - 7) * 0.3 + 1;
        pricing.gold = Math.floor(pricing.gold * tierMultiplier);
        pricing.usd = Math.floor(pricing.usd * tierMultiplier * 100) / 100;
        pricing.toman = Math.floor(pricing.toman * tierMultiplier);
        break;
        
      case 'custom_boost':
        const type = template.types[Math.floor(Math.random() * template.types.length)];
        const specialization = template.specializations[Math.floor(Math.random() * template.specializations.length)];
        
        title = title.replace('{type}', type).replace('{specialization}', specialization);
        description = `Professional ${type.toLowerCase()} service with ${specialization.toLowerCase()}. Customized approach for your specific needs.`;
        break;
    }
    
    return {
      id: `service_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      title,
      description,
      gameId: 'wow',
      serviceType,
      workspaceType,
      workspaceOwnerId: workspaceOwnerId || createdBy,
      createdBy,
      priceGold: pricing.gold,
      priceUsd: pricing.usd,
      priceToman: pricing.toman,
      estimatedTime: this.generateEstimatedTime(serviceType),
      requirements: this.generateRequirements(serviceType),
      status: Math.random() > 0.2 ? 'active' : 'inactive', // 80% active services
      createdAt: this.generateRandomDate(60).toISOString(),
      updatedAt: this.generateRandomDate(30).toISOString(),
      tags: this.generateServiceTags(serviceType)
    };
  }

  // Generate a random order
  generateOrder(serviceId, buyerId, advertiserId) {
    const service = mockDataManager.getService(serviceId);
    const buyer = mockDataManager.getBuyer(buyerId);
    
    if (!service || !buyer) {
      return null;
    }
    
    const currency = this.currencies[Math.floor(Math.random() * this.currencies.length)];
    const priceKey = `price${currency.charAt(0).toUpperCase() + currency.slice(1)}`;
    const status = this.orderStatuses[Math.floor(Math.random() * this.orderStatuses.length)];
    
    const createdAt = this.generateRandomDate(30);
    const order = {
      id: `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      serviceId,
      buyerId,
      advertiserId,
      boosterId: status !== 'pending' ? this.generateRandomBoosterId() : null,
      status,
      pricePaid: service[priceKey],
      currencyUsed: currency,
      gameCredentials: this.generateGameCredentials(buyer),
      specialInstructions: this.generateSpecialInstructions(),
      createdAt: createdAt.toISOString(),
      timeline: [{
        status: 'pending',
        timestamp: createdAt.toISOString(),
        note: 'Order created'
      }]
    };
    
    // Add timeline entries based on status
    this.generateOrderTimeline(order, createdAt);
    
    // Add evidence if order is completed or evidence_submitted
    if (status === 'completed' || status === 'evidence_submitted') {
      order.evidence = this.generateEvidence(service.serviceType);
    }
    
    return order;
  }

  // Generate a random buyer
  generateBuyer() {
    const discordUsername = this.generateDiscordUsername();
    
    return {
      id: `buyer_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      discordUsername,
      discordAvatarUrl: MockImageHelpers.getRandomAvatar(),
      joinedAt: this.generateRandomDate(90).toISOString(),
      totalOrders: Math.floor(Math.random() * 20),
      completedOrders: Math.floor(Math.random() * 15),
      rating: Math.random() > 0.1 ? (Math.random() * 2 + 3).toFixed(1) : null
    };
  }

  // Generate a random team
  generateTeam(leaderId) {
    const teamNames = [
      'Elite Boosting Crew', 'Mythic Plus Masters', 'Pro Gaming Squad', 'Legendary Boosters',
      'Champion Services', 'Expert Gaming Team', 'Premium Boost Co', 'Elite Gaming Guild',
      'Master Boosters United', 'Professional Gaming Services'
    ];
    
    const name = teamNames[Math.floor(Math.random() * teamNames.length)];
    
    return {
      id: `team_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name,
      description: `Professional WoW boosting team specializing in high-end content and quality service delivery.`,
      leaderId,
      members: [{
        userId: leaderId,
        role: 'leader',
        status: 'active',
        joinedAt: this.generateRandomDate(180).toISOString(),
        permissions: ['manage_team', 'manage_services', 'assign_orders', 'view_analytics'],
        contributionStats: {
          servicesCreated: Math.floor(Math.random() * 20),
          ordersGenerated: Math.floor(Math.random() * 100),
          totalEarnings: Math.floor(Math.random() * 10000)
        }
      }],
      settings: {
        autoApproveMembers: Math.random() > 0.5,
        earningsDistribution: 'leader_wallet',
        requireApprovalForServices: Math.random() > 0.3,
        allowMemberInvites: Math.random() > 0.4
      },
      isActive: true,
      createdAt: this.generateRandomDate(180).toISOString(),
      stats: {
        totalMembers: 1,
        activeMembers: 1,
        totalServices: 0,
        totalOrders: 0,
        totalEarnings: 0,
        averageRating: 5.0
      }
    };
  }

  // Helper methods
  generateRandomDate(daysBack) {
    const now = new Date();
    const randomDays = Math.floor(Math.random() * daysBack);
    const randomHours = Math.floor(Math.random() * 24);
    const randomMinutes = Math.floor(Math.random() * 60);
    
    return new Date(now.getTime() - (randomDays * 24 * 60 * 60 * 1000) - (randomHours * 60 * 60 * 1000) - (randomMinutes * 60 * 1000));
  }

  generateEstimatedTime(serviceType) {
    const times = {
      mythic_plus: ['30-45 minutes', '45-60 minutes', '1-1.5 hours'],
      leveling: ['6-8 hours', '8-12 hours', '12-16 hours'],
      delves: ['20-30 minutes', '30-45 minutes', '45-60 minutes'],
      custom_boost: ['1-2 hours', '2-4 hours', '4-6 hours']
    };
    
    const serviceTimes = times[serviceType] || times.custom_boost;
    return serviceTimes[Math.floor(Math.random() * serviceTimes.length)];
  }

  generateRequirements(serviceType) {
    const requirements = {
      mythic_plus: [
        'Level 80, Item Level 580+, Discord for communication',
        'Level 80, Item Level 570+, Own key preferred',
        'Level 80, Item Level 590+, Mythic+ experience recommended'
      ],
      leveling: [
        'Character at starting level, account credentials if account sharing',
        'Level 70+ character, Discord for updates',
        'Valid WoW account, character ready for leveling'
      ],
      delves: [
        'Level 80, Item Level 570+, Delve key',
        'Level 80, Item Level 580+, Discord required',
        'Level 80, Delve access unlocked'
      ],
      custom_boost: [
        'Level 80, Discord required, specific requirements vary',
        'Max level character, Discord for coordination',
        'Account access or self-play, Discord communication'
      ]
    };
    
    const serviceRequirements = requirements[serviceType] || requirements.custom_boost;
    return serviceRequirements[Math.floor(Math.random() * serviceRequirements.length)];
  }

  generateServiceTags(serviceType) {
    const tags = {
      mythic_plus: [['mythic+', 'timed', 'loot'], ['mythic+', 'weekly', 'chest'], ['mythic+', 'fast', 'professional']],
      leveling: [['leveling', 'fast', 'safe'], ['leveling', 'questing', 'efficient'], ['leveling', 'dungeon', 'speed']],
      delves: [['delves', 'rewards', 'mounts'], ['delves', 'tier11', 'gear'], ['delves', 'weekly', 'completion']],
      custom_boost: [['custom', 'flexible', 'professional'], ['boost', 'personalized', 'quality'], ['service', 'tailored', 'expert']]
    };
    
    const serviceTags = tags[serviceType] || tags.custom_boost;
    return serviceTags[Math.floor(Math.random() * serviceTags.length)];
  }

  generateGameCredentials(buyer) {
    const characterName = this.characterNames[Math.floor(Math.random() * this.characterNames.length)];
    const realm = this.realms[Math.floor(Math.random() * this.realms.length)];
    const characterClass = this.characterClasses[Math.floor(Math.random() * this.characterClasses.length)];
    
    return {
      username: characterName,
      realm: realm,
      characterClass: characterClass,
      characterLevel: 80
    };
  }

  generateSpecialInstructions() {
    const instructions = [
      'Please be careful with my character.',
      'Looking for specific loot drops. Will tip extra if they drop!',
      'Need this completed quickly for weekly reset.',
      'First time using boost service, please be patient.',
      'Will tip extra for excellent service and communication.',
      'Character has sentimental value, please take care.',
      'Need completion before raid night tomorrow.',
      'Looking to learn the strategy, please explain as you go.',
      'Have Discord available for communication during service.',
      'Flexible on timing, just need it done this week.'
    ];
    
    return instructions[Math.floor(Math.random() * instructions.length)];
  }

  generateRandomBoosterId() {
    const boosters = mockDataManager.getUsersByRole('booster');
    if (boosters.length === 0) return null;
    
    return boosters[Math.floor(Math.random() * boosters.length)].id;
  }

  generateOrderTimeline(order, createdAt) {
    let currentDate = new Date(createdAt);
    
    if (order.status !== 'pending') {
      // Add assigned status
      currentDate = new Date(currentDate.getTime() + (Math.random() * 2 * 60 * 60 * 1000)); // 0-2 hours later
      order.assignedAt = currentDate.toISOString();
      order.timeline.push({
        status: 'assigned',
        timestamp: currentDate.toISOString(),
        note: 'Assigned to booster'
      });
    }
    
    if (['in_progress', 'evidence_submitted', 'completed', 'rejected'].includes(order.status)) {
      // Add in_progress status
      currentDate = new Date(currentDate.getTime() + (Math.random() * 4 * 60 * 60 * 1000)); // 0-4 hours later
      order.startedAt = currentDate.toISOString();
      order.timeline.push({
        status: 'in_progress',
        timestamp: currentDate.toISOString(),
        note: 'Booster started the service'
      });
    }
    
    if (['evidence_submitted', 'completed', 'rejected'].includes(order.status)) {
      // Add evidence_submitted status
      currentDate = new Date(currentDate.getTime() + (Math.random() * 6 * 60 * 60 * 1000)); // 0-6 hours later
      order.timeline.push({
        status: 'evidence_submitted',
        timestamp: currentDate.toISOString(),
        note: 'Evidence uploaded by booster'
      });
    }
    
    if (['completed', 'rejected'].includes(order.status)) {
      // Add final status
      currentDate = new Date(currentDate.getTime() + (Math.random() * 2 * 60 * 60 * 1000)); // 0-2 hours later
      order.completedAt = currentDate.toISOString();
      order.timeline.push({
        status: order.status,
        timestamp: currentDate.toISOString(),
        note: order.status === 'completed' ? 'Order approved and completed' : 'Order rejected'
      });
      
      if (order.status === 'completed') {
        order.reviewNotes = 'Excellent service! Fast completion and good communication.';
      } else {
        order.reviewNotes = 'Service not completed as promised. Refund issued.';
      }
    }
  }

  generateEvidence(serviceType) {
    const evidenceImage = MockImageHelpers.getRandomEvidenceImage(serviceType);
    const notes = [
      'Service completed successfully as requested. All objectives met.',
      'Completed with excellent results. Character is safe and ready.',
      'Professional service delivery. All requirements fulfilled.',
      'Fast and efficient completion. Customer will be satisfied.',
      'High-quality service provided. Exceeded expectations.'
    ];
    
    return {
      imageUrl: evidenceImage.url,
      notes: notes[Math.floor(Math.random() * notes.length)],
      uploadedAt: new Date().toISOString()
    };
  }

  // Batch generation methods
  generateMultipleUsers(count, roles = ['booster']) {
    return Array.from({ length: count }, () => this.generateUser(roles));
  }

  generateMultipleServices(count, createdBy, workspaceType = 'personal', workspaceOwnerId = null) {
    return Array.from({ length: count }, () => 
      this.generateService(createdBy, workspaceType, workspaceOwnerId)
    );
  }

  generateMultipleBuyers(count) {
    return Array.from({ length: count }, () => this.generateBuyer());
  }

  generateMultipleOrders(count, serviceIds, buyerIds, advertiserIds) {
    const orders = [];
    for (let i = 0; i < count; i++) {
      const serviceId = serviceIds[Math.floor(Math.random() * serviceIds.length)];
      const buyerId = buyerIds[Math.floor(Math.random() * buyerIds.length)];
      const advertiserId = advertiserIds[Math.floor(Math.random() * advertiserIds.length)];
      
      const order = this.generateOrder(serviceId, buyerId, advertiserId);
      if (order) {
        orders.push(order);
      }
    }
    return orders;
  }
}

// Create global instance
const mockDataGenerator = new MockDataGenerator();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MockDataGenerator, mockDataGenerator };
} else if (typeof window !== 'undefined') {
  window.MockDataGenerator = MockDataGenerator;
  window.mockDataGenerator = mockDataGenerator;
}