const { getNextGameMessage } = require('../service/schedule.service');

module.exports = {
	name: 'nextgame',
	description: 'Shows the next game for home team',
	execute: function(message, args) {
		getNextGameMessage().then(msg => message.channel.send(msg));
	},
};