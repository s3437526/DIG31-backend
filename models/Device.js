const mongoose = require('mongoose')
const Schema = mongoose.Schema

// schema
const deviceSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true
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