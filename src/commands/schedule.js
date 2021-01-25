const { findNextGame } = require('../service/schedule.service');
const colors = require('../enum/teamColors');
const Discord = require('discord.js');
const { resourceUrl } = require('../../config.json');
const moment = require('moment');

module.exports = {
	name: 'schedule',
	description: 'Shows the next 10 games in the schedule',
	execute: async function(message, args) {
		const games = await findNextGame(10);
		if (games.length === 0) {
			message.channel.send('No future games found for this season...');
		}
		else {
			message.channel.send(buildScheduleEmbed(games));
		}
	},
};

function buildScheduleEmbed(games) {
	let gameList = '';
	const tz = moment.tz(moment.tz.guess()).zoneAbbr();
	games.forEach(game => {
		let time = moment(game.startTimeUTC);
		let timeString = (time.diff(moment(), 'days') > 5) ? time.format('lll') : time.calendar();
		gameList += `**${global.team.code} ${(game.isHome) ? 'vs' : 'at'} ${game['team.code']}** ${timeString}\n`
	});

	return new Discord.MessageEmbed()
		.setColor(colors[global.team.code])
		.setAuthor(`${global.team.name} ${(games.length < 10) ? 'Remaining' : 'Next'} ${games.length} ${(games.length === 1) ? 'Game' : 'Games'}:`, null, null)
		.setThumbnail(`${resourceUrl}teams/${global.team.code}.png`)
		.setDescription(gameList)
		.setFooter(`All times listed in ${tz}`)
}