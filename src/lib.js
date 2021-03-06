
import { load } from 'envdotjs'
load()

var policyDocument = {
	"Version": "2012-10-17",
	"Statement": [
		{
			"Sid": "Stmt1459758003000",
			"Effect": "Allow",
			"Action": [
				"execute-api:Invoke"
			],
			"Resource": [
				"arn:aws:execute-api:*"
			]
		}
	]
}

console.log('AUTH LIB FILE LOADED')
var ACCESS_TOKEN_LENGTH = 16; // (apparent) length of an Autho0 access_token

var AWS = require('aws-sdk');

console.log('LOADED AWS-SDK')
if (process.env.AWS_REGION) {
	AWS.config.update({ region: process.env.AWS_REGION });
}

var AuthenticationClient = require('auth0').AuthenticationClient;

console.log('LOADED AUTH0')

if (typeof process.env.AUTH0_DOMAIN === "undefined" || !process.env.AUTH0_DOMAIN.match(/\.auth0\.com$/)) {
	console.log('AUTH0_DOMAIN ERR')
	throw new Error("Expected AUTHO_DOMAIN environment variable to be set in .env file. See https://manage.auth0.com/#/applications")
}

if (typeof process.env.AUTH0_CLIENTID === "undefined" || process.env.AUTH0_CLIENTID.length === 0) {
	console.log('AUTH0_CLIENTID ERR')
	throw new Error("Expected AUTH0_CLIENTID environment variable to be set in .env file. See https://manage.auth0.com/#/applications")
}

console.log('AUTHENTICATING CLIENT')

const authOptions = {
	domain: process.env.AUTH0_DOMAIN,
	clientId: process.env.AUTH0_CLIENTID
}

console.log('authOptions', authOptions)

var auth0 = new AuthenticationClient(authOptions);

console.log('AUTHENTICATION CLIENT')

// extract and return the Bearer Token from the Lambda event parameters
var getToken = function (params) {
	var token;

	if (!params.type || params.type !== 'TOKEN') {
		throw new Error("Expected 'event.type' parameter to have value TOKEN");
	}

	var tokenString = params.authorizationToken;
	if (!tokenString) {
		throw new Error("Expected 'event.authorizationToken' parameter to be set");
	}

	var match = tokenString.match(/^Bearer (.*)$/);
	if (!match || match.length < 2) {
		throw new Error("Invalid Authorization token - '" + tokenString + "' does not match 'Bearer .*'");
	}
	return match[1];
}

var returnAuth0UserInfo = function (auth0return) {
	console.log('AUTH0RETURN:', auth0return)
	if (!auth0return) throw new Error('Auth0 empty return');
	if (auth0return === 'Unauthorized') {
		throw new Error('Auth0 reports Unauthorized')
	} else if (!auth0return) {

	}

	return auth0return
}

var saveUserInfo = function (userInfo) {
	if (!userInfo) throw new Error('saveUserInfo - expected userInfo parameter');
	if (!userInfo.user_id) throw new Error('saveUserInfo - expected userInfo.user_id parameter');
	console.log(userInfo);
	//Use this space if you want to save the user
	return userInfo;

}

// extract user_id from the autho0 userInfo and return it for AWS principalId
var getPrincipalId = function (userInfo) {
	if (!userInfo || !userInfo.user_id) {
		throw new Error("No user_id returned from Auth0");
	}
	console.log('Auth0 authentication successful for user_id ' + userInfo.user_id);

	return userInfo.user_id;
}

// return the expected Custom Authorizaer JSON object
var getAuthentication = function (principalId) {
	return {
		principalId: principalId,
		policyDocument: policyDocument
	}
}


console.log('EXPORTING AUTH')

const jwt = require('jsonwebtoken')
const fetch = require('isomorphic-fetch')

module.exports.authenticate = function (params) {
	console.log('AUTHENTICATING')
	var token = getToken(params);

	var getTokenDataPromise;
	if (token.length === ACCESS_TOKEN_LENGTH) { // Auth0 v1 access_token (deprecated)
		console.log('PARSING USER TOKEN')
		getTokenDataPromise = auth0.users.getInfo(token);
	} else if (token.length > ACCESS_TOKEN_LENGTH) { // (probably) Auth0 id_token
		console.log('PARSING ID TOKEN')
		getTokenDataPromise = auth0.tokens.getInfo(token);
	} else {
		throw new TypeError("Bearer token too short - expected >= 16 charaters");
	}

	console.log('TOKEN:', token)

	console.log('RUNNING PROMISE CHAIN')


	const otherPromise = async () => {
		console.log('SECRET:', process.env.AUTH0_SECRET)
		const decoded = jwt.verify(token, process.env.AUTH0_SECRET)
		console.log('DECODED:', decoded)
	}
	otherPromise()



	return getTokenDataPromise
		.then(returnAuth0UserInfo)
		.then(saveUserInfo)
		.then(getPrincipalId)
		.then(getAuthentication);
}