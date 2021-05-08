const express = require('express')
const router = express.Router()
const Utils = require('./../utils')
const Item = require('./../models/Item')
const path = require('path')

// Device routes-----------------------------------------------------------------
// GET - get all devices
// endpoint = /device ------------------------------------------------------------
/*
This code block handles the request to retrieve all devices from the database and if 
this is unsuccessful, throws a generic error
*/
router.get('/', Utils.authenticateToken, (req, res) => {
    // Get all devices from the device model using the find() method
    Item.find().populate("placeName").populate("type").populate("activityHistory").populate("iconURL")
        .then((items) => {
            res.json(items)
        })
        .catch((err) => {
            console.log("There was a problem with retrieving devices ", err)
        })
})

module.exports = router