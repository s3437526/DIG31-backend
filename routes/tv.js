const express = require('express')
const router = express.Router()
const Utils = require('../utils')
const Tv = require('../models/Tv')
const Item = require('../models/Item')
const path = require('path')
const ActivityHistory = require('../models/ActivityHistory')

// Tv routes-----------------------------------------------------------------
// GET - get all tvs
// endpoint = /tv------------------------------------------------------------
/*
This code block handles the request to retrieve all tvs from the database and if 
this is unsuccessful, throws a generic error
*/
router.get('/', Utils.authenticateToken, (req, res) => {
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
router.get('/:id', Utils.authenticateToken, (req, res) => {

    Tv.findById(req.params.id).populate("placeName").populate("type").populate("activityHistory")
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
        // upload avater image then update item
        let uploadPath = path.join(__dirname, '..', 'public', 'images')
        Utils.uploadFile(req.files.avatar, uploadPath, (uniqueFilename) => {
            avatarFilename = uniqueFilename
                // update item with all fields including avatar
                // updateItem({
                //     firstName: req.body.firstName, /// edit here... or remove - I think it's not needed???
                //     lastName: req.body.lastName,
                //     email: req.body.email,
                //     avatar: avatarFilename,
                //     bio: req.body.bio,
                //     accessLevel: req.body.accessLevel
                // })
        })
    } else {
        // update item without avatar
        updateItem(req.body)
    }

    // update Tv
    function updateItem(update) {
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

    // check that the user is admin
    if (req.headers.access != 2) {
        return res.status(401).send({ message: "You have to be an administrator to create items" })
    }

    // validate request
    if (Object.keys(req.body).length === 0) {
        return res.status(400).send({ message: "Tv content can not be empty" })
    }

    // check that tv with same name or ip address doesn't already exist
    Item.findOne({ $or: [{ "ipAddress": req.body.ipAddress }, { "name": req.body.name }] })
        .then(item => {
            // if the item is null then there is no current item/conflict - resume creating
            if (item == null) {
                let newItem = new Tv(req.body)
                    // create a new activity history associated with the item and assign it to it
                const activityHistory = new ActivityHistory(null, null)
                newItem.activityHistory = activityHistory._id
                activityHistory.save()
                newItem.save()
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
                    // check that the ip address isn't reused
            } else if (item.ipAddress === req.body.ipAddress) {
                return res.status(400).json({
                        message: "The Ip " + req.body.ipAddress + " already exists. It must be unique."
                    })
                    // if the item name already exists don not continue creating
            } else if (item.name === req.body.name) {
                return res.status(400).json({
                    message: `The TV "${req.body.name}" already exists. Consider renaming it.`
                })
            }
        })
        .catch(err => {
            console.log(err)
            return res.status(500).send({
                message: "Problem creating tv",
                error: err
            })
        })
})

// DELETE - delete tv --------------------------------------
router.delete('/:id', Utils.authenticateToken, (req, res) => {
    // make sure the user is admin
    if (req.headers.access != 2) { // There has to be a safer way of determining admin...
        return res.status(401).json({
            message: "Not authorised to create, you are not and admin!"
        })
    }

    // attempt to delete the item
    try {
        Item.findByIdAndDelete({ _id: req.params.id })
            .then(item => {
                    ActivityHistory.findByIdAndDelete({ _id: item.activityHistory })
                        .then(activityHistory => {
                            console.log("Activity history successfully deleted.")
                        })
                    res.status(200).json({
                        message: "Item " + item.name + " successfully deleted.",
                    })
                }

            )
    } catch (err) {
        res.status(500).json({
            message: "Failed deleting item",
            err
        })
    }
})

module.exports = router