const mongoose = require('mongoose');

const featureSchema = new mongoose.Schema({
    title: {type: String, required: true},
    description: {type: String, required: true},
    createdAt: {type: Date, default: Date.now}
});

featureSchema.set('toJSON', {
    transform: (doc, ret) => {
        ret.createdAt = ret.createdAt.toLocaleString();
        return ret;
    }
});

const Feature = mongoose.model('Feature', featureSchema);

module.exports = Feature;