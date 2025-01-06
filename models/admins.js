const mongoose = require('mongoose');

//define the admin schema
const adminSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true,
        lowercase: true 
    },
    password:{
        type: String,
        required: true,
        minLength: 6
    },
    picture:{
        type: String,               //assuming picture will be saved as url
        required: false
    },
    bio:{
        type: String,
        required: false
    }
});

//create a model based on the schema
const Admin = mongoose.model('Admin', adminSchema);

module.exports= Admin;