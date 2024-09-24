const express = require("express");
const path = require("path");
const routes = require("./routes");
const bodyParser = require("body-parser");
const cors = require('cors');

require('dotenv').config();

const db = require("./config/db/localDB");
const app = express();

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));


db.connect();
routes(app);


// app.listen(process.env.PORT, () => {
//   console.log(`Server is running at http://localhost:${process.env.PORT}`);
// });

app.listen(5000, () => {
  console.log(`Server is running at http://localhost:5000`);
});
