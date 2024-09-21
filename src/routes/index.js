const google = require('./account/google-auth')

function routes(app) {
  app.use('/auth/google', google);

}

module.exports = routes;