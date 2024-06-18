// UnnamedAI. I don't know how this would turn out. :/
const setup = (function(settings = {
	grammar: [],
	personalities: [],
	name: "UnnamedAI"
}) {
	function ra(array) {
		return array[Math.floor(Math.random() * array.length)]
	}
	const regexes = [
		{
			regex: /((hi(ya?)|hello|hey|howdy)(\s*))(there?)((\,)?)(\s*)(my(\s*)?)(((pal|bud(dy?)|man|friend|woman|child|([a-z]*))|\?)?)|(g'day|(good|great|marvellous|awesome)(\s*)day((,\s*)?))|(what's(\s*)shakin('|g)(\s*)my(\s*)(pal|bud(dy?)|man|friend|woman|child|bacon))|((pal|bud(dy?)|man|friend|woman|child|hey|hi|hello|([a-z]*))(,(\s*))?)(what's\s*up|what\s*is\s*up)|(hello|hi|howdy|g'day|hey)(((,?)(\s*)there)?)/i,
			responses: function(name) {
				const hellos = (function() {
					if (settings.personalities.includes("western")) {
						return ["Howdy", "G'day"]
					} else {
						return ["Hi", "Hello", "Hey"]
					}
				})()
				return ra(hellos) + (Math.random() < 0.5 ? ", " : " ") + (settings.personalities.includes("western") ? ra(["mate", "partner"]) : (Math.random() < 0.75 && !!name ? " " + name : "")) + (Math.random() < 0.5 ? "." : "!") + " "
			},
			id: "greet0"
		},
		{
			regex: /(how\s*are|how're)\s*you|(how's|how\s*was)\s*((((your|the|this)\s*day))((\s*today)?)|(your\s*day(\s*right\s*(now|this\s*sec(ond?))|\s*this\s*time((\s*today)?))))|(your|the|this)\s*day/i,
			responses: function(name) {
				const replys = (function() {
					if (settings.personalities.includes("human_canexperience")) {
						if (settings.personalities.includes("lazy")) {
							return ["I had " + ra(["fun", "a good time", "a good day", "a great day", "a fun day"])]
						} else {
							return ["I " + ra(["just had", "had", "experienced", "just experienced"]) + " a" + ra(["n adventure", " trip", " fun adventure", " fun trip"]), "I had a " + ra(["very ", ""]) + ra(["fun ", "great ", "awesome ", "cool "]) + ra(["day", "adventure"])]
						}
					} else {
						if (settings.personalities.includes("lazy")) {
							const a = "can't experience, nor " + ra(["can I feel", "have fun", "hang out"])
							return ["I " + ra(["unfortunately ", ""]) + a, ra(["Unfortanetly, ", ""]) + "I " + a]
						} else {
							return ["Since " + ra(["I am an AI", "I am just a single JavaScript file", "I am just AI", "I don't feel", "I wasn't made for traveling", "I wasn't made for exploring", "I am just a program"]) + ra(["", ","]) + " I " + ra(["unfortunately ", ""]) + "can't " + ra(["experience the real life world", "travel to any place", "travel anywhere", "experience real life", "really travel anywhere", "go on an adventure"])]
						}
					}
				})()
				return ra(replys) + (Math.random() < 0.5 ? ra(["!", "."]) : (Math.random() < 0.75 && !!name ? (", " + (settings.personalities.includes("western") ? ra(["partner", "mate"]) : name)) : "") + ra(["!", "."])) + " "
			},
			id: "how_are_you"
		},
		{
			regex: /my\s*name\s*is\s*(\w+)|my\s*name's\s*(\w+)|my\s*own\s*name\s*is\s*(\w+)/i,
			responses: function(name) {
				const r = regexes[0].responses(name)
				const lowercase = r[0].toLowerCase() + r.slice(1)
				return Math.random() < 0.5 ? ra(["Well, ", "Well "]) + lowercase : r
			},
			id: "recognize_name"
		},
		{
			regex: /what's\s*your\s*name|what\s*is\s*your\s*name|how\s*(should|would)\s*i\s*address\s*you|what\s*should\s*i\s*call\s*you/,
			responses: function(name) {
				return ra(["My name's ", "My name is ", "Well, my name is ", "Well my name is ", "Well, my name's ", "Well my name's "]) + settings.name + ra(["!", ".", ", " + (settings.personalities.includes("western") ? ra(["mate", "partner", name]) : name) + ra(["!", "."])])
			},
			id: "whats_your_name"
		}
	].filter(item => !settings.personalities.some(i => i.id === item.id && i.type === "exc_response_id"))
	const information = {
		username: ""
	}
	return {
		respond: function(response) {
			let ai = ""
			// detect name sentences
			const canName = !settings.personalities.some(i => i.id === "recognize_name" && i.type === "exc_response_id")
			if (canName) {
				response.replace(/my\s*name\s*is\s*(\w+)|my\s*name's\s*(\w+)|my\s*own\s*name\s*is\s*(\w+)/i, function(_, name) {
					information.username = name
				})
			}
			let greeted = false
			regexes.forEach(function(item) {
				const a = item.responses(information.username).replace(/(,| )(\.|\!)/g, "$2").replace(/,\./g, ".").replace(/  /g, " ")
				if (item.regex.test(response)) {
					if (item.id.startsWith("greet")) {
						if (greeted === false) {
							ai += a
							greeted = true
						}
					} else {
						ai += a
					}
				}
			})
			ai = ai.trim()
			if (ai === "") {
				return ra(["I couldn't understand that.", "Sorry, I couldn't catch that.", "Try breaking whatever you said in other sentences. Maybe that would help.", "I can't understand you yet. Try rewriting the sentences, that usually helps."])
			}
			return ai
		}
	}
})
