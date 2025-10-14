// Mock Images and Evidence Data
// This file contains mock image URLs and evidence data for the prototype

const MockImages = {
  // Evidence screenshots for completed orders
  evidence: {
    mythicPlus: [
      {
        url: 'https://via.placeholder.com/800x600/2f3136/ffffff?text=M%2B20+Necrotic+Wake+Completed+18:45',
        description: 'Mythic+20 Necrotic Wake completion screenshot showing timer and loot'
      },
      {
        url: 'https://via.placeholder.com/800x600/2f3136/ffffff?text=M%2B15+Mists+Completed+16:23',
        description: 'Mythic+15 Mists of Tirna Scithe completion with gear rewards'
      },
      {
        url: 'https://via.placeholder.com/800x600/2f3136/ffffff?text=M%2B18+Siege+Completed+19:12',
        description: 'Mythic+18 Siege of Boralus successful completion'
      }
    ],
    leveling: [
      {
        url: 'https://via.placeholder.com/800x600/2f3136/ffffff?text=Level+80+Character+Sheet',
        description: 'Character sheet showing level 80 achievement and stats'
      },
      {
        url: 'https://via.placeholder.com/800x600/2f3136/ffffff?text=Khaz+Algar+Quest+Complete',
        description: 'Quest completion in Khaz Algar zones with experience gained'
      }
    ],
    delves: [
      {
        url: 'https://via.placeholder.com/800x600/2f3136/ffffff?text=Tier+11+Delve+Rewards',
        description: 'Tier 11 Delve completion with rare mount and gear rewards'
      },
      {
        url: 'https://via.placeholder.com/800x600/2f3136/ffffff?text=Delve+Completion+Certificate',
        description: 'Delve completion achievement and reward summary'
      }
    ],
    pvp: [
      {
        url: 'https://via.placeholder.com/800x600/2f3136/ffffff?text=Arena+Rating+1800+Achieved',
        description: 'Arena rating achievement showing 1800+ rating'
      },
      {
        url: 'https://via.placeholder.com/800x600/2f3136/ffffff?text=RBG+Victory+Screen',
        description: 'Rated Battleground victory with rating increase'
      }
    ],
    raids: [
      {
        url: 'https://via.placeholder.com/800x600/2f3136/ffffff?text=Mythic+Raid+Kill+Screenshot',
        description: 'Mythic raid boss kill with loot and achievement'
      },
      {
        url: 'https://via.placeholder.com/800x600/2f3136/ffffff?text=AOTC+Achievement',
        description: 'Ahead of the Curve achievement completion'
      }
    ],
    achievements: [
      {
        url: 'https://via.placeholder.com/800x600/2f3136/ffffff?text=Rare+Achievement+Unlocked',
        description: 'Rare achievement completion with mount reward'
      },
      {
        url: 'https://via.placeholder.com/800x600/2f3136/ffffff?text=Meta+Achievement+Complete',
        description: 'Meta achievement completion with title reward'
      }
    ]
  },

  // Discord avatars for users
  avatars: {
    default: [
      'https://cdn.discordapp.com/embed/avatars/0.png',
      'https://cdn.discordapp.com/embed/avatars/1.png',
      'https://cdn.discordapp.com/embed/avatars/2.png',
      'https://cdn.discordapp.com/embed/avatars/3.png',
      'https://cdn.discordapp.com/embed/avatars/4.png'
    ],
    custom: [
      'https://via.placeholder.com/128x128/7289da/ffffff?text=PB',
      'https://via.placeholder.com/128x128/43b581/ffffff?text=MM',
      'https://via.placeholder.com/128x128/faa61a/ffffff?text=TL',
      'https://via.placeholder.com/128x128/f04747/ffffff?text=RE',
      'https://via.placeholder.com/128x128/9266cc/ffffff?text=DS'
    ]
  },

  // Service type icons
  serviceIcons: {
    mythic_plus: '🏰',
    leveling: '⬆️',
    delves: '🕳️',
    custom_boost: '⚡',
    raid: '🐉',
    pvp: '⚔️',
    achievement: '🏆'
  },

  // Currency icons
  currencyIcons: {
    gold: '🪙',
    usd: '💵',
    toman: '﷼'
  },

  // Status icons
  statusIcons: {
    pending: '⏳',
    assigned: '👤',
    in_progress: '🔄',
    evidence_submitted: '📸',
    under_review: '👁️',
    completed: '✅',
    rejected: '❌',
    active: '🟢',
    inactive: '🔴'
  },

  // Role icons
  roleIcons: {
    advertiser: '📊',
    team_advertiser: '👥',
    booster: '🎮',
    leader: '👑',
    senior_member: '⭐',
    member: '👤'
  },

  // Game class icons
  classIcons: {
    'Death Knight': '💀',
    'Warrior': '⚔️',
    'Demon Hunter': '😈',
    'Mage': '🔮',
    'Paladin': '🛡️',
    'Hunter': '🏹',
    'Priest': '✨',
    'Rogue': '🗡️',
    'Shaman': '⚡',
    'Warlock': '🔥',
    'Monk': '🥋',
    'Druid': '🌿',
    'Evoker': '🐲'
  },

  // Realm/Server icons
  realmIcons: {
    'Stormrage': '⛈️',
    'Area-52': '🛸',
    'Tichondrius': '👹',
    'Mal\'Ganis': '😈',
    'Illidan': '🗡️',
    'Kil\'jaeden': '💀',
    'Arthas': '❄️'
  }
};

// Helper functions for getting random images
const MockImageHelpers = {
  getRandomEvidenceImage(serviceType) {
    const images = MockImages.evidence[serviceType] || MockImages.evidence.mythicPlus;
    return images[Math.floor(Math.random() * images.length)];
  },

  getRandomAvatar() {
    const allAvatars = [...MockImages.avatars.default, ...MockImages.avatars.custom];
    return allAvatars[Math.floor(Math.random() * allAvatars.length)];
  },

  getServiceIcon(serviceType) {
    return MockImages.serviceIcons[serviceType] || '❓';
  },

  getCurrencyIcon(currency) {
    return MockImages.currencyIcons[currency] || '💰';
  },

  getStatusIcon(status) {
    return MockImages.statusIcons[status] || '❓';
  },

  getRoleIcon(role) {
    return MockImages.roleIcons[role] || '👤';
  },

  getClassIcon(characterClass) {
    return MockImages.classIcons[characterClass] || '⚔️';
  },

  getRealmIcon(realm) {
    return MockImages.realmIcons[realm] || '🌍';
  },

  // Generate a placeholder image URL with custom text and colors
  generatePlaceholderImage(width = 400, height = 300, text = 'Image', bgColor = '2f3136', textColor = 'ffffff') {
    return `https://via.placeholder.com/${width}x${height}/${bgColor}/${textColor}?text=${encodeURIComponent(text)}`;
  },

  // Generate evidence image based on service type and order details
  generateEvidenceImage(serviceType, orderDetails) {
    const baseImages = MockImages.evidence[serviceType] || MockImages.evidence.mythicPlus;
    const randomImage = baseImages[Math.floor(Math.random() * baseImages.length)];
    
    // Customize the image URL based on order details
    let customText = randomImage.url.split('?text=')[1] || 'Service+Completed';
    
    if (orderDetails) {
      if (serviceType === 'mythic_plus' && orderDetails.keyLevel) {
        customText = `M%2B${orderDetails.keyLevel}+Completed`;
      } else if (serviceType === 'leveling' && orderDetails.targetLevel) {
        customText = `Level+${orderDetails.targetLevel}+Achieved`;
      } else if (serviceType === 'pvp' && orderDetails.targetRating) {
        customText = `Rating+${orderDetails.targetRating}+Achieved`;
      }
    }
    
    return {
      url: `https://via.placeholder.com/800x600/2f3136/ffffff?text=${customText}`,
      description: randomImage.description
    };
  }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MockImages, MockImageHelpers };
} else if (typeof window !== 'undefined') {
  window.MockImages = MockImages;
  window.MockImageHelpers = MockImageHelpers;
}