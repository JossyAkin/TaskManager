const User = require('../models/usermodel');
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const {promisify} = require('util');
const AppError = require('../utils/AppError');
const sendEmail = require('../utils/Email');
const crypto = require('crypto')

const signToken = id =>{
    return jwt.sign({ id:id}, process.env.JWT_SECRET, process.env.EXPIRES_IN);
}

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id)
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly :true
    }
    user.password = undefined

    if(process.env === 'production') cookieOptions.secure = true;

    res.cookie('jwt', token, cookieOptions)
    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    });


}

const signUp = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirmed: req.body.passwordConfirmed,
        role : req.body.role
    });

     createSendToken(newUser, 201, res)

});

const logIn = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    // check if email and password was inputted
    if (!email || !password) {
        return next(new AppError('please enter your email or password',400));
    }
    // check if there is no existing email and if password is correct
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('incorrect email or password', 401));
    }

     createSendToken(user, 201, res)

});
// for logged in users
const protect = catchAsync(async (req, res, next) => {
    // get token
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        return next(new AppError('you are not logged in, please log in', 401));
    }

    //verify then token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    //check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(new AppError('user for this token no longer exists', 401));
    }
    // check if user changed password after token was issued
    if (currentUser.changedPasswordAfter()) {
        return next(new AppError('user recently changed password, please log in again', 401));
    }

    // add user to request object/grant access
    req.user = currentUser;
    next();
});

//roles
const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError('you are not permitted to perform this action', 401));
        }
        next()
    };

};

// forgot password
const forgotPassword = catchAsync(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new AppError(' there is no user with that email!', 404));
    }
    // create  password reset Token
    const resetToken = await user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    //send email
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetpassword/${resetToken}`;

    const message = `forgot your password? submit a request with your new password to ${resetUrl}.\n if you
    did not forget your password please ignore this message`;

    try {
        await sendEmail({
            email: user.email,
            subject: "your password reset token(exires in 10 minutes)",
            message,
        });

        res.status(200).json({
            status: 'success',
            message: 'Token sent via email!'

        });
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetTokenExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return next(new AppError('there was an error sending the email please try again later', 500));
    }
});

const resetPassword = catchAsync(async (req, res, next) => {
    const hashedToken = crypto.createHash('sha256')
        .update(req.params.token)
        .digest('hex');
    const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetTokenExpires: { $gt: Date.now() } });
    if (!user) {
        return next(new AppError('token is invalid or has expired, 404'));
    }
    //update the user
    user.password = req.body.password;
    user.passwordConfirmed = req.body.passwordConfirmed;
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    await user.save();

    createSendToken(user, 201, res)

});

// updating the password

const updatePassword = catchAsync(async(req, res, next) =>{
    const user = await User.findById(req.user.id).select('+password');

    if(!(await user.correctPassword(req.body.passwordCurrent, user.password))){
        return next(new AppError('password is wrong', 401))
    }

    user.password = req.body.password
    user.passwordConfirmed = req.body.passwordConfirmed
    await user.save()

    createSendToken(user, 200, res)

})



module.exports = {
    signUp,
    logIn,
    protect,
    restrictTo,
    forgotPassword,
    resetPassword,
    updatePassword
};