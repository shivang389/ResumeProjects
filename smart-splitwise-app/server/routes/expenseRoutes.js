const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');

// Routes
router.post('/', expenseController.addExpense); // Used for both Group and Personal
router.get('/personal/:userId', expenseController.getPersonalExpenses); // Fetch Personal Dashboard
router.delete('/:id', expenseController.deleteExpense);

module.exports = router;