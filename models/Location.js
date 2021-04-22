const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Utils = require('./../utils')
require('mongoose-type-email')

// schema
const locationSchema = new mongoose.Schema({
    locationType: {
        type: String,
        require: true
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