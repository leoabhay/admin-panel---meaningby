const express = require('express');
const router = express.Router();
const { createWord, getWords, getWordById, updateWord, deleteWord } = require('../controllers/wordController');

// create word route
router.post('/create', createWord);

// get all words route
router.get('/getAll', getWords);

// get word by id route
router.get('/get/:wordId', getWordById);

// update word route
router.put('/update/:wordId', updateWord);

// delete word route
router.delete('/delete/:wordId', deleteWord);

module.exports = router;