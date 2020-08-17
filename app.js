// importing modules
const express = require('express');
// -- module for working with templates
const handlebars = require('express-handlebars');
// -- module for working with forms
const bodyParser = require('body-parser');
// -- module for our app
const app = express();
// -- module for working with admin routes
const admin = require('./routes/admin');
// -- module ofr working with user routes
const usuario = require('./routes/usuario');
// -- module for working with paths
const path = require('path');
// -- module for working with sessions
const session = require('express-session');
const flash = require('connect-flash');
// -- module for working with mongoDB
const mongoose = require('mongoose');
// -- the post model
require('./models/Postagem');
const Postagem = mongoose.model('postagens');
// -- the categories model
require('./models/Categoria');
const Categoria = mongoose.model('categorias');
// -- module for working with passport
const passport = require('passport');
require('./config/auth')(passport);
// -- helper
const db = require('./config/db');


// Configurations
// -- Session
app.use(session({
    secret: 'cursodenode',
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
// -- MiddleWares
app.use(function(req, res, next){
    //console.log('OIee, Estou atendo as tuas requisicoes ...');
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});
// -- Body Parser
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
// -- Handlebars
app.engine('handlebars', handlebars({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
;
// -- Mongoose 
mongoose.Promise = global.Promise;
mongoose.connect(db.mongoURI, {useNewUrlParser: true, useUnifiedTopology: true} ).then(function(){
    console.log('Conectado ao mongo...');
}).catch((erro)=>{
    console.log('Houve um erro ao se conectar '+erro);
});
// COMING SOON...
// -- Static Files
app.use(express.static(path.join(__dirname, 'public')));

// ROUTERS
// -- MAIN
app.get('/', function(req, res){
    res.locals.metaTags = {
        title: "Pagina inicial",
        description : 'Como adicionar meta tags no handlebars',
        keywords : "blog nodJs, caf3, blog, javascript"
    }
    Postagem.find().populate('categoria').sort({data : 'desc'}).then(function(postagens){
        res.render('index', {postagens: postagens.map((postagem) => postagem.toJSON())});
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao listar postagens');
        res.redirect('/404');
    });
});
app.get('/404', function(req, res){
    res.send('Erro');
})
app.get('/postagem/:slug', function(req, res){
    Postagem.findOne({slug: req.params.slug}).populate('categoria').then(function(postagem){    
        let post = postagem.toJSON();
        res.locals.metaTags = {
            title: post.titulo,
            description : post.descricao,
            keywords : post.titulo
        }
        res.render('postagem/index', {postagem: post});

    }).catch((err) => {
        req.flash('error_msg', 'Postagem inexistente');
        res.redirect('/');
    })
});
app.get('/categorias', function(req, res){
    Categoria.find().sort({data : 'desc'}).then(function(cateorias){
        res.render('categorias/index', {categorias : cateorias.map((categoria) => categoria.toJSON())});
    }).catch((err) =>{
        req.flash('error_msg', 'Houve um erro ao listar as categorías');
        req.redirect('/');
    })

});
app.get('/categoria/:slug', function(req, res){
    let slug = req.params.slug;
    Categoria.findOne({slug: slug}).then(function(categoria){
        Postagem.find({categoria: categoria._id}).then(function(postagens){
            res.render('categorias/postagens', {postagens : postagens.map((postagem) => postagem.toJSON()), categoria : categoria.toJSON()});
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao carregar postagens dessa categoria');
            res.redirect('/categorias');
        });
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao carregar postagens ...');
        res.redirect('/categorias');
    })
});
// --  ADMIN
app.use('/admin', admin);

// -- USER
app.use('/usuarios', usuario);

//Server
const PORT = process.env.PORT || 3333;
app.listen(PORT, function(){
    console.log('Server running in port '+PORT+' ...');
});