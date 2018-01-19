# serverless-aws-boilerplate

[![Build Status](https://travis-ci.org/escaladesports/serverless-aws-boilerplate.svg?branch=master)](https://travis-ci.org/escaladesports/serverless-aws-boilerplate)

A bare-bones boilerplate for working with [AWS Lambda functions](https://aws.amazon.com/lambda/) in the [Serverless framework](https://serverless.com/).

## Features

- [ES6](http://es6-features.org/) transpiling
- [Middy](https://middy.js.org/) for easy Lambda middleware
- [Mocha](https://mochajs.org/)/[Chai](http://chaijs.com/) for unit testing
- [envdotjs](https://www.npmjs.com/package/envdotjs) for environment variables
- [TravisCI](https://travis-ci.org/) for continuous integration & delivery

## Installation

```bash
git clone git@github.com:escaladesports/serverless-aws-boilerplate.git new-function
cd new-function
yarn
```

## Environment Variables

Environment variables are (by default) managed through the `env.js` file. Create an encryption key in a `envdotjs-key` file at the root of your project. Any time you make a change the the `env.js` file, make sure you run `yarn encrypt` after. Only the `env.js.enc` and `envdotjs-key` files will be uploaded to AWS. `env.js` will not get uploaded and will not be checked into .git. So always encrypt after altering the environment file.

For more info, see the [envdotjs documentation](https://github.com/escaladesports/envdotjs).

## Deployment

Deployment should be handled by TravisCI automatically. This will ensure that all branches have their own separate deploys and that everything is in sync with the repository.

If this does not work for your use case, `yarn deploy` will deploy to a staging environment. Use `yarn deploy-production` to deploy to production. All unit tests must pass a production test for a production deploy to succeed. You can modify the production deployment script in `package.json` if this needs to be changed.