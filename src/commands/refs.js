const { getRefsMessage } = require('../service/boxscore.service');

module.exports = {
	name: 'refs',
	description: 'Get refs for the last/current game',
	execute: async function(message, args) {
    message.channel.send(getRefsMessage());
	},
};