const { getBoxScoreMessage, getLeaders } = require('../service/boxscore.service');

module.exports = {
	name: 'boxscore',
	description: 'Shows boxscore stats',
	execute: async function(message, args) {
		if (args.length === 0) {
      message.channel.send(getBoxScoreMessage('default'));
    }
    else {
      switch(args[0]) {
        case 'extra':
          message.channel.send(getBoxScoreMessage('extra'));
          break;
        case 'extended':
        case 'full':
          message.channel.send(getBoxScoreMessage('extended'));
          break;
        case 'help':
        case 'options':
          message.channel.send(getHelpMessage());
          break;
        case 'leaders':
        case 'leader':
          message.channel.send(getLeaders());
          break;
        default:
          let response = getBoxScoreMessage(args);
          if (response !== '')
            message.channel.send(response);
      }
    }
	},
};

function getHelpMessage() {
  return 'HELP';
}