/**
 * Analytics Routes
 * Track and retrieve search analytics for trend dashboard
 */

const express = require('express');
const router = express.Router();
const SearchAnalytics = require('../models/SearchAnalytics');
const authenticate = require('../middleware/auth');

/**
 * POST /api/analytics/track
 * Track a user search
 */
router.post('/track', authenticate, async (req, res) => {
  try {
    const { searchType, topwear, bottomwear, accessories, style, restylePrompt, colorPalette } = req.body;

    const analytics = new SearchAnalytics({
      userId: req.userId,
      searchType,
      topwear,
      bottomwear,
      accessories,
      style,
      restylePrompt,
      colorPalette,
    });

    await analytics.save();

    res.status(201).json({ message: 'Search tracked successfully' });
  } catch (error) {
    console.error('Analytics tracking error:', error);
    res.status(500).json({ message: 'Failed to track search' });
  }
});

/**
 * GET /api/analytics/trends/personal
 * Get personal trends for the logged-in user
 */
router.get('/trends/personal', authenticate, async (req, res) => {
  try {
    const userId = req.userId;
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Get user's searches from last 30 days
    const searches = await SearchAnalytics.find({
      userId,
      createdAt: { $gte: thirtyDaysAgo },
    });

    // Aggregate data
    const topwearCounts = {};
    const bottomwearCounts = {};
    const styleCounts = {};
    const outfitCombinations = {};

    searches.forEach((search) => {
      // Count topwear
      if (search.topwear) {
        const topwear = search.topwear.toLowerCase().trim();
        topwearCounts[topwear] = (topwearCounts[topwear] || 0) + 1;
      }

      // Count bottomwear
      if (search.bottomwear) {
        const bottomwear = search.bottomwear.toLowerCase().trim();
        bottomwearCounts[bottomwear] = (bottomwearCounts[bottomwear] || 0) + 1;
      }

      // Count styles
      if (search.style) {
        const style = search.style.toLowerCase().trim();
        styleCounts[style] = (styleCounts[style] || 0) + 1;
      }

      // Count outfit combinations
      if (search.topwear && search.bottomwear) {
        const combo = `${search.topwear}|${search.bottomwear}|${search.style || 'casual'}`;
        outfitCombinations[combo] = (outfitCombinations[combo] || 0) + 1;
      }
    });

    // Convert to sorted arrays
    const topTopwear = Object.entries(topwearCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([item, count]) => ({ item, count }));

    const topBottomwear = Object.entries(bottomwearCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([item, count]) => ({ item, count }));

    const topStyles = Object.entries(styleCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([style, count]) => ({ style, count }));

    const topOutfits = Object.entries(outfitCombinations)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([combo, count]) => {
        const [topwear, bottomwear, style] = combo.split('|');
        return { topwear, bottomwear, style, count };
      });

    res.json({
      totalSearches: searches.length,
      topTopwear,
      topBottomwear,
      topStyles,
      topOutfits,
    });
  } catch (error) {
    console.error('Personal trends error:', error);
    res.status(500).json({ message: 'Failed to retrieve personal trends' });
  }
});

/**
 * GET /api/analytics/trends/global
 * Get global trends across all users
 */
router.get('/trends/global', authenticate, async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

    // Get all searches from last 30 days
    const recentSearches = await SearchAnalytics.find({
      createdAt: { $gte: thirtyDaysAgo },
    });

    // Get searches from 30-60 days ago for comparison
    const previousSearches = await SearchAnalytics.find({
      createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo },
    });

    // Helper function to count items
    const countItems = (searches, field) => {
      const counts = {};
      searches.forEach((search) => {
        if (search[field]) {
          const item = search[field].toLowerCase().trim();
          counts[item] = (counts[item] || 0) + 1;
        }
      });
      return counts;
    };

    // Count current period
    const topwearCounts = countItems(recentSearches, 'topwear');
    const bottomwearCounts = countItems(recentSearches, 'bottomwear');
    const styleCounts = countItems(recentSearches, 'style');

    // Count previous period for comparison
    const prevTopwearCounts = countItems(previousSearches, 'topwear');
    const prevBottomwearCounts = countItems(previousSearches, 'bottomwear');

    // Calculate growth percentage
    const calculateGrowth = (current, previous) => {
      if (previous === 0) return current > 0 ? '+100%' : '0%';
      const growth = ((current - previous) / previous) * 100;
      return growth > 0 ? `+${Math.round(growth)}%` : `${Math.round(growth)}%`;
    };

    // Get top items with growth
    const topTopwear = Object.entries(topwearCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([item, count]) => ({
        item,
        count,
        change: calculateGrowth(count, prevTopwearCounts[item] || 0),
      }));

    const topBottomwear = Object.entries(bottomwearCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([item, count]) => ({
        item,
        count,
        change: calculateGrowth(count, prevBottomwearCounts[item] || 0),
      }));

    // Count outfit combinations
    const outfitCombinations = {};
    recentSearches.forEach((search) => {
      if (search.topwear && search.bottomwear) {
        const combo = `${search.topwear}|${search.bottomwear}|${search.style || 'casual'}`;
        outfitCombinations[combo] = (outfitCombinations[combo] || 0) + 1;
      }
    });

    const topOutfits = Object.entries(outfitCombinations)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([combo, count]) => {
        const [topwear, bottomwear, style] = combo.split('|');
        return { topwear, bottomwear, style, searches: count };
      });

    // Calculate seasonal trends (top styles)
    const seasonalTrends = Object.entries(styleCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([trend, count]) => {
        const total = recentSearches.length;
        const popularity = Math.round((count / total) * 100);
        return { trend, popularity };
      });

    // Curated trending fashion images from Unsplash (high-quality fashion photography)
    const trendingImages = [
      {
        id: 1,
        url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80',
        title: 'Modern Street Style',
        category: 'Casual Chic',
        photographer: 'Unsplash'
      },
      {
        id: 2,
        url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80',
        title: 'Elegant Fashion',
        category: 'Formal Wear',
        photographer: 'Unsplash'
      },
      {
        id: 3,
        url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80',
        title: 'Contemporary Style',
        category: 'Urban Fashion',
        photographer: 'Unsplash'
      },
      {
        id: 4,
        url: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&q=80',
        title: 'Classic Elegance',
        category: 'Timeless',
        photographer: 'Unsplash'
      },
      {
        id: 5,
        url: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80',
        title: 'Minimalist Fashion',
        category: 'Modern Minimal',
        photographer: 'Unsplash'
      },
      {
        id: 6,
        url: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=800&q=80',
        title: 'Trendy Outfit',
        category: 'Street Fashion',
        photographer: 'Unsplash'
      }
    ];

    res.json({
      totalSearches: recentSearches.length,
      topTopwear,
      topBottomwear,
      topOutfits,
      seasonalTrends,
      trendingImages,
    });
  } catch (error) {
    console.error('Global trends error:', error);
    res.status(500).json({ message: 'Failed to retrieve global trends' });
  }
});

module.exports = router;
