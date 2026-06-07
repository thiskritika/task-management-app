const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Task = require('../models/Task');

// Get all tasks for user
router.get('/', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    console.error('GET /tasks error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create task
router.post('/', auth, async (req, res) => {
  try {
    const { title, description } = req.body;
    
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }
    
    const task = new Task({
      title,
      description: description || '',
      userId: req.user.id
    });
    
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    console.error('POST /tasks error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update task
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, status } = req.body;
    const task = await Task.findOne({ _id: req.params.id, userId: req.user.id });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (status) task.status = status;
    
    await task.save();
    res.json(task);
  } catch (error) {
    console.error('PUT /tasks error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Toggle task status
router.patch('/:id/toggle', auth, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user.id });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    task.status = task.status === 'pending' ? 'completed' : 'pending';
    await task.save();
    res.json(task);
  } catch (error) {
    console.error('PATCH /tasks/toggle error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete task
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('DELETE /tasks error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;