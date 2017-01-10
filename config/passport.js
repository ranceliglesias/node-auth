const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;

// Load the user model
const User = require('../app/models/user');
// Load the auth config
const configAuth = require('./auth');

module.exports = function (passport) {
  // Serialize the user for sessio
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  // Deserialize user
  passport.deserializeUser(function(id, done) {
    User.findById(id, function (err, user) {
      done(err, user);
    });
  });

  // Local login
  passport.use('local-login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  },
  function(req, email, password, done) {
    if (email) {
      email = email.toLowerCase();
    }
    // Async
    process.nextTick(function() {
      User.findOne({'local.email' : email }, (err, user) => {
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(null, false, req.flash('loginMessage', 'No user found!'));
        }
        console.log(password);
        if (!user.validPassword(password)) {
          return done(null,false, req.flash('loginMessage', 'Ooops! Wrong password.'));
        }
        return done(null, user);
      });
    });
}));

  passport.use('local-signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  },
  function(req, email, password, done) {
    if (email) {
      email = email.toLowerCase();
    }
    // Async
    process.nextTick(function() {
      if (!req.user) {
        User.findOne({ 'local.email': email }, (err, user) => {
          if (err) {
            return done(err);
          }
          if (user) {
            return done(null, false, req.flash('signupMessage', 'This email is already taken.'));
          } else {
            // create user
            const newUser = new User();
            newUser.local.email = email;
            newUser.local.password = newUser.generateHash(password);

            newUser.save((err) => {
              if (err) {
                return done(err);
              }
              return done(null, newUser);
            });
          }
        });
      } else if (!req.user.local.email) {
        User.findOne({'local-email': 'email'}, (err, user) =>{
          if (err) {
            return done(err);
          }
          if (user) {
            return done(null,false, req.flash('loginMessage', 'This email is already taken.'));
          } else {
            const user = req.user;
            user.local.email = email;
            user.local.password = user.generateHash(password);
            user.save((err) => {
              if (err) {
                return done(err);
              }
              return done(null, user);
            });
          }
        });
      } else {
        return done(null, req.user);
      }
    });
  }));

  // Facebook
  const fbStrategy = configAuth.facebookAuth;
  fbStrategy.passReqToCallback = true;
  passport.use(new FacebookStrategy(fbStrategy, function(req, token, refreshToken, profile) {
    // Async
    process.nextTick(function() {
      // is user Logged in ?
      if (!req.user) {
          User.findOne({'facebook.id' : profile.id}, (err, user) => {
            if (err)
              return done(err);
            if (user) {
              if (!user.facebook.token) {
                user.facebook.token = token;
                user.facebook.name = `${profile.name.givenName} ${profile.name.familyName}`;
                user.facebook.email = (profile.emails[0].value || '').toLowerCase();

                user.save((err) => {
                  if (err) {
                    return done(err);
                  }
                  return done(null, user);
                });
              }
              return done(null, user);
            } else {
              const newUser = new User();
              newUser.facebook.id = profile.id;
              newUser.facebook.token = token;
              newUser.facebook.name = `${profile.name.givenName} ${profile.name.familyName}`;
              newUser.facebook.email = (profile.emails[0].value || '').toLowerCase();

              newUser.save((err) => {
                if (err) {
                  return done(err);
                }
                return done(null, newUser);
              });
            }
          });
      } else {
        // Exists and is logged in
        const user = req.user;
        user.facebook.id = profile.id;
        user.facebook.token = token;
        user.facebook.name = `${profile.name.givenName} ${profile.name.familyName}`;
        user.facebook.email = (profile.emails[0].value || '').toLowerCase();

        user.save((err) => {
          if (err) {
            return done(err);
          }
          return done(null, user);
        });
      }
    });
  }));

}
