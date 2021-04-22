const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Utils = require('./../utils')
require('mongoose-type-email')

// schema
const activityHistorySchema = new mongoose.Schema({
    itemId: { type: Number, required: true },
    lastActive: { type: Array, required:  true },
    activityDuration: { type: Array, required: true }

}, { timestamps: true })

// model
const activityHistoryModel = mongoose.model('ActivityHistory', activityHistorySchema)

// export
module.exports = activityHistoryModel