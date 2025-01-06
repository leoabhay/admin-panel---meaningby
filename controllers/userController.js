const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

// create user controller
const createUser = async (req, res) => {
    try {
        const { name, email, password, confirmPassword } = req.body;

        // validate user input
        if (!(email && password && confirmPassword)) {
            console.error('Missing Fields:', { name, email, password, confirmPassword });
            return res.status(400).json({ message: "All input fields are required" });
        }

        // check if user already exists
        const userExist = await User.findOne({ email });
        if (userExist) {
            return res.status(409).json({ message: "User already exists" });
        }

        // compare password
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // handle profile image upload
        const profilePicture = req.file 
            ? `/uploads/profiles/${req.file.filename}` 
            : '/images/profile.jpg';

        // create new user
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            profilePicture
        });

        await newUser.save();
        // res.status(201).json({message: "User created successfully",
        //      user:{
        //         id: newUser._id,
        //         name: newUser.name,
        //         email: newUser.email,
        //         profilePicture: newUser.profilePicture
        //      }});

        // Set session data after successful signup
        req.session.isLoggedIn = true;
        req.session.userName = newUser.name;
        req.session.userEmail = newUser.email;
        req.session.userId = newUser._id;
        req.session.userProfileImage = newUser.profilePicture;

        // redirect to dashboard
        res.redirect('/dashboard');

    } catch (error) {
        console.error('Error creating user', error);
        res.status(500).json({ message: "Error creating user", error });
    }
};

// login controller
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // validate user input
        if (!(email && password)) {
            return res.status(400).json({ message: "All input fields are required" });
        }

        // check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // check if password is correct
        if (!await bcrypt.compare(password, user.password)) {
            return res.status(401).json({ message: "Incorrect password" });
        }

        // create a JWT token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1y' });

        // set the token in a cookie
        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 3600000 });

        // res.status(200).json({message: "Login successful",
        //     user: {
        //         id: user._id,
        //         name: user.name,
        //         email: user.email,
        //         profilePicture: user.profilePicture,
        //     },
        //     token: token
        // });

        // set session data after successful login
        req.session.isLoggedIn = true;
        req.session.userName = user.name;
        req.session.userEmail = user.email;
        req.session.userId = user._id;
        req.session.userProfileImage = user.profilePicture;

        // redirect to dashboard
        res.redirect('/dashboard');

    } catch (error) {
        console.error('Error logging in', error);
        res.status(500).json({ message: "Error logging in", error });
    }
};

// update user controller
const updateUser = async (req, res) => {
    try {
        const { name, email, currentPassword, newPassword, confirmPassword } = req.body;
        const { userId } = req.params || req.session.userId;

        // find user exists or not
        const user = await User.findById(userId);
        if (!user) {
            console.error('User not found');
            return res.status(404).json({ message: "User not found" });
        }

        // handle file upload if provided
        if (req.file) {
            user.profilePicture = `/uploads/profiles/${req.file.filename}`;
            req.session.userProfileImage = user.profilePicture; // update session data
        }

        // update name and email
        user.name = name || user.name;
        user.email = email || user.email;

        // password update logic
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
        res.status(200).json({ message: "User updated successfully",
             user:{
                id: user._id,
                name: user.name,
                email: user.email,
                profilePicture: user.profilePicture
        } });

    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: "Error updating profile", error });
    }
};

// logout controller
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
        const { userId } = req.params; 

        // validate userId
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const user = await User.findById(userId);
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
        const{ userId} = req.params;

        // check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        await user.deleteOne(); // delete

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