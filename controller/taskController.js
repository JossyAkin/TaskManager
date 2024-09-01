const Task = require('../models/tasksModels');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError')


const getAllTasks = catchAsync(async (req, res, next) => {

    const tasks = await Task.find();
    res.status(200).json({
        results: tasks.length,
        status: 'success',
        data: tasks
    });


});
const getTask = catchAsync(async (req, res, next) => {

    const task = await Task.findById(req.params.id);
    if(!task){
        return next(new AppError('No task found with that ID', 404))
    }
    res.status(200).json({
        status: 'success',
        data: task
    });

});

const createTask = catchAsync(async (req, res, next) => {

    const task = await Task.create(req.body);
    res.status(201).json({
        status: 'success',
        data: task
    });

});


const deleteTask = catchAsync(async (req, res, next) => {

   const task =  await Task.findByIdAndDelete(req.params.id);
    if (!task) {
        return next(new AppError('No task found with that ID', 404));
    }
    res.status(204).json({
        status: 'success',
        data: null
    });

});


const updateTask = catchAsync(async (req, res, next) => {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    if (!task) {
         return next(new AppError('No task found with that ID', 404));
    }
    res.status(200).json({
        status: 'success',
        data: task
    });



});

module.exports = {
    getAllTasks,
    getTask,
    createTask,
    deleteTask,
    updateTask
}

