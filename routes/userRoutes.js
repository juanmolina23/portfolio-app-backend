const express = require("express");
const User = require("../models/user");
const passport = require("passport");
const bcrypt = require("bcrypt");

const router = express.Router();

router.get("/", (req, res) => {
  res.send(req.user);
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) throw err;
    if (!user) res.send("Incorrect username/password");
    else {
      req.login(user, (err) => {
        if (err) throw err;
        res.status(200);
        res.statusMessage = "Successfully Authenticated";
        res.send({
          displayName: user.displayName,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          role: user.role,
        });
      });
    }
  })(req, res, next);
});

router.post("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) throw err;
    req.session.destroy();
    res.send("Successfully logged out!");
  });
});

router.post("/register", (req, res) => {
  User.findOne({ username: req.body.username })
    .then(async (doc) => {
      if (doc) res.send("User already exists");
      if (!doc) {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const newUser = new User({
          username: req.body.username,
          password: hashedPassword,
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          displayName: req.body.displayName,
          role: req.body.role,
        });
        await newUser.save();
        res.send("User Created");
      }
    })
    .catch((err) => {
      throw err;
    });
});

module.exports = router;
