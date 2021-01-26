const { teamSchedule } = require('../enum/endpoints');
const axios = require('axios');
const db = require('../database').models;
const { Op } = require('sequelize');
const Discord = require('discord.js');
const colors = require('../enum/teamColors');
const { resourceUrl } = require('../../config.json');
const moment = require('moment');

var relevantGames = {};
var isGameActive = false;

module.exports = {
	updateSchedule: async function() {
    if (isGameActive)
      return;

    const res = await axios
      .get(teamSchedule.replace('{{year}}', global.year).replace('{{team}}', global.team.urlName))
			.catch((err) => { console.log(err) });;
    
    gameList = [];
		res.data.league.standard.forEach(game => {
      gameList.push({
        gameId: game.gameId,
        stageId: game.seasonStageId,
        homeId: (game.isHomeTeam) ? game.hTeam.teamId : game.vTeam.teamId,
        opponentId: (game.isHomeTeam) ? game.vTeam.teamId : game.hTeam.teamId,
        gameUrlCode: game.gameUrlCode,
        dateCode: game.startDateEastern,
        statusNum: game.statusNum,
        extendedStatusNum: game.extendedStatusNum,
        startTimeUTC: game.startTimeUTC,
        isHome: game.isHomeTeam
      });
    });

    await db.game.destroy({ where: {}, truncate: true })
			.catch((err) => { console.log(err) });
		await db.game.bulkCreate(gameList)
      .catch((err) => { console.log(err) });
    await module.exports.updateRelevantGameInfo();
    console.log(`Schedule updated`);
  },

  getRelevantGameInfo: function() {
    return relevantGames;
  },

  updateRelevantGameInfo: async function() {
    let nextGame = await module.exports.findNextGame();
    let lastGame = await module.exports.findLastGame();

    if (nextGame.length === 0) 
      nextGame = undefined;
    else 
      relevantGames.next = { 
        id: nextGame[0].gameId, 
        date: nextGame[0].gameUrlCode.substring(0,8), 
        time: nextGame[0].startTimeUTC,
        opp: (nextGame[0].isHome) ? nextGame[0].gameUrlCode.substring(9,12) : nextGame[0].gameUrlCode.substring(12,15),
        type: (nextGame[0].isHome) ? 'vs' : 'at'
      };

    if (lastGame.length === 0) 
      lastGame = undefined;
    else 
      relevantGames.last = { 
        id: lastGame[0].gameId, 
        date: lastGame[0].gameUrlCode.substring(0,8), 
        time: lastGame[0].startTimeUTC,
        opp: (lastGame[0].isHome) ? lastGame[0].gameUrlCode.substring(9,12) : lastGame[0].gameUrlCode.substring(12,15),
        type: (lastGame[0].isHome) ? 'vs' : 'at'
      };
  },

  setIsGameActive: function(status) {
    isGameActive = status;
  },

  getIsGameActive: function() {
    return isGameActive
  },

  findNextGame: async function(amount = 1) {
    let results = await db.game.findAll({
      where: { 
        [Op.and]: {
          dateCode: { [Op.gte]: global.date },
          statusNum: { [Op.eq]: 1 },
          extendedStatusNum: { [Op.eq]: 0 }
        } 
      },
      include: [db.team],
      raw: true,
      limit: amount,
      order: [['dateCode', 'ASC']]
    });
    return results;
  },

  findLastGame: async function(amount = 1) {
    let results = await db.game.findAll({
      where: { 
        [Op.and]: {
          dateCode: { [Op.lte]: global.date },
          statusNum: { [Op.ne]: 1 },
          extendedStatusNum: { [Op.eq]: 0 }
        } 
      },
      include: [db.team],
      raw: true,
      limit: amount,
      order: [['dateCode', 'DESC']]
    });
    return results;
  },

  markGameAsPlayed: function (id) {
    return db.game.increment({ statusNum: 10 }, { where: { gameId: id } });
  },

  getNextGameMessage: async function () {
    let results = await module.exports.findNextGame();
		if (results.length === 0) {
			return 'No future games found for this season...';
		}
		else {
			results = results[0];
			const time = moment(results.startTimeUTC);
			return new Discord.MessageEmbed()
				.setColor(colors[global.team.code])
				.setAuthor(`Next ${global.team.name} Game:`, null, null)
				.setThumbnail(`${resourceUrl}matchups/${results['team.code']}.png`)
				.setDescription(
					`${global.team.name} ${(results.isHome) ? 'vs' : 'at'} ${results['team.nickname']}\n` + 
					`${time.calendar()} ${moment.tz(moment.tz.guess()).zoneAbbr()} [${time.fromNow()}]`
        );	
		}
  }
};