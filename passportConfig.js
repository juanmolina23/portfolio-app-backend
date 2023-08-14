const User = require('./models/user');
const bcrypt = require('bcrypt')
const localStrategy = require('passport-local').Strategy

module.exports = (passport) => {
    passport.use(
        new localStrategy((username, password, done) => {
            User.findOne({username: username}).then((user) => {
                if(!user) return done(null, false);
                bcrypt.compare(password, user.password).then(res => {
                    if(res){
                        return done(null, user)
                    }else{
                        return done(null, false);
                    }
                }).catch(err => {
                    throw err;
                });
            }).catch(err => {
                throw err;
            });
        })
    );

    // passport.serializeUser(function(user, cb) {
    //     process.nextTick(function() {
    //       return cb(null, {
    //         id: user.id,
    //         username: user.username
    //       });
    //     });
    //   });
      
    //   passport.deserializeUser(function(user, cb) {
    //     process.nextTick(function() {
    //       return cb(null, user);
    //     });
    //   });

    passport.serializeUser((user, cb) => {
        cb(null, user.id);
    });
    passport.deserializeUser((id, cb) => {
        User.findOne({_id: id}).then(user => {
            cb(null, user);
        }).catch(err => {
            throw err;
        });

    });
}