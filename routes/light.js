const express = require('express')
const router = express.Router()
const Utils = require('../utils')
const Light = require('../models/Light')
const Item = require('../models/Light')
const path = require('path')

// Light routes-----------------------------------------------------------------
// GET - get all lights
// endpoint = /light------------------------------------------------------------
/*
This code block handles the request to retrieve all lights from the database and if 
this is unsuccessful, throws a generic error
*/
router.get('/', (req, res) => {
    // Get all lights from the light model using the find() method
    Item.find({ type: "6083b63c3477435e1c8dd579" }).populate("placeName").populate("type").populate("activityHistory")
        .then((items) => {
            res.json(items)
        })
        .catch((err) => {
            console.log("There was a problem with retrieving lights ", err)
        })
})

// GET - get single light -------------------------------------------------------
router.get('/:id', (req, res) => { ////////////////////////////////////////////////Utils.authenticateToken,
    if (req.light._id != req.params.id) { ///// not working....?
        return res.status(401).json({
            message: "Not authorised"
        })
    }

    Item.findById(req.params.id)
        .then(light => {
            res.json(light)
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                message: "Couldn't get light",
                error: err
            })
        })
})


// PUT - update light ---------------------------------------------
router.put('/:id', Utils.authenticateToken, (req, res) => {
    // validate request
    if (!req.body) return res.status(400).send("Task content can't be empty")

    let avatarFilename = null

    // if avatar image exists, upload!
    if (req.files && req.files.avatar) {
        // upload avater image then update light
        let uploadPath = path.join(__dirname, '..', 'public', 'images')
        Utils.uploadFile(req.files.avatar, uploadPath, (uniqueFilename) => {
            avatarFilename = uniqueFilename
                // update light with all fields including avatar
            updateLight({
                firstName: req.body.firstName, /// edit here... or remove - I think it's not needed???
                lastName: req.body.lastName,
                email: req.body.email,
                avatar: avatarFilename,
                bio: req.body.bio,
                accessLevel: req.body.accessLevel
            })
        })
    } else {
        // update light without avatar
        updateLight(req.body)
    }

    // update Light
    function updateLight(update) {
        Item.findByIdAndUpdate(req.params.id, update, { new: true })
            .then(light => res.json(light))
            .catch(err => {
                res.status(500).json({
                    message: 'Problem updating light',
                    error: err
                })
            })
    }
})

// POST - create new light --------------------------------------
router.post('/', (req, res) => {
    // validate request
    if (Object.keys(req.body).length === 0) {
        return res.status(400).send({ message: "Light content can not be empty" })
    }

    // check account with email doen't already exist                /// look for something else here
    Item.findOne({ email: req.body.email })
        .then(item => {
            // if (item != null) {
            //     return res.status(400).json({
            //         message: "email already in use, use different email address"
            //     })
            // }
            // create new light       
            let newLight = new Light(req.body)
            newLight.save()
                .then(item => {
                    // success!  
                    // return 201 status with light object
                    return res.status(201).json(item)
                })
                .catch(err => {
                    console.log(err)
                    return res.status(500).send({
                        message: "Problem creating light",
                        error: err
                    })
                })
        })
})

module.exports = router