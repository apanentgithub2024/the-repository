// Writerbot
const writestory = (function(js) {
	const malenames = ["Anthony", "Antony", "Aaron", "Arco", "Acroah", "Arcoah", "Arthur", "Ben", "Bob", "Bobby", "Billy", "Bradley", "Brock", "Barney", "Bruce", "Bratt", "Bruno", "Boris", "Connor", "Cooper", "Carl", "Carlo", "Dwayne", "Drake", "Derick", "Darwin", "Darr", "Dan", "Diego", "Erick", "Ethan", "Eric", "Eron", "Elmore", "Elnor", "Freddy", "Fred", "Frank", "Fond", "Finn", "Foir", "Garrett", "Harriot", "Harold", "Harry", "Harroh", "Hong", "Ichabod", "Iggy", "Jake", "Jack", "Jon", "Johnny", "John", "Jared", "Jarn", "Leland", "Loran", "Lared", "Liam", "Manny", "Mone", "Nobi", "Nobita", "Orion", "Oran", "Periwinkle", "Peri", "Pern", "Quinn", "Rory", "Rick", "Rohnny", "Riddan", "Riddy", "Sam", "Sammy", "Sidney", "Sid", "Sonn", "Von", "Wyatt", "Waro", "Yuri", "Yoddy", "Zach", "Zachary"]
	const femalenames = ["Annie", "Anna", "Brianna", "Britannica", "Bella", "Crystal", "Carlie", "Carol", "Carolina", "Caroline", "Daniel", "Dora", "Dona", "Elly", "Fionna", "Frizzle", "Fonda", "Floria", "Gabriel", "Gonda", "Honnah", "Hannah", "Hora", "Jade", "Jill", "Jane", "Lily", "Lilliana", "Lia", "Lira", "Mona", "Monie", "Rana", "Raini", "Rainie", "Sora", "Sona", "Tina", "Traini", "Valerie", "Vanessa"]
	const nonbinarynames = ["Florian", "Hern"]
	const msg = `WARNING: This story is only meant for education purposes! This means you shouldn't take any notes from this story, nor learn anything from this story!
If you are reading this message, you can proceed into the story and begin reading it.\n\n`
	const database = {
		characters: [
			{
				name: "Shopkeeper",
				description: [
					{
						trait: "owns_item",
						params: {
							items: ["donut", "bow", "doll", "security camera", "basic camera", "knife", "chainsaw", "axe", "conga", "apple", "banana", "orange", "carrot", "bottled water", "salt", "pepper"]
						}
					},
					{
						trait: "lets_borrow_item",
						params: {
							characters: "any",
							items: "any"
						}
					}
				],
				locations: /|/g
			},
			{
				name: "Barack Obama",
				description: ["President of United States", "Saved the laws of United States"],
				locations: /\b(us|united states)\b/g
			},
			{
				name: "Donald Trump",
				description: ["President of United States", "Bullies Barack Obama", "Bullies Joe Biden"],
				locations: /\b(us|united states)\b/g
			},
			{
				name: "Joe Biden"
			}
		]
	}
})
