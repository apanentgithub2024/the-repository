const run = function(text, c = true) {
	const ret = /"((?:[^"\\]|\\.)*)"|'((?:[^"\\]|\\.)*)'|\d+|\d*\.(\d*)|\s*([\+\-\*\^]|and|or|xor|not|nand|nor|xnor|==|\^=)\s*|(?!define|lock|unlock|if|log|string)([a-zA-Z_]([a-zA-Z_0-9]*))|string\s*=>\s*/
	const keys = /define\s+([a-zA-Z_]([a-zA-Z_0-9]*))\s*=\s*|((un?)lock)\s+([a-zA-Z_]([a-zA-Z_0-9]*))|if\s+|log\s*=>\s*|end(\s+|;|\n)|getTime\s*=>\s*\(\)/
	const tokensRe = new RegExp(ret.source + "|" + keys.source + "|=", "gs")
	function lexer(c) {
		const a = c.match(tokensRe)
		console.log(a)
		return a
	}
	function parser(original, tok) {
		const check = original.replace(tokensRe, "")
		if (/[^ \r\t\n;\>]/.test(check)) {
			throw "ParserError: Invalid token has been found: " + check.match(/[^ \r\t\n;\>]+/g)[0]
		}
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
					} else if (/getTime\s*=>\s*\(\)/.test(token)) {
						f.push({
							type: "getti"
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
		function parseLines(tok) {
			let tokens = []
			let i = 0
			let lines = []
			let state = ""
			while (i < tok.length) {
				const token = tok[i]
				if (!state.startsWith("for") && /define\s+([a-zA-Z_]([a-zA-Z_0-9]*))\s*=/.test(token)) {
					const varname = token.match(/([a-zA-Z_]([a-zA-Z0-9_]*))/g)[1]
					tokens.push({
						type: "dv",
						v: varname
					})
					state = "for"
				} else if (state.startsWith("for") && ret.test(token) && !/define|(un?)lock/.test(token) && token != "lock" && token != "unlock" && !token.startsWith("if") && !token.startsWith("log") && !token.startsWith("end")) {
					formula.push(token)
					if (i + 1 === tok.length) {
						tokens.push({
							type: "f",
							f: parseIntoFormula(formula)
						})
					}
				} else if (state.startsWith("for") && (!ret.test(token) || /define|(un?)lock/.test(token) || token == "lock" || token == "unlock" || token.startsWith("if") || token.startsWith("log") || token.startsWith("end"))) {
					state = (state.endsWith("if") ? "if" : "")
					tokens.push({
						type: "f",
						f: parseIntoFormula(formula)
					})
					formula = []
					i--
				} else if (state == "" && (token == "lock" || token == "unlock")) {
					const varname = (i < tok.length - 1 ? tok[i + 1] : "")
					tokens.push({
						type: (token.startsWith("un")?"u":"") + "lo",
						v: varname
					})
					i++
				} else if (state == "" && token.startsWith("log")) {
					tokens.push({
						type: "log"
					})
					state = "for"
				} else if (state == "" && token.startsWith("if")) {
					tokens.push({
						type: "if"
					})
					state = "forif"
				} else if (state === "if") {
					if (token.startsWith("end")) {
						tokens.push({
							type: "sou", // source
							f: parseLines(lines)
						})
						state = ""
						lines = []
					} else {
						lines.push(token)
					}
				}
				i++
			}
			return tokens
		}
		const result = parseLines(tok)
		return result
	}
	const result = parser(text, lexer(text))
	if (c) {
		let t = ""
		const variables = {}
		const definedVariables = []
		const lockedVariables = []
		const js = ["var","let","const","try","catch","finally","void","function","if","else","class","extends","true","false","return","yield","time"]
		const variableTypes = {}
		function placeholder(v) {
			let va = v
			while (definedVariables.includes(va) || js.includes(va) || lockedVariables.includes(va)) {
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
						const lt = tokens[i - 1]
						const isstring = lt.type == "st" || (lt.type == "var" && variableTypes[lt.v] == "st")
						if (token.o == "*") {
							if (isstring && ["int","dec"].includes(tokens[i + 1].type)) {
								f += ".repeat(" + tokens[i + 1].v + ")"
								i++
							} else {
								f += token.o
							}
						} else if (token.o == "-") {
							if (isstring && ["int","dec"].includes(tokens[i + 1].type)) {
								f += ".slice(-" + tokens[i + 1].v + ")"
								i++
							} else {
								f += token.o
							}
						} else {
							f += token.o
						}
						break
					case "getti":
						f += "(performance.now()-time)/1000"
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
		const y = result[i+1].f.some(i => i.type === "getti")
		function compileLines(result, isbase) {
			let code = "" + (isbase ? (y ? "const time=performance.now();" : "") : "")
			let i = 0
			while (i < result.length) {
				const t = result[i]
				if (t.type == "dv") {
					const r = compile(result[i+1])
					variableTypes[t.v] = /(("((?:[^"\\]|\\.)*)"|'((?:[^"\\]|\\.)*)')((\.repeat\(\d+\)|\.slice\(-(\d+)\))?)(\+?))*/s.test(r) || r.includes('+""') ? "st" : ""
					code += `${i>0?";":""}let ${placeholder(t.v)}=${r}`
					definedVariables.push(t.v)
				} else if (t.type == "lo") {
					if (!definedVariables.includes(t.v)) {
						throw `CompilerError: The variable "${t.v}" has to be defined in order to be unlocked`
					}
					variables[t.v] = placeholder(t.v)
					code += `${i>0?";":""}const ${placeholder(t.v)}=${t.v}`
					lockedVariables.push(variables[t.v])
				} else if (t.type == "ulo") {
					const success = delete variables[t.v]
					if (!success) {
						throw `CompilerError: The variable "${t.v}" has to be locked in order to be unlocked`
					} 
				} else if (t.type == "log") {
					const r = compile(result[i+1])
					code += `${i>0?";":""}console.log(${r})`
				} else if (t.type == "if") {
					const condition = compile(result[i+1])
					const cache = result[i+2].f.filter(i => i.type !== "f").length
					code += `${i>0?";":""}if(${condition})${cache > 1 ? "{" : ""}${compileLines(result[i+2].f, false)}${cache > 1 ? "}" : ""}`
					i += 2
				}
				i++
			}
			return code
		}
		return compileLines(result, true)
	}
}
