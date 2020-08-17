const localStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
// -- user model
require('../models/Usuario');
const Usuario = mongoose.model('usuarios');

module.exports = function(passport){
    passport.use(new localStrategy({usernameField: 'email', passwordField: 'senha'}, (email, senha, done) =>{
        Usuario.findOne({email: email}).then(function(usuario){
            if(!usuario){
                return done(null, false, {message: 'Conta inexistente'});
            }else{
                bcrypt.compare(senha, usuario.senha, (erro, batem) =>{
                    if(batem){
                        return done(null, usuario);
                    }else{
                        return done(null, false, {message : 'Usuario ou senha incorretos'});
                    }
                })
            }
        })
    }));

    passport.serializeUser(function(usuario, done){
        done(null, usuario.id);
    });
    passport.deserializeUser(function(id, done){
        Usuario.findById(id, (err, usuario)=> {
            done(err, usuario);
        });
    })
}