const mongoose = require('mongoose')
const Schema = mongoose.Schema

// schema
const itemSchema = new mongoose.Schema({                                           //// implement/import this into the sub-items e.g. light, tv etc
    placeName: { type: Schema.Types.ObjectId, required: true, ref: 'Place' },
    type: { type: Schema.Types.ObjectId, required: true, ref: 'Device' },
    // imageURL: { type: String, required: true }, // Not needed - taken from device image URL?
    name: { type: String, required: true },
    status: { type: Number, required: true },
    state: { type: Number, required: true },
    pinned: { type: Boolean, required: true },
    enabled: { type: Boolean, required: true },
    pollRate: { type: Date, required: true },
    reportingRate: { type: Number, required: true },
    ipAddress: { type: String, required: true },
    mqttTopic: { type: String, required: true },
    lastActive: { type: Array, required: false },
    activityHistory: { type: Schema.Types.ObjectId, required: true, ref: 'ActivityHistory' } // Link to ActivityHistory?
    // activityDuration: { type: Array, required: false } // Not needed - taken from ActivityHisotry duration?

}, { timestamps: true })

// model
const itemModel = mongoose.model('Item', itemSchema)

// export
module.exports = itemModel