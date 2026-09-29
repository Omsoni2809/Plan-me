const User = require('../models/userModel');

exports.syncUser = async (req, res) => {
  try {
    const { clerkId, name, email } = req.body;
    // Uses $set to update details, and setDefaultsOnInsert to apply default categories if new
    const user = await User.findOneAndUpdate(
      { clerkId },
      { $set: { name, email, clerkId } },
      { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true } 
    );
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserByClerkId = async (req, res) => {
  try {
    const user = await User.findOne({ clerkId: req.params.clerkId });
    res.json(user || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateCategories = async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { clerkId: req.params.clerkId },
      { $set: { categories: req.body.categories } },
      { returnDocument: 'after' }
    );
    res.json(user.categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};