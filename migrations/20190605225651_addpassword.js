exports.up = async function(knex) {
  await knex.schema.table("users", tbl => {
    tbl.string("password");
  });
};

exports.down = async function(knex) {
  await knex.schema.table("users", tbl => {
    tbl.dropColumn("pasword");
  });
};
