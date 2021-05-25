const express = require('express')
const router = express.Router()
const Utils = require('../utils')
const Sprinkler = require('../models/Sprinkler')
const Item = require('../models/Item')
const path = require('path')
const ActivityHistory = require('../models/ActivityHistory')

// Sprinkler routes-----------------------------------------------------------------
// GET - get all sprinklers
// endpoint = /sprinkler------------------------------------------------------------
/*
This code block handles the request to retrieve all sprinklers from the database and if 
this is unsuccessful, throws a generic error
*/
router.get('/', Utils.authenticateToken, (req, res) => {
    // Get all sprinklers from the sprinkler model using the find() method
    Item.find({ type: "60853a6d26779032244c9237" }).populate("placeName").populate("type").populate("activityHistory").populate("iconURL")
        .then((sprinklers) => {
            res.json(sprinklers)
        })
        .catch((err) => {
            console.log("There was a problem with retrieving sprinklers ", err)
        })
})

// GET - get single sprinkler -------------------------------------------------------
router.get('/:id', Utils.authenticateToken, (req, res) => {

    Sprinkler.findById(req.params.id).populate("placeName").populate("type").populate("activityHistory").populate("iconURL")
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

    // make sure the user is admin
    if (req.headers.access != 2) { // There has to be a safer way of determining admin...
        return res.status(401).json({
            message: "Not authorised to change, you are not an admin!"
        })
    }

    // validate request
    if (!req.body) return res.status(400).send("Task content can't be empty")

    // update sprinkler
    Sprinkler.findByIdAndUpdate(req.params.id, req.body, { new: true })
        .then(sprinkler => res.json(sprinkler))
        .catch(err => {
            res.status(500).json({
                message: 'Problem updating sprinkler',
                error: err
            })
        })
})

// POST - create new sprinkler --------------------------------------
router.post('/', Utils.authenticateToken, (req, res) => {

        // check that the user is admin
        if (req.headers.access != 2) {
            return res.status(401).send({ message: "You have to be an administrator to create items" })
        }

        // validate request
        if (Object.keys(req.body).length === 0) {
            return res.status(400).send({ message: "Sprinkler content can not be empty" })
        }

        // check that sprinkler with same name or ip address doesn't already exist
        Item.findOne({ $or: [{ "ipAddress": req.body.ipAddress }, { "name": req.body.name }] })
            .then(item => {
                // if the item is null then there is no current item/conflict - resume creating
                if (item == null) {
                    let newItem = new Sprinkler(req.body)
                        // create a new activity history associated with the item and assign it to it
                    const activityHistory = new ActivityHistory(null, null)
                    newItem.activityHistory = activityHistory._id
                    activityHistory.save()
                    newItem.save()
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
                } else if (item.ipAddress === req.body.ipAddress) {
                    return res.status(400).json({
                            message: "The Ip " + req.body.ipAddress + " already exists. It must be unique."
                        })
                        // if the item name already exists don not continue creating
                } else if (item.name === req.body.name) {
                    return res.status(400).json({
                        message: `The sprinkler "${req.body.name}" already exists. Consider renaming it.`
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
    // DELETE - delete sprinkler --------------------------------------
router.delete('/:id', Utils.authenticateToken, (req, res) => {

    // make sure the user is admin
    if (req.headers.access != 2) { // There has to be a safer way of determining admin...
        return res.status(401).json({
            message: "Not authorised to delete, you are not an admin!"
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