const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('game', {
		gameId: {
			allowNull: false,
			primaryKey: true,
			type: DataTypes.STRING
		},
		stageId: {
			allowNull: false,
			type: DataTypes.INTEGER,
		},
		homeTeamId: {
			allowNull: false,
			type: DataTypes.STRING,
		},
    visitorTeamId: {
			allowNull: false,
			type: DataTypes.STRING,
    },
    gameUrlCode: {
			allowNull: false,
			type: DataTypes.STRING,
    },
    dateCode: {
			allowNull: false,
			type: DataTypes.STRING,
    },
    statusNum: {
			allowNull: false,
			type: DataTypes.INTEGER,
		},
		extendedStatusNum: {
			allowNull: false,
			type: DataTypes.INTEGER,
		},
    startTimeUTC: {
			allowNull: false,
			type: DataTypes.DATE,
		},
		isHome: {
			allowNull: false,
			type: DataTypes.BOOLEAN
		}
  });
}