const Feature = require('../models/Feature');

// create feature controller
const createFeature = async (req, res) => {
    try {
        const { title, description } = req.body;

        // validate fields
        if (!title || !description) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // create new feature
        const newFeature = new Feature({
            title,
            description
        });
        await newFeature.save();

        res.status(201).json({
            message: "Feature created successfully",
            feature: { id: newFeature._id, title: newFeature.title, description: newFeature.description }
        });

    } catch (error) {
        console.error("Error creating blog:", error);
        res.status(500).json({ message: "Error creating blog", error: error.message });
    }
};

// get all features controller
const getFeatures = async (req, res) => {
    try {
        const features = await Feature.find();
        res.status(200).json({ features });

    } catch (error) {
        console.error("Error getting features:", error);
        res.status(500).json({ message: "Error getting features", error: error.message });
    }
};

// get feature by id controller
const getFeatureById = async (req, res) => {
    try {
        const { FeatureId } = req.params;

        // check if blog exists
        const blog = await Blog.findById(FeatureId);
        if (!blog) {
            return res.status(404).json({ message: "Feature not found" });
        }

        res.status(200).json({ feature});

    } catch (error) {
        console.error("Error getting feature:", error);
        res.status(500).json({ message: "Error getting feature", error: error.message });
    }
};

// update feature controller
const updateFeature = async (req, res) => {
    try {
        const { FeatureId } = req.params;
        const { title, description } = req.body;

        // check if blog exists
        const feature = await Feature.findById(blogId);
        if (!feature) {
            return res.status(404).json({ message: "Feature not found" });
        }

        // update blog
        feature.title = title;
        feature.description = description;
        await feature.save();

        res.status(200).json({
            message: "Feature updated successfully",
            feature: { title: feature.title, description: feature.description }
        });

    } catch (error) {
        console.error("Error updating blog:", error);
        res.status(500).json({ message: "Error updating blog", error: error.message });
    }
};

// delete feature controller
const deleteFeature = async (req, res) => {
    try {
        const { FeatureId } = req.params;

        // check if feature exists
        const feature = await Feature.findById(FeatureId);
        if (!feature) {
            return res.status(404).json({ message: "Feature not found" });
        }

        await Blog.deleteOne();

        res.status(200).json({ message: "Feature deleted successfully" });

    } catch (error) {
        console.error("Error deleting feature:", error);
        res.status(500).json({ message: "Error deleting feature", error: error.message });
    }
};

module.exports = {
    createFeature,
    getFeatures,
    getFeatureById,
    updateFeature,
    deleteFeature
};