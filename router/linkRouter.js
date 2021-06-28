const express = require('express');

class LinkRouter {
    constructor(service){
        this.service = service
    }
    router(){
        const router = express.Router();
        router.get('/',this.get.bind(this))
        router.post('/',this.post.bind(this))
        return router;
    }
    async get(req,res){
        console.log(req.user)
        let user_id = req.user.id;
        let data = await this.service.getAllLinks(user_id);
        console.log('result', data);
        res.send(data);
    }
    async post(req,res){
        console.log('req',req.body);
        console.log('user',req.user);
        let user_id = req.user.id;
        let data = {
            user_id:user_id,
            title:req.body.data.title,
            url:req.body.data.url
        }
        console.log(data);
        let insertQuery = await this.service.addLink(data);
        if(insertQuery[0]){
            //insert success
            let newQuery = await this.service.getAllLinks(user_id);
            console.log('newQuery',newQuery);
            res.send(newQuery);
        }
    }
}

module.exports = LinkRouter;