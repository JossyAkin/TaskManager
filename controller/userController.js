const User = require('../models/usermodel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

const filteredBody = (obj, ...allowedfields) => {
    newObj = {};
    Object.keys(obj).forEach((el) => {
        if (allowedfields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;

};

const updateMe = catchAsync(async (req, res, next) => {
    if (req.body.password || req.body.passwordConfirmed) {
        return next(new AppError('this route is not for password update', 401));
    }

    const filteredBody = filterObj(req.body, 'name', 'email');

    const updatedUser = await User.findByIdAndDelete(req.user.id, filteredBody, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        status:'success',
        message :'user succcesfully updated!',
        data:{
            updatedUser
        }
    })
});

const deleteMe = catchAsync(async(req, res, next) => {
    const deletedUser = await User.findByIdAndDelete(req.user.id, {active : false});
    res.status(204).json({
        status :'success',
        message:'user succesfully deleted!',
        data :null
    })

})

const getAllUsers = catchAsync(async (req, res, next) => {

    const users = await User.find();
    res.status(200).json({
        status: 'success',
        data: 'route not implemented'
    });


});
const getUser = catchAsync(async (req, res, next) => {

    const user = await User.findById(req.params.id);
    if (!user) {
        return next(new AppError('No user found with that ID', 404));
    }
    res.status(200).json({
        status: 'success',
        data: 'route not implemented'
    });

});

const createUser = catchAsync(async (req, res, next) => {

    const user = await User.create(req.body);
    res.status(201).json({
        status: 'success',
        data: 'route not implemented'
    });

});


const deleteUser = catchAsync(async (req, res, next) => {

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
        return next(new customError('No user found with that ID', 404));
    }
    res.status(204).json({
        status: 'success',
        data: null
    });

});


const updateUser = catchAsync(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    if (!User) {
        return next(new AppError('No user found with that ID', 404));
    }
    res.status(200).json({
        status: 'success',
        data: 'route not implemented'
    });



});

module.exports = {
    getAllUsers,
    getUser,
    createUser,
    deleteUser,
    updateUser,
    updateMe,
    deleteMe
}



