const express = require('express');
const router = express.Router();
const { createBlog, getBlogs, getBlogById, updateBlog, deleteBlog} = require('../controllers/blogController');

// create blog route
router.post('/create', createBlog);

// get all blogs route
router.get('/getAll', getBlogs);

// get blog by id route
router.get('/get/:blogId', getBlogById);

// update blog route
router.put('/update/:blogId', updateBlog);

// delete blog route
router.delete('/delete/:blogId', deleteBlog);

module.exports = router;