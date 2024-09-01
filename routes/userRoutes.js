const express = require('express');
const router = express.Router();
const { signUp, logIn, forgotPassword, resetPassword, updatePassword } = require('../controller/authController');
const { getAllUsers,
    updateMe,
    deleteMe,
    getUser,
    createUser,
    deleteUser,
    updateUser,
} = require('../controller/userController');

router.post('/signup', signUp);
router.post('/login', logIn);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);
router.patch('/updatePassword', updatePassword);
router.patch('/updateMe', updateMe);
router.delete('/deleteMe', deleteMe);

router.route('/').get(getAllUsers).post(createUser);

router.route('/:id').get(getUser).delete(deleteUser).patch(updateUser);

module.exports = router;