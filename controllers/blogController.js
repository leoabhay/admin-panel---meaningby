const multer = require('multer');
const path = require('path');
const Blog = require('../models/Blog');
const fs = require('fs');

// multer setup for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'uploads', 'blogs')); // set relative path
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});


const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },  // 5 mb limit
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png/;
        const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = fileTypes.test(file.mimetype);

        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Only JPEG, JPG, and PNG files are allowed!'));
        }
    }
});


// create blog controller
const createBlog = async (req, res) => {
    try {
        const { title, author, description } = req.body;
        const image = req.file ? req.file.path : null;

        // validate fields
        if (!title || !author || !description) {
            return res.status(400).json({ message: "All fields including an image are required" });
        }

        // create new blog
        const newBlog = new Blog({
            title,
            author,
            image,
            description
        });
        await newBlog.save();

        res.status(201).json({
            message: "Blog created successfully",
            blog: {
                id: newBlog._id,
                title: newBlog.title,
                author: newBlog.author,
                image: newBlog.image,
                description: newBlog.description
            }
        });
    } catch (error) {
        console.error("Error creating blog:", error);
        res.status(500).json({ message: "Error creating blog", error: error.message });
    }
};


// get all blogs controller
const getBlogs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const blogs = await Blog.find().skip(skip).limit(limit);
        const totalBlogs = await Blog.countDocuments();

        res.status(200).json({
            blogs,
            totalBlogs,
            totalPages: Math.ceil(totalBlogs / limit),
            currentPage: page
        });
    } catch (error) {
        console.error("Error fetching blogs:", error);
        res.status(500).json({ message: "Error getting blogs", error: error.message });
    }
};


// get blog by id controller
const getBlogById = async (req, res) => {
    try {
        const { blogId } = req.params;

        if (!blogId) {
            return res.status(400).json({ message: "Blog ID is required" });
        }

        const blog = await Blog.findById(blogId);
        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }

        res.status(200).json(blog);
    } catch (error) {
        console.error("Error getting blog:", error);
        res.status(500).json({ message: "Error getting blog", error: error.message });
    }
};

// update blog controller
const updateBlog = async (req, res) => {
    try {
        const { blogId } = req.params;
        const { title, author, description } = req.body;
        const image = req.file ? req.file.path : null;

        const existingBlog = await Blog.findById(blogId);
        if (!existingBlog) {
            return res.status(404).json({ message: "Blog not found" });
        }

        if (!title || !author || !description) {
            return res.status(400).json({ message: "All fields except the image are required" });
        }

        existingBlog.title = title;
        existingBlog.author = author;
        existingBlog.description = description;
        if (image) existingBlog.image = image;
        await existingBlog.save();

        res.status(200).json({
            message: "Blog updated successfully",
            blog: {
                id: existingBlog._id,
                title: existingBlog.title,
                author: existingBlog.author,
                description: existingBlog.description,
                image: existingBlog.image
            }
        });
    } catch (error) {
        console.error("Error updating blog:", error);
        res.status(500).json({ message: "Error updating blog", error: error.message });
    }
};

// delete blog controller
const deleteBlog = async (req, res) => {
    try {
        const { blogId } = req.params;
        const existingBlog = await Blog.findById(blogId);
        if (!existingBlog) {
            return res.status(404).json({ message: "Blog not found" });
        }

        // delete the image file if it exists
        if (existingBlog.image) {
            const imagePath = path.join(__dirname, '..', existingBlog.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await existingBlog.deleteOne();
        res.status(200).json({ message: "Blog deleted successfully" });
    } catch (error) {
        console.error("Error deleting blog:", error);
        res.status(500).json({ message: "Error deleting blog", error: error.message });
    }
};


module.exports = {
    createBlog,
    getBlogs,
    getBlogById,
    updateBlog,
    deleteBlog,
    upload  // export multer upload for using in routes
};