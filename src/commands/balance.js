const { getUser } = require('../service/user.service');
const { tokenName } = require('../../config.json');

module.exports = {
	name: 'balance',
	description: 'Check user\'s token balance',
	execute: async function(message, args) {
    const user = await getUser(message.author);
    message.channel.send(`${message.author}, you have ${user.tokens} ${tokenName}.`);
	},
};