const mongoose = require('mongoose')
const Schema = mongoose.Schema

// schema
const locationSchema = new mongoose.Schema({
    locationType: {
        type: String,
        required: true
    },
    iconURL: {
        type: String,
        required: true
    }
}, { timestamps: true })

// model
const locationModel = mongoose.model('Location', locationSchema)

// export
module.exports = locationModel