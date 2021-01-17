const fs = require('fs');
const Discord = require('discord.js');
const {prefix, token} = require('./config.json');
const client = new Discord.Client();

// Load command files
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./src/commands/${file}`);
	client.commands.set(command.name, command);
}

// On bot startup
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

// On message recieved
client.on('message', message => {
	if (!message.content.startsWith(prefix) || message.author.bot) 
		return;
	
	const args = message.content.slice(prefix.length).trim().split(/ +/);
	const command = args.shift().toLowerCase();

	if (client.commands.has(command)) {
		try {
			client.commands.get(command).execute(message, args);
		} catch (error) {
			console.error(error);
			message.reply('there was an error trying to execute that command!');
		}
	}
});

// Start bot
client.login(token);