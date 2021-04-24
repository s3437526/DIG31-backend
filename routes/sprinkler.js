const express = require('express')
const router = express.Router()
const Utils = require('../utils')
const Sprinkler = require('../models/Sprinkler')
const path = require('path')

// Sprinkler routes-----------------------------------------------------------------
// GET - get all sprinklers
// endpoint = /sprinkler------------------------------------------------------------
/*
This code block handles the request to retrieve all sprinklers from the database and if 
this is unsuccessful, throws a generic error
*/
router.get('/', (req, res) => {
    // Get all sprinklers from the sprinkler model using the find() method
    Sprinkler.find()
        .then((sprinklers) => {
            res.json(sprinklers)
        })
        .catch((err) => {
            console.log("There was a problem with retrieving sprinklers ", err)
        })
})

// GET - get single sprinkler -------------------------------------------------------
router.get('/:id', (req, res) => { ////////////////////////////////////////////////Utils.authenticateToken,
    if (req.sprinkler._id != req.params.id) { ///// not working....?
        return res.status(401).json({
            message: "Not authorised"
        })
    }

    Sprinkler.findById(req.params.id)
        .then(sprinkler => {
            res.json(sprinkler)
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                message: "Couldn't get sprinkler",
                error: err
            })
        })
})


// PUT - update sprinkler ---------------------------------------------
router.put('/:id', Utils.authenticateToken, (req, res) => {
    // validate request
    if (!req.body) return res.status(400).send("Task content can't be empty")

    let avatarFilename = null

    // if avatar image exists, upload!
    if (req.files && req.files.avatar) {
        // upload avater image then update sprinkler
        let uploadPath = path.join(__dirname, '..', 'public', 'images')
        Utils.uploadFile(req.files.avatar, uploadPath, (uniqueFilename) => {
            avatarFilename = uniqueFilename
                // update sprinkler with all fields including avatar
            updateSprinkler({
                firstName: req.body.firstName,                              /// edit here... or remove - I think it's not needed???
                lastName: req.body.lastName,
                email: req.body.email,
                avatar: avatarFilename,
                bio: req.body.bio,
                accessLevel: req.body.accessLevel
            })
        })
    } else {
        // update sprinkler without avatar
        updateSprinkler(req.body)
    }

    // update Sprinkler
    function updateSprinkler(update) {
        Sprinkler.findByIdAndUpdate(req.params.id, update, { new: true })
            .then(sprinkler => res.json(sprinkler))
            .catch(err => {
                res.status(500).json({
                    message: 'Problem updating sprinkler',
                    error: err
                })
            })
    }
})

// POST - create new sprinkler --------------------------------------
router.post('/', (req, res) => {
    // validate request
    if (Object.keys(req.body).length === 0) {
        return res.status(400).send({ message: "Sprinkler content can not be empty" })
    }

    // check account with email doen't already exist                /// look for something else here
    Sprinkler.findOne({ email: req.body.email })
        .then(sprinkler => {
            if (sprinkler != null) {
                return res.status(400).json({
                    message: "email already in use, use different email address"
                })
            }
            // create new sprinkler       
            let newSprinkler = new Sprinkler(req.body)
            newSprinkler.save()
                .then(sprinkler => {
                    // success!  
                    // return 201 status with sprinkler object
                    return res.status(201).json(sprinkler)
                })
                .catch(err => {
                    console.log(err)
                    return res.status(500).send({
                        message: "Problem creating sprinkler",
                        error: err
                    })
                })
        })
})

module.exports = router