const { dailySummary } = require('../enum/endpoints');
const axios = require('axios');

module.exports = {
	setDailyInfo: async function() {
		const res = await axios.get(dailySummary).catch((err) => { console.log(err) });
		global.year = res.data.seasonScheduleYear;
		global.stage = res.data.teamSitesOnly.seasonStage;
		global.date = res.data.links.currentDate;
		console.log(`Daily info updated [NBA Season Year: ${global.year} | NBA Date: ${global.date}]`);
	}
};