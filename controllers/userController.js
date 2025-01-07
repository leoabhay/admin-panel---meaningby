const User = require('../models/User');
const UserOTPVerification = require('../models/Otp');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// const path = require('path');
const nodemailer = require('nodemailer');
require('dotenv').config();

// nodemailer
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    service: 'gmail',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.USER,
        pass: process.env.PASS,
    },
});

// for checking nodemailer
// const mailOptions = {
//     from: process.env.USER,
//     to: process.env.USER,
//     subject: 'SMTP Test',
//     text: 'This is a test email.',
// };

// transporter.sendMail(mailOptions, (error, info) => {
//     if (error) {
//         return console.log('Error:', error);
//     }
//     console.log('Email sent:', info.response);
// });


// create user controller
const createUser = async (req, res) => {
    try {
        const { name, email, password, confirmPassword } = req.body;

        // validate input fields
        if (!(email && password && confirmPassword)) {
            console.error('Missing Fields:', { name, email, password, confirmPassword });
            return res.status(400).json({ message: "All fields are required" });
        }

        // validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        // check if user already exists
        const userExist = await User.findOne({ email });
        if (userExist) {
            return res.status(409).json({ message: "User already exists" });
        }

        // compare passwords
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        // hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // handle profile image upload
        const profilePicture = req.file
            ? `/uploads/profiles/${req.file.filename}`
            : '/images/profile.jpg';

        // create new user
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            profilePicture,
            verified: false
        });

        // save new user
        await newUser.save();

        // send OTP verification email
        await sendOTPVerificationEmail(newUser);

        // res.status(201).json({
        //     message: "User created successfully. Verification email sent.",
        //     user: {
        //         id: newUser._id,
        //         name: newUser.name,
        //         email: newUser.email,
        //         profilePicture: newUser.profilePicture,
        //         verified: newUser.verified
        //     },
        // });

        res.render('otp', {
            userId: newUser._id,
            email: newUser.email
        });

    } catch (error) {
        console.error('Error creating user', error);
        res.status(500).json({ message: "Error creating user", error: error.message });
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

        // if user not verified
        if (!user.verified) {
            return res.status(403).json({ message: "Email not verified. Please verify your email."});
        }

        // check if password is correct
        if (!await bcrypt.compare(password, user.password)) {
            return res.status(401).json({ message: "Incorrect password" });
        }

        // create a JWT token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // set the token in a cookie
        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 3600000 });

        // res.status(200).json({message: "Login successful",
        //     user: {
        //         id: user._id,
        //         name: user.name,
        //         email: user.email,
        //         profilePicture: user.profilePicture
        //     },
        //     token: token
        // });

        // set session data after successful login
        req.session.isLoggedIn = true;
        req.session.userName = user.name;
        req.session.userEmail = user.email;
        req.session.userId = user._id;
        req.session.userProfileImage = user.profilePicture;

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
            user.password = await bcrypt.hash(newPassword, 12);
        }

        // update user
        await user.save();

        res.status(200).json({ message: "User updated successfully",
             user:{
                id: user._id,
                name: user.name,
                email: user.email,
                profilePicture: user.profilePicture
        } });

        // res.redirect('/dashboard');

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
        const users = await User.find().select('-password');
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

// send otp verification email
const sendOTPVerificationEmail = async ({ _id, email }) => {
    try {
        const otp = `${Math.floor(1000 + Math.random() * 9000)}`; // generate 4 digit otp code
        // email options
        const mailOptions = {
            from: process.env.USER,
            to: email,
            subject: "Verify your email",
            html: `<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
                    <h2 style="color: #4CAF50; text-align: center;">Email Verification Code</h2>
                    <p style="margin: 20px 0; font-size: 16px;">
                    Please use the following otp to verify your email:</p>
                    <div style="font-size: 24px; font-weight: bold; text-align: center; color: #4CAF50; border: 1px dashed #4CAF50; padding: 10px; margin: 20px auto; width: fit-content;">
                        ${otp}
                    </div>
                    <p style="margin: 20px 0; font-size: 14px; color: #555;">
                        This code is valid for <strong>1 hour</strong>. If you did not request this, please ignore this email.
                    </p>
                    <footer style="margin-top: 20px; text-align: center; font-size: 12px; color: #aaa;">
                        &copy; 2025 Your Company Name. All rights reserved.
                    </footer>
                    </div>`,
        };

        // hash otp
        const hashedOTP = await bcrypt.hash(otp, 10);

        const newOTPVerification = new UserOTPVerification({
            userId: _id,
            otp: hashedOTP,
            createdAt: Date.now(),
            expiresAt: Date.now() + 3600000, // expires at 1 hour
        });

        await newOTPVerification.save();
        console.log("OTP record saved successfully", { userId: _id, otp});

        // send otp email
        await transporter.sendMail(mailOptions);
        console.log("Verification email sent to:", email);

    } catch (error) {
        console.error("Error in sendOTPVerificationEmail:", error.message);
        throw new Error("Failed to send OTP email. Please try again later.");
    }
};

// verify otp controller
const verifyOTP = async (req, res) => {
    try {
        const { userId, otp } = req.body;

        // validate input fields
        if (!userId || !otp) {
            return res.status(400).json({ status: "FAILED", message: "Both userId and OTP are required." });
        }

        // check for existing OTP records for the user
        const userOTPRecord = await UserOTPVerification.findOne({ userId });
        if (!userOTPRecord) {
            return res.status(404).json({ status: "FAILED", message: "No OTP record found. Please request a new OTP." });
        }

        const { expiresAt, otp: hashedOTP } = userOTPRecord;

        // check if OTP has expired
        if (expiresAt < Date.now()) {
            await UserOTPVerification.deleteOne({ userId }); // delete expired OTP record
            return res.status(400).json({ status: "FAILED", message: "OTP has expired. Please request a new one." });
        }

        // verify the OTP
        const isOTPValid = await bcrypt.compare(otp, hashedOTP);
        if (!isOTPValid) {
            return res.status(400).json({ status: "FAILED", message: "Invalid OTP. Please try again." });
        }

        // mark user as verified
        await User.updateOne({ _id: userId }, { verified: true });
        console.log("User verified:", userId);

        // delete OTP record after successful verification
        await UserOTPVerification.deleteOne({ userId });

        // render a success page with a redirect message
        res.render("verified", { message: "Successfully verified! Redirecting to login page...", redirectUrl: "/login" });

    } catch (error) {
        console.error("Error in verifying otp:", error.message);
        return res.status(500).json({ status: "FAILED", message: "An error occurred during verification. Please try again later." });
    }
};

// resend otp verification
const resendOTP = async (req, res) => {
    try {
        const { userId, email } = req.body;

        // validate input fields
        if (!userId || !email) {
            return res.status(400).json({ message: "User ID and email are required." });
        }

        // check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // delete existing OTP records for the user
        await UserOTPVerification.deleteMany({ userId });

        // resend OTP
        await sendOTPVerificationEmail({ _id: userId, email });

        // res.status(200).json({ message: "OTP resent successfully. Please check your email." });

        res.redirect(`/otp?userId=${userId}&email=${email}`);

    } catch (error) {
        console.error("Error resending OTP:", error.message);
        res.status(500).json({ message: "Failed to resend OTP. Please try again later." });
    }
};

module.exports = {
    createUser,
    login,
    logout,
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    verifyOTP,
    resendOTP
};