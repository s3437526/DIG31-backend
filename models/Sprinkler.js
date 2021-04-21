const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Utils = require('./../utils')
require('mongoose-type-email')

// schema
const sprinklerSchema = new mongoose.Schema({
    placeName: { type: Schema.Types.ObjectId, required: true, ref: 'Place' },
    type: { type: Schema.Types.ObjectId, required: true, ref: 'Device' },
    // imageURL: { type: String, required: true }, // Not needed - taken from device image URL?
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
    activityHistory: { type: Number, required: false }, // Link to ActivityHistory?
    activityDuration: { type: Array, required: false } // Link to ActivityHistory?

}, { timestamps: true })

// model
const sprinklerModel = mongoose.model('Sprinkler', sprinklerSchema)

// export
module.exports = sprinklerModel