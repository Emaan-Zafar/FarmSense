var mongoose = require("mongoose");

var userSchema = mongoose.Schema({
    username: String,
    email: String,
    password: String
}, { collection: 'User' });

var userModel = mongoose.model('User', userSchema);

module.exports = userModel;