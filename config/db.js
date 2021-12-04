const path = require('path'),
  rootPath = path.normalize(__dirname + '/..'),
  env = process.env.NODE_ENV || 'production';

const config = {
  development: {
    root: rootPath,
    app: {
      name: 'aseemai-api',
    },
    port: 27017,
    db: 'mongodb://localhost/aseemai-api',
    saltWorkFactor: 10,
    maxLoginAttempts: 5,
    lockTime: 2 * 60 * 60 * 1000,
    jwtSecret:
      'gncmd$2a$10$6rRXhjTzFgHmko13WgiOquLvwQpL2S4.O.ZJCAsZekAY8YzYzWZzi',
    jwtKey: 'WgiOquLvwQpL2S4.O.ZJCA',
    defultPasswordExpire: 86400
  },

  production: {
    root: rootPath,
    app: {
      name: 'iaseemai-api',
    },
    port: 27017,
    db: 'mongodb://localhost/aseemai-api',
    saltWorkFactor: 10,
    maxLoginAttempts: 5,
    lockTime: 2 * 60 * 60 * 1000,
    jwtSecret:
      'gncmd$2a$10$6rRXhjTzFgHmko13WgiOquLvwQpL2S4.O.ZJCAsZekAY8YzYzWZzi',
    jwtKey: 'WgiOquLvwQpL2S4.O.ZJCA',
    defultPasswordExpire: 86400
  },
};

module.exports = config[env];
