// dependencies------------------------------
require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const port = process.env.PORT || 3000
const fileUpload = require('express-fileupload')


// database connection ----------------------
mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false
    })
    .then(() => console.log("db connected!"))
    .catch(err => console.error("db connection failed ", err))


// express app setup -----------------------
const app = express()
app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
// app.use('*', cors())
app.use(cors({
    origin: 'https://elated-nightingale-5e8652.netlify.app'
}))
// app.options('*', cors());
// app.options(cors({
//     origin: 'https://elated-nightingale-5e8652.netlify.app'
// }));
app.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 }
}))

// routes ---------------------------------

// auth
const authRouter = require('./routes/auth')
app.use('/auth', authRouter)

// user
const userRouter = require('./routes/user')
app.use('/user', userRouter)

// // activity history
// const activityHistoryRouter = require('./routes/activityHistory')
// app.use('/activityHistory', activityHistoryRouter)

// place
const placeRouter = require('./routes/place')
app.use('/place', placeRouter)

// location
const locationRouter = require('./routes/location')
app.use('/location', locationRouter)

// device
const deviceRouter = require('./routes/device')
app.use('/device', deviceRouter)

// tv
const tvRouter = require('./routes/tv')
app.use('/tv', tvRouter)

// item
const itemRouter = require('./routes/item')
app.use('/item', itemRouter)

// light
const lightRouter = require('./routes/light')
app.use('/light', lightRouter)

// sprinkler
const sprinklerRouter = require('./routes/sprinkler')
app.use('/sprinkler', sprinklerRouter)

// run app listen on port --------------------
app.listen(port, () => {
    console.log("App running on port ", port)
})