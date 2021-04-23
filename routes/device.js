const express = require('express')
const router = express.Router()
const Utils = require('./../utils')
const Place = require('./../models/Place')
const path = require('path')

// Device routes-----------------------------------------------------------------
// GET - get all devices
// endpoint = /device ------------------------------------------------------------
/*
This code block handles the request to retrieve all devices from the database and if 
this is unsuccessful, throws a generic error
*/
router.get('/', (req, res) => { /** secure this down by adding auth token when done - only open for testing purposes */
    // Get all histories from the device model using the find() method
    Place.find()
        .then((devices) => {
            res.json(devices)
        })
        .catch((err) => {
            console.log("There was a problem with retrieving devices ", err)
        })
})

// GET - get single device -------------------------------------------------------
router.get('/:id', (req, res) => { //Utils.authenticateToken, 
    if (req.device._id != req.params.id) {
        return res.status(401).json({
            message: "Not authorised"
        })
    }

    Device.findById(req.params.id)
        .then(device => {
            res.json(device)
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                message: "Couldn't get device",
                error: err
            })
        })
})


// PUT - update device ---------------------------------------------
router.put('/:id', Utils.authenticateToken, (req, res) => {
    // validate request
    if (!req.body) return res.status(400).send("Task content can't be empty")

    let avatarFilename = null

    // if avatar image exists, upload!
    if (req.files && req.files.avatar) {
        // upload avater image then update device
        let uploadPath = path.join(__dirname, '..', 'public', 'images')     /// not sure how this will work yet... if it will be needed
        Utils.uploadFile(req.files.avatar, uploadPath, (uniqueFilename) => {
            avatarFilename = uniqueFilename
                // update device with all fields including avatar
            updateDevice({
                // firstName: req.body.firstName,
                // lastName: req.body.lastName,
                // email: req.body.email,
                type: req.body.locationType,
                iconURL: req.body.iconURL                         // device only uses iconURL and locationType in schema
                // bio: req.body.bio,
                // accessLevel: req.body.accessLevel
            })
        })
    } else {
        // update device without avatar
        updateDevice(req.body)
    }

    // update device
    function updateDevice(update) {
        Device.findByIdAndUpdate(req.params.id, update, { new: true })
            .then(device => res.json(device))
            .catch(err => {
                res.status(500).json({
                    message: 'Problem updating device',
                    error: err
                })
            })
    }
})

// POST - create new device --------------------------------------
router.post('/', (req, res) => {
    // validate request
    if (Object.keys(req.body).length === 0) {
        return res.status(400).send({ message: "Device content can not be empty" })
    }

    // check account with email doen't already exist        /// Just check that the device ID doesn't exist...
    Device.findOne({ email: req.body.email })
        .then(device => {
            if (device != null) {
                return res.status(400).json({
                    message: "email already in use, use different email address" //////// ?
                })
            }
            // create new device       
            let newDevice = new Device(req.body)
            newDevice.save()
                .then(device => {
                    // success!  
                    // return 201 status with device object
                    return res.status(201).json(device)
                })
                .catch(err => {
                    console.log(err)
                    return res.status(500).send({
                        message: "Problem creating device",
                        error: err
                    })
                })
        })
})

module.exports = router