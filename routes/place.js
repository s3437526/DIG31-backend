const express = require('express')
const router = express.Router()
const Utils = require('./../utils')
const Place = require('./../models/Place')
const Item = require('../models/Light')
const path = require('path')

// Places routes-----------------------------------------------------------------
// GET - get all places
// endpoint = /place ------------------------------------------------------------
/*
This code block handles the request to retrieve all places from the database and if 
this is unsuccessful, throws a generic error
*/
router.get('/', (req, res) => { /** secure this down by adding auth token when done - only open for testing purposes */
    // Get all histories from the activity history model using the find() method
    Place.find()
        .then((places) => {
            res.json(places)
        })
        .catch((err) => {
            console.log("There was a problem with retrieving places ", err)
        })
})

// GET - get single activity history -------------------------------------------------------
router.get('/:id', (req, res) => { //Utils.authenticateToken, 
    if (req.activityHistory._id != req.params.id) {
        return res.status(401).json({
            message: "Not authorised"
        })
    }

    ActivityHistory.findById(req.params.id)
        .then(activityHistory => {
            res.json(activityHistory)
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                message: "Couldn't get activity history",
                error: err
            })
        })
})


// PUT - update place ---------------------------------------------
router.put('/:id', Utils.authenticateToken, (req, res) => {
    // validate request
    if (!req.body) return res.status(400).send("Task content can't be empty")

    let avatarFilename = null

    // if avatar image exists, upload!
    if (req.files && req.files.avatar) {
        // upload avater image then update place
        let uploadPath = path.join(__dirname, '..', 'public', 'images')
        Utils.uploadFile(req.files.avatar, uploadPath, (uniqueFilename) => {
            avatarFilename = uniqueFilename
                // update place with all fields including avatar
            updatePlace({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                avatar: avatarFilename,
                bio: req.body.bio,
                accessLevel: req.body.accessLevel
            })
        })
    } else {
        // update place without avatar
        updatePlace(req.body)
    }

    // update Place
    function updatePlace(update) {
        Place.findByIdAndUpdate(req.params.id, update, { new: true })
            .then(place => res.json(place))
            .catch(err => {
                res.status(500).json({
                    message: 'Problem updating place',
                    error: err
                })
            })
    }
})

// POST - create new place --------------------------------------
router.post('/', (req, res) => {
    // validate request
    if (Object.keys(req.body).length === 0) {
        return res.status(400).send({ message: "Place content can not be empty" })
    }

    // check account with email doen't already exist
    Place.findOne({ email: req.body.email })
        .then(place => {
            // if (place != null) {
            //     return res.status(400).json({
            //         message: "email already in use, use different email address"
            //     })
            // }
            // create new place       
            let newPlace = new Place(req.body)
            newPlace.save()
                .then(place => {
                    // success!  
                    // return 201 status with place object
                    return res.status(201).json(place)
                })
                .catch(err => {
                    console.log(err)
                    return res.status(500).send({
                        message: "Problem creating place",
                        error: err
                    })
                })
        })
})

module.exports = router