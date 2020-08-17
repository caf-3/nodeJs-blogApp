const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
require('../models/Usuario');
const Usuario = mongoose.model('usuarios');
// -- module for working with hash
const bcrypt = require('bcryptjs');
const passport = require('passport');
router.get('/registrar', function(req, res){
    res.render('usuarios/registro');
});


router.post('/registrar', function(req, res){
    let erros = [];
    let nome = req.body.nome;
    let email = req.body.email;
    let senha = req.body.senha;
    let senha2 = req.body.senha2;
    if(!nome || typeof nome == undefined || nome == null){
        erros.push({texto : 'Nome inválido'});
    }
    if(nome.length < 4){
        erros.push({texto : 'Nome muito curto'})
    }
    
    if(!email || typeof email == undefined || email == null){
        erros.push({texto : 'Email inválido'});
    }
    if(!senha || typeof senha == undefined || senha == null){
        erros.push({texto : 'Senha inválida'});
    }
    if(senha.length < 6){
        erros.push({texto : 'A senha deve ter no mínimio 6 caracteres'});
    }
    if(senha !== senha2){
        erros.push({texto : 'Digitou senhas diferentes'});
    }
    if(erros.length == 0){
        Usuario.findOne({email: email}).then(function(usuario){
            if(usuario){
                req.flash('error_msg', 'O email em questão já está em uso');
                res.redirect('/usuarios/registrar');
            }else{
                const novoUsuario = new Usuario({
                    nome : nome,
                    email : email,
                    senha : senha
                });
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(novoUsuario.senha, salt, (err, hash) =>{
                        if(err){
                            req.flash('error_msg', 'Houve um erro ao registrar usuario');
                            res.redirect('/usuarios/registrar');
                        }else{
                            novoUsuario.senha = hash;
                            novoUsuario.save().then(function(){
                                req.flash('success_msg', 'Usuario cadastrado com sucesso');
                                res.redirect('/usuarios/registrar')
                            }).catch((err)=>{
                                req.flash('error_msg', 'Houve um erro interno');
                                res.redirect('/usuarios/registrar');
                            });
                        }
                    })
                })
            }
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro interno');
            res.redirect('/usuarios/registrar')
        })
    }else{
        res.render('usuarios/registro', {erros : erros});
    }

    
});

router.get('/login', function(req, res){
    res.render('usuarios/login');
});
router.post('/login', (req, res, next) =>{
    passport.authenticate('local',{
        successRedirect: '/',
        failureRedirect: '/usuarios/login',
        failureFlash: true
    })(req, res, next);
});
router.get('/logout', function(req, res){
    req.logout();
    req.flash('success_msg', 'Sessão terminada');
    res.redirect('/');
});



module.exports = router;