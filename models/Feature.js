const mongoose = require('mongoose');

const featureSchema = new mongoose.Schema({
    title: {type: String, required: true},
    logo: {type: String, required: true},
    description: {type: String, required: true}
});

const Feature = mongoose.model('Feature', featureSchema);

module.exports = Feature;