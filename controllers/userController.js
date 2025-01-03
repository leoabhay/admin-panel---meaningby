const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { error } = require('console');
const jwt = require('jsonwebtoken');
const path = require('path');


// Create user controller
const createUser = async (req, res) => {
    try {
        const { name, email, password, confirmPassword } = req.body;

        // Validate user input
        if (!(email && password && confirmPassword)) {
            console.error('Missing Fields:', { name, email, password, confirmPassword });
            return res.status(400).json({ message: "All input fields are required" });
        }

        // Check if user already exists
        const userExist = await User.findOne({ email });
        if (userExist) {
            return res.status(409).json({ message: "User already exists" });
        }

        // Compare password
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Handle profile image upload
        const profilePicture = req.file 
            ? `/uploads/profiles/${req.file.filename}` 
            : '/images/profile.jpg';

        // Create new user
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            profilePicture
        });

        await newUser.save();

        // Set session data after successful signup
        req.session.isLoggedIn = true;
        req.session.userName = newUser.name;
        req.session.userEmail = newUser.email;
        req.session.userId = newUser._id;
        req.session.userProfileImage = newUser.profilePicture;

        // Redirect to dashboard
        res.redirect('/dashboard');

    } catch (error) {
        console.error('Error creating user', error);
        res.status(500).json({ message: "Error creating user", error });
    }
};

// Login controller
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate user input
        if (!(email && password)) {
            return res.status(400).json({ message: "All input fields are required" });
        }

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if password is correct
        if (!await bcrypt.compare(password, user.password)) {
            return res.status(401).json({ message: "Incorrect password" });
        }

        // Create a JWT token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1y' });

        // Set the token in a cookie
        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 3600000 });

        // Set session data after successful login
        req.session.isLoggedIn = true;
        req.session.userName = user.name;
        req.session.userEmail = user.email;
        req.session.userId = user._id;
        req.session.userProfileImage = user.profilePicture;

        // Redirect to dashboard
        res.redirect('/dashboard');

    } catch (error) {
        console.error('Error logging in', error);
        res.status(500).json({ message: "Error logging in", error });
    }
};

// Update user controller
const updateUser = async (req, res) => {
    try {
        const { name, email, currentPassword, newPassword, confirmPassword } = req.body;
        const userId = req.params.id || req.session.userId;

        // Find user
        const user = await User.findById(userId);
        if (!user) {
            console.error('User not found');
            return res.status(404).json({ message: "User not found" });
        }

        // Handle file upload if provided
        if (req.file) {
            user.profilePicture = `/uploads/profiles/${req.file.filename}`;
            req.session.userProfileImage = user.profilePicture; // Update session data
        }

        // Update name and email
        user.name = name || user.name;
        user.email = email || user.email;

        // Password update logic
        if (newPassword && currentPassword) {
            const isPasswordMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isPasswordMatch) {
                return res.status(400).json({ message: "Current password is incorrect" });
            }
            if (newPassword !== confirmPassword) {
                return res.status(400).json({ message: "New passwords do not match" });
            }
            user.password = await bcrypt.hash(newPassword, 10);
        }

        await user.save();
        res.status(200).json({ message: "Profile updated successfully" });

    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: "Error updating profile", error });
    }
};

// Logout controller
const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: "Error logging out", error: err });
        }
        res.clearCookie('token');
        res.redirect('/login');
    });
};


// get all users controller
const getUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        console.log('Error getting users', error);
        res.status(500).json({ message: "Error getting users", error: error });
    }
};

// get user by id controller
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        console.log('Error getting user by id', error);
        res.status(500).json({ message: "Error getting user by id", error: error });
    }
};


// delete user controller
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        await user.remove();
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.log('Error deleting user', error);
        res.status(500).json({ message: "Error deleting user", error: error });
    }
};

module.exports = {
    createUser,
    login,
    logout,
    getUsers,
    getUserById,
    updateUser,
    deleteUser
};