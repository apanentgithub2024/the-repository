const run = function(text, c = true) {
	const ret = /"((?:[^"\\]|\\.)*)"|'((?:[^"\\]|\\.)*)'|\d+|\d*\.(\d*)|\s*([\+\-\*\^]|and|or|xor|not|nand|nor|xnor|==|\^=)\s*|([a-zA-Z_][a-zA-Z_0-9]*)/
	const rete = /"((?:[^"\\]|\\.)*)"|'((?:[^"\\]|\\.)*)'|\d+|\d*\.(\d*)|\s*([\+\-\*\^]|and|or|xor|not|nand|nor|xnor|==|\^=)\s*/
	const keys = /(define)\s+([a-zA-Z_]([a-zA-Z_0-9]*))\s*=\s*|(delete)\s+([a-zA-Z_]([a-zA-Z_0-9]*))/
	const tokensRe = new RegExp(keys.source + "|" + ret.source + "|=", "gs")
	function lexer(c) {
		return c.match(tokensRe)
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
					} else if (/([a-zA-Z_]([a-zA-Z_0-9]*))/.test(token)) {
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
			if (state === "" && /define\s+([a-zA-Z_]([a-zA-Z_0-9]*))\s*=/.test(token)) {
				const varname = token.match(/([a-zA-Z_]([a-zA-Z0-9_]*))/g)[1]
				tokens.push({
					type: "dv",
					v: varname
				})
				state = "for"
			} else if (state == "for" && rete.test(token)) {
				formula.push(token)
				if (i + 1 === tok.length) {
					tokens.push({
						type: "f",
						f: parseIntoFormula(formula)
					})
				}
			} else if (state == "for" && !rete.test(token)) {
				state = ""
				tokens.push({
					type: "f",
					f: parseIntoFormula(formula)
				})
				formula = []
				i--
			}
			i++
		}
		return tokens
	}
	const result = parser(text, lexer(text))
	if (c) {
		let code = "";
		let t = ""
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
						f += {"and":"&&","or":"||","xor":"^","ot":"","xnor":"^"}[token.b.replace(/^n/, "")]
						if (token.b.startsWith("n")) {
							f = "!(" + f + ")"
						} else if (token.b == "xnor" || token.b === "xor") {
							f = "Boolean(" + f + ")"
						}
						if (token.b == "xnor") {
							f = "!(" + f + ")"
						}
						break
					case "var":
						f += token.v
						break
					case "ari":
						if (token.o == "*") {
							if (tokens[i - 1].type == "st" && ["int","dec"].includes(tokens[i + 1].type)) {
								f += ".repeat(" + tokens[i + 1].v + ")"
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
				i++
			}
			return f
		}
		for (let i = 0; i < result.length; i++) {
			const t = result[i]
			if (t.type == "dv") {
				code += `${code.length>0?";":""}let ${t.v}=${compile(result[i+1])}`
			}
		}
		return code
	}
}
