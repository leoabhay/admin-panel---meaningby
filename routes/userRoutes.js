const express = require('express');
const router = express.Router();
const { createUser, login, logout, updateUser, getUser, getUserById, deleteUser } = require('../controllers/userController');

// create new user route
router.post('/create', createUser);

// login user route
router.post('/login', login);

// logout user route
router.get('/logout', logout);

// get user route
router.get('/getUser', getUser);

// get user by id route
router.get('/getUser/:userId', getUserById);

// update user route (profile and password)
router.post('/update/:userId', updateUser);

// delete user route
router.delete('/delete/:userId', deleteUser);

module.exports = router;