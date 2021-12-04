'use strict';

const User = require('../models/user');
const jwt = require('jsonwebtoken');
const CONFIG = require('../../config/db');

exports.register = async (req, res) => {
  const newUser = new User(req.body);
  try {
    const result = await newUser.save();
    res.json(result);
  } catch (err) {
    if (err.name === 'MongoError' && err.code === 11000) {
      return res.status(500).send('User already exist!');
    }
    return res.status(500).send(err.message);
  }
};

exports.login = (req, res) => {
  User.findOne({ email: req.body.email }, function(err, user) {
    if (err) {
      return res.status(500).send('Error on the server');
    }

    if (!user) {
      return res.status(404).send('No user found');
    }

    user.comparePassword(req.body.password, function(err, user, reason) {
      if (err) {
        return res.status(401).send('Unauthorized');
      }

      if (user) {
        var token = jwt.sign(
          { credentials: `${user._id}.${CONFIG.jwtKey}.${user.email}` },
          CONFIG.jwtSecret,
          { expiresIn: CONFIG.defultPasswordExpire },
        );
        const credentials = {
          id: user._id,
          name: user.name,
          username: user.username,
          email: user.email,
          role: user.role,
          status: user.status,
          token: token,
          firstTimeLogin: false,
          lastLoginTime: user.lastLoginTime
        };
        if (
          (user.createdBy && !user.lastLoginTime) ||
          user.status === 'ARCHIVE'
        ) {
          credentials['firstTimeLogin'] = true;
        }
        user.lastLoginTime = new Date();
        user.save();
        return res.status(200).send(credentials);
      }

      // otherwise we can determine why we failed
      var reasons = User.failedLogin;
      console.log('REASON', reason);
      switch (reason) {
        case reasons.NOT_FOUND:
          return res.status(404).send('No user found');
          break;
        case reasons.PASSWORD_INCORRECT:
          // note: these cases are usually treated the same - don't tell
          // the user *why* the login failed, only that it did
          return res.status(401).send('Unauthorized');
          break;
        case reasons.MAX_ATTEMPTS:
          // send email or otherwise notify user that account is
          // temporarily locked
          return res.status(429).send('Too Many Request');
          break;
      }
    });
  });
};

exports.logout = async (req, res) => {
  res.status(200).send({ auth: false });
};
