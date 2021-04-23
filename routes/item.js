const express = require('express')
const router = express.Router()
const Utils = require('./../utils')
const Item = require('./../models/Item')
const path = require('path')

// Item routes-----------------------------------------------------------------
// GET - get all items
// endpoint = /item------------------------------------------------------------
/*
This code block handles the request to retrieve all items from the database and if 
this is unsuccessful, throws a generic error
*/
router.get('/', (req, res) => {
    // Get all items from the item model using the find() method
    Item.find()
        .then((items) => {
            res.json(items)
        })
        .catch((err) => {
            console.log("There was a problem with retrieving items ", err)
        })
})

// GET - get single item -------------------------------------------------------
router.get('/:id', (req, res) => { ////////////////////////////////////////////////Utils.authenticateToken,
    if (req.item._id != req.params.id) { ///// not working....?
        return res.status(401).json({
            message: "Not authorised"
        })
    }

    Item.findById(req.params.id)
        .then(item => {
            res.json(item)
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                message: "Couldn't get item",
                error: err
            })
        })
})


// PUT - update item ---------------------------------------------
router.put('/:id', Utils.authenticateToken, (req, res) => {
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
            updateItem({
                firstName: req.body.firstName,                              /// edit here... or remove - I think it's not needed???
                lastName: req.body.lastName,
                email: req.body.email,
                avatar: avatarFilename,
                bio: req.body.bio,
                accessLevel: req.body.accessLevel
            })
        })
    } else {
        // update item without avatar
        updateItem(req.body)
    }

    // update Item
    function updateItem(update) {
        Item.findByIdAndUpdate(req.params.id, update, { new: true })
            .then(item => res.json(item))
            .catch(err => {
                res.status(500).json({
                    message: 'Problem updating item',
                    error: err
                })
            })
    }
})

// POST - create new item --------------------------------------
router.post('/', (req, res) => {
    // validate request
    if (Object.keys(req.body).length === 0) {
        return res.status(400).send({ message: "Item content can not be empty" })
    }

    // check account with email doen't already exist                /// look for something else here
    Item.findOne({ email: req.body.email })
        .then(item => {
            if (item != null) {
                return res.status(400).json({
                    message: "email already in use, use different email address"
                })
            }
            // create new item       
            let newItem = new Item(req.body)
            newItem.save()
                .then(item => {
                    // success!  
                    // return 201 status with item object
                    return res.status(201).json(item)
                })
                .catch(err => {
                    console.log(err)
                    return res.status(500).send({
                        message: "Problem creating item",
                        error: err
                    })
                })
        })
})

module.exports = router