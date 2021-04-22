const express = require('express')
const router = express.Router()
const Utils = require('./../utils')
const ActivityHistory = require('./../models/ActivityHistory')
const path = require('path')

// Activity history routes-----------------------------------------------------------------
// GET - get all activity histories
// endpoint = /activityHistory ------------------------------------------------------------
/*
This code block handles the request to retrieve all histories from the database and if 
this is unsuccessful, throws a generic error
*/
router.get('/', (req, res) => { /** secure this down by adding auth token when done - only open for testing purposes */
    // Get all histories from the activity history model using the find() method
    ActivityHistory.find()
        .then((activityHistories) => {
            res.json(activityHistories)
        })
        .catch((err) => {
            console.log("There was a problem with retrieving activity histories ", err)
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


// PUT - update user ---------------------------------------------
router.put('/:id', Utils.authenticateToken, (req, res) => {
    // validate request
    if (!req.body) return res.status(400).send("Task content can't be empty")

    let avatarFilename = null

    // if avatar image exists, upload!
    if (req.files && req.files.avatar) {
        // upload avater image then update user
        let uploadPath = path.join(__dirname, '..', 'public', 'images')
        Utils.uploadFile(req.files.avatar, uploadPath, (uniqueFilename) => {
            avatarFilename = uniqueFilename
                // update user with all fields including avatar
            updateUser({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                avatar: avatarFilename,
                bio: req.body.bio,
                accessLevel: req.body.accessLevel
            })
        })
    } else {
        // update user without avatar
        updateUser(req.body)
    }

    // update User
    function updateUser(update) {
        User.findByIdAndUpdate(req.params.id, update, { new: true })
            .then(user => res.json(user))
            .catch(err => {
                res.status(500).json({
                    message: 'Problem updating user',
                    error: err
                })
            })
    }
})

// POST - create new user --------------------------------------
router.post('/', (req, res) => {
    // validate request
    if (Object.keys(req.body).length === 0) {
        return res.status(400).send({ message: "User content can not be empty" })
    }

    // check account with email doen't already exist
    User.findOne({ email: req.body.email })
        .then(user => {
            if (user != null) {
                return res.status(400).json({
                    message: "email already in use, use different email address"
                })
            }
            // create new user       
            let newUser = new User(req.body)
            newUser.save()
                .then(user => {
                    // success!  
                    // return 201 status with user object
                    return res.status(201).json(user)
                })
                .catch(err => {
                    console.log(err)
                    return res.status(500).send({
                        message: "Problem creating account",
                        error: err
                    })
                })
        })
})

module.exports = router