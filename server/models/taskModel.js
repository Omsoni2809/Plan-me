const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      default: 'default_user',
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    task_date: {
      type: String, // 'YYYY-MM-DD'
      required: [true, 'Task date is required'],
    },
    start_time: {
      type: String,
      default: '',
    },
    end_time: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      default: 'personal',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['pending', 'ongoing', 'completed'], // Added 'ongoing'
      default: 'pending',
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret.__v;
        return ret;
      },
    },
  }
);

module.exports = mongoose.model('Task', taskSchema);