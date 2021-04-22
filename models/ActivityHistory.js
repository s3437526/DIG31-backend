const mongoose = require('mongoose')
const Schema = mongoose.Schema

// schema
const activityHistorySchema = new Schema({
    // itemId: { type: Number, required: true }, // May not be required...?
    lastActive: [String],
    activityDuration: [String]

}, { timestamps: true })

// model
const activityHistoryModel = mongoose.model('ActivityHistory', activityHistorySchema)

// export
module.exports = activityHistoryModel