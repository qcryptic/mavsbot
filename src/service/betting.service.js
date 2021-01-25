const { bettingOdds } = require('../enum/endpoints');
const axios = require('axios');
const db = require('../database').models;
const colors = require('../enum/teamColors');
const { prefix, resourceUrl } = require('../../config.json');
const Discord = require('discord.js');
const schedule = require('./schedule.service');
const boxscore = require('./boxscore.service');
const message = require('./message.service');

var bettingLine = { team: '', opponent: '', win: 1, lose: 1, gameId: '', date: '' };
var betsOpen = false;

module.exports = {
  /**
   * Updates the betting line for the next game to be played (only works on game days)
   */
	updateBettingLine: async function() {
    const res = await axios.get(bettingOdds).catch((err) => { console.log(err) });
    res.data.data.forEach((matchup) => {
      if (matchup.teams[0] === global.team.fullName || matchup.teams[1] === global.team.fullName) {
        let odds1 = 0, odds2 = 0;
        matchup.sites.forEach((site) => {
          odds1 += site.odds.h2h[0];
          odds2 += site.odds.h2h[1];
        });
        if (matchup.teams[0] === global.team.fullName) {
          bettingLine.opponent = matchup.teams[1].split(" ").slice(-1);
          bettingLine.win = +(odds1/matchup.sites.length).toFixed(2);
          bettingLine.lose = +(odds2/matchup.sites.length).toFixed(2);
        }
        else {
          bettingLine.opponent = matchup.teams[0].split(" ").slice(-1);
          bettingLine.win = +(odds2/matchup.sites.length).toFixed(2);
          bettingLine.lose = +(odds1/matchup.sites.length).toFixed(2);
        }
        bettingLine.gameId = schedule.getRelevantGameInfo().next.id;
        bettingLine.date = schedule.getRelevantGameInfo().next.date;
        betsOpen = true;
        return;
      }
    });
  },

  /**
   * Returns true if bets are open, false otherwise
   */
  areBetsOpen: function() {
    return betsOpen;
  },

  /**
   * Returns current betting line
   */
  getBettingLine: function() {
    return bettingLine;
  },

  /**
   * Resets betting line to default values
   */
  resetBettingLine: function() {
    betsOpen = false;
    bettingLine = { team: global.team.name, opponent: '', win: 0, lose: 0 };
  },

  /**
   * Pays out all bets or refunds them based on the status of the games the bets were placed for
   * If a game was postponed/cancelled then the bets are refunded
   * If a game has finished and was not postponed/cancelled then the bets are paid out as normal
   * If a game has not started or is in progress nothing is done as the bet is still open
   */
  payoutAllBets: async function() {
    let bets = await db.bet.findAll();

    let gameIds = [];
    bets.forEach(bet => {
      gameIds.push(bet.dataValues.gameId + "|" + bet.dataValues.date);
    });
    gameIds = gameIds.filter((v, i, a) => a.indexOf(v) === i);

    for (const game of gameIds) {
      let info = game.split('|');
      let score = await boxscore.getMiniBoxscore(info[0], info[1]);
      if (score.extendedStatusNum !== 0) { // game was cancelled/postponed
        refundBets(score.gameId);
        message.sendBettingChannel(`${global.team.code}/${score[score.opp].triCode} bets have been refunded due to cancellation or postponement!`);
      }
      else if (score.statusNum === 3) { // game has finished
        let outcome = (score[score.mavs].score > score[score.opp].score) ? 'win' : 'lose';
        payoutBets(outcome, score.gameId);
        message.sendBettingChannel(`${global.team.code}/${score[score.opp].triCode} bets have been payed out!\n**${global.team.name.toUpperCase()} ${outcome.toUpperCase()}**`);
      }
    }
  },

  /**
   * Calculates the payout for the wager using current odds
   */
  calculatePayout: function(position, wager) {
    return getPayout(position, wager);
  },

  /**
   * Places a bet for a user using current odds
   * Deducts the wager from the user's balance
   */
  placeBet: async function(user, pos, wager) {
    let bet = { 
      'userId': user, 
      'position': pos, 
      'payout': getPayout(pos, wager), 
      'wager': wager, 
      'gameId': bettingLine.gameId, 
      'date': bettingLine.date 
    };
    await db.user.decrement({ tokens: wager }, { where: { id: user } }).catch(err => { throw err });
    await db.bet.create(bet).catch((err) => { throw err });
  },

  getBettingLineEmbed: function (title = "Betting Line") {
    return new Discord.MessageEmbed()
      .setColor(colors[global.team.code])
      .setAuthor(title, null, null)
      .setTitle(`${bettingLine.team} vs. ${bettingLine.opponent}`)
      .setDescription(`${global.team.name} win: ${bettingLine.win}x\n${global.team.name} lose: ${bettingLine.lose}x`)
      .setFooter(`To place a bet: ${prefix}bet win 10`)
      .setThumbnail(`${resourceUrl}bet.png`);
  }
};

function getPayout(position, wager) {
  return Math.round(bettingLine[position] * wager);
}

/**
 * Pays out the bets for a game based on the passed in winning position
 * Deletes all bets for the game after payout is complete
 */
async function payoutBets(winningPosition, game) {
  let bets = await db.bet.findAll({ where: { gameId: game } });
  bets.forEach(bet => {
    if (bet.dataValues.position === winningPosition) {
      db.user.increment(
        { tokens: bet.dataValues.payout },
        { where: { id: bet.dataValues.userId } }
      )
    }
  });
  db.bet.destroy({ where: { gameId: game }, truncate: true });
}

/**
 * Refund open bets for a game (like when a game gets cancelled)
 * Deletes all bets for the game after payout is complete
 */
async function refundBets(game) {
  let bets = await db.bet.findAll({ where: { gameId: game } });
  bets.forEach(bet => {
    db.user.increment(
      { tokens: bet.dataValues.wager },
      { where: { id: bet.dataValues.userId } }
    )
  });
  db.bet.destroy({ where: { gameId: game }, truncate: true });
}