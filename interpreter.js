// JavaPlus: A new superset for JavaScript. This is unfinished, though.
function superset(code) {
	const array = /((const|let|var)\s+[a-zA-Z$_][a-zA-Z$_0-9]*\s*\=)?((#|l\-|f\-)?)(\[((('[^']*')|("[^"]*")|(`[^`]*`)|\d+([eE]\d+?)(\.\d+?)|null|undefined|\/\*([^\*]*)\*\/),\s*)*(('[^']*')|("[^"]*")|(`[^`]*`)|\d+([eE]\d+?)(\.\d+?)|null|undefined|\/\*([^\*]*)\*\/)\])|\[\])/g
	let c = code.replace(array, function(match, _, _2, spec) {
		if (spec === "#") {
			return match + ".length"
		} else if (spec === "l-") {
			return match + `[${"(" + match + ")"}.length - 1]`
		} else if (spec === "f-") {
			return match + `[0]`
		}
		return match
	})
	return c
}
