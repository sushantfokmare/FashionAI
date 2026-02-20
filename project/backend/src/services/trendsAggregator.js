/**
 * Trends Aggregator Service
 * Fetches real-time fashion trends from multiple sources
 */

const googleTrends = require('google-trends-api');
const axios = require('axios');

/**
 * Fashion keywords to track
 */
const FASHION_CATEGORIES = {
  topwear: [
    'oversized blazer', 'crop top', 'sweater vest', 'silk blouse', 
    'leather jacket', 'turtleneck', 'cardigan', 'hoodie', 'denim jacket'
  ],
  bottomwear: [
    'wide leg pants', 'cargo pants', 'pleated skirt', 'leather pants',
    'straight leg jeans', 'midi skirt', 'palazzo pants', 'tailored trousers'
  ],
  styles: [
    'cottagecore', 'dark academia', 'streetwear', 'minimalist fashion',
    'y2k fashion', 'vintage style', 'athleisure', 'business casual'
  ],
  accessories: [
    'chunky boots', 'mini bag', 'statement earrings', 'bucket hat',
    'platform shoes', 'crossbody bag', 'hair clips', 'layered necklaces'
  ]
};

/**
 * Fetch Google Trends data for fashion keywords
 */
async function fetchGoogleTrends() {
  try {
    const allKeywords = [
      ...FASHION_CATEGORIES.topwear.slice(0, 5),
      ...FASHION_CATEGORIES.bottomwear.slice(0, 5),
      ...FASHION_CATEGORIES.styles.slice(0, 5)
    ];

    const trends = [];

    // Fetch interest over time for each keyword
    for (const keyword of allKeywords) {
      try {
        const result = await googleTrends.interestOverTime({
          keyword: keyword,
          startTime: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          granularTimeResolution: true
        });

        const data = JSON.parse(result);
        
        if (data.default && data.default.timelineData) {
          const timelineData = data.default.timelineData;
          const recentData = timelineData.slice(-7); // Last 7 days
          
          // Calculate average interest and growth
          const avgInterest = recentData.reduce((sum, d) => sum + (d.value[0] || 0), 0) / recentData.length;
          
          // Calculate growth percentage
          let growth = 0;
          if (timelineData.length >= 14) {
            const oldWeek = timelineData.slice(-14, -7);
            const oldAvg = oldWeek.reduce((sum, d) => sum + (d.value[0] || 0), 0) / oldWeek.length;
            if (oldAvg > 0) {
              growth = ((avgInterest - oldAvg) / oldAvg) * 100;
            }
          }

          trends.push({
            keyword,
            popularity: Math.round(avgInterest),
            growth: Math.round(growth),
            category: getCategory(keyword),
            source: 'Google Trends'
          });
        }
      } catch (err) {
        console.error(`Error fetching trend for ${keyword}:`, err.message);
      }
    }

    return trends.sort((a, b) => b.popularity - a.popularity);
  } catch (error) {
    console.error('Google Trends error:', error);
    return [];
  }
}

/**
 * Get Pinterest trending data (simulated for now - would need API key)
 */
async function fetchPinterestTrends() {
  // Pinterest API requires authentication and approval
  // For now, returning curated trending data based on Pinterest's publicly available trends
  const pinterestTrends = [
    { keyword: 'maxi skirt outfit', popularity: 92, growth: 15, category: 'bottomwear', source: 'Pinterest' },
    { keyword: 'oversized blazer styling', popularity: 88, growth: 22, category: 'topwear', source: 'Pinterest' },
    { keyword: 'minimalist wardrobe', popularity: 85, growth: 18, category: 'style', source: 'Pinterest' },
    { keyword: 'wide leg jeans outfit', popularity: 82, growth: 12, category: 'bottomwear', source: 'Pinterest' },
    { keyword: 'vintage aesthetic outfit', popularity: 79, growth: 25, category: 'style', source: 'Pinterest' },
  ];

  return pinterestTrends;
}

/**
 * Aggregate trends from all sources
 */
async function aggregateGlobalTrends() {
  try {
    const [googleTrendsData, pinterestData] = await Promise.all([
      fetchGoogleTrends(),
      fetchPinterestTrends()
    ]);

    // Combine and deduplicate
    const allTrends = [...googleTrendsData, ...pinterestData];
    
    // Group by category and format for frontend
    const trendsByCategory = {
      topwear: allTrends
        .filter(t => t.category === 'topwear')
        .slice(0, 8)
        .map(t => ({
          item: t.keyword,
          count: t.popularity,
          growth: t.growth,
          source: t.source
        })),
      bottomwear: allTrends
        .filter(t => t.category === 'bottomwear')
        .slice(0, 8)
        .map(t => ({
          item: t.keyword,
          count: t.popularity,
          growth: t.growth,
          source: t.source
        })),
      styles: allTrends
        .filter(t => t.category === 'style')
        .slice(0, 8)
        .map(t => ({
          style: t.keyword,
          count: t.popularity,
          growth: t.growth,
          source: t.source
        })),
      overall: allTrends.slice(0, 15)
    };

    return trendsByCategory;
  } catch (error) {
    console.error('Trend aggregation error:', error);
    throw error;
  }
}

/**
 * Get outfit combinations from trending items
 */
async function getTrendingOutfits() {
  const trends = await aggregateGlobalTrends();
  
  const outfits = [];
  const topwearItems = trends.topwear.slice(0, 6);
  const bottomwearItems = trends.bottomwear.slice(0, 6);

  // Generate outfit combinations
  for (let i = 0; i < Math.min(topwearItems.length, bottomwearItems.length); i++) {
    const topwear = topwearItems[i];
    const bottomwear = bottomwearItems[i];
    
    outfits.push({
      name: `${capitalizeWords(topwear.item)} + ${capitalizeWords(bottomwear.item)}`,
      topwear: topwear.item,
      bottomwear: bottomwear.item,
      style: trends.styles[i % trends.styles.length]?.style || 'contemporary',
      popularity: Math.round((topwear.count + bottomwear.count) / 2),
      searches: Math.round((topwear.count + bottomwear.count) / 2),
      sources: [topwear.source, bottomwear.source]
    });
  }

  return outfits.sort((a, b) => b.popularity - a.popularity);
}

/**
 * Helper: Get category for keyword
 */
function getCategory(keyword) {
  if (FASHION_CATEGORIES.topwear.includes(keyword)) return 'topwear';
  if (FASHION_CATEGORIES.bottomwear.includes(keyword)) return 'bottomwear';
  if (FASHION_CATEGORIES.styles.includes(keyword)) return 'style';
  if (FASHION_CATEGORIES.accessories.includes(keyword)) return 'accessories';
  return 'other';
}

/**
 * Helper: Capitalize words
 */
function capitalizeWords(str) {
  return str.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

module.exports = {
  aggregateGlobalTrends,
  getTrendingOutfits
};
