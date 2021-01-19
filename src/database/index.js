const fs = require('fs');
const { Sequelize } = require('sequelize');
const { dbString } = require('../../config.json');;

// Create sequelize connection
const sequelize = new Sequelize(dbString, { logging: false} );

// Load models
const modelFiles = fs.readdirSync('./src/database/models').filter(model => model.endsWith('.js'));
for (const model of modelFiles) {
	require(`./models/${model}`)(sequelize);
}

module.exports = sequelize;