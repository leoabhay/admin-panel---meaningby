const express = require('express');
const { createFeature, getFeatureById, getFeatures, updateFeature, deleteFeature } = require('../controllers/featureController');
const router = express.Router();

// create feature route
router.post('/create', createFeature);

// get all features route
router.get('/getAll', getFeatures);

// get feature by id route
router.get('/get:featureId', getFeatureById);

// update feature route
router.put('/update/:featureId', updateFeature);

// delete feature route
router.delete('/delete:featureId', deleteFeature);

module.exports = router;