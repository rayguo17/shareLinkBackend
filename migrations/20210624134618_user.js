
exports.up = function (knex) {
    return knex.schema.createTable('user', (table) => {
        table.increments('id');
        table.string('username');
        table.string('email');
        table.string('hash');
        table.string('facebook_id');
    }).then(()=>{
        return knex.schema.createTable('link',(table)=>{
            table.increments('id');
            table.integer('user_id');
            table.string('title');
            table.string('url');
            table.foreign('user_id').references('user.id');
        })
    })
};

exports.down = function (knex) {
    return knex.schema.dropTable('link').dropTable('user');
};
