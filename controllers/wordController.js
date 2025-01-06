const Word = require('../models/Word');

// create word controller
const createWord = async (req, res) => {
    try {
        const { word, definition, synonyms, antonyms, example } = req.body;

        // validate fields
        if (!word || !definition || !example) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // create word
        const newWord = new Word({ word, definition, synonyms, antonyms, example });
        await newWord.save();

        res.status(201).json({
            message: "Word created successfully",
            word: { id: newWord._id, 
                    word: newWord.word, 
                    definition: newWord.definition, 
                    synonyms: newWord.synonyms, 
                    antonyms: newWord.antonyms, 
                    example: newWord.example }
        });
    } catch (error) {
        console.error("Error creating word:", error);
        res.status(500).json({ message: "Error creating word", error: error.message });
    }
};

// get all words controller
const getWords = async (req, res) => {
    try {
        const words = await Word.find();
        res.status(200).json({ words });

    } catch (error) {
        console.error("Error fetching words:", error);
        res.status(500).json({ message: "Error getting words", error: error.message });
    }
};

// get word by id controller
const getWordById = async (req, res) => {
    try {
        const { wordId } = req.params;  // ensure `wordId` matches the route definition

        if (!wordId) {
            return res.status(400).json({ message: "Word ID is required" });
        }

        // check if word exists
        const word = await Word.findById(wordId);
        if (!word) {
            return res.status(404).json({ message: "Word not found" });
        }

        res.status(200).json(word);

    } catch (error) {
        console.error("Error getting word:", error);
        res.status(500).json({ message: "Error getting word", error: error.message });
    }
};

// update word controller
const updateWord = async (req, res) => {
    try {
        const { wordId } = req.params;
        const { word, definition, synonyms, antonyms, example } = req.body;

        const existingWord = await Word.findById(wordId);
        if (!existingWord) {
            return res.status(404).json({ message: "Word not found" });
        }

        if (!word || !definition) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // update word
        existingWord.word = word;
        existingWord.definition = definition;
        existingWord.synonyms = synonyms;
        existingWord.antonyms = antonyms;
        existingWord.example = example;
        await existingWord.save();

        res.status(200).json({
            message: "Word updated successfully",
            word: {
                id: existingWord._id,
                word: existingWord.word,
                definition: existingWord.definition,
                synonyms: existingWord.synonyms,
                antonyms: existingWord.antonyms,
                example: existingWord.example,
            },
        });
    } catch (error) {
        console.error("Error updating word:", error);
        res.status(500).json({ message: "Error updating word", error: error.message });
    }
};

// delete word controller
const deleteWord = async (req, res) => {
    try {
        const { wordId } = req.params;

        const existingWord = await Word.findById(wordId);
        if (!existingWord) {
            return res.status(404).json({ message: "Word not found" });
        }

        await existingWord.deleteOne();      // this will delete the word from the database

        res.status(200).json({ message: "Word deleted successfully" });
        
    } catch (error) {
        console.error("Error deleting word:", error);
        res.status(500).json({ message: "Error deleting word", error: error.message });
    }
};

module.exports = {
    createWord,
    getWords,
    getWordById,
    updateWord,
    deleteWord
};