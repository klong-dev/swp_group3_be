const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const Student = require('../../app/models/Student');
require('dotenv').config();

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback"
},
  async (accessToken, refreshToken, profile, done) => {
    try {
      // if (profile._json.hd !== 'fpt.edu.vn') {
      //   return done(null, false, { message: 'Unauthorized domain' });
      // }
      const existingStudent = await Student.findOne({ where: { accountId: profile.id } });
      if (existingStudent) {
        return done(null, existingStudent);
      }
      const newStudent = await Student.create({
        accountId: profile.id,
        email: profile.emails[0].value,
        fullName: profile.displayName,
        point: 50,
        imgPath: profile.photos[0].value,
        isMentor: 0,
        status: 1,
      });
      done(null, newStudent);
    } catch (err) {
      done(err, null);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.accountId);
});

passport.deserializeUser(async (accountId, done) => {
  try {
    const user = await Student.findOne({ where: { accountId } });
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
