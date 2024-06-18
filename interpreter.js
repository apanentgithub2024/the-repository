// JavaPlus: A new superset for JavaScript. This is unfinished, though.
function superset(code) {
	const array = /(#|l\-|f\-)?(\[((('[^']*')|("[^"]*")|(`[^`]*`)|\d+([eE]\d+?)(\.\d+?)|null|undefined|\/\*([^\*]*)\*\/),\s*)*(('[^']*')|("[^"]*")|(`[^`]*`)|\d+([eE]\d+?)(\.\d+?)|null|undefined|\/\*([^\*]*)\*\/)\]|((?!let)(?!const)(?!var)(?!void)(?!function)[a-zA-Z$]([a-zA-Z0-9$]*)|\[\])/g
	let c = code.replace(array, function(match, spec) {
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
