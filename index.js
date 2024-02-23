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

const Schema = mongoose.Schema;
// create a 'Exercise' Model
const exerciseSchema = new Schema({
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: String,
});
let Exercise = mongoose.model("Exercise", exerciseSchema);

// create a 'User' Model
const userSchema = new Schema({
  username: { type: String, required: true },
  count:Number,
  log: [exerciseSchema]  
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
app.post(
  "/api/users/:_id/exercises",
  bodyParser.urlencoded({ extended: false }),
  (req, res) => {
    let id = req.params._id;
    let description = req.body.description;
    let duration = parseInt(req.body.duration);
    let date = req.body.date;
    console.log(id, description, duration, date);

    if (date == "") {
      date = new Date().toISOString().substring(0, 10);
    }

    console.log("after modify: ", id, description, duration, date);
    let newExercise = new Exercise({
      description: req.body.description,
      duration: parseInt(req.body.duration),
      date: new Date(date).toDateString()
    });

    User.findByIdAndUpdate(
      id,
      {
        $push: { log: newExercise },
      },
      { new: true }
    )
      .then((updatedUser) => {
        let resObject = {};
        resObject["_id"] = updatedUser.id;
        resObject["username"] = updatedUser.username;
        resObject["date"] = new Date(date).toDateString();
        resObject["duration"] = newExercise.duration;
        resObject["description"] = newExercise.description;
        res.json(resObject);
      })
      .catch((err) => {
        if (err) return console.error(err);
      });
  }
);

// handler of log
app.get("/api/users/:_id/logs", (req, res) => {
  let id = req.params._id;
  User.findById(id)
    .then((result) => {
      result["count"]=result.log.length;
      res.json(result);
    })
    .catch((err) => {
      if (err) return console.error(err);
    });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});

// Ref Sol on Ganesh H youtube channel
