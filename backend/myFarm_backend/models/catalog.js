var mongoose = require("mongoose");

var catalogSchema = mongoose.Schema({
    Id: String,
    Sex: String,
    Color: String,
    Breed: String,
    Age: Number,
    Height: Number,
    Weight: Number,
    Health_Status: String
}, { collection: 'Catalog' });

var catalogModel = mongoose.model('Catalog', catalogSchema);

module.exports = catalogModel;