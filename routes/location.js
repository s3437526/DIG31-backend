const express = require('express')
const router = express.Router()
const Utils = require('./../utils')
const Location = require('./../models/Location')
const path = require('path')

// Location routes-----------------------------------------------------------------
// GET - get all locations
// endpoint = /location ------------------------------------------------------------
/*
This code block handles the request to retrieve all locations from the database and if 
this is unsuccessful, throws a generic error
*/
router.get('/', Utils.authenticateToken, (req, res) => {

    // make sure the user is admin
    if (req.headers.access != 2) { // There has to be a safer way of determining admin...
        return res.status(401).json({
            message: "Not authorised to access, you are not an admin!"
        })
    }

    // Get all locations from the location model using the find() method
    Location.find()
        .then((locations) => {
            res.json(locations)
        })
        .catch((err) => {
            console.log("There was a problem with retrieving locations ", err)
        })
})

// GET - get single location -------------------------------------------------------
router.get('/:id', Utils.authenticateToken, (req, res) => {

    // make sure the user is admin
    if (req.headers.access != 2) { // There has to be a safer way of determining admin...
        return res.status(401).json({
            message: "Not authorised to access, you are not an admin!"
        })
    }

    Location.findById(req.params.id)
        .then(location => {
            res.json(location)
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                message: "Couldn't get location",
                error: err
            })
        })
})


// PUT - update location ---------------------------------------------
router.put('/:id', Utils.authenticateToken, (req, res) => {

    // make sure the user is admin
    if (req.headers.access != 2) { // There has to be a safer way of determining admin...
        return res.status(401).json({
            message: "Not authorised to change, you are not an admin!"
        })
    }

    // validate request
    if (!req.body) return res.status(400).send("Task content can't be empty")

    let iconURL = null

    // if avatar image exists, upload!
    if (req.files && req.files.avatar) {
        // upload avater image then update location
        let uploadPath = path.join(__dirname, '..', 'public', 'icons')
        Utils.uploadFile(req.files.avatar, uploadPath, (uniqueFilename) => {
            iconURL = uniqueFilename
                // update location with all fields including avatar
            updateLocation({
                iconURL: req.body.iconURL
            })
        })
    } else {
        // update location without avatar
        updateLocation(req.body)
    }

    // update location
    function updateLocation(update) {
        Location.findByIdAndUpdate(req.params.id, update, { new: true })
            .then(location => res.json(location))
            .catch(err => {
                res.status(500).json({
                    message: 'Problem updating location',
                    error: err
                })
            })
    }
})

// POST - create new location --------------------------------------
router.post('/', Utils.authenticateToken, (req, res) => {

    // make sure the user is admin
    if (req.headers.access != 2) { // There has to be a safer way of determining admin...
        return res.status(401).json({
            message: "Not authorised to create, you are not an admin!"
        })
    }

    // validate request
    if (Object.keys(req.body).length === 0) {
        return res.status(400).send({ message: "Location content can not be empty" })
    }

    // Cust check that the location name doesn't exist...
    Location.findOne({ locationType: req.body.locationType })
        .then(location => {
            if (location.locationType === req.body.locationType) {
                return res.status(400).json({
                    message: "The location " + req.body.locationType + " already exists. Consider renaming it"
                })
            } else {
                // create new location       
                let newLocation = new Location(req.body)
                newLocation.save()
                    .then(location => {
                        // success!  
                        // return 201 status with location object
                        return res.status(201).json(location)
                    })
                    .catch(err => {
                        console.log(err)
                        return res.status(500).send({
                            message: "Problem creating location",
                            error: err
                        })
                    })
            }
        })
})

// not deleting places at this point...
// when considering deleting, implement deleting dependent entities

module.exports = router