const express = require('express');
const router = express.Router();
const { getAllTasks,
    getTask,
    createTask,
    deleteTask,
    updateTask } = require('../controller/taskController');
    const {protect, restrictTo} = require('../controller/authController')

router.route('/').get(protect, restrictTo('admin'),getAllTasks).post(createTask);

router.route('/:id').get(getTask).delete(deleteTask).patch(updateTask);

module.exports = router;