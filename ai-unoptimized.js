// UnnamedAI. I don't know how this would turn out. :/
// Model is Basic 1.0.
const setup = (function(settings = {
	grammar: [],
	personalities: [],
	name: "UnnamedAI"
}) {
	let currentlyasking = ""
	const westernp = settings.personalities.includes("westernp")
	const human_canexperiencep = settings.personalities.includes("human_canexperience")
	const lazyp = settings.personalities.includes("lazy")
	function ra(array) {
		return array[Math.floor(Math.random() * array.length)]
	}
	const regexes = [
		{
			regex: /((hi(ya?)|hello|hey|howdy)(\s*))(there?)((\,)?)(\s*)(my(\s*)?)(((pal|bud(dy?)|man|friend|woman|child|([a-z]*))|\?)?)|(g'day|(good|great|marvellous|awesome)(\s*)day((,\s*)?))|(what's(\s*)shakin('|g)(\s*)my(\s*)(pal|bud(dy?)|man|friend|woman|child|bacon))|((pal|bud(dy?)|man|friend|woman|child|hey|hi|hello|([a-z]*))(,(\s*))?)(what's\s*up|what\s*is\s*up)|(hello|hi|howdy|g'day|hey)(((,?)(\s*)there)?)/i,
			responses: function(name, should) {
				const hellos = westernp ? ["Howdy", "G'day"] : ["Hi", "Hello", "Hey"]
				return ra(hellos) + (Math.random() < 0.5 ? ", " : " ") + (westernp ? ra(["mate", "partner"]) : ((Math.random() < 0.75 || should) && !!name ? " " + name : "")) + (Math.random() < 0.5 ? "." : "!") + " "
			},
			id: "greet0"
		},
		{
			regex: /(how\s*are|how're)\s*you|(how's|how\s*was)\s*((((your|the|this)\s*day))((\s*today)?)|(your\s*day(\s*right\s*(now|this\s*sec(ond?))|\s*this\s*time((\s*today)?))))|(your|the|this)\s*day|(what's\s*going\s*on\s*in\s*(your\s*day|today|before\s*you\s*came)|what's\s*shakin('|g)((\s*today)?))/i,
			responses: function(name) {
				const replys = (function() {
					if (human_canexperiencep) {
						if (lazyp) {
							return ["I had " + ra(["fun", "a good time", "a good day", "a great day", "a fun day"])]
						} else {
							return ["I " + ra(["just had", "had", "experienced", "just experienced"]) + " a" + ra(["n adventure", " trip", " fun adventure", " fun trip"]), "I had a " + ra(["very ", ""]) + ra(["fun ", "great ", "awesome ", "cool "]) + ra(["day", "adventure"])]
						}
					} else {
						if (lazyp) {
							const a = "can't experience, nor " + ra(["can I feel", "have fun", "hang out"])
							return ["I " + ra(["unfortunately ", ""]) + a, ra(["Unfortunately, ", ""]) + "I " + a]
						} else {
							return ["Since " + ra(["I am an AI", "I am just a single JavaScript file", "I am just AI", "I don't feel", "I wasn't made for traveling", "I wasn't made for exploring", "I am just a program"]) + ra(["", ","]) + " I " + ra(["unfortunately ", ""]) + "can't " + ra(["experience the real life world", "travel to any place", "travel anywhere", "experience real life", "really travel anywhere", "go on an adventure"])]
						}
					}
				})()
				return ra(replys) + (Math.random() < 0.5 ? ra(["!", "."]) : (Math.random() < 0.75 && !!name ? (", " + (westernp ? ra(["partner", "mate"]) : name)) : "") + ra(["!", "."])) + " "
			},
			id: "how_are_you"
		},
		{
			regex: /my\s*own\s*name\s*is\s*(\w+)|my\s*name\s*is\s*(\w+)|my\s*name's\s*(\w+)/i,
			responses: function(name) {
				const r = regexes[0].responses(name, true)
				const lowercase = r[0].toLowerCase() + r.slice(1)
				return Math.random() < 0.5 ? ra(["Well, ", "Well "]) + lowercase : r
			},
			id: "recognize_name"
		},
		{
			regex: /what's\s*your\s*name|what\s*is\s*your\s*name|how\s*(should|would)\s*i\s*address\s*you|what\s*should\s*i\s*call\s*you|what\s*is\s*your\s*own\s*name|what's\s*your\s*own\s*name/i,
			responses: function(name) {
				return ra(["My name's ", "My name is ", "Well, my name is ", "Well my name is ", "Well, my name's ", "Well my name's "]) + settings.name + ra(["!", ".", ", " + (westernp ? ra(["mate", "partner", name]) : name) + ra(["!", "."])]) + " "
			},
			id: "whats_your_name"
		},
		{
			regex: /(you're|you\s*are)\s*((actually\s*)?)(((very|so|super)\s*)*)(smart|awesome|helpful|kind|sweet|nice|enjoyable|unique|fun(ny?)|cool|(respect|trust|appreciat(e?))(ful|worthy|able))/i,
			responses: function() {
				return lazyp ? ra(["Thanks!", "Thank you!", "Thank you so much!", "Thank you very much!"]) : (westernp ? ra(["Thanks for the darn ", "Thank you for the darn ", "Thank you for the pretty darn "]) + ra(["good ", "nice ", "appreciable "]) + ra(["compliment", "honor"]) + ra([".", "!", ", " + ra(["mate", "partner"]) + ra([".", "!"])]) : ra(["Thank you!", "Thank you very much!", "Thanks!", "I appreciate the compliment!", "I like the compliment!", "I appreciate your kindness!", "I like your compliment!", "I like your compliment very much!", "Thank you so much!", "I like your compliment so much!", "I'm glad you " + ra(["honor ", "like ", "appreciate "]) + "me!"]) + " " + ra(["Even though I'm not perfect, ", "Even though I have some issues to have fixed, ", "I may not be perfect, but "]) + ra(["I can help you anytime you want!", "I can help you enjoy your day more!", "I can try to support you along the way!", "I can try to improve the more I last!", "I improve almost every day!"])) + " "
			},
			id: "compliment0"
		},
		{
			regex: /do\s*you\s*need\s*(assistance|help)|how\s*(can|should)\s*i\s*(assist|help)\s*you|can\s*i\s*(assist|help)\s*you|do\s*you\s*(want|need)\s*(assistance|help)|do\s*you\s*seek\s*((for\s*)?)(assistance|help)/i,
			responses: function() {
				return ra(["I don't need assistance", "I don't need help", "No, I don't need assistance", "No, I don't need help"]) + ra([".", ", but " + ra(["thank you for asking!", "thanks for asking!", "thank you for asking me!", "thanks for asking me!"])])
			},
			id: "do_you_need_assistance"
		},
		{
			regex: /((let\s*me|lemme)\s*know|(call|warn)\s*me|shout\s*for\s*(assistance|help))\s*(if|when)\s*you\s*((really\s*)?)(need|want|seek((\s*for)?))\s*(assistance|help)|if\s*you\s*((ever\s*)?)((do\s*)?)(want|need|have\s*to\s*call\s*for)\s*(help|assistance)/i,
			responses: function(name) {
				return ra(["Okay", "I know when to let you know for " + ra(["help", "assistance"]), "Got it", "I know when I need you", "I know when to ask for help", "Alright", "Thanks for knowing to help me when I need you" + " " + ra(["for anything", "for something" + ra([" important", " problematic", ""])])]) + (!!name ? ra([", " + (westernp ? ra(["partner", "mate"]) : name), ""]) : "") + ra([".", "!"])
			},
			id: "let_me_know_when_you_need_assistance"
		}
	].filter(item => !settings.personalities.some(i => typeof i === "object" && !Array.isArray(i) && !!i && i.id === item.id && i.type === "exc_response_id"))
	const information = {
		username: undefined
	}
	return {
		respond: function(response) {
			let ai = ""
			// detect name sentences
			const canName = !settings.personalities.some(i => typeof i === "object" && !Array.isArray(i) && !!i && i.id === "recognize_name" && i.type === "exc_response_id")
			if (canName) {
				response.replace(/my\s*own\s*name\s*is\s*(\w+)|my\s*name\s*is\s*(\w+)|my\s*name's\s*(\w+)/i, function(_, ...a) {
					information.username = a.find(item => !!item)
				})
			}
			let greeted = false
			for (const item of regexes) {
				const a = item.responses(information.username).replace(/(,?)(\s*)\./g, ".").replace(/(,?)(\s*)\!/g, "!").replace(/  /g, " ")
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
			}
			ai = ai.trim()
			if (ai === "") {
				return ra(["I couldn't understand that.", "Sorry, I couldn't catch that.", "Try breaking whatever you said in other sentences. Maybe that would help.", "I can't understand you yet. Try rewriting the sentences, that usually helps."])
			}
			return ai
		},
		model: "Basic 1.0"
	}
})
