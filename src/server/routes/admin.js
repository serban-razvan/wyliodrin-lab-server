'use strict';

var express = require('express');
var debug = require('debug')('development:admin-route');
var db = require('../database/database.js');
var error = require('../error.js');

var adminApp = express.Router();

debug.log = console.info.bind(console);


function adminSecurity(req, res, next) {
	var role = req.user.role;
	if (role === 'admin') {
		next();
	} else {
		var err = error.unauthorized('User is not admin');
		next(err);
	}
}

/**
 * @api {post} /create Create a user
 * @apiName CreateUser
 * @apiGroup User
 *
 * @apiParam {String} username Username
 * @apiParam {String} password Password
 * @apiParam {String} firstName First name of user
 * @apiParam {String} email Email of user
 *
 * @apiSuccess {Number} err 0 
 * @apiError {String} err Error
 * @apiError {String} statusError error
 */
adminApp.post('/create_user', async function(req, res, next) {
	var e;
	var username = req.body.username;
	var password = req.body.password;
	var email = req.body.email;
	var firstName = req.body.firstName;
	var lastName = req.body.lastName;
	var role = req.body.role;
	try {
		var user = await db.user.create(username, password, firstName, lastName, email, role);
		try {
			await db.workspace.createUserHome(user.userId);
		} catch (err) {
			debug('Error creating workspace', err);
			e = error.serverError(err);
			next(e);
		}
		res.status(200).send({
			err: 0,
			user: user
		});
	} catch (err) {
		if (err.code !== 11000) {
			debug('Creation failed', { requestId: req.requestId, error: err });
			e = error.serverError();
			next(e);
		} else {
			debug('Creation failed, user exists', { requestId: req.requestId, error: err });
			e = error.notAcceptable('User already exists');
			next(e);
		}
	}
});

adminApp.post('/delete_user', async function(req, res, next) {
	var e;
	var userId = req.body.userId;
	try {
		await db.user.deleteByUserId(userId);
	} catch (err) {
		debug(err);
		e = error.serverError();
		next(e);
	}
	return { err: 0 };
});

adminApp.post('/list_users', async function(req, res, next) {
	var e;
	try {
		var users = await db.user.listUsers();
	} catch (err) {
		debug('Error listing users');
		e = error.serverError(err);
		next(e);
	}
	res.status(200).send({ err: 0, users });
});

adminApp.post('/set_password', async function(req, res, next) {
	var e;
	var userId = req.body.userId;
	var newPassword = req.body.newPassword;
	try {
		await db.user.setPassword(userId, newPassword);
	} catch (err) {
		debug(err);
		e = error.serverError(err);
		next(e);
	}
	return { err: 0 };
});

module.exports.adminSecurity = adminSecurity;
module.exports.adminRoute = adminApp;