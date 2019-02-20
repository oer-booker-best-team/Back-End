exports.up = function(knex, Promise) {
  return knex.schema.createTable("books", tbl => {
    tbl.increments();

    tbl.string("title", 255).notNullable();

    tbl.string("author", 255).notNullable();

    tbl.string("publisher", 255).notNullable();

    tbl.string("license", 255).notNullable();

    tbl.string("subject", 255).notNullable();

    tbl.string("image", 500).notNullable();

    tbl.string("link", 500);

    tbl.integer("user_id").unsigned().notNullable();
    tbl.foreign("user_id").references("id").on("users");
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists("books");
};
