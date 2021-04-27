const express = require('express')
const router = express.Router()
const Utils = require('../utils')
const Light = require('../models/Light')
const Item = require('../models/Item')
const path = require('path')
const ActivityHistory = require('../models/ActivityHistory')

// Light routes-----------------------------------------------------------------
// GET - get all lights
// endpoint = /light------------------------------------------------------------
/*
This code block handles the request to retrieve all lights from the database and if 
this is unsuccessful, throws a generic error
*/
router.get('/', Utils.authenticateToken, (req, res) => {
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
router.get('/:id', (req, res) => {

    Light.findById(req.params.id).populate("placeName").populate("type").populate("activityHistory")
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
        // upload avater image then update light
        let uploadPath = path.join(__dirname, '..', 'public', 'images')
        Utils.uploadFile(req.files.avatar, uploadPath, (uniqueFilename) => {
            avatarFilename = uniqueFilename
                // update light with all fields including avatar
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
        // update light without avatar
        updateItem(req.body)
    }

    // update Light
    function updateItem(update) {
        Light.findByIdAndUpdate(req.params.id, update, { new: true })
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
router.post('/', Utils.authenticateToken, (req, res) => {

    // check that the user is admin
    if (req.headers.access != 2) {
        return res.status(401).send({ message: "You have to be an administrator to create items" })
    }

    // validate request
    if (Object.keys(req.body).length === 0) {
        return res.status(400).send({ message: "Light content can not be empty" })
    }

    // check account with email doesn't already exist
    Item.findOne({ $or: [{ "ipAddress": req.body.ipAddress }, { "name": req.body.name }] })
        .then(item => {
            if (item == null) {
                let newItem = new Light(req.body)
                    // create a new activity history associated with the item and assign it to it
                const activityHistory = new ActivityHistory(null, null)
                newItem.activityHistory = activityHistory._id
                activityHistory.save()
                newItem.save()
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
                    // check that the ip address isn't reused
            } else if (item.ipAddress === req.body.ipAddress) {
                return res.status(400).json({
                        message: "The Ip " + req.body.ipAddress + " already exists. It must be unique."
                    })
                    // if the item name already exists don not continue creating
            } else if (item.name === req.body.name) {
                return res.status(400).json({
                    message: `The light "${req.body.name}" already exists. Consider renaming it.`
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

// DELETE - delete light --------------------------------------
router.delete('/:id', Utils.authenticateToken, (req, res) => {
    // make sure the user is admin
    if (req.headers.access != 2) { // There has to be a safer way of determining admin...
        return res.status(401).json({
            message: "Not authorised to delete, you are not and admin!"
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