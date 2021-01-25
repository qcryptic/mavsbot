const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
	sequelize.define('team', {
		id: {
			allowNull: false,
			primaryKey: true,
			type: DataTypes.STRING
		},
		code: {
			allowNull: false,
			type: DataTypes.STRING,
			unique: true
		},
		name: {
			allowNull: false,
			type: DataTypes.STRING,
			unique: true
		},
    urlName: {
			allowNull: false,
			type: DataTypes.STRING,
			unique: true
    },
    nickname: {
			allowNull: false,
			type: DataTypes.STRING,
			unique: true
    },
    city: {
			allowNull: false,
			type: DataTypes.STRING,
		},
		conference: {
			allowNull: false,
			type: DataTypes.STRING,
		},
    division: {
			allowNull: false,
			type: DataTypes.STRING,
		},
		botTeam: {
			allowNull: false,
			type: DataTypes.BOOLEAN
		}
	});
};