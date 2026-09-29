const Task = require('../models/taskModel');

// GET /api/tasks?userId=...
exports.getTasks = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.json([]);
    const tasks = await Task.find({ userId }).sort({ task_date: 1, start_time: 1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/tasks
exports.createTask = async (req, res) => {
  try {
    const { title, description, task_date, start_time, end_time, category, priority, status = 'pending', userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'User ID is required' });

    // If starting directly as ongoing, demote other ongoing tasks
    if (status === 'ongoing') {
      await Task.updateMany({ userId, status: 'ongoing' }, { $set: { status: 'pending' } });
    }

    const newTask = await Task.create({
      title,
      description,
      task_date,
      start_time,
      end_time,
      category,
      priority,
      status,
      userId,
    });
    res.status(201).json(newTask);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// PUT /api/tasks/:id
exports.updateTask = async (req, res) => {
  try {
    const currentTask = await Task.findById(req.params.id);
    if (!currentTask) return res.status(404).json({ error: 'Task not found' });

    if (req.body.status === 'ongoing') {
      await Task.updateMany(
        { userId: currentTask.userId, _id: { $ne: req.params.id }, status: 'ongoing' },
        { $set: { status: 'pending' } }
      );
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { returnDocument: 'after', runValidators: true }
    );
    res.json(updatedTask);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// PATCH /api/tasks/:id/status
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const currentTask = await Task.findById(req.params.id);
    if (!currentTask) return res.status(404).json({ error: 'Task not found' });

    // If marking as ongoing, set any other ongoing task back to pending
    if (status === 'ongoing') {
      await Task.updateMany(
        { userId: currentTask.userId, _id: { $ne: req.params.id }, status: 'ongoing' },
        { $set: { status: 'pending' } }
      );
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { status },
      { returnDocument: 'after' }
    );
    res.json(updatedTask);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE /api/tasks/:id
exports.deleteTask = async (req, res) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);
    if (!deletedTask) return res.status(404).json({ error: 'Task not found' });
    res.json({ message: 'Task deleted successfully', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};