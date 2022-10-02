const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
    name: {
        type: String
    },
    price: {
        type: Number
    }, 
    quality: {
        type: String
    },
    resolution: {
        type: String
    },
    devices: {
        type: [String]
    }
})

module.exports = mongoose.model('Plan', planSchema);