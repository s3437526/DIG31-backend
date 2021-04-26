const express = require('express')
const router = express.Router()
const Utils = require('../utils')
const Tv = require('../models/Tv')
const Item = require('../models/Light')
const path = require('path')

// Tv routes-----------------------------------------------------------------
// GET - get all tvs
// endpoint = /tv------------------------------------------------------------
/*
This code block handles the request to retrieve all tvs from the database and if 
this is unsuccessful, throws a generic error
*/
router.get('/', (req, res) => {
    // Get all tvs from the tv model using the find() method
    Item.find({ type: "60853adf26779032244c9238" }).populate("placeName").populate("type").populate("activityHistory")
        .then((tvs) => {
            res.json(tvs)
        })
        .catch((err) => {
            console.log("There was a problem with retrieving TVs ", err)
        })
})

// GET - get single tv -------------------------------------------------------
router.get('/:id', (req, res) => { ////////////////////////////////////////////////Utils.authenticateToken,
    if (req.tv._id != req.params.id) { ///// not working....?
        return res.status(401).json({
            message: "Not authorised"
        })
    }

    Tv.findById(req.params.id)
        .then(tv => {
            res.json(tv)
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                message: "Couldn't get tv",
                error: err
            })
        })
})


// PUT - update tv ---------------------------------------------
router.put('/:id', Utils.authenticateToken, (req, res) => {
    // validate request
    if (!req.body) return res.status(400).send("Task content can't be empty")

    let avatarFilename = null

    // if avatar image exists, upload!
    if (req.files && req.files.avatar) {
        // upload avater image then update tv
        let uploadPath = path.join(__dirname, '..', 'public', 'images')
        Utils.uploadFile(req.files.avatar, uploadPath, (uniqueFilename) => {
            avatarFilename = uniqueFilename
                // update tv with all fields including avatar
            updateTv({
                firstName: req.body.firstName, /// edit here... or remove - I think it's not needed???
                lastName: req.body.lastName,
                email: req.body.email,
                avatar: avatarFilename,
                bio: req.body.bio,
                accessLevel: req.body.accessLevel
            })
        })
    } else {
        // update tv without avatar
        updateTv(req.body)
    }

    // update Tv
    function updateTv(update) {
        Tv.findByIdAndUpdate(req.params.id, update, { new: true })
            .then(tv => res.json(tv))
            .catch(err => {
                res.status(500).json({
                    message: 'Problem updating tv',
                    error: err
                })
            })
    }
})

// POST - create new tv --------------------------------------
router.post('/', Utils.authenticateToken, (req, res) => {
    // validate request
    if (Object.keys(req.body).length === 0) {
        return res.status(400).send({ message: "Tv content can not be empty" })
    }

    // check that tv with same name doen't already exist
    Tv.findOne({ name: req.body.name })
        .then(tv => {
            if (tv != null) {
                return res.status(400).json({
                    message: `The TV "${req.body.name}" already exists. Consider renaming it.`
                })
            }
        })
    Item.findOne({ ipAddress: req.body.ipAddress })
        .then(item => {

            console.log(item.ipAddress)
            if (item.ipAddress === req.body.ipAddress) {
                return res.status(400).json({
                    message: "The Ip " + req.body.ipAddress + " already exists. It must be unique."
                })
            } else {
                tv => {
                    let newTv = new Tv(req.body)
                    newTv.save()
                        .then(tv => {
                            // success!  
                            // return 201 status with tv object
                            return res.status(201).json(tv)
                        })
                        .catch(err => {
                            console.log(err)
                            return res.status(500).send({
                                message: "Problem creating tv",
                                error: err
                            })
                        })
                }
            }
        })


    // create new tv       

})

module.exports = router