const cron = require('node-cron');
const schedule = require('./schedule.service');
const teams = require('./teams.service');
const betting = require('./betting.service');
const message = require('./message.service');
const dailyInfo = require('./dailyInfo.service');
const boxscore = require('./boxscore.service');
const Discord = require('discord.js');
const colors = require('../enum/teamColors');
const { resourceUrl } = require('../../config.json');
const moment = require('moment');

// Every 1 minute
cron.schedule('* * * * *', async function() {
  if (!schedule.getIsGameActive()) 
    return; 
  
  const { id, date } = schedule.getRelevantGameInfo().last;
  const game = await boxscore.getBoxscore(id, date);
  /*
    - Check status of game 
    - Check if quarter has ended (reset flag for points, send notification(s))
  */
  if (game.info.endTimeUTC) { // Game has ended
    console.log('game ended')
    schedule.setIsGameActive(false);
    betting.payoutAllBets();
  }
});

// Every 15 minutes
cron.schedule('*/15 * * * *', async function() {
  if (!schedule.getRelevantGameInfo().next) 
    return;

  // Get next game info
  let game = schedule.getRelevantGameInfo().next;
  let gameInfo = await boxscore.getMiniBoxscore(game.id, game.date);
  let gameTime = moment(gameInfo.startTimeUTC);

  // Game time was changed
  if (game.time.getTime() !== gameTime.valueOf()) {
    message.sendMainChannel(`The **${global.team.code} ${game.type} ${game.opp}** game time has changed!`);
    await schedule.updateSchedule();
    message.sendMainChannel(schedule.getNextGameMessage());
    game = schedule.getRelevantGameInfo().next;
    gameInfo = await boxscore.getMiniBoxscore(game.id, game.date);
    gameTime = moment(gameInfo.startTimeUTC);
  }

  // Game got cancelled or postponed
  if (gameInfo.extendedStatusNum !== 0) {
    message.sendMainChannel(`The **${global.team.code} ${game.type} ${game.opp}** game has been cancelled or postponed!`);
    await schedule.updateSchedule();
    message.sendMainChannel(schedule.getNextGameMessage());
    if (betting.areBetsOpen()) {
      message.sendBettingChannel("**All open bets have been refunded due to the game being cancelled/postponed!**");
      betting.resetBettingLine();
      betting.payoutAllBets();
    }
    game = schedule.getRelevantGameInfo().next;
    gameInfo = await boxscore.getMiniBoxscore(game.id, game.date);
    gameTime = moment(gameInfo.startTimeUTC);
  }

  sendGameNotification(gameInfo);

  // Send betting and game notifications (betting opens 1 hour before games)
  const minutesToGame = gameTime.diff(moment(), 'minutes');
  if (minutesToGame <= 0 && minutesToGame > -5) {
    sendGameNotification(gameInfo);
    if (betting.areBetsOpen()) {
      betting.resetBettingLine();
      message.sendBettingChannel("**The tables are now closed, good luck!**");
    }
    await schedule.markGameAsPlayed(game.id);
    await schedule.updateRelevantGameInfo();
    schedule.setIsGameActive(true);
  }
  else if (minutesToGame <= 60 && minutesToGame >= 5) {
    updateBettingOdds();
  }
});

// Every 4 hours
cron.schedule('5 */4 * * *', async function() {
  await dailyInfo.setDailyInfo();
  await schedule.updateSchedule();
});

// Every day at 3:10AM
cron.schedule('10 3 * * *', function() {
  teams.updateTeams();
  betting.payoutAllBets(); // method cleans up any potential missed betting payouts/refunds
});

async function updateBettingOdds() {
  let s = (betting.areBetsOpen()) ? 'Betting Line Updated!' : 'Bets Are Now Open!';
  await betting.updateBettingLine().catch(err => {console.log(err)});
  let embed = betting.getBettingLineEmbed(s);
  message.sendBettingChannel(embed);
}

function sendGameNotification(data) {
  let series = '';
  const { seriesWin, seriesLoss, triCode } = data.hTeam;
  if (seriesWin === "") 
    series = 'Season series tied 0-0';
  else if (seriesWin > seriesLoss) 
    series = `${triCode} leads season series ${seriesWin}-${seriesLoss}`;
  else if (seriesWin === seriesLoss)
    series = `Season series tied ${seriesWin}-${seriesLoss}s`;
  else 
    series = `${data.vTeam.triCode} leads series ${seriesLoss}-${seriesWin}`;
  message.sendGameNotification(
    new Discord.MessageEmbed()
      .setColor(colors[global.team.code])
      .setAuthor(`${global.team.name} Game Starting Now!`, null, null)
      .setDescription(
        `${data.hTeam.triCode} (${data.hTeam.win}-${data.hTeam.loss}) vs. ${data.vTeam.triCode} (${data.vTeam.win}-${data.vTeam.loss})\n` + 
        `${data.arena.name}, ${data.arena.city} ${data.arena.stateAbbr}\n` + 
        series
      )
      .setThumbnail(`${resourceUrl}matchups/${data[data.opp].triCode}.png`)
      .setFooter(`React to be removed/added from game notifications`)
  );
}