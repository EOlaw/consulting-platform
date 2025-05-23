/**
 * Passport Configuration
 */
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../users/models/user-model');
const config = require('../config/config');

module.exports = (passport) => {
  const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.JWT_SECRET
  };

  passport.use(
    new JwtStrategy(opts, async (jwt_payload, done) => {
      try {
        // Find the user by ID
        const user = await User.findById(jwt_payload.id).select('+active');

        if (user && user.active) {
          // If user is found and active, return the user
          return done(null, user);
        }

        // If user is not found or inactive, return false
        return done(null, false);
      } catch (err) {
        return done(err, false);
      }
    })
  );
};
