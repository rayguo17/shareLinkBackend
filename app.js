const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const development = require('./knexfile').development;
const { hashPassword, checkPassword } = require('./bcrypt');
const { jwtSecret } = require('./config');
const knex = require('knex')(development);
const authClass = require('./auth')(knex);
const app = express();
const axios = require('axios');

const LinkService = require('./service/linkService');
const LinkRouter = require('./router/linkRouter');

app.use(express.json());
app.use(cors());
app.use(authClass.initialize());

app.get('/', (req, res) => {
    res.send("Hello World");
})

app.use('/api/link',authClass.authenticate(),new LinkRouter(new LinkService(knex)).router());

app.get('/secret',authClass.authenticate(),(req,res)=>{
    
})

app.post('/api/register', async (req, res) => {
    try {
        console.log('register process', req.body);
        //get three things: username email password,
        //set the password into bcrypt item, and then store in db
        let hash = await hashPassword(req.body.password);
        let id = await knex('user').insert({ username: req.body.username, hash: hash, email: req.body.email })
            .returning('id');
        let payload = {
            id: id[0]
        }
        let token = jwt.sign(payload, jwtSecret);
        res.json({
            token: token
        })
    } catch (error) {
        console.log('register', error)
    }


})
app.post('/api/login', async (req, res) => {
    console.log('login process',req.body)
    if (req.body.email && req.body.password) {
        let email = req.body.email;
        let password = req.body.password;
        let query = await knex('user').where('email', email)
            .select('id', 'hash');
        let hash = query[0].hash;
        let match = await checkPassword(password,hash);
        if(match){
            let payload = {
                id:query[0].id
            };
            let token =jwt.sign(payload,jwtSecret);
            res.json({token:token})
        }else{
            res.sendStatus(401);
        }
    }else{
        res.sendStatus(401);
    }
});
app.post('/api/login/facebook',async(req,res)=>{
    try {
        console.log('facebook',req.body);
    if(req.body.accessToken){
        let accessToken = req.body.accessToken;
        let data = await axios.get(
            `https://graph.facebook.com/me?access_token=${accessToken}`
        )
        console.log('data from facebook',data.data)
            if(!data.data.error){
                let user = {
                    username:data.data.name,
                    facebook_id:data.data.id
                }
                let checkUserExist = await knex('user').where('facebook_id',user.facebook_id).select('id');
                if(checkUserExist[0]){
                    //console.log('reading from db')
                    user.id=checkUserExist[0].id;
                    let payload = {
                        id:user.id
                    }
                    //console.log('read id',payload);
                    let token = jwt.sign(payload,jwtSecret);
                    res.json({token:token})
                }else{
                    //console.log('saving info to db')
                    let query = await knex('user').insert(user).returning('id');
                    //console.log('saving process',query)
                    let payload = {
                        id:query[0]
                    }
                    //console.log('read id',payload);
                    let token = jwt.sign(payload,jwtSecret);
                    res.json({token:token})
                }
                
            }else{
                res.sendStatus(401);
            }
        
    }else{
        res.sendStatus(401);
    }
    } catch (error) {
        console.log('facebook login',error)
    }
    
})



app.listen(8080, () => {
    console.log('server running on port 8080...')
})