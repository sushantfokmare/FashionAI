/**
 * Global Trends Routes
 * Real-time fashion trends from external sources
 */

const express = require('express');
const router = express.Router();
const { aggregateGlobalTrends, getTrendingOutfits } = require('../services/trendsAggregator');

/**
 * GET /api/trends/global
 * Get real-time global fashion trends
 */
router.get('/global', async (req, res) => {
  try {
    const trends = await aggregateGlobalTrends();
    res.json(trends);
  } catch (error) {
    console.error('Global trends error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch global trends',
      error: error.message 
    });
  }
});

/**
 * GET /api/trends/outfits
 * Get trending outfit combinations
 */
router.get('/outfits', async (req, res) => {
  try {
    const outfits = await getTrendingOutfits();
    res.json(outfits);
  } catch (error) {
    console.error('Trending outfits error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch trending outfits',
      error: error.message 
    });
  }
});

module.exports = router;
