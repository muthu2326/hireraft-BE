var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cors = require('cors')


global.lib = require('./lib');

var jobs = require('./routes/jobs.server.route');
var users = require('./routes/users.server.route');
var hr = require('./routes/hr.server.route');
var employers = require('./routes/employers.server.route');
var states = require('./routes/states.server.route')
var campaign = require('./routes/campaign.server.route')

var app = express();

app.use(cors())

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/jobs', jobs);
app.use('/users', users);
app.use('/hr', hr);
app.use('/employers', employers);
app.use('/states', states);
app.use('/campaign', campaign);

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}
app.use(function(req, res, next) {
    var allowedOrigins = ['https://www.hireraft.com', 'http://192.168.43.37:4200', 'http://localhost:4200'];
    var origin = req.headers.origin;
    origin = "*";
    // Commented temporarily for any frotend with IP address can point to remote backend
    //if (allowedOrigins.indexOf(origin) > -1) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    //}
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Authorization, Accept,Content-Length, X-Requested-With, X-PINGOTHER, token');
    res.header('Access-Control-Expose-Headers', 'X-Total-Count');
    res.header('X-Total-Count', 5000);
    
    if ('OPTIONS' === req.method) {
        res.sendStatus(200);
    } else {
        next();
    }
});

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;

