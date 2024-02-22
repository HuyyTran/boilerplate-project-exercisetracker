const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
// connect to db
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URI);

app.use(cors());
app.use(express.static("public"));

//middleware
app.use((req, res, next) => {
  console.log(req.method + " " + req.path + " - " + req.ip);
  next();
}, bodyParser.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});


// create a 'User' Model
const Schema = mongoose.Schema;
const userSchema = new Schema({
  userName: String,
  description: String,
  duration: Number,
  date: Date,
});


app.post('/api/users', (req, res) => {

});
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
