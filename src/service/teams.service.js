const { teams } = require('../enum/endpoints');
const { homeTeam } = require('../../config.json');
const db = require('../database').models;
const axios = require('axios');

module.exports = {

	updateTeams: async function() {
		const res = await axios.get(teams.replace('{{year}}', global.year))
			.catch((err) => { console.log(err) });

		let teamList = [];
		res.data.league.standard.forEach(team => {
			let isHomeTeam = team.urlName === homeTeam.toLowerCase();
			teamList.push({
				id: team.teamId,
				code: team.tricode,
				name: team.fullName,
				urlName: team.urlName,
				nickname: team.nickname,
				city: team.city,
				conference: team.confName,
				division: team.divName,
				botTeam: isHomeTeam
			});
			if (isHomeTeam) {
				global.team = {
					urlName: team.urlName,
					id: team.teamId,
					name: team.nickname,
					code: team.tricode,
					fullName: team.fullName
				}
			}
		});

		if (!global.team) {
			console.log('ERROR: Home team not found - update your config to add a valid homeTeam name');
			process.exit(0);
		}

		// await db.team.destroy({ where: {}, truncate: { cascade: true } })
		// 	.catch((err) => { console.log(err) });
		// await db.team.bulkCreate(teamList)
		// 	.catch((err) => { console.log(err) });
		console.log(`Teams updated [Home team set to ${global.team.name}]`);
	},

	getTeamById: function(teamId) {
		return db.team.findAll({where: { id: teamId }});
	}

};