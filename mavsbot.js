const fs = require('fs');
const Discord = require('discord.js');
const { prefix, token } = require('./config.json');
const db = require('./src/database');
const client = new Discord.Client();
const daily = require('./src/service/dailyInfo.service');
const teams = require('./src/service/teams.service');
const schedule = require('./src/service/schedule.service');
const bets = require('./src/service/betting.service');
const boxscore = require('./src/service/boxscore.service');
require('./src/service/cron.service');

// Load command files
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./src/commands/${file}`);
	client.commands.set(command.name, command);
}

// On bot startup
client.on('ready', async () => {
	console.log(`Logged into Discord as ${client.user.tag}!`);
	global.client = client;

	// Check database connection and sync models
	try {
		await db.authenticate();
		console.log('Database connection successful');
		await db.sync({ force: false });
		console.log('Database models synced');
	} catch (error) {
		console.error('Database error: ', error);
		process.exit(0);
	}

	// Grab and store essential NBA info for bot to function correctly
	await daily.setDailyInfo();
	await teams.updateTeams();
	await schedule.updateSchedule();
	const games = schedule.getRelevantGameInfo();
	let nextGame = await boxscore.getMiniBoxscore(games.next.id, games.next.date);
	if (nextGame.statusNum === 2) {
		console.log('A game is playing right now! Updating variables as needed');
    await schedule.markGameAsPlayed(nextGame.gameId);
		await schedule.updateRelevantGameInfo();
		schedule.setIsGameActive(true);
	}
	boxscore.getBoxscore(games.last.id, games.last.date);
	bets.resetBettingLine();
	bets.payoutAllBets();
	console.log(`\nBot is now fully operational`);
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

client.login(token);