const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/sync', userController.syncUser);
router.get('/:clerkId', userController.getUserByClerkId);
router.put('/:clerkId/categories', userController.updateCategories);

module.exports = router;