const mongoose = require('mongoose');

const featureSchema = new mongoose.Schema({
    title: {type: String, required: true},
    description: {type: String, required: true},
    full_description: {type: String, required: true},
    image: {type: String, default: null}
});

const Feature = mongoose.model('Feature', featureSchema);

module.exports = Feature;