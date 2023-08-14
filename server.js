require("dotenv").config();
const MongoStore = require("connect-mongo");
const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const passport = require("passport");
const passportLocal = require("passport-local").Strategy;
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const session = require("express-session");
const bodyParser = require("body-parser");
const User = require("./models/user");
const passportConfig = require("./passportConfig");

const DATABASE_URL = process.env.DATABASE_URL;
const PORT = process.env.PORT;
const SECRET = process.env.SECRET;
const app = express();
mongoose.connect(DATABASE_URL);
const database = mongoose.connection;

//Classes
const ApiResponse = require("./classes/ApiResponse");

//Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(
  session({
    secret: SECRET,
    cookie: { maxAge: 60 * 60 * 1000, httpOnly: true, signed: true },
    saveUninitialized: false,
    resave: false,
    store: MongoStore.create({
      mongoUrl: DATABASE_URL,
      ttl: 60 * 60 * 1000,
    }),
  })
);

app.use(cookieParser(SECRET));
app.use(passport.initialize());
app.use(passport.session());
passportConfig(passport);

app.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) throw err;
    if (!user) res.send(new ApiResponse(1, "Incorrect username/password", {}));
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

app.post("/register", (req, res) => {
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

app.get("/user", (req, res) => {
  res.send(req.body);
  console.log(req.body);
});

app.listen(PORT, () => {
  console.log(`Server Started at ${PORT}`);
});

database.on("error", (error) => {
  console.log(error);
});

database.once("connected", () => {
  console.log("Database Connected");
});
