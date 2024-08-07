const generateCustomRegex = (function(reg) {
	// DICTIONARY: parse = parsed token
	const syntax = /:([sS])/
	const literals = /[^:]|::/
	function tokenize(text) {
		return text.match(new RegExp([syntax, literals].map(regex => regex.source).join("|"), "g"))
	}
	function parse(tokens) {
		return tokens.map(function(token) {
			if (/:[^:]/.test(token)) {
				return {type: "spec", detect: token[1]}
			} else {
				return {type: "lite", detect: token[0]} // reminds me of binary.
			}
		})
	}
	// idk why I chose "parses" for the argument name, but it's there
	function interpret(parses, text, isGlobal = false) {
		const target = text.split("")
		let i = 0, // This is so in my code, I can modify this even though it's used in a for loop
		gotRight = 0, // The amount of times each parse meets the rule of each letter when detecting a target.
		targetMatched = "", // The target that will be matched if the conditions are met
		targetsMatched = [] // Selp-explainatory. See the text above ^^^^^^^^^^^^^^^^^^^
		for (; i < target.length; i++) {
			const parse = parses[gotRight]
				switch (parse.type) { // performance reasons
					case "lite":
						if (target[i] === parse.detect) {
							gotRight++;targetMatched += target[i]
						} else {gotRight = 0;targetMatched = ""}
						break
					case "spec":
						switch (parse.detect.toLowerCase()) { // Another switch detection??
							case "s":
								let condition = [" ", "\t", "\n", "\r"].includes(target[i])
								condition = parse.detect == "S" ? !condition : condition
								if (condition) {
									gotRight++;targetMatched += target[i]
								} else {gotRight = 0;targetMatched = ""}
								break
						}
				}
			if (gotRight == parses.length) {
				if (isGlobal) {
					targetsMatched.push(targetMatched)
					gotRight = 0
					targetMatched = ""
				} else {
					return targetMatched
				}
			}
		}
		return isGlobal ? targetsMatched : null
	}
	return {
		match: function(text, isGlobal) {
			return interpret(parse(tokenize(reg)), text, isGlobal)
		}
	}
})
