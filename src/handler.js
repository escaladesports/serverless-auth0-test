import middy from 'middy'
import { jsonBodyParser, httpErrorHandler, cors } from 'middy/middlewares'
import { load } from 'envdotjs'
load()

import lib from './lib'


module.exports.auth = (event, context) => {
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
		callback(null, {
			body: JSON.stringify({
				result: 'hi'
			})
		})
	})
	.use(cors())
	.use(httpErrorHandler())