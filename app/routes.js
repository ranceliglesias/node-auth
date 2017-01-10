
const Event = require('../app/models/event');

module.exports = function(app, passport) {
  // Show the home page
  app.get('/', (req, res) => {
    res.render('pages/index.ejs');
  });

  // Show the profile page
  app.get('/profile', isLoggedIn, (req, res) => {
    res.render('pages/profile.ejs', {
      user: req.user
    });
  });

  // Logout of profile
  app.get('/logout', (req, res) => {
    res.redirect('/');
    });

  // Show pages createEvent
  app.get('/createevent', (req, res) => {
    res.render('pages/createevent.ejs', {message: req.flash('loginMessage')});
  });

  // Create Event
  app.post('/createevent', function(req, res, next) {
      Event(new Event({
        title: req.body.title,
        location: req.body.location,
        description: req.body.description
      }).save(function (err) {
          if (err) {
              return next(err);
          }
          res.redirect('/createevent');
      }))
  });

  // Read All Events
  app.get('/readevents', (req, res) => {
      Event.find((err, event) => {
          if (err) {
              throw err;
          }
          res.json(event || {});
      })
  });


  // Show the form
  app.get('/login', (req, res) => {
    res.render('pages/login.ejs', {message: req.flash('loginMessage')});
  });
  app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/profile',
    failureRedirect: '/login',
    failureFlash: true
  }));

// Show the form
  app.get('/signup', (req, res) => {
    res.render('pages/signup.ejs', {message: req.flash('signupMessage')});
  });

// signem up
  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/profile',
    failureRedirect: '/signup',
    failureFlash: true
  }));

};

// Check is Loogedin
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()){
    return next();
  }
  res.redirect('/');
}
