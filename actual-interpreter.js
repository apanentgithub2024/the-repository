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
					string: token,
					stringV: token.slice(1, -1)
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
	function interpret(parses) {
		const variables = new Map()
		let defV = {ident: null, is: false}
		let result = null
		function parseEquation(parses) {
			let memory = {type: "", value: null}
			let prevMemory = null
			let type = null
			for (const parse of parses) {
				switch (parse.type) {
					case "val":
						prevMemory = memory
						const value = parse[parse.value]
						memory.value = parse.value == "string" ? parse.stringV : value
						memory.type = parse.value
						if (type !== null) {
							if (["int", "num"].includes(memory.type)) {
								memory.value = Number(memory.value)
							}
							if (type == "+") {
								memory.value = prevMemory.value + memory.value
							} else if (type == "-") {
								if (prevMemory.type == "string" && memory.type == "num") {
									memory.value = prevMemory.value.slice(-memory.value)
								} else if ([prevMemory, memory].every(i => i.type == "number")) {
									memory.value = prevMemory.value - memory.value
								} else {
									throw new SyntaxError("The value (" + prevMemory.value + ") which is a '" + prevMemory.type + "' can't be subtracted from another value that is a '" + memory.type + "'.")
								}
							}
						}
						break
					case "arith":
						if (new Set(["int", "num", "string"]).has(memory.type)) {
							type = memory.operand
						} else {
							throw new SyntaxError("The value (" + memory.value + ") which is a '" + memory.type + "' can't be used in an arithmetic equation, since the value isn't a form of a number, or a string.")
						}
						break
				}
			}
			return memory.value
		}
		for (const parse of parses) {
			switch (parse.type) {
				case "newvar":
					defV.ident = parse.identifier
					defV.is = true
					break
				case "equation":
					if (defV.is) {
						variables.set(defV.ident, parseEquation(parse.parses))
						result = variables.get(defV.ident)
					} else {
						throw new SyntaxError("The value (" + parse.parses.map(i => ({"val": i[i.value], "arith": i.operand})[i.type]).join(" ") + ") is provided, but doesn't have any use in the code.")
					}
					break
			}
		}
		return result
	}
	return interpret(enhanceParses(parse(lexer(text))))
}
