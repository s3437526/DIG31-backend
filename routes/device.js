const express = require('express')
const router = express.Router()
const Utils = require('./../utils')
const Device = require('./../models/Device')
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
    Device.find()
        .then((devices) => {
            res.json(devices)
        })
        .catch((err) => {
            console.log("There was a problem with retrieving devices ", err)
        })
})

// GET - get single device -------------------------------------------------------
router.get('/:id', Utils.authenticateToken, (req, res) => {

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

    // make sure the user is admin
    if (req.headers.access != 2) { // There has to be a safer way of determining admin...
        return res.status(401).json({
            message: "Not authorised to change, you are not and admin!"
        })
    }

    // validate request
    if (!req.body) return res.status(400).send("Task content can't be empty")

    let avatarFilename = null

    // if avatar image exists, upload!
    if (req.files && req.files.avatar) {
        // upload avater image then update device
        let uploadPath = path.join(__dirname, '..', 'public', 'images')
        Utils.uploadFile(req.files.avatar, uploadPath, (uniqueFilename) => {
            avatarFilename = uniqueFilename
                // update device with all fields including avatar  /// not sure how this will work yet... if it will be needed
                // updateDevice({
                //     type: req.body.locationType,
                //     iconURL: req.body.iconURL
                // })
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
router.post('/', Utils.authenticateToken, (req, res) => {

    // make sure the user is admin
    if (req.headers.access != 2) { // There has to be a safer way of determining admin...
        return res.status(401).json({
            message: "Not authorised to create, you are not and admin!"
        })
    }

    // validate request
    if (Object.keys(req.body).length === 0) {
        return res.status(400).send({ message: "Device content can not be empty" })
    }

    // Check that the device doesn't exist...
    Device.findOne({ "type": req.body.type })
        .then(device => {
            if (device.type === req.body.type) {
                return res.status(400).json({
                    message: "The device " + req.body.type + " already exists. Consider renaming it"
                })
            } else {
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
            }

        })
})

// not deleting devices at this point...
// when considering deleting, implement deleting dependent entities

module.exports = router