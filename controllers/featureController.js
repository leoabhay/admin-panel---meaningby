const Feature = require('../models/Feature');
const path = require('path');

// create feature controller
const createFeature = async (req, res) => {
    try {
        const { title, description, full_description } = req.body;

        // validate fields
        if (!title || !description || !full_description) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // handle uploaded image
        const image = req.file ? path.join('uploads', 'features', req.file.filename) : null;

        // create feature
        const newFeature = new Feature({ title, description, full_description, image });
        await newFeature.save();

        res.status(201).json({
            message: "Feature created successfully",
            feature: { id: newFeature._id, 
                    feature: newFeature.title, 
                    description: newFeature.description,
                    full_description: newFeature.full_description,
                    image: newFeature.image 
                }
        });

    } catch (error) {

        console.error("Error creating feature:", error);
        res.status(500).json({ message: "Error creating feature", error: error.message });
    }
};

// get all features controller
const getFeatures = async (req, res) => {
    try {
        const features = await Feature.find();
        res.status(200).json({ features });

    } catch (error) {
        console.error("Error fetching features:", error);
        res.status(500).json({ message: "Error getting features", error: error.message });
    }
};

// get feature by id controller
const getFeatureById = async (req, res) => {
    try {
        const { featureId } = req.params;  // ensure 'featureId' matches the route definition

        // validate featureId
        if (!featureId) {
            return res.status(400).json({ message: "Feature ID is required" });
        }

        // check if feature exists
        const feature = await Feature.findById(featureId);
        if (!feature) {
            return res.status(404).json({ message: "Feature not found" });
        }

        res.status(200).json(feature);

    } catch (error) {
        console.error("Error fetching feature:", error);
        res.status(500).json({ message: "Error getting feature", error: error.message });
    }
};

// update feature controller
const updateFeature = async (req, res) => {
    try {
        const { featureId } = req.params;
        const { title, description, full_description } = req.body;

        // validate featureId
        if(!featureId){
            return res.status(400).json({message: "Feature ID is required"});
        }

        // validate fields
        if (!title || !description || !full_description) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // check if feature exists
        const existingFeature = await Feature.findById(featureId);
        if (!existingFeature) {
            return res.status(404).json({ message: "Feature not found" });
        }

        // handle updated image if provided
        if (req.file) {
            existingFeature.image = path.join('uploads', 'features', req.file.filename);
        }

        // update feature fields
        existingFeature.title = title;
        existingFeature.description = description;
        existingFeature.full_description = full_description;
        await existingFeature.save();

        res.status(200).json({
            message: "Feature updated successfully",
            feature: { 
                    id: existingFeature._id, 
                    title: existingFeature.title, 
                    description: existingFeature.description,
                    full_description: existingFeature.full_description,
                    image: existingFeature.image
                }
        });

    } catch (error) {
        console.error("Error updating feature:", error);
        res.status(500).json({ message: "Error updating feature", error: error.message });
    }
};

// delete feature controller
const deleteFeature = async (req, res) => {
    try {
        const { featureId } = req.params;

        // check if feature exists
        const existingFeature = await Feature.findById(featureId);
        if (!existingFeature) {
            return res.status(404).json({ message: "Feature not found" });
        }

        await existingFeature.deleteOne();

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