'use strict';

var path = require('path');
var fs = require('fs-extra');
var debug = require('debug')('wyliodrin-lab-server:workspace-database');
var statusCodes = require('http-status-codes');

debug.log = console.info.bind(console);

var HOMES = path.join(__dirname, 'homes');
var PROJECTS = 'projects';

/**
 * 
 * @param {String} filePath - path relative to project for file
 * @param {String} userId - id of the user
 * @param {String} project - the project containing the file
 */
function verifyPath(filePath, userId, project) {
	var absPath = path.join(HOMES, userId, project, filePath);
	var normalizedPath = path.normalize(absPath);
	var verifyPath = path.join(HOMES, userId, project);
	if (normalizedPath.startsWith(verifyPath)) {
		return { valid: true, absPath: absPath, normalizedPath: normalizedPath };
	}
	return { valid: false, absPath: absPath, normalizedPath: normalizedPath };
}

async function hasHome(userId) {
	var userHome = path.join(HOMES, userId);
	try {
		var homeExists = await fs.pathExists(userHome);
	} catch (err) {
		throw new Error('Got error checking home', err);
	}
	return homeExists;
}

async function projectExists(userId, project) {
	var userHome = path.join(HOMES, userId);
	var projPath = path.join(userHome, PROJECTS, project);

	try {
		var exists = await fs.pathExists(projPath);
	} catch (err) {
		throw new Error('Got error checking project', err);
	}

	return exists;
}

async function fileExists(userId, project, filePath) {
	var userHome = path.join(HOMES, userId);
	var file_path = path.join(userHome, PROJECTS, project, filePath);
	try {
		var exists = await fs.pathExists(file_path);
	} catch (err) {
		throw new Error('Got error checking project', err);
	}

	return exists;
}



async function createUserHome(userId) {
	var userHome = path.join(HOMES, userId);
	var userProjects = path.join(userHome, PROJECTS);

	try {
		await fs.mkdir(userHome);
	} catch (err) {
		debug('Error making user home', err);
		throw new Error('File System Error: \n', err);
	}
	try {
		await fs.mkdir(userProjects);
	} catch (err) {
		debug('Error making user project folder', err);
		throw new Error('File System Error: \n', err);
	}
}

function isValidName(name) {
	var regex = new RegExp(/^[\w\-. ]+$/);
	if (regex.test(name) && name !== '.' && name !== '..') {
		return true;
	}
	return false;

}

async function createProject(userId, projectName) {

	if (isValidName(projectName)) {
		return { success: false, message: 'Invalid project name' };
	}
	var userHome = path.join(HOMES, userId);
	var userProjects = path.join(userHome, PROJECTS);
	var projectPath = path.join(userProjects, projectName);

	try {
		debug(projectPath);
		await fs.ensureDir(projectPath);
		debug('Project created');
	} catch (err) {
		debug('Error creating project', err);
		return { success: false, message: 'File System Error: \n' + err };
	}
	debug('This should be after created');
	return { success: true };
}


/**
 * 
 * @param {String} filePath - the file path relative to the project
 * @param {String} userId - id of the user
 * @param {String} project - name of the project 
 * @param {Object} data - object containing name of file and data from file 
 */
async function setFile(filePath, userId, project, data) {
	try {
		var projectExists = await projectExists(userId, project);
	} catch (err) {
		throw new Error('File System Error', err);
	}

	if (!projectExists) {
		return { success: false, message: 'Project not found', err: statusCodes.BAD_REQUEST };
	}

	var pathIsValid = verifyPath(filePath, userId, project);
	if (!pathIsValid.valid) {
		return { success: false, message: 'Invalid path', err: statusCodes.BAD_REQUEST };
	}

	var fileData = new Buffer(data.data, 'base64');
	var normalized_path = pathIsValid.normalizedPath;
	try {
		await fs.outputFile(normalized_path, fileData);
	} catch (err) {
		debug('Got error writing file: ', err);
		return { success: false, message: 'File system error', err: statusCodes.INTERNAL_SERVER_ERROR };
	}

	return { success: true, err: 0 };
}

/**
 * 
 * @param {String} filePath - the file path relative to the project
 * @param {String} userId - id of the user
 * @param {String} project - name of the project 
 */
async function getFile(filePath, userId, project) {
	var pathIsValid = verifyPath(filePath, userId, project);
	if (!pathIsValid.valid) {
		return { success: false, message: 'Invalid path', err: statusCodes.BAD_REQUEST };
	}
	try {
		var prExists = await projectExists(userId, project);
	} catch (err) {
		debug(err);
		return { success: false, message: 'File system error', err: statusCodes.INTERNAL_SERVER_ERROR };
	}
	if (!prExists) {
		return { success: false, message: 'Project not found', err: statusCodes.BAD_REQUEST };
	}

	try {
		var exists = await fileExists(userId, project, filePath);
	} catch (err) {
		debug(err);
		return { success: false, message: 'File system error', err: statusCodes.INTERNAL_SERVER_ERROR };
	}
	if (!exists) {
		return { success: false, message: 'File not found', err: statusCodes.BAD_REQUEST };
	}

	var normalized_path = pathIsValid.normalizedPath;

	try {
		var data = (await fs.readFile(normalized_path)).toString('base64');
	} catch (err) {
		debug(err);
		return { success: false, message: 'File system error', err: statusCodes.INTERNAL_SERVER_ERROR };
	}

	return { success: true, data, err: 0 };
}


/**
 * Lists the projects of a user 
 * @param {String} userId Id of user to list projects
 */
async function listProjects(userId) {
	var userHome = path.join(HOMES, userId);
	var userProjects = path.join(userHome, PROJECTS);
	debug(userProjects);
	var projectList = [];

	try {
		var projects = await fs.readdir(userProjects);
	} catch (err) {
		debug('Error reading project list');
		throw new Error('File System Error: \n', err);
	}

	projects.forEach((projectName) => {
		projectList.push({ name: projectName });
	});
	debug('Projects: ', projectList);

	return projectList;
}

var workspace = {
	createUserHome,
	createProject,
	listProjects,
	hasHome,
	setFile,
	getFile
};

module.exports = workspace;