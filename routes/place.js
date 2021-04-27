const express = require('express')
const router = express.Router()
const Utils = require('./../utils')
const Place = require('./../models/Place')
const path = require('path')

// Places routes-----------------------------------------------------------------
// GET - get all places
// endpoint = /place ------------------------------------------------------------
/*
This code block handles the request to retrieve all places from the database and if 
this is unsuccessful, throws a generic error
*/
router.get('/', Utils.authenticateToken, (req, res) => {
    // Get all places from the activity history model using the find() method
    Place.find()
        .then((places) => {
            res.json(places)
        })
        .catch((err) => {
            console.log("There was a problem with retrieving places ", err)
        })
})

// GET - get single activity history -------------------------------------------------------
router.get('/:id', Utils.authenticateToken, (req, res) => {

    Place.findById(req.params.id)
        .then(place => {
            res.json(place)
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                message: "Couldn't get place",
                error: err
            })
        })
})


// PUT - update place ---------------------------------------------
router.put('/:id', Utils.authenticateToken, (req, res) => {

    // make sure the user is admin
    if (req.headers.access != 2) { // There has to be a safer way of determining admin...
        return res.status(401).json({
            message: "Not authorised to change, you are not an admin!"
        })
    }

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
                // updatePlace({
                //     firstName: req.body.firstName,
                //     lastName: req.body.lastName,
                //     email: req.body.email,
                //     avatar: avatarFilename,
                //     bio: req.body.bio,
                //     accessLevel: req.body.accessLevel
                // })
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
router.post('/', Utils.authenticateToken, (req, res) => {

    // make sure the user is admin
    if (req.headers.access != 2) { // There has to be a safer way of determining admin...
        return res.status(401).json({
            message: "Not authorised to create, you are not an admin!"
        })
    }

    // validate request
    if (Object.keys(req.body).length === 0) {
        return res.status(400).send({ message: "Place content can not be empty" })
    }

    // Check that the place doesn't exist...
    Place.findOne({ "placeName": req.body.placeName })
        .then(place => {
            if (place.placeName === req.body.placeName) {
                return res.status(400).json({
                    message: "The place " + req.body.placeName + " already exists. Consider renaming it"
                })
            } else {
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
            }
        })
})

// not deleting places at this point.
// when considering deleting, implement deleting dependent entities

module.exports = router