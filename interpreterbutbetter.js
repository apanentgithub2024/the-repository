const run = function(text, c = true) {
	const ret = /"((?:[^"\\]|\\.)*)"|'((?:[^"\\]|\\.)*)'|\d+|\d*\.(\d*)|\s*([\+\-\*\^]|and|or|xor|not|nand|nor|xnor|==|\^=)\s*|([a-zA-Z_][a-zA-Z_0-9]*)/
	const keys = /define\s+([a-zA-Z_]([a-zA-Z_0-9]*))\s*=\s*|((un?)lock)\s+([a-zA-Z_]([a-zA-Z_0-9]*))/
	const tokensRe = new RegExp(keys.source + "|" + ret.source + "|=", "gs")
	function lexer(c) {
		const a = c.match(tokensRe)
		return a
	}
	function parser(original, tok) {
		const check = original.replace(tokensRe, "")
		if (/[^ \r\t\n;]/.test(check)) {
			throw "ParserError: Invalid token has been found: " + check.match(/[^ \r\t\n;]+/g)[0]
		}
		let tokens = []
		let state = ""
		let formula = []
		function parseIntoFormula(group) {
			let f = []
			for (const token of group) {
				if (ret.test(token)) {
					if (/("|')(.*)/s.test(token)) {
						f.push({
							type: "st",
							v: token.slice(1, -1),
							q: token[0]
						})
					} else if (/\d+(\.?)/.test(token)) {
						f.push({
							type: token.includes(".") ? "dec" : "int",
							v: token
						})
					} else if (/(=|\^)=/.test(token)) {
						f.push({
							type: "eq",
							n: token.includes("^")
						})
					} else if (/(n?)(and|or)|x(n?)or|not/.test(token)) {
						f.push({
							type: "bo",
							b: token.trim()
						})
					} else if (/(([a-zA-Z_]([a-zA-Z_0-9]*))|[a-zA-Z_])/.test(token)) {
						f.push({
							type: "var",
							v: token
						})
					} else if (/[\+\-\*\/]/.test(token)) {
						f.push({
							type: "ari",
							o: token.trim()
						})
					} else {
						f.push({
							type: "ign"
						})
					}
				} else {
					throw "ParseIntoFormulaError: Expected a formula token: " + token
				}
			}
			return f
		}
		let i = 0
		while (i < tok.length) {
			const token = tok[i]
			if (state == "" && /define\s+([a-zA-Z_]([a-zA-Z_0-9]*))\s*=/.test(token)) {
				const varname = token.match(/([a-zA-Z_]([a-zA-Z0-9_]*))/g)[1]
				tokens.push({
					type: "dv",
					v: varname
				})
				state = "for"
			} else if (state == "for" && ret.test(token) && !/define|lock/.test(token)) {
				formula.push(token)
				if (i + 1 === tok.length) {
					tokens.push({
						type: "f",
						f: parseIntoFormula(formula)
					})
				}
			} else if (state == "for" && (!ret.test(token) || /define|lock/.test(token))) {
				state = ""
				tokens.push({
					type: "f",
					f: parseIntoFormula(formula)
				})
				formula = []
				i--
			} else if (state == "" && /(un?)lock\s+([a-zA-Z_]([a-zA-Z_0-9]*))/.test(token)) {
				const varname = token.match(/([a-zA-Z_]([a-zA-Z0-9_]*))/g)[1]
				tokens.push({
					type: (/unlock\s+/.test(token)?"u":"") + "lo",
					v: varname
				})
			}
			i++
		}
		return tokens
	}
	const result = parser(text, lexer(text))
	if (c) {
		let code = "";
		let t = ""
		const variables = {}
		const definedVariables = []
		const lockedVariables = []
		const js = ["var","let","const","try","catch","finally","void","function","if","else","class","extends","true","false","return","yield"]
		function placeholder(v) {
			let va = v
			while (definedVariables.includes(va) || js.includes(va)) {
				va += "_"
			}
			return va
		}
		function placeholder2(v) {
			let va = v
			while (lockedVariables.includes(va) || js.includes(va)) {
				va += "_"
			}
			return va
		}
		function compile(formula) {
			const tokens = formula.f
			let f = ""
			let i = 0
			while (i < tokens.length) {
				const token = tokens[i]
				switch (token.type) {
					case "st":
						f += token.q + token.v + token.q
						break
					case "int":
						f += token.v
						break
					case "dec":
						f += token.v
						break
					case "eq":
						f += (token.n ? "!" : "=") + "=="
						break
					case "bo":
						if (token.b == "not") {
							if (!tokens[i - 1]) {
								f += "!"
							} else {
								if (tokens[i - 1].type == "bo") {
									f += "!"
								} else {
									throw "CompilerError: The \"not\" logic operator must *only* have a right parameter, not also the left parameter."
								}
							}
						} else {
							f += {"and":"&&","or":"||","xor":"^","xnor":"^"}[token.b.replace(/^n/, "")]
							if (token.b.startsWith("n")) {
								f = "!(" + f
							} else if (token.b == "xnor" || token.b === "xor") {
								f = "Boolean(" + f + ")"
							}
							if (token.b == "xnor") {
								f = "!(" + f
							}
						}
						break
					case "var":
						f += Object.prototype.hasOwnProperty.call(variables, token.v)?variables[token.v]:token.v
						break
					case "ari":
						if (token.o == "*") {
							if (tokens[i - 1].type == "st" && ["int","dec"].includes(tokens[i + 1].type)) {
								f += ".repeat(" + tokens[i + 1].v + ")"
								i++
							} else {
								f += token.o
							}
						} else if (token.o == "-") {
							if (tokens[i - 1].type == "st" && ["int","dec"].includes(tokens[i + 1].type)) {
								f += ".slice(-" + tokens[i + 1].v + ")"
								i++
							} else {
								f += token.o
							}
						} else {
							f += token.o
						}
						break
					case "ign":
						break
				}
				if (i > 0 && tokens[i - 1].type == "bo" && (tokens[i - 1].b.startsWith("n") || tokens[i - 1].b[1] == "n") && tokens[i - 1].b !== "not") {
					f += ")"
				}
				i++
			}
			return f
		}
		for (let i = 0; i < result.length; i++) {
			const t = result[i]
			if (t.type == "dv") {
				const r = compile(result[i+1])
				code += `${i>0?";":""}let ${placeholder(t.v)}=${r}`
				definedVariables.push(t.v)
			} else if (t.type == "lo") {
				variables[t.v] = placeholder2(placeholder(t.v))
				code += `${i>0?";":""}const ${placeholder(t.v)}=${t.v}`
				lockedVariables.push(variables[t.v])
			} else if (t.type == "ulo") {
				const success = delete variables[t.v]
				if (!success) {
					throw `CompilerError: The variable "${t.v}" has to be locked to be unlocked`
				} 
			}
		}
		return code
	}
}
