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
  username: String,
  description: String,
  duration: Number,
  date: Date,
  count: Number,
  log: [{ description: String, duration: Number, date: Date }],
});
let User = mongoose.model("User", userSchema);

app.post("/api/users", (req, res) => {
  let username = req.body.username;
  let id = "";
  User.findOne({ username: username })
    .then((result) => {
      // if this user name doesnt exist in the db
      if (result == undefined) {
        var newUser = new User({
          username: username,
        });
        newUser.save().catch((err) => {
          if (err) return console.error(err);
        });
        res.json({ username: username, _id: newUser._id.toString() });
      } else {
        // if this user name already exist in the db
        res.json({ username: username, _id: result._id.toString() });
      }
    })
    .catch((err) => {
      if (err) return console.error(err);
    });
});

// get the list of all users
app.get("/api/users", (req, res) => {
  User.find({})
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      if (err) return console.error(err);
    });
});

//handle Post to /api/users/L_id/exercises
app.post("/api/users/:_id/exercises", (req, res) => {
  let id = req.params._id;
  let description = req.body.description;
  let duration = req.body.duration;
  let date = req.body.date;
  console.log(id, description, duration, date);

  //if date is empty
  if (date == "") {
    date = new Date();
  }
  //   User.findOneAndUpdate(
  //     { _id: id },
  //     { description: description, duration: duration, date: date }
  //   )
  //     .then((data) => {
  //       res.json({
  //         _id: data._id,
  //         username: data.username,
  //         date: data.date.toDateString(),
  //         duration: data.duration,
  //         description: data.description,
  //       });
  //     })
  //     .catch((err) => {
  //       if (err) return console.error(err);
  //     });
  // });
  User.findOne(
    { _id: id },
  )
    .then((data) => {
      res.json({
        _id: id,
        username: data.username,
        date: date.toDateString(),
        duration: duration,
        description: description,
      });
    })
    .catch((err) => {
      if (err) return console.error(err);
    });
});
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});

// Ref Sol on Ganesh H youtube channel