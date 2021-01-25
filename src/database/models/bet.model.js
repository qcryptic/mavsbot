const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
	sequelize.define('bet', {
		id: {
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
			type: DataTypes.INTEGER
		},
		userId: {
			allowNull: false,
			type: DataTypes.STRING
		},
		position: {
			allowNull: false,
			type: DataTypes.STRING
		},
		payout: {
			allowNull: false,
			type: DataTypes.INTEGER
		},
		wager: {
			allowNull: false,
			type: DataTypes.INTEGER
		},
		gameId: {
			allowNull: false,
			type: DataTypes.STRING
		},
		date: {
			allowNull: false,
			type: DataTypes.STRING
		},
	});
};