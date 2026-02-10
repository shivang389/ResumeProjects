const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');

// Define Routes and map them to Controller functions
router.post('/create', groupController.createGroup);
router.get('/user/:userId', groupController.getUserGroups);
router.get('/:groupId', groupController.getGroupDetails);
router.post('/invite', groupController.inviteMember);
router.post('/leave', groupController.leaveGroup);

module.exports = router;