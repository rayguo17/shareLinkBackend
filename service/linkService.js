
class linkService {
    constructor(knex){
        this.knex = knex
    }
    getAllLinks(user_id){
        return this.knex('link').where('user_id',user_id);
    }
    addLink(data){
        return this.knex('link').insert(data).returning('id');
    }
}

module.exports = linkService;