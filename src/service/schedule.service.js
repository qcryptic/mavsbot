const { teamSchedule } = require('../enum/endpoints');
const axios = require('axios');
const db = require('../database');

module.exports = {
	updateSchedule: async function() {
    const res = await axios
      .get(teamSchedule.replace('{{year}}', global.year).replace('{{team}}', global.team.urlName))
			.catch((err) => { console.log(err) });;
    
    gameList = [];
		res.data.league.standard.forEach(game => {
      gameList.push({
        gameId: game.gameId,
        stageId: game.seasonStageId,
        homeTeamId: game.hTeam.teamId,
        visitorTeamId: game.vTeam.teamId,
        gameUrlCode: game.gameUrlCode,
        dateCode: game.startDateEastern,
        statusNum: game.statusNum,
        extendedStatusNum: game.extendedStatusNum,
        startTimeUTC: game.startTimeUTC,
        isHome: game.isHomeTeam
      });
    });

    await db.models.game.destroy({ where: {}, truncate: true })
			.catch((err) => { console.log(err) });
		await db.models.game.bulkCreate(gameList)
      .catch((err) => { console.log(err) });
    console.log(`Schedule updated`);
  }
};