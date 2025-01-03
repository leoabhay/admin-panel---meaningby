const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// create user controller
const createUser = async (req, res) => {
    try {
        const { name, email, password, confirmPassword } = req.body;

        // validate user input
        if (!(email && password && confirmPassword)) {
            console.error('Missing Fields:', { name, email, password, confirmPassword });
            return res.status(400).json({ message: "All input fields are required" });
        }

        // check if user already exist
        const userExist = await User.findOne({ email });
        if (userExist) {
            return res.status(409).json({ message: "User already exist" });
        }

        // compare password
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Password do not match" });
        }

        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // create new user
        const newUser = new User({
            name,
            email,
            password: hashedPassword
        });
        await newUser.save();

        // set session data after successful signup
        req.session.isLoggedIn = true;
        req.session.userName = newUser.name;

        // redirect to dashboard
        res.redirect('/dashboard');

    } catch (error) {
        console.log('Error creating user', error);
        res.status(500).json({ message: "Error creating user", error: error });
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

        // check if user exist
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // check if password is correct
        if (!await bcrypt.compare(password, user.password)) {
            return res.status(401).json({ message: "Incorrect password" });
        }

        // Create a JWT token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1y' });

        // Set the token in a cookie
        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 3600000 });

        // set session data after successful login
        req.session.isLoggedIn = true;
        req.session.userName = user.name;
        req.session.userEmail = user.email;
        req.session.userId = user._id;

        // redirect to dashboard
        res.redirect('/dashboard');

    } catch (error) {
        console.log('Error logging in', error);
        res.status(500).json({ message: "Error logging in", error: error });
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

// update user controller
const updateUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.name = name || user.name;
        user.email = email || user.email;
        if (password) {
            user.password = await bcrypt.hash(password, 10);
        }

        await user.save();
        res.status(200).json(user);
    } catch (error) {
        console.log('Error updating user', error);
        res.status(500).json({ message: "Error updating user", error: error });
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
