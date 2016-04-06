var mongoose = require('mongoose');
var gracefulShutdown;
var readLine = require ("readline");

/* 1. Defined a database connection string */
// connect to mongo by mongoose.connect
// Test db connection
var dbURI = 'mongodb://localhost/Loc8r';

// production db connection
if (process.env.NODE_ENV === 'production') {
    dbURI = process.env.MONGOLAB_URI;
}

/* 2. Opened a Mongoose connection at application startup */
mongoose.connect(dbURI);

// 3. CONNECTION EVENTS
// Monitoring for successful connection through Mongoose
mongoose.connection.on('connected', function() {
    console.log('Mongoose connected to ' + dbURI);
});
mongoose.connection.on('error', function(err) {
    console.log('Mongoose connection error: ' + err);
});
mongoose.connection.on('disconnected', function() {
    console.log('Mongoose disconnected');
});

// CAPTURE APP TERMINATION / RESTART EVENTS
// To be called when process is restarted or terminated
gracefulShutdown = function(msg, callback) {
    mongoose.connection.close(function() {
        console.log('Mongoose disconnected through ' + msg);
        callback();
    });
};

// For nodemon restarts Listen for SIGUSR2
// Send message to gracefulShutdown and callback to
// kill process, emitting SIGUSR2 again
process.once('SIGUSR2', function() {
    gracefulShutdown('nodemon restart', function() {
        process.kill(process.pid, 'SIGUSR2');
    });
});

// Listen for SIGINT emitted on application termination
process.on('SIGINT', function() {
    gracefulShutdown('app termination', function() {
        process.exit(0);
    });
});

// For Heroku app termination
process.on('SIGTERM', function() {
    gracefulShutdown('Heroku app termination', function() {
        process.exit(0);
    });
});



// This will emit the SIGINT signal on Windows machines, 
// allowing you to capture it and gracefully close down 
// anything else you need to before the process ends.
//if (process.platform === "win32"){
//    var rl = readLine.createInterface ({
//        input: process.stdin,
//        output: process.stdout
//    });
    
//    rl.on ("SIGINT", function (){
//        process.emit ("SIGINT");
//    });
//}

// BRING IN YOUR SCHEMAS & MODELS
require('./locations');


