const mongoose = require('mongoose');

const wordSchema = new mongoose.Schema({
    word: { type: String, required: true },
    definition: { type: String, required: true },
    synonyms: { type: String },
    antonyms: { type: String },
    example: { type: String },
});

const Word = mongoose.model('Word', wordSchema);

module.exports = Word;