const express = require('express')
const router = express.Router()
const Utils = require('./../utils')
const Item = require('./../models/Item')
const path = require('path')
const ActivityHistory = require('./../models/ActivityHistory')

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
            console.log(items)
        })
        .catch((err) => {
            console.log("There was a problem with retrieving devices ", err)
        })
})

// jsut addded.....
router.put('/:id', Utils.authenticateToken, (req, res) => {

    console.log(req.body)
        // Check that the device doesn't exist...
    Item.findOne({ "type": req.body.type }) // This may cause a failure if trying to bring on another item of the same type? may need to be a more robust search i.e. type, placename and name
        .then(item => {
            if (item.type === req.body.type) {
                return res.status(400).json({
                    message: "The item " + req.body.type + " already exists. Consider renaming it"
                })
            } else {
                // create new activity history for device to associate with
                let newHistory = new ActivityHistory()
                let itemId
                newHistory.save(function(err, result) {
                        if (err) {
                            response = { error: true, message: "Error creating history" };
                        } else {
                            response = { error: false, message: "History added", id: result._id };
                            itemId = result._id
                                // console.log(result._id)

                            // console.log(`Newly created item ID is: ${itemId}`)
                            // assign its id to the request body to create the item
                            // create new device       
                            let newitem = new Item({
                                name: req.body.name,
                                min: req.body.min,
                                max: req.body.max,
                                reportingRate: req.body.reportingRate,
                                pollRate: req.body.pollRate,
                                ipAddress: req.body.ipAddress,
                                mqttTopic: req.body.mqttTopic,
                                type: req.body.type,
                                placeName: req.body.placeName,
                                enabled: req.body.enabled,
                                pinned: req.body.pinned,
                                state: req.body.state,
                                status: req.body.status,
                                activityHistory: itemId
                            })
                            newitem.save()
                                .then(item => {
                                    // success!  
                                    // return 201 status with device object
                                    return res.status(201).json(item)
                                })
                                .catch(err => {
                                    console.log(err)
                                    return res.status(500).send({
                                        message: "Problem creating item",
                                        error: err
                                    })
                                })
                        }
                        // res.json(response);
                    })
                    // req.body.activityHistory = itemId


            }

        })
})

router.post('/', Utils.authenticateToken, (req, res) => {

    // make sure the user is admin
    if (req.headers.access != 2) { // There has to be a safer way of determining admin...
        return res.status(401).json({
            message: "Not authorised to create, you are not an admin!"
        })
    }

    // validate request
    if (Object.keys(req.body).length === 0) {
        return res.status(400).send({ message: "Item content can not be empty" })
    }
    console.log(req.body)
        // Check that the device doesn't exist...
    Item.findOne({ "type": req.body.type }) // This may cause a failure if trying to bring on another item of the same type? may need to be a more robust search i.e. type, placename and name
        .then(item => {
            if (item.type === req.body.type) {
                return res.status(400).json({
                    message: "The item " + req.body.type + " already exists. Consider renaming it"
                })
            } else {
                // create new activity history for device to associate with
                let newHistory = new ActivityHistory()
                let itemId
                newHistory.save(function(err, result) {
                        if (err) {
                            response = { error: true, message: "Error creating history" };
                        } else {
                            response = { error: false, message: "History added", id: result._id };
                            itemId = result._id
                                // console.log(result._id)

                            // console.log(`Newly created item ID is: ${itemId}`)
                            // assign its id to the request body to create the item
                            // create new device       
                            let newitem = new Item({
                                name: req.body.name,
                                min: req.body.min,
                                max: req.body.max,
                                reportingRate: req.body.reportingRate,
                                pollRate: req.body.pollRate,
                                ipAddress: req.body.ipAddress,
                                mqttTopic: req.body.mqttTopic,
                                type: req.body.type,
                                placeName: req.body.placeName,
                                enabled: req.body.enabled,
                                pinned: req.body.pinned,
                                state: req.body.state,
                                status: req.body.status,
                                activityHistory: itemId
                            })
                            newitem.save()
                                .then(item => {
                                    // success!  
                                    // return 201 status with device object
                                    return res.status(201).json(item)
                                })
                                .catch(err => {
                                    console.log(err)
                                    return res.status(500).send({
                                        message: "Problem creating item",
                                        error: err
                                    })
                                })
                        }
                        // res.json(response);
                    })
                    // req.body.activityHistory = itemId


            }

        })
})

module.exports = router