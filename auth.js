const passport = require('passport');
const passportJWT = require('passport-jwt');
const { jwtSession, jwtSecret } = require('./config');
const ExtraJwt = passportJWT.ExtractJwt;

module.exports = (knex) => {
    const strategy = new passportJWT.Strategy({
        secretOrKey: jwtSecret,
        jwtFromRequest: ExtraJwt.fromAuthHeaderAsBearerToken()
    }, async (payload, done) => {
        try {
            console.log('payload',payload)
        let query = await knex("user").select("*")
            .where({"id": payload.id});
        console.log('query',query);
        
        let user = {
            id: query[0].id
        }
        if (user) {
            return done(null, { id: user.id });

        } else {
            return done(new Error('User Not Found!'), null);
        }
        } catch (error) {
            console.log('auth error',error)
        }
        
    })

    passport.use(strategy);
    return {
        initialize: function () {
            return passport.initialize()
        },
        authenticate: function () {
            return passport.authenticate(
                'jwt', jwtSession
            )
        }
    }
}