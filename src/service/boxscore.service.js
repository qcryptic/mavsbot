const { miniBoxscore, boxscore } = require('../enum/endpoints');
const moment = require('moment');
const axios = require('axios');

var score;

module.exports = {
  getMiniBoxscore: async function(id, date) {
    let res = await axios.get(miniBoxscore.replace('{{date}}', date).replace('{{gameId}}', id))
      .catch((err) => { console.log(err) });
    const t = (res.data.basicGameData.hTeam.triCode === global.team.code) ? ['hTeam','vTeam'] : ['vTeam','hTeam'];
    res.data.basicGameData.mavs = t[0];
    res.data.basicGameData.opp = t[1];
    return res.data.basicGameData;
  },

  getBoxscore: async function(id, date) {
    const res = await axios.get(boxscore.replace('{{date}}', date).replace('{{gameId}}', id))
      .catch((err) => { console.log(err) });
    score = { info: res.data.basicGameData, stats: res.data.stats };
    const t = (score.info.hTeam.triCode === global.team.code) ? ['hTeam','vTeam'] : ['vTeam','hTeam'];
    score.mavs = t[0];
    score.opp = t[1];
    score.type = (t[0] === 'hTeam') ? 'vs' : 'at';
    return score;
  },

  getRefsMessage: function() {
    let refs = '';
    score.info.officials.formatted.forEach(official => {
      refs += official.firstNameLastName + ', ';
    });
    if (refs === '') {
      return `No refs found for ${getMatchupString()}, try again a bit later.`;
    }
    else {
      return `Refs for ${getMatchupString()}:\n${refs.slice(0, -2)}`
    }
  },

  getBoxScoreMessage: function(stats) {
    if (!Array.isArray(stats)) {
      if (stats === 'default') {
        stats = ['point', 'assist', 'rebound', 'steal', 'block', 'turnover', 'foul', 'percentage'];
      }
      else if (stats === 'extra') {
        stats = ['paint', 'turnover_points', 'fast_break', 'second_chance', 'biggest_lead', 'run', 'timeout'];
      }
      else if (stats === 'extended') {
        stats = ['point', 'assist', 'rebound', 'steal', 'block', 'turnover', 'foul', 'percentage', 'paint', 'turnover_points', 'fast_break', 'second_chance', 'biggest_lead', 'run', 'timeout'];
      }
    }

    if (stats.length === 0)
      return '';
    
    let scoreString = '';
    const mappings = require('../enum/boxscoreMappings');
    stats.forEach(statName => {
      const stat = mappings[statName] || mappings[mappings.aliases[statName]];
      if (stat) {
        let statString = stat['format'].replace('$m', global.team.code).replace('$o', score.info[score.opp].triCode);
        stat['keys'].forEach((prop, i) => {
          statString = statString.replace(`$${i}m`, resolve(score.stats[score.mavs], prop)).replace(`$${i}o`, resolve(score.stats[score.opp], prop));
        });
        scoreString += fixSpaces(statString);
      }
    });

    if (scoreString === '')
      return scoreString;
    
    return `${getMatchupString()} Boxscore - ${getTimeRemaining()}\`\`\`ruby\n${scoreString}\n\`\`\``;
  },

  getLeaders: function() {
    return 'LEADERS';
  }
}

function getMatchupString() {
  return `${global.team.code} ${score.type} ${score.info[score.opp].triCode}`;
}

function getTimeRemaining() {
  if (score.info.endTimeUTC) {
    return `**FINAL [${moment(score.info.startTimeUTC).format("MMM Do")}]**`;
  }
  const { current, isEndOfPeriod } = score.info.period;
  return (isEndOfPeriod) ? `**LIVE ${current}Q-END**` : `**LIVE ${current}Q-${score.info.clock}**`;
}

function resolve(obj, path){
  path = path.split('.');
  var current = obj;
  while(path.length) {
    if(typeof current !== 'object') return -1;
    current = current[path.shift()];
  }
  return current;
}

function fixSpaces(str) {
  if (!str.includes('$s')) 
    return str;

  let spaces = '';
  let size = str.indexOf(')') - str.indexOf('(');
  if (size === 3)
    spaces = ' ';
  else if (size === 2)
    spaces = '  ';
  else if (size === 1)
    spaces = '   '
  return str.replace('$s', spaces);
}