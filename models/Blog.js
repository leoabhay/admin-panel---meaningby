const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    full_description: { type: String, required: true },
    author: { type: String, required: true },
    image: { type: String, default: null},
    createdAt: { type: Date, default: Date.now }
});

blogSchema.methods.toJSON = function() {
    const obj = this.toObject();
    obj.createdAt = obj.createdAt.toISOString();
    return obj;
};

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;