const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, unique: true },
    email: { type: String, unique: true },
    password: { type: String },
    confirmPassword: { type: String },
    profilePicture: { type: String, default: '/images/profile.jpg' },
    verified : { type: Boolean, default: false }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;