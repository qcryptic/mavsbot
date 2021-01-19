const fs = require('fs');
const Discord = require('discord.js');
const { prefix, token } = require('./config.json');
const db = require('./src/database');
const client = new Discord.Client();
const daily = require('./src/service/dailyInfo.service');
const teams = require('./src/service/teams.service');

// Load command files
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./src/commands/${file}`);
	client.commands.set(command.name, command);
}

// On bot startup
client.on('ready', () => {
  console.log(`Logged into Discord as ${client.user.tag}!`);
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
			message.reply('Error trying to execute that command!');
		}
	}
});

// Startup sequence: Start database => sync models => log into bot
(async () => {
    try {
			await db.authenticate();
			console.log('Database connection successful');
			await db.sync({ logging: false, force: true });
			console.log('Database models synced');
		} catch (error) {
			console.error('Database error: ', error);
			process.exit(0);
		}

		await daily.setDailyInfo();
		await teams.updateTeams();

		client.login(token);
})();