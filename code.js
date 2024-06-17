// You don't HAVE to use ANTLR to make a programming language
let ProgrammingLanguage = (function() {
	const ignoreReg = /[ \t\r\n;]+/g // Ignore any whitespace characters, including semicolons, since they're not important in our code.
	function lexer(code) {
		return code.split(ignoreReg)
	}
	function parser(tokens) {
		let transpiled = []
		let int = /[0-9]+(?!\D)$/
		let num = /[0-9]+\.[0-9]+$/
		let str = /^\"[^\"]*\"$/
		tokens.forEach(function(token) {
			let js = {
				token
			}
			if (int.test(token)) {
				js.type = "int"
			} else if (num.test(token)) {
				js.type = "num"
			} else if (str.test(token)) {
				js.type = "str"
			} else {
				js.type = ""
			}
			transpiled.push(js)
		})
		// We need another layer of looping for string values.
		let st = false
		let j = transpiled.length
		let i = 0
		for (; i < j; i += 1) {
			if (st) {
				
			} else {
				
			}
		}
		return transpiled
	}
	return {
		exec: (e) => parser(lexer(e))
	}
})()
