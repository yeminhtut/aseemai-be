'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');
const validator = require('validator');
const CONFIG = require('../../config/db');

let UserSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      isAsync: true,
      validator: validator.isEmail,
      message: 'Invalid Email Address.',
    },
    required: [true, 'User email required'],
  },
  password: {
    type: String,
    required: false,
  },
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Departments',
    required: false,
  },
  role: {
    type: String,
    enum: ['ADMIN', 'OFFICER', 'STAFF'],
    default: 'STAFF',
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'ARCHIVE'],
    default: 'INACTIVE',
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  passwordExpireTime: {
    type: Number,
    default: null,
  },
  loginAttempts: {
    type: Number,
    default: 0,
  },
  lockUntil: {
    type: Number,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    default: null,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
  },
  lastLoginTime: {
    type: Date,
    default: null,
  },
  lastPasswordUpdatedAt: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const reasons = (UserSchema.statics.failedLogin = {
  NOT_FOUND: 0,
  PASSWORD_INCORRECT: 1,
  MAX_ATTEMPTS: 2,
});

UserSchema.pre('save', function(next) {
  let user = this;
  if (!user.isModified('password')) {
    return next();
  }
  user.status = 'ACTIVE';
  bcrypt.genSalt(CONFIG.db.saltWorkFactor, function(err, salt) {
    if (err) return next(err);

    // hash the password along with our new salt
    bcrypt.hash(user.password, salt, function(err, hash) {
      if (err) return next(err);

      // override the cleartext password with the hashed one
      user.password = hash;
      user.lastPasswordUpdatedAt = new Date();
      next();
    });
  });
});

UserSchema.methods.generateHashedPassword = function(password) {
  return new Promise((resolve, reject) => {
    return bcrypt.genSalt(CONFIG.db.saltWorkFactor, function(err, salt) {
      if (err) reject(false);

      return bcrypt.hash(password, salt, function(err, hashedPassword) {
        if (err) reject(false);
        resolve(hashedPassword);
      });
    });
  });
};

UserSchema.methods.generateHash = function(data) {
  return bcrypt.hashSync(data, bcrypt.genSaltSync(8), null);
};

UserSchema.methods.incLoginAttempts = function(cb) {
  console.log('LOCK', this.lockUntil, this.lockUntil, Date.now());
  // if we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.update(
      {
        $set: { loginAttempts: 1 },
        $unset: { lockUntil: 1 },
      },
      cb,
    );
  }
  // otherwise we're incrementing
  var updates = { $inc: { loginAttempts: 1 } };

  console.log('updates', updates);

  // lock the account if we've reached max attempts and it's not locked already
  if (this.loginAttempts + 1 >= CONFIG.maxLoginAttempts && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + CONFIG.lockTime };
  }
  return this.update(updates, cb);
};

UserSchema.methods.comparePassword = function(candidatePassword, cb) {
  let user = this;
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) return cb(err);

    if (isMatch) {
      if (!user.loginAttempts && !user.lockUntil) return cb(null, user);
      // reset attempts and lock info
      var updates = {
        $set: { loginAttempts: 0 },
        $unset: { lockUntil: 1 },
      };

      return user.update(updates, function(err) {
        if (err) return cb(err);
        return cb(null, user);
      });
    }

    user.incLoginAttempts(function(err) {
      if (err) return cb(err);
      return cb(null, null, reasons.PASSWORD_INCORRECT);
    });
  });
};

module.exports = mongoose.model('Users', UserSchema);