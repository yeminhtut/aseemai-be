'use strict';

const user = require('../controllers/userController');
const { catchError } = require('../lib/errorHandler');
const verifyToken = require('../lib/verifyToken');

module.exports = app => {
  app
    .route('/users')
    .get(catchError(user.listAllUsers))
    .post(catchError(user.createNewUser));

  app.route('/users/forgot').post(catchError(user.forgot));

  app
    .route('/users/reset')
    .get(catchError(user.resetRequest))
    .post(catchError(user.resetConfirm));

  app
    .route('/users/:userId')
    .get(verifyToken, catchError(user.getUserDetail))
    .put(verifyToken, catchError(user.updateUser))
    .delete(verifyToken, catchError(user.deleteUser));

  app.route('/me').get(
    verifyToken,
    (req, res, next) => {
      req.params.userId = req.credentials.userId;
      next();
    },
    catchError(user.getUserDetail),
  );
};
