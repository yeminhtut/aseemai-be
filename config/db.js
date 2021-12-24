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
    db: 'mongodb://heyaseemai:fywrEb-kixqyz-pumwo0@cluster0-shard-00-00.mss5e.mongodb.net:27017,cluster0-shard-00-01.mss5e.mongodb.net:27017,cluster0-shard-00-02.mss5e.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-zromam-shard-0&authSource=admin&retryWrites=true&w=majority',
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
      name: 'aseemai-api',
    },
    port: 27017,
    db: 'mongodb://heyaseemai:fywrEb-kixqyz-pumwo0@cluster0-shard-00-00.mss5e.mongodb.net:27017,cluster0-shard-00-01.mss5e.mongodb.net:27017,cluster0-shard-00-02.mss5e.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-zromam-shard-0&authSource=admin&retryWrites=true&w=majority',
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
