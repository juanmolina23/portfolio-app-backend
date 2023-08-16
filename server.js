require("dotenv").config();
const MongoStore = require("connect-mongo");
const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const bodyParser = require("body-parser");
const passportConfig = require("./passportConfig");
const userRoutes = require("./routes/userRoutes");

//Environmental Variables
const DATABASE_URL = process.env.DATABASE_URL;
const PORT = process.env.PORT;
const SECRET = process.env.SECRET;

//Express App Initialized
const app = express();

//Database Connection
mongoose.connect(DATABASE_URL);
const database = mongoose.connection;

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
    cookie: { maxAge: 60 * 1000, httpOnly: true, signed: true },
    saveUninitialized: false,
    resave: false,
    store: MongoStore.create({
      mongoUrl: DATABASE_URL,
      ttl: 60 * 1000,
    }),
  })
);

app.use(cookieParser(SECRET));
app.use(passport.initialize());
app.use(passport.session());
passportConfig(passport);

app.use("/api", userRoutes);

app.listen(PORT, () => {
  console.log(`Server Started at ${PORT}`);
});

database.on("error", (error) => {
  console.log(error);
});

database.once("connected", () => {
  console.log("Database Connected");
});
