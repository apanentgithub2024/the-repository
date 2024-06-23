(function() {
	const _exec = function(code) {
		try {
			eval(code)
			return true
		} catch {
			return false
		}
	}
	const originString = String
	const originNumber = Number
	const windowE = _exec("window")
	const variableExists = function(varname) {
		return /^[^a-zA-Z_$][^a-zA-Z_$0-9]*$/.test(varname) ? (function(){
			throw new Error("The variable's identifier must be compatible with JavaScript's initial variable letterset! Run WebTech.javaScript.getInfo().varCharSet_help for more info.")
		}()) : (windowE ? Object.prototype.hasOwnProperty.call(window, varname) || _exec(varname) : false)
	}
	const _timers = []

	class Timer {
		#whenstarted = Date.now();
		#endTime = Infinity;
		constructor(end) {
			this.endTime = originNumber(end)
			function tick() {
				const t = Date.now() - this.whenstarted
				const c = t > this.endTime
				this.continuing = !c
				this.progress = t
				for (const func of this.onTick) {
					func(t, c)
				}
				if (c) {
					requestAnimationFrame(tick)
				} else {
					for (const func of this.onEnd) {
						func()
					}
				}
			}
			tick()
		}
		#onTick = [];
		#onEnd = [];
		_getTimers() {
			return _timers
		}
		continuing = true;
		progress = 0;
		connectOnEnd(func) {
			if (typeof func == "function") {
				this.onEnd.push(func)
			} else {
				console.warn("You must connect only a function to the onEnd event.")
			}
		}
		connectOnTick(func) {
			if (typeof func == "function") {
				this.onTick.push(func)
			} else {
				console.warn("You must connect only a function to the onTick event.")
			}
		}
		end() {
			this.endTime = 0
		}
	}
	const json = {
		javaScript: {
			getInfo: function() {
				return {
					varCharSet: {
						init: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$",
						notInit: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_$",
						regexSource: "[a-zA-Z_$][a-zA-Z_$0-9]*",
						regex: /[a-zA-Z_$][a-zA-Z_$0-9]*/
					},
					varCharSet_help: "In JavaScript, a number can't be the initializer for any variable. This means you can't define a variable that starts with a number, in other terms. So, if you want to define a variable, then you must have the initial letter of the identifier be any character that is not a number."
				}
			},
			variableExists: variableExists
		},
		timers: {
			startTimer: function(end) {
				const t = new Timer(end)
				_timers.push(t)
				return t
			},
			_timerClass: Timer
		},
		version: "1.0"
	}

	// We must submit the module to the module Object, but does it exist necessarily? (Are we running in a local, Node.js, or a browser environment?)
	if (variableExists("module")) {
		if (typeof module == "object" && !Array.isArray(module) && String(module) == "[object Object]") { // Node.js
			json.environment = variableExists("exports") ? "Node" : windowE ? "Browser" : "Local"
			module.exports = json
		} else {
			json.environment = "Browser"
		}
	} else {
		json.environment = "Browser"
	}

	if (json.environment == "Browser") {
		window.WebTech = json
	}
})()
