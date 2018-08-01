'use strict';

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var bodyParser = require('body-parser');
var statusCodes = require('http-status-codes');
require('./database/database.js');
var users = require('./routes/users');
var error = require('./error.js');
var projects = require('./routes/projects');

var app = express();

if (process.env.NODE_ENV !== 'production') app.use(logger('dev'));

app.use(function(req, res, next) {
    req.ipAddress = req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress;
    next();
});


var apiv1 = express.Router();

apiv1.use(bodyParser.urlencoded({ extended: false }));
apiv1.use(bodyParser.json());
apiv1.use(cookieParser('changeIsGood'));

apiv1.use('/user', users.publicRoutes);

apiv1.use(users.security);

apiv1.use('/user', users.privateRoutes);

apiv1.use('/project', projects.projectsRouter);

// Useful variables to display in ejs templates
app.use(function(req, res, next) {
    res.locals.currentUser = req.user;
    next();
});

app.use('/api/v1', apiv1);

app.use(express.static(path.join(__dirname, 'client')));

app.use('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'client', 'views', 'index.html'));
});

app.use(session({
    secret: 'changeIsGood',
    resave: true,
    saveUninitialized: true
}));

app.use(function errorMiddleware(err, req, res, next) {
    if (err.status) {
        error.sendError(res, err);
    } else {
        error.sendError(res, error.notFound('Page not found'));
    }
});

module.exports = app;