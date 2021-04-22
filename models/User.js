const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Utils = require('./../utils')
require('mongoose-type-email')

// schema
const userSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: mongoose.SchemaTypes.Email,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    bio: {
        type: String // NOT mandatory...
    },
    imageURL: {
        type: String // NOT mandatory...
    },
    accessLevel: {
        type: Number,
        required: true
    },
    status: {
        type: Number,
        default: true
    },
}, { timestamps: true })

// encrypt password field on save
userSchema.pre('save', function(next) {
    // check if password is present and is modifed  
    if (this.password && this.isModified()) {
        this.password = Utils.hashPassword(this.password);
    }
    next()
})

// model
const userModel = mongoose.model('User', userSchema)

// export
module.exports = userModel