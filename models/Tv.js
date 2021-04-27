const mongoose = require('mongoose')
const Schema = mongoose.Schema

// schema
const tvSchema = new mongoose.Schema({
    placeName: { type: Schema.Types.ObjectId, required: true, ref: 'Place' },
    type: { type: Schema.Types.ObjectId, required: true, ref: 'Device' },
    name: { type: String, required: true },
    status: { type: Number, required: true },
    state: { type: Number, required: true },
    pinned: { type: Boolean, required: true },
    enabled: { type: Boolean, required: true },
    channel: { type: Number, required: false },
    volume: { type: Number, required: false },
    pollRate: { type: Date, required: true },
    reportingRate: { type: Number, required: true },
    ipAddress: { type: String, required: true },
    mqttTopic: { type: String, required: true },
    lastActive: { type: Array, required: false },
    activityHistory: { type: Schema.Types.ObjectId, required: true, ref: 'ActivityHistory' }

}, { timestamps: true })

// model
const tvModel = mongoose.model('Tv', tvSchema, "items")

// export
module.exports = tvModel