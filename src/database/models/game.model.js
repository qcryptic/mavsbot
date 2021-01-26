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
		homeId: {
			allowNull: false,
			type: DataTypes.STRING,
		},
    opponentId: {
			allowNull: false,
			type: DataTypes.STRING,
    },
    gameUrlCode: {
			allowNull: false,
			type: DataTypes.STRING,
    },
    dateCode: {
			allowNull: false,
			type: DataTypes.INTEGER,
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