const router = require('express').Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

router.get('/profile', auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar } });
  } catch (err) {
    next(err);
  }
});

// Get user's saved designs
router.get('/saved-designs', auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ savedDesigns: user.savedDesigns || [] });
  } catch (err) {
    next(err);
  }
});

// Save a design
router.post('/saved-designs', auth, async (req, res, next) => {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl) return res.status(400).json({ message: 'Image URL is required' });

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Avoid duplicates
    if (!user.savedDesigns) user.savedDesigns = [];
    if (!user.savedDesigns.includes(imageUrl)) {
      user.savedDesigns.push(imageUrl);
      await user.save();
    }

    res.json({ savedDesigns: user.savedDesigns });
  } catch (err) {
    next(err);
  }
});

// Delete a saved design
router.delete('/saved-designs', auth, async (req, res, next) => {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl) return res.status(400).json({ message: 'Image URL is required' });

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.savedDesigns = (user.savedDesigns || []).filter(url => url !== imageUrl);
    await user.save();

    res.json({ savedDesigns: user.savedDesigns });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
