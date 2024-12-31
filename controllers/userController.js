const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// helper function to save the profile picture
const saveProfilePicture = (file) => {
    const uploadPath = path.join(__dirname, '..', 'uploads', 'profiles', file.name);
    file.mv(uploadPath, (err) => {
        if (err) {
            console.error('Error saving profile picture:', err);
            throw new Error('Error saving profile picture');
        }
    });
    return `/uploads/profiles/${file.name}`;  // fixed the path here
};


// create user controller
const createUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const profilePicture = req.files?.profilePicture;

        // validate fields
        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // vheck if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // save profile picture if provided
        let profilePicturePath = '/profile.jpg';
        if (profilePicture) {
            profilePicturePath = saveProfilePicture(profilePicture);
        }

        // create new user
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            profilePicture: profilePicturePath
        });
        await newUser.save();

        // set session data after successful signup
        req.session.isLoggedIn = true;
        req.session.userName = newUser.name;
        req.session.userProfileImage = newUser.profilePicture;

        // redirect to dashboard after successful signup
        res.redirect('/dashboard');

    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ message: "Error creating user", error: error.message });
    }
};

// login controller
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // validate fields
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User does not exist" });
        }

        // compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // set session data after successful login
        req.session.isLoggedIn = true;
        req.session.userName = user.name;
        req.session.userProfileImage = user.profilePicture;
        req.session.userEmail = user.email;
        req.session.userId = user._id;

        res.redirect('/dashboard');  // redirect to dashboard page

    } catch (error) {
        console.error("Error logging in:", error);
        res.status(500).json({ message: "Error logging in", error: error.message });
    }
};

// logout controller
const logout = (req, res) => {
    try {
        // clear the session or cookie (whichever is being used)
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Error logging out' });
            }

            // redirect to the login page after successful logout
            res.clearCookie('token', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Strict'
            });
            res.redirect('/login'); // redirect to the login page
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error logging out', error: error.message });
    }
};

// get user controller
const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.user);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ user: { name: user.name, email: user.email, profilePicture: user.profilePicture } });

    } catch (error) {
        console.error("Error getting user:", error);
        res.status(500).json({ message: "Error getting user", error: error.message });
    }
};

// get user by id controller
const getUserById = async (req, res) => {
    try {
        const { userId } = req.params;

        // check if userId is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid User ID" });
        }

        // find user by userId
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ user: { id: user._id, name: user.name, email: user.email, profilePicture: user.profilePicture } });

    } catch (error) {
        console.error("Error getting user by ID:", error);
        res.status(500).json({ message: 'Error getting user', error: error.message });
    }
};

// update user controller
const updateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { name, email, currentPassword, newPassword, confirmPassword } = req.body;
        const profilePicture = req.files?.profilePicture;

        if (!userId || !name || !email) {
            return res.status(400).json({ message: "User ID, name, and email are required" });
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid User ID" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (currentPassword && newPassword && confirmPassword) {
            if (newPassword !== confirmPassword) {
                return res.status(400).json({ message: "New passwords do not match" });
            }

            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: "Current password is incorrect" });
            }

            user.password = await bcrypt.hash(newPassword, 10);
        }

        if (profilePicture) {
            user.profilePicture = saveProfilePicture(profilePicture); // Save image and get correct path
        }

        user.name = name;
        user.email = email;
        await user.save();

        // update session after successful profile update
        req.session.userName = user.name;
        req.session.userProfileImage = user.profilePicture;
        req.session.userEmail = user.email;

        res.redirect('/dashboard');     // redirect to the dashboard after updating the profile

    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: 'Error updating user', error: error.message });
    }
};

// delete user controller
const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        // check if userId is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid User ID" });
        }

        // delete user by userId
        const user = await User.findByIdAndDelete(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
};

module.exports = {
    createUser,
    login,
    logout,
    getUser,
    getUserById,
    updateUser,
    deleteUser
};