const mentor = require('./mentor')
const student = require('./student')
const google = require('./account/google-auth')

function routes(app) {
  app.use('/auth/google', google);
  app.use('/auth/google/callback', google); 
  app.use('/mentor', mentor);
  app.use('/student', student);
}

module.exports = routes;