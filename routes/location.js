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
router.get('/', (req, res) => { /** secure this down by adding auth token when done - only open for testing purposes */
    // Get all histories from the location model using the find() method
    Location.find()
        .then((locations) => {
            res.json(locations)
        })
        .catch((err) => {
            console.log("There was a problem with retrieving locations ", err)
        })
})

// GET - get single location -------------------------------------------------------
router.get('/:id', (req, res) => { //Utils.authenticateToken, 
    if (req.location._id != req.params.id) {
        return res.status(401).json({
            message: "Not authorised"
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
    // validate request
    if (!req.body) return res.status(400).send("Task content can't be empty")

    let avatarFilename = null

    // if avatar image exists, upload!
    if (req.files && req.files.avatar) {
        // upload avater image then update location
        let uploadPath = path.join(__dirname, '..', 'public', 'images') /// not sure how this will work yet... if it will be needed
        Utils.uploadFile(req.files.avatar, uploadPath, (uniqueFilename) => {
            avatarFilename = uniqueFilename
                // update location with all fields including avatar
            updateLocation({
                // firstName: req.body.firstName,
                // lastName: req.body.lastName,
                // email: req.body.email,
                locationType: req.body.locationType,
                iconURL: req.body.iconURL // location only uses iconURL and locationType in schema
                    // bio: req.body.bio,
                    // accessLevel: req.body.accessLevel
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
router.post('/', (req, res) => {
    // validate request
    if (Object.keys(req.body).length === 0) {
        return res.status(400).send({ message: "Location content can not be empty" })
    }

    // check account with email doen't already exist        /// Just check that the location ID doesn't exist...
    Location.findOne({ email: req.body.email })
        .then(location => {
            // if (location != null) {
            //     return res.status(400).json({
            //         message: "email already in use, use different email address" //////// ?
            //     })
            // }
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
        })
})

module.exports = router