const mongoose = require('mongoose')
const Schema = mongoose.Schema

// schema
const activityHistorySchema = new Schema({
    // itemId: { type: Number, required: true }, // May not be required...?
    lastActive: {
        type: [String],
        required: true
    },
    activityDuration: {
        type: [String],
        required: true
    }

}, { timestamps: true })

// model
const activityHistoryModel = mongoose.model('ActivityHistory', activityHistorySchema)

// export
module.exports = activityHistoryModel