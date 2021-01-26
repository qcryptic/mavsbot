const { theOddsApiKey } = require('../../config.json');

module.exports = {
    dailySummary: 'http://data.nba.net/10s/prod/v1/today.json',
    teams: 'http://data.nba.net/data/10s/prod/v1/{{year}}/teams.json',
    teamSchedule: 'http://data.nba.net/data/10s/prod/v1/{{year}}/teams/{{team}}/schedule.json',
    standings: 'http://data.nba.net/data/10s/prod/v1/{{date}}/standings_all.json',
    boxscore: 'http://data.nba.net/data/10s/prod/v1/{{date}}/{{gameId}}_boxscore.json',
    miniBoxscore: 'http://data.nba.net/data/10s/prod/v1/{{date}}/{{gameId}}_mini_boxscore.json',
    bettingOdds: 'https://api.the-odds-api.com/v3/odds?sport=basketball_nba&region=us&mkt=h2h&dateFormat=iso&apiKey='+theOddsApiKey,
    statusUpdates: 'https://www.fantasylabs.com/api/players/news/2/'
}