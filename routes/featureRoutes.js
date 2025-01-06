const express = require('express');
const { createFeature, getFeatureById, getFeatures, updateFeature, deleteFeature } = require('../controllers/featureController');
const router = express.Router();
const { upload } = require('../middleware/multer');

// create feature route
router.post('/create', upload.uploadFeatures.single('image'), createFeature);

// get all features route
router.get('/getAll', getFeatures);

// get feature by id route
router.get('/get/:featureId', getFeatureById);

// update feature route
router.put('/update/:featureId', upload.uploadFeatures.single('image'), updateFeature);

// delete feature route
router.delete('/delete/:featureId', deleteFeature);

module.exports = router;