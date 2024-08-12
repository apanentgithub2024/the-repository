class InterpreterParserError extends Error {
	constructor(message) {
		super(message)
		this.name = "InterpreterParserError"
	}
}
const run = function(text) {
	const ret = /"((?:[^"\\]|\\.)*)"|'((?:[^"\\]|\\.)*)'|\d+|\d*\.(\d*)|\s*([\+\-\*\^]|and|or|xor|not|nand|nor|xnor|==|\^=)\s*|(?!define|lock|unlock|if|log|string)([a-zA-Z_]([a-zA-Z_0-9]*))|str\s*=>\s*/
	const keys = /define\s+([a-zA-Z_]([a-zA-Z_0-9]*))\s*=\s*|((un?)lock)\s+([a-zA-Z_]([a-zA-Z_0-9]*))|if\s+|log\s*=>\s*|end(\s+|;|\n)|getTime\s*=>\s*\(\)/
	const tokensRe = new RegExp(ret.source + "|" + keys.source + "|=", "gs")
	function lexer(c) {
		const a = c.match(tokensRe)
		return a
	}
	function parse(tokens) {
		let parses = [], i = 0
		const cache = tokens.length
		let varr = /define\s+([a-zA-Z_]([a-zA-Z_0-9]*))/, ints = /^[0-9]+$/, nums = /[0-9]+\.[0-9]*/, arithmetic = /[\+\-\*\/\^]/, vars = /[a-zA-Z_]([a-zA-Z_0-9]*)/
		for (; i < cache; i++) {
			const token = tokens[i]
			const c = token.match(varr)
			if (c) {
				parses.push({
					type: "newvar",
					identifier: c[1]
				})
			} else if (ints.test(token)) {
				parses.push({
					type: "val",
					value: "int",
					int: token
				})
			} else if (nums.test(token)) {
				parses.push({
					type: "val",
					value: "num",
					num: token
				})
			} else if (['"', "'"].includes(token[0]) && ['"', "'"].includes(token.at(-1))) {
				parses.push({
					type: "val",
					value: "string",
					string: token.slice(1, -1)
				})
			} else if (arithmetic.test(token)) {
				parses.push({
					type: "arith",
					operator: token.trim()
				})
			} else if (vars.test(token)) {
				parses.push({
					type: "val",
					value: "variable",
					variable: token
				})
			} else {
				throw new InterpreterParserError("Parser was about to convert token into a parsed token, but this token (" + token + ") is invalid.")
			}
		}
		return parses
	}
	const values = new Set(["arith", "val"])
	function enhanceParses(parses) {
		let pars = []
		let valueParses = []
		let count = 0
		for (const parse of parses) {
			if (values.has(parse.type)) {
				count++
				valueParses.push(parse)
			} else {
				if (count > 0) {
					pars.push({
						type: "equation",
						parses: valueParses
					})
					valueParses = []
				} else {
					pars.push(parse)
				}
				count = 0
			}
		}
		if (count > 0) {
			pars.push({
				type: "equation",
				parses: valueParses
			})
			valueParses = []
		} else {
			pars.push(parse)
		}
		return pars
	}
	function interpreter(parses) {
		const variables = new Map()
	}
	return enhanceParses(parse(lexer(text)))
}
