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
      if (profile._json.hd !== 'fpt.edu.vn') {
        return done(null, false, { message: 'Unauthorized domain' });
      }
      // Check if user already exists in our db
      const existingStudent = await Student.findOne({ where: { studentID: profile.id } });
      if (existingStudent) {
        return done(null, existingStudent);
      }
      // if (profile._json.hd === 'fpt.edu.vn') {
        const newStudent = await Student.create({
          studentID: profile.id,
          email: profile.emails[0].value,
          name: profile.displayName,
        });
        done(null, newStudent);
      // }
    } catch (err) {
      done(err, null);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.studentID);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await Student.findByPk(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});