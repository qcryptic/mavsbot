const db = require('../database').models;

module.exports = {
	getUser: async function(user) {
    let result = await db.user.findAll({
      where: { id: user.id }
    });
    if (result.length === 0) {
      let created = await createUser(user);
      return created.dataValues;
    }
    else {
      return result[0].dataValues;
    }
  }
};

async function createUser(user) {
  let userJson = {
    id: user.id,
    username: user.username,
    tokens: 100
  }
  return db.user.create(userJson);
}