const express = require('express');
const router = express.Router();
const { createUser, login, logout, updateUser, getUsers, getUserById, deleteUser } = require('../controllers/userController');
const { upload } = require('../middleware/multer');

// Create new user route
router.post('/create', upload.uploadProfiles.single('profilePicture'), createUser);

// Login user route
router.post('/login', login);

// Logout user route
router.post('/logout', logout);

// Get all users route
router.get('/getAll', getUsers);

// Get user by ID route
router.get('/get/:userId', getUserById);

// Update user route (profile and password)
router.put('/update/:userId', upload.uploadProfiles.single('profilePicture'), updateUser);

// Delete user route
router.delete('/delete/:userId', deleteUser);

module.exports = router;