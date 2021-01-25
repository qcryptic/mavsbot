const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
	sequelize.define('user', {
		id: {
			allowNull: false,
			primaryKey: true,
			type: DataTypes.STRING
		},
		username: {
			allowNull: false,
			type: DataTypes.STRING
		},
		tokens: {
			allowNull: false,
			type: DataTypes.INTEGER
		}
	});
};