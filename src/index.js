const session = require('express-session')
const bodyParser = require("body-parser")
const express = require('express')
const routes = require("./routes")
const path = require("path")
const cors = require('cors')


require('dotenv').config()

const app = express()

//const db = require("./config/db")
//db.connect()

app.use(cors())
app.use(session({
  secret: process.env.SESSION_SECRET_KEY || "session_secret_key",
  resave: false,
  saveUninitialized: true
}))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(express.json())

app.use(express.static(path.join(__dirname, "public")))


routes(app)

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running at http://localhost:${process.env.PORT || 3000}`);
})