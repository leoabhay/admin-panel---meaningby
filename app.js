const express = require('express');
const session = require('express-session');
const path = require('path');
const multer = require('./middleware/multer');
const userRoutes = require('./routes/userRoutes');
const blogRoutes = require('./routes/blogRoutes');
const featureRoutes = require('./routes/featureRoutes');
const wordRoutes = require('./routes/wordRoutes');
const dbConnect = require('./config/db');
const { createUser, login } = require('./controllers/userController');

// load environment variables
require('dotenv').config();

// create express app
const app = express();

// database connection
dbConnect();

// set up view engine and middleware
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // for form data parsing
app.use(express.static('public'));

// serve uploaded files
app.use('/uploads/profiles', express.static(path.join(__dirname, 'uploads', 'profiles')));

// set up session middleware
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }   // change to true if using HTTPS
}));

// route to serve the profile page
app.get('/profile', (req, res) => {
    // console.log('Session Data:', req.session);
    // console.log('User Profile Image:', req.session.userProfileImage);

    const isLoggedIn = req.session.isLoggedIn || false;
    const userProfileImage = isLoggedIn && req.session.userProfileImage 
        ? req.session.userProfileImage 
        : '/images/profile.jpg';
    const userName = isLoggedIn ? req.session.userName : 'Guest';
    const userEmail = isLoggedIn ? req.session.userEmail : 'email@example.com';
    const userId = isLoggedIn ? req.session.userId : null;

    if (!isLoggedIn) {
        return res.redirect('/login');
    }

    res.render('profile', {
        userName,
        userProfileImage,
        userEmail,
        userId,
    });
});

// route to handle profile picture update
app.post('/profile/upload', multer.single('profilePicture'), (req, res) => {
    const isLoggedIn = req.session.isLoggedIn || false;

    if (!isLoggedIn) {
        return res.redirect('/login');
    }

    // Store the uploaded profile image path in session
    req.session.userProfileImage = `/uploads/profiles/${req.file.filename}`;

    // Send a response indicating successful upload
    res.redirect('/dashboard'); // or send a response with updated data
});

// route to serve the dashboard page
app.get('/dashboard', (req, res) => {
    const isLoggedIn = req.session.isLoggedIn || false;
    const userProfileImage = isLoggedIn ? req.session.userProfileImage : '/uploads/profiles/default.jpg';
    const userName = isLoggedIn ? req.session.userName : 'Guest';

    if (!isLoggedIn) {
        return res.redirect('/login');
    }

    res.render('dashboard', {
        isLoggedIn: isLoggedIn,
        userProfileImage: userProfileImage,
        userName: userName
    });
});

// route to handle login ( localhost:8080/ or localhost:8080/login ) 
app.get('/', (req, res) => {
    const isLoggedIn = req.session.isLoggedIn || false;
    if (isLoggedIn) {
        res.redirect('/dashboard');
    } else {
        res.render('login');
    }
});

// route to serve the signup page
app.get('/signup', (req, res) => {
    res.render('signup');
});

// route to serve the login page
app.get('/login', (req, res) => {
    res.render('login');
});

// route to serve the word management page
app.get('/word', (req, res) => {
    const isLoggedIn = req.session.isLoggedIn || false;
    res.render('word', { isLoggedIn });
});

// route to serve the blog page
app.get('/blog', (req, res) => {
    const isLoggedIn = req.session.isLoggedIn || false;
    res.render('blog', { isLoggedIn });
});

// route to serve the feature page
app.get('/feature', (req, res) => {
    const isLoggedIn = req.session.isLoggedIn || false;
    res.render('feature', { isLoggedIn });
});

// route to handle logout
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Error logging out' });
        }
        res.redirect('/login');
    });
});

// route to handle signup form submission
app.post('/signup', createUser);

// route to handle login form submission
app.post('/login', login);

// routes for other APIs and functionalities
app.use('/api/user', userRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/feature', featureRoutes);
app.use('/api/word', wordRoutes);

// error handler for multer
// app.use((err, req, res, next) => {
//     if (err instanceof multer.MulterError) {
//         res.status(400).json({ message: err.message });
//     } else if (err) {
//         res.status(500).json({ message: "Internal Server Error", error: err.message });
//     } else {
//         next();
//     }
// });

// connect to server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});