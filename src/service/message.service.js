const { mainChannel, bettingChannel, notificationRole, serverId } = require('../../config.json');

module.exports = {
  sendMainChannel: function(msg) {
    global.client.channels.cache.get(mainChannel).send(msg);
  },

  sendBettingChannel: function(msg) {
    global.client.channels.cache.get(bettingChannel).send(msg);
  },

  sendGameNotification: function(msg) {
    global.client.channels.cache.get(mainChannel)
      .send(msg)
      .then((sentMsg) => {
        const guild = sentMsg.guild;
        const role = guild.roles.cache.get(notificationRole);
        sentMsg.react('✅').then(() => sentMsg.react('❌'));
        let filter = (react, user) => { return react.emoji.name === '✅' || react.emoji.name === '❌' };
        sentMsg.awaitReactions(filter, { time: 120000 })
          .then(collected => {
            collected.each(item => {
              let userList = item.users.cache
                .filter((userEntry) => { return userEntry.id !== sentMsg.author.id })
                .map((userEntry) => userEntry.id);
              userList.forEach(user => {
                if (item.emoji.name === '✅')
                  guild.members.cache.get(user).roles.add(role);
                else if (item.emoji.name === '❌')
                  guild.members.cache.get(user).roles.remove(role);
              });
            });
            sentMsg.reactions.removeAll();
            sentMsg.edit(msg.setFooter(''));
          })
          .catch(() => {
            sentMsg.reactions.removeAll();
            sentMsg.edit(msg.setFooter(''));
          });
      });
  }
}