const express = require('express');
const app = express();
const morgan = require('morgan');
var mongo = require('mongodb').MongoClient;
// const mongoose = require('mongoose');

require('dotenv').config();

app.use(express.static('public'));

// DB setup
// mongoose.connect('mongodb://localhost:27017/auth');

// use morgan for logging errors
app.use(morgan('combined'));

// set the port
app.set('port', (process.env.PORT || 8080));

mongo.connect(process.env.MONGO_URL, function (error, db) {
    if (error) {
    throw new Error('Database failed to connect!');
    } else {
    console.log('MongoDB successfully connected on port 27017.');
    }
    
    // routes
    const routes = require('./routes/routes.js');
    routes(app, db);
    
    // start the server
    app.listen(app.get('port'), function() {
        console.log('Express server listening on port', app.get('port'));
    });

});