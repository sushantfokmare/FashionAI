/**
 * Search Analytics Model
 * Tracks user searches for trend analysis
 */

const mongoose = require('mongoose');

const searchAnalyticsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    searchType: {
      type: String,
      enum: ['design', 'restyle'],
      required: true,
    },
    topwear: {
      type: String,
      trim: true,
    },
    bottomwear: {
      type: String,
      trim: true,
    },
    accessories: {
      type: String,
      trim: true,
    },
    style: {
      type: String,
      trim: true,
    },
    restylePrompt: {
      type: String,
      trim: true,
    },
    colorPalette: [String],
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
searchAnalyticsSchema.index({ userId: 1, createdAt: -1 });
searchAnalyticsSchema.index({ searchType: 1 });
searchAnalyticsSchema.index({ topwear: 1 });
searchAnalyticsSchema.index({ bottomwear: 1 });
searchAnalyticsSchema.index({ createdAt: -1 });

module.exports = mongoose.model('SearchAnalytics', searchAnalyticsSchema);
