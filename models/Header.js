const mongoose = require('mongoose');

const headerSchema = new mongoose.Schema({
    header: {type: String},
});

const Header = mongoose.model('Header', headerSchema);

module.exports = Header;