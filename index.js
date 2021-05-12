const featuresRoutes = require("./routes/features.router.js");
const loginRoutes = require("./routes/login.router.js");
const cors = require('cors')
const mongoose = require("mongoose")
require('dotenv').config()
const express = require("express")
const app = express()
const bodyParser = require('body-parser')
const path = require('path')
const passport = require('passport');
const expressSession = require('express-session')({
  secret: 'secret',
  resave: false,
  saveUninitialized: false
});
const rootDir = require('./util/path')

app.use(passport.initialize());
app.use(passport.session());

app.use(cors())

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(rootDir, 'public')))

app.set('view engine', 'pug')
app.set('views', 'views')

app.use(bodyParser.json());
app.use(expressSession);

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
})

 
//connect to mongodb
mongoose
  .connect(process.env.database, { useNewUrlParser: true })
  .then(() => console.log("Connected to MongoDB..."))
  .catch(err => console.error("Could not connect to MongoDB..."));


app.use(express.json());
//use users route for api/users
app.use("/", featuresRoutes);
app.use("/", loginRoutes);


app.listen(80);
