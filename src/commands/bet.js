const { tokenName, bettingChannel } = require('../../config.json');
const bettingSvc = require('../service/betting.service');
const { getUser } = require('../service/user.service');

module.exports = {
	name: 'bet',
	description: 'See betting odds, or place a bet',
	execute: function(message, args) {
		if (message.channel.id !== bettingChannel) {
			message.channel.send(`${message.author} Betting commands only available in <#${bettingChannel}>`);
		}
		else if (args[0] && (args[0] === 'log' || args[0] === 'open' || args[0] === 'history')) {
			sendPlacedBets(message);
		}
		else if (bettingSvc.areBetsOpen()) {
			if (args[0] === 'odds' || args[0] === 'line') 
				message.channel.send(bettingSvc.getBettingLineEmbed());
			else if ((args[0] === 'win' || args[0] === 'lose') && args.length === 2 && /^\d+$/.test(args[1])) 
				createBet(message, args);
			else 
				showCommandOptions(message);
		}
		else {
			message.channel.send('No bet is currently running. The tables open 1 hour before game time and close at game start.');
		}
	},
};

function showCommandOptions(message) {
	message.channel.send(`${message.author}, please use **!bet odds** to see odds or **!bet <win|lose> <amount>** to place a bet`);
}

function sendPlacedBets(message) {
	message.channel.send('Not implemented yet - Will show your currently open bets')
}

async function createBet(message, args) {
	const user = await getUser(message.author);
	if (user.tokens >= args[1]) {
		showBetConfirmation(message, args);
	}
	else {
		message.channel.send(`${message.author} you do not have enough ${tokenName}, you have ${user.tokens}.`);
	}
}

function showBetConfirmation(message, args) {
	let payout = bettingSvc.calculatePayout(args[0], args[1]);
	let line = bettingSvc.getBettingLine();
	let response = 
		`${message.author} Betting ${args[1]} ${tokenName}\n` + 
		`WAGER: ${line.team} ${args[0].toUpperCase()} against ${line.opponent}\n` + 
		`PAYOUT: ${payout} ${tokenName}\n` + 
		`STATUS: *pending - confirm by reaction*`;
	message.channel
		.send(response)
		.then((sentMsg) =>  {
			sentMsg.react('✅').then(() => sentMsg.react('❌'));
			let filter = (react, user) => { return user.id === message.author.id };
			sentMsg.awaitReactions(filter, { max: 1, time: 30000 })
				.then(collected => {
					if (collected.first().emoji.name === '✅') {
						bettingSvc.placeBet(message.author.id, args[0], args[1]);
						sentMsg.edit(response.replace('*pending - confirm by reaction*', '**CONFIRMED**')); 
					}
					else 
						sentMsg.edit(response.replace('*pending - confirm by reaction*', '**CANCELLED**'));
					sentMsg.reactions.removeAll();
				})
				.catch(() => {
					sentMsg.edit(response.replace('*pending - confirm by reaction*', '**CANCELLED** *- timed out*'));
					sentMsg.reactions.removeAll();
				});
		})
}