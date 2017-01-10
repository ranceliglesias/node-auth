const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const configDB = require('./config/database.js');

// config
mongoose.connect(configDB.url);
require('./config/passport')(passport);
// set up ejs for templating
app.set('view engine', 'ejs');

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));
app.use(cookieParser()); //read cookies
// session
app.use(session({
      secret: 'welovefviwelovefvi',
      resave: false,
      saveUninitialized: false
}));

// passport
app.use(passport.initialize());
app.use(flash()); // give a messages
app.use(passport.session()); // persistence
// routes
require('./app/routes')(app, passport);

// Server listening...
app.listen(PORT, () => {
console.log(`The app is alive at port: ${PORT}`);
});

module.exports = app;
