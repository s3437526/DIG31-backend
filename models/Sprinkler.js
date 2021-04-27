const mongoose = require('mongoose')
const Schema = mongoose.Schema

// schema
const sprinklerSchema = new mongoose.Schema({
    placeName: { type: Schema.Types.ObjectId, required: true, ref: 'Place' },
    type: { type: Schema.Types.ObjectId, required: true, ref: 'Device' },
    name: { type: String, required: true },
    status: { type: Number, required: true },
    state: { type: Number, required: true },
    level: { type: Number, required: true },
    pinned: { type: Boolean, required: true },
    enabled: { type: Boolean, required: true },
    autoManage: { type: Boolean, required: true },
    minTrigger: { type: Number, required: true },
    maxTrigger: { type: Number, required: true },
    pollRate: { type: Date, required: true },
    reportingRate: { type: Number, required: true },
    ipAddress: { type: String, required: true },
    mqttTopic: { type: String, required: true },
    lastActive: { type: Array, required: false },
    activityHistory: { type: Schema.Types.ObjectId, required: true, ref: 'ActivityHistory' }

}, { timestamps: true })

// model
const sprinklerModel = mongoose.model('Sprinkler', sprinklerSchema, "items")

// export
module.exports = sprinklerModel