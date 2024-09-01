console.log('Task manager Api');
const express = require('express');
const AppError = require('./utils/AppError')
const globalErrorHandler = require('./controller/errorController')
const taskRouter = require('./routes/taskRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

app.use(express.json());

app.use('/api/v1/tasks', taskRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
    return next(new AppError(`can't find ${req.originalUrl} on this server!`, 404))
}) 

app.use(globalErrorHandler)

module.exports = app;