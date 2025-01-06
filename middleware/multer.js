const multer = require('multer');
const path = require('path');
const fs = require('fs');

// helper function to ensure a directory exists
const ensureDirectoryExists = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log('Upload directory is ready:', dirPath);     // logs the created directory
    }
};

// define directories
const profileUploadDir = path.join(__dirname, '..', 'uploads', 'profiles');
const blogUploadDir = path.join(__dirname, '..', 'uploads', 'blogs');
const featureUploadDir = path.join(__dirname, '..', 'uploads', 'features');

// ensure directories exist
ensureDirectoryExists(profileUploadDir);
ensureDirectoryExists(blogUploadDir);
ensureDirectoryExists(featureUploadDir);

// create a factory function for multer storage
const createStorage = (uploadDir) =>
    multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, uploadDir);    // use the specified upload directory
        },
        filename: (req, file, cb) => {
            cb(null, `${Date.now()}_${file.originalname}`);
        },
    });

// define upload configurations

// for profiles
const uploadProfiles = multer({
    storage: createStorage(profileUploadDir),
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png/;
        const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = fileTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error("Only images are allowed"));
        }
    },
});

// for blogs
const uploadBlogs = multer({
    storage: createStorage(blogUploadDir),
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png/;
        const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = fileTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error("Only images are allowed"));
        }
    },
});

// for features
const uploadFeatures = multer({
    storage: createStorage(featureUploadDir),
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png/;
        const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = fileTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error("Only logos are allowed"));
        }
    },
});

// export the upload configurations inside an upload object
module.exports = {
    upload: {
        uploadProfiles,
        uploadBlogs,
        uploadFeatures
    },
};