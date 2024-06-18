// JavaPlus: A new superset for JavaScript. This is unfinished, though.
function superset(code) {
	function special(spec, matchnospec) {
		if (spec === "#") {
			return matchnospec + ".length"
		} else if (spec === "l") {
			return matchnospec + `[${"(" + mattCH + ")"}.length - 1]`
		} else if (spec === "f") {
			return matchnospec + `[0]`
		}
	}
	const array = /((#|l|f)?)(\[((('[^']*')|("[^"]*")|(`[^`]*`)|\d+([eE]\d+?)(\.\d+?)|null|undefined|\/\*([^\*]*)\*\/),\s*)*(('[^']*')|("[^"]*")|(`[^`]*`)|\d+([eE]\d+?)(\.\d+?)|null|undefined|\/\*([^\*]*)\*\/)\])|\[\]|\[(('[^']*')|("[^"]*")|(`[^`]*`)|\d+([eE]\d+?)(\.\d+?)|null|undefined|\/\*([^\*]*)\*\/)\]/g
	let c = code.replace(array, function(match, spec) {
		const matchnospec = match.replace(/^(#|l|f)/g, "")
		return special(spec, matchnospec) || match
	})
	const variable = /((#|l|f)?)(?<!")(?<!')(?<!`)([a-zA-Z$_][a-zA-Z$_0-9]*)([^"'`]?)/g
	c = code.replace(variable, function(match, spec, _, _, _, _, varname) {
		const a = "const,let,var,void,function,try,catch,finally,class,extends,default,case,switch,export,import".split(",")
		if (!a.includes(varname)) {
			return special(spec, varname) || match
		}
		return match
	})
	return c
}
