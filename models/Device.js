const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Utils = require('./../utils')
require('mongoose-type-email')

// schema
const deviceSchema = new mongoose.Schema({
    type: {
        type: String,
        require: true
    },
    iconURL: {
        type: String,
        required: true
    }
}, { timestamps: true })

// model
const deviceModel = mongoose.model('Device', deviceSchema)

// export
module.exports = deviceModel