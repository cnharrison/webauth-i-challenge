const knex = require("knex");
const knexConfig = require("../knexfile.js");
const db = knex(knexConfig.development);

module.exports = {
  find,
  findByUser,
  insert,
  update,
  remove
};

function find() {
  return db("users");
}

function findByUser(myUser) {
  return db("users").where({ user: myUser });
}

function insert(user) {
  return db("users")
    .insert(user)
    .then(ids => ({ id: ids[0] }));
}

function update(id, user) {
  return db("users")
    .where("id", Number(id))
    .update(user);
}

function remove(id) {
  return db("users")
    .where("id", Number(id))
    .del();
}
