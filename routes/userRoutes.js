const express = require('express');
const router = express.Router();
const { createUser, login, logout, updateUser, getUsers, getUserById, deleteUser } = require('../controllers/userController');

// create new user route
router.post('/create', createUser);

// login user route
router.post('/login', login);

// logout user route
router.post('/logout', logout);

// get user route
router.get('/getAll', getUsers);

// get user by id route
router.get('/get/:userId', getUserById);

// update user route (profile and password)
router.put('/update/:userId', updateUser);

// delete user route
router.delete('/delete/:userId', deleteUser);

module.exports = router;