import mochaPlugin from 'serverless-mocha-plugin'
const expect = mochaPlugin.chai.expect
const wrapped = mochaPlugin.getWrapper('hello', '/src/handler', 'hello')

describe('Result', () => {
	it('should always pass', () =>{
		expect(1).to.equal(1)
	})
	it('should be success', async () => {
		const res = await wrapped.run(JSON.stringify({
			body: {
				test: 'abc'
			}
		}))
		expect(res.body).to.not.be.empty
		res.body = JSON.parse(res.body)
		expect(res.body.result).to.not.be.empty
		expect(res.body.result).to.equal('success')
	})
})
