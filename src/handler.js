console.log('HANDLER.JS')

import verify from 'auth0-verify'
import middy from 'middy'
import { jsonBodyParser, httpErrorHandler, cors } from 'middy/middlewares'
import { load } from 'envdotjs'
load()

import lib from './lib'

module.exports.auth = (event, context) => {
	console.log('AUTH ENDPOINT HIT...')
	try {
		lib.authenticate(event)
			.then(context.succeed)
			.catch(err => {
				if (!err) context.fail("Unhandled error case");
				//      if ( err.message ) context.fail( err.message );
				console.log(err);
				context.fail(err);
			});
	}
	catch (err) {
		console.log(err);
		context.fail(err);
	}
}


// Export function with middleware
module.exports.hello = middy((event, context, callback) => {
		console.log('HELLO ENDPOINT HIT')
		callback(null, {
			body: JSON.stringify({
				result: 'hi'
			})
		})
	})
	.use(cors())
	.use(httpErrorHandler())


const jwt = require('express-jwt')
const jwksRsa = require('jwks-rsa')

const getTokenContents = (token, uri, clientId) => {
	return new Promise((resolve, reject) => {
		const app = jwt({
			secret: jwksRsa.expressJwtSecret({
				cache: true,
				rateLimit: true,
				jwksRequestsPerMinute: 5,
				jwksUri: `https://${uri}/.well-known/jwks.json`
			}),
			audience: clientId,
			algorithms: ['RS256']
		})
		const req = {
			headers: {
				authorization: `Bearer ${token}`
			}
		}

		app(req, {}, (err, res) => {
			if (err) return reject(err)
			resolve(req.user)
		})
	})
}



module.exports.test = middy((event, context, callback) => {
		console.log('TEST ENDPOINT HIT')

		const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ik4wVkZSVVV5TWtGRVJUbEZRMFU0UVVFeE5Ea3dNVGMyTnpNNVFVSkJNemd6UVRSQ01rTTBOUSJ9.eyJpc3MiOiJodHRwczovL2VzY2FsYWRlLXNwb3J0cy5hdXRoMC5jb20vIiwic3ViIjoiZ29vZ2xlLW9hdXRoMnwxMTQ2MjQ0MzM4NTE1MzQ3Njg5NTciLCJhdWQiOiI3MnZQdTNHbGZYcUlkaldRU3R6ZnVXVlNpNlhPNnFEMSIsImlhdCI6MTUxNjM4MDU4NCwiZXhwIjoxNTE2NDE2NTg0LCJhdF9oYXNoIjoidlZlT1JLZW0xZFZkMU4xRzMtUk9ldyIsIm5vbmNlIjoiZEpVYlFfWU9tUXdJTzhJaU1PSVZudy5va2lVZUxNM0sifQ.aMxPaPxJGQwYpfjkyvUZKuZDMjD_FasjDlfc3Jdf_MSjdOO3MVdzomuQc0wop_hagCx2iNyzwDaefD4zS6c5UTtlU0m82-WH9-Uc6jCf39ql3AaFq7y455xNNciKqO7E5e3XYQZU3kNVxhmDD-sG9XtDYDamMr8DxsH40yVAkj0M8MF5csiXGq9NdLtlUUv9Hjb1cHJQjdUIHlaGJRCFrT0uyuXZ1Fuv3vlXWCik4Gg3RBYHxs5NvtjiZO6x3i6Dj9Nd5QBQ_ljqC9lic-HqCztQr4Nt-T5hTjK7BBI5TyOKFBgwqgKRnV_SJtAo5lEIMCJiGdTm1oMOzkT83WDuZg'

		getTokenContents(token, process.env.AUTH0_DOMAIN, process.env.AUTH0_CLIENTID)
			.then(res => {
				console.log('RES:', res)
			})
			.catch(console.error)

		callback(null, {
			body: JSON.stringify({
				result: 'hi'
			})
		})
	})
	.use(cors())
	.use(httpErrorHandler())
