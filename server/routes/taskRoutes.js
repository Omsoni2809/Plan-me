const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

router.get('/', taskController.getTasks);
router.post('/', taskController.createTask);
router.put('/:id', taskController.updateTask); // Edit full task
router.patch('/:id/status', taskController.updateStatus); // Complete/Uncomplete
router.delete('/:id', taskController.deleteTask); // Delete task

module.exports = router;