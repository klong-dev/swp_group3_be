const session = require('express-session')
const bodyParser = require("body-parser")
const passport = require('passport')
const routes = require("./routes")
const express = require("express")
const path = require("path")
const cors = require('cors')

require('./app/controllers/GoogleController')
require('dotenv').config()

const db = require("./config/db/localDB")
const app = express()

app.use(cors())
app.use(session({
  secret: process.env.SESSION_SECRET_KEY,
  resave: false,
  saveUninitialized: true
}))
app.use(passport.initialize())
app.use(passport.session())

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(express.json())

app.use(express.static(path.join(__dirname, "public")))

db.connect()
routes(app)

app.listen(process.env.PORT, () => {
  console.log(`Server is running at http://localhost:${process.env.PORT}`);
})
