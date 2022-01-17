"use strict";

const mongoose = require("mongoose");
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");
const validator = require("validator");
const CONFIG = require("../../config/db");

let CompanySchema = new Schema({
    name: {
        type: String,
    },
    email: {
        type: String,
        lowercase: true,
        trim: true,
        validate: {
            isAsync: true,
            validator: validator.isEmail,
            message: "Invalid Email Address.",
        },
        required: [true, "User email required"],
    },
    password: {
        type: String,
        required: false,
      },
    companyName: {
        type: String,
    },
    role: {
        type: String,
    },
    phNumber: {
        type: String,
    },
    requiredRole: {
        type: String,
    },
    duration: {
        type: String,
    },
    requiredSkills: {
        type: Array,
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

const reasons = (CompanySchema.statics.failedLogin = {
    NOT_FOUND: 0,
    PASSWORD_INCORRECT: 1,
    MAX_ATTEMPTS: 2,
});

CompanySchema.pre("save", function (next) {
    let user = this;
    if (!user.isModified("password")) {
        return next();
    }
    user.status = "ACTIVE";
    bcrypt.genSalt(CONFIG.db.saltWorkFactor, function (err, salt) {
        if (err) return next(err);

        // hash the password along with our new salt
        bcrypt.hash(user.password, salt, function (err, hash) {
            if (err) return next(err);

            // override the cleartext password with the hashed one
            user.password = hash;
            user.lastPasswordUpdatedAt = new Date();
            next();
        });
    });
});

CompanySchema.methods.generateHashedPassword = function (password) {
    return new Promise((resolve, reject) => {
        return bcrypt.genSalt(CONFIG.db.saltWorkFactor, function (err, salt) {
            if (err) reject(false);

            return bcrypt.hash(password, salt, function (err, hashedPassword) {
                if (err) reject(false);
                resolve(hashedPassword);
            });
        });
    });
};

CompanySchema.methods.generateHash = function (data) {
    return bcrypt.hashSync(data, bcrypt.genSaltSync(8), null);
};

CompanySchema.methods.incLoginAttempts = function (cb) {
    // if we have a previous lock that has expired, restart at 1
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return this.update(
            {
                $set: { loginAttempts: 1 },
                $unset: { lockUntil: 1 },
            },
            cb
        );
    }
    // otherwise we're incrementing
    var updates = { $inc: { loginAttempts: 1 } };

    // lock the account if we've reached max attempts and it's not locked already
    if (this.loginAttempts + 1 >= CONFIG.maxLoginAttempts && !this.isLocked) {
        updates.$set = { lockUntil: Date.now() + CONFIG.lockTime };
    }
    return this.update(updates, cb);
};

CompanySchema.methods.comparePassword = function (candidatePassword, cb) {
    let user = this;
    bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
        if (err) return cb(err);

        if (isMatch) {
            if (!user.loginAttempts && !user.lockUntil) return cb(null, user);
            // reset attempts and lock info
            var updates = {
                $set: { loginAttempts: 0 },
                $unset: { lockUntil: 1 },
            };

            return user.update(updates, function (err) {
                if (err) return cb(err);
                return cb(null, user);
            });
        }

        user.incLoginAttempts(function (err) {
            if (err) return cb(err);
            return cb(null, null, reasons.PASSWORD_INCORRECT);
        });
    });
};

module.exports = mongoose.model("Companies", CompanySchema);
