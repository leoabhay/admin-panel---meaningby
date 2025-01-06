const Blog = require('../models/Blog');
const path = require('path');

// create blog controller
const createBlog = async (req, res) => {
    try {
        const { title, description, full_description, author } = req.body;

        // Validate fields
        if (!title || !description || !full_description || !author) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Handle uploaded image
        const image = req.file ? path.join('uploads', 'blogs', req.file.filename) : null;

        // Create blog
        const newBlog = new Blog({ title, description, full_description, author, image });
        await newBlog.save();

        res.status(201).json({
            message: "Blog created successfully",
            blog: {
                id: newBlog._id,
                title: newBlog.title,
                description: newBlog.description,
                full_description: newBlog.full_description,
                author: newBlog.author,
                image: newBlog.image,
                createdAt: newBlog.createdAt.toISOString(),
            },
        });
    } catch (error) {
        console.error("Error creating blog:", error);
        res.status(500).json({ message: "Error creating blog", error: error.message });
    }
};

// get all blogs controller
const getBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find();
        res.status(200).json({ blogs });
    } catch (error) {
        console.error("Error fetching blogs:", error);
        res.status(500).json({ message: "Error getting blogs", error: error.message });
    }
};

// get blog by id controller
const getBlogById = async (req, res) => {
    try {
        const { blogId } = req.params; // ensure 'blogId' matches the route definition

        // validate blogId
        if (!blogId) {
            return res.status(400).json({ message: "Blog ID is required" });
        }

        // check if blog exists
        const blog = await Blog.findById(blogId);
        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }

        res.status(200).json(blog);

    } catch (error) {
        console.error("Error fetching blog:", error);
        res.status(500).json({ message: "Error getting blog", error: error.message });
    }
};

// update blog controller
const updateBlog = async (req, res) => {
    try {
        const { blogId } = req.params;
        const { title, description, full_description, author } = req.body;

        if (!blogId) {
            return res.status(400).json({ message: "Blog ID is required" });
        }

        // validate fields
        if (!title || !description || !full_description || !author) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // check if blog exists
        const existingBlog = await Blog.findById(blogId);
        if (!existingBlog) {
            return res.status(404).json({ message: "Blog not found" });
        }

        // Handle updated image if provided
        if (req.file) {
            existingBlog.image = path.join('uploads', 'blogs', req.file.filename);
        }

        // Update blog fields
        existingBlog.title = title || existingBlog.title;
        existingBlog.description = description || existingBlog.description;
        existingBlog.full_description = full_description || existingBlog.full_description;
        existingBlog.author = author || existingBlog.author;
        await existingBlog.save();

        res.status(200).json({
            message: "Blog updated successfully",
            blog: {
                id: existingBlog._id,
                title: existingBlog.title,
                description: existingBlog.description,
                full_description: existingBlog.full_description,
                author: existingBlog.author,
                image: existingBlog.image,
                createdAt: existingBlog.createdAt.toISOString(),
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

        if (!blogId) {
            return res.status(400).json({ message: "Blog ID is required" });
        }

        // check if blog exists
        const existingBlog = await Blog.findById(blogId);
        if (!existingBlog) {
            return res.status(404).json({ message: "Blog not found" });
        }

        // Optionally delete the associated image file here if needed
        // fs.unlinkSync(path.join(__dirname, '..', existingBlog.image));

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
};