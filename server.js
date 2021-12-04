require('babel-core').transform('code', {
  presets: ['es2017'],
});

const express = require('express'),
  bodyParser = require('body-parser'),
  mongoClient = require('mongodb').MongoClient,
  mongoose = require('mongoose'),
  config = require('./config/db'),
  app = express(),
  server = require('http').Server(app),
  io = require('socket.io')(server),
  port = process.env.PORT || 9000;
  
// mongoose instance connection url connection
if (mongoose.connection.readyState != 1) {
  mongoose.Promise = global.Promise;
  mongoose.connect(config.db);
  const db = mongoose.connection;
  db.on('error', err => {
    throw new Error(`Unable to connect to database at ${config.db} err`);
  });

  db.once('open', function() {
    console.log('Database is connected');
  });
}
app.use(function(req, res, next) {
  req.io = io;
  next();
});

// Bring in our dependencies
require('./config/express')(app, config);

server.listen(port, () => {
  console.log('We are live on port: ', port);
});

io.on('connection', function(socket) {
  console.log('Socket is up and running now.');
  socket.on('channel1', function(message) {
    console.log('Message from client : ' + message);
  });
});
