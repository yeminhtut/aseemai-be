'use strict';

const auth = require('../controllers/authController');
const verifyToken = require('../lib/verifyToken');
const { catchError } = require('../lib/errorHandler');

module.exports = app => {
  app.route('/auth/register').post(catchError(auth.register));

  app.route('/auth/login').post(auth.login);

  app.route('/auth/logout').get(verifyToken, catchError(auth.logout));
};
