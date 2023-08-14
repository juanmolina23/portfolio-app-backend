const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        required: true,
        type: String
    },
    password: {
        required: true,
        type: String
    }, 
    firstName: {
        required: true,
        type: String
    }, 
    lastName: {
        required: true,
        type: String
    }, 
    displayName: {
        required: true,
        type: String
    }, 
    role: {
        required: false,
        default: 'user',
        type: String
    }

})

module.exports = mongoose.model('user', userSchema)