const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  id: String,
  label: String,
  icon: String,
  color: String
}, { _id: false });

const userSchema = new mongoose.Schema({
  clerkId: { type: String, unique: true, sparse: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  categories: {
    type: [categorySchema],
    default: [
      { id: 'education', label: 'Education', icon: 'BookOpen', color: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30' },
      { id: 'work', label: 'Work', icon: 'Briefcase', color: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30' },
      { id: 'fitness', label: 'Fitness', icon: 'Dumbbell', color: 'text-green-500 bg-green-100 dark:bg-green-900/30' },
      { id: 'personal', label: 'Personal', icon: 'User', color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30' }
    ]
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);