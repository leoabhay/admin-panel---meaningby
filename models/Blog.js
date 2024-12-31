const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    author: { type: String, required: true },
    image: { type: String, required: false },
    createdAt: { type: Date, default: Date.now }
});

blogSchema.methods.formatCreatedAt = function() {
    return this.createdAt.toLocaleString();      // this include both date and time
};

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;