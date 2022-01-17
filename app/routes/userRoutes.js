'use strict';

const user = require('../controllers/userController');
const company = require('../controllers/companyController');
const { catchError } = require('../lib/errorHandler');
const verifyToken = require('../lib/verifyToken');

module.exports = app => {
  app
    .route('/developers')
    .get(catchError(user.listAllUsers))
    .post(catchError(user.createNewUser));

  app
    .route('/companies')
    .get(catchError(company.listAllCompanies))
    .post(catchError(company.createNewCompany));

  app
    .route('/developers/:userId')
    .get(verifyToken, catchError(user.getUserDetail))
    .put(verifyToken, catchError(user.updateUser))
    .delete(verifyToken, catchError(user.deleteUser));
};
