const express = require('express');
const router = express.Router()
const mongoose = require('mongoose');
const { unregisterDecorator } = require('handlebars');
require('../models/Categoria');
const Categoria = mongoose.model('categorias'); 
require('../models/Postagem');
const Postagem = mongoose.model('postagens');
const {eAdmin} = require('../helpers/eAdmin');

router.get('/', eAdmin, function(req, res){
    res.render('admin/index');
});

//CATEGORIES SECTION
// Showing the categories
router.get('/categorias',eAdmin, (req, res) => {
    Categoria.find().sort({date: 'desc'}).then((categorias) => {
        res.render('admin/categorias', {categorias: categorias.map(categoria => categoria.toJSON())})    
        //Essa linha acima salvou o mundo, pois nao e mais permitido passar diretamente o parametro para ser acessado na view, por questoes de seguranca.
    }).catch((err) => {
        console.log("Erro listar categorias! : " + err);
    });
   
})
//add category form
router.get('/categorias/add',eAdmin, function(req, res){
    res.render('admin/addcategorias');
});
//add category controller
router.post('/categorias/nova', eAdmin, function(req, res){
    //receiving the data
    const nome = req.body.nome;
    const slug = req.body.slug;
    let erros = [];
    if(!nome || typeof nome == undefined || nome == null){
        erros.push({texto: 'Nome da categoria invalido'});
    }
    if(nome.length < 2){
        erros.push({texto: 'Nome da categoria muito pequeno'});
    }
    if(!slug || typeof slug == undefined || slug == null){
        erros.push({texto: 'Slug da categoria invalido'});
    }
    if(erros.length > 0){
        res.render('admin/addcategorias', {erros: erros});
    }else{
        const novaCategoria = {
            nome: nome,
            slug: slug
        };
        new Categoria(novaCategoria).save().then(function(){
            req.flash('success_msg', `Categoria criada com sucesso`);
            res.redirect('/admin/categorias');
        }).catch((err)=>{
            req.flash('error_msg', 'Houve um erro ao cadastrar categoria');
            res.redirect('/admin');
        });
    }

});

//edit category form
router.get('/categorias/edit/:id', eAdmin, function(req, res){
    Categoria.findOne({_id: req.params.id}).then(function(categoria){
        res.render('admin/editcategoria', {categoria : categoria.toJSON()});
    }).catch(function(err){
        req.flash('error_msg', 'Categoria inexistente');
        res.redirect('/admin/categorias');
    });
});
//edit category controller
router.post('/categorias/edit', eAdmin, function(req, res){
    let categoryId = req.body.id;
    let categoryName = req.body.nome;
    let categorySlug = req.body.slug;
    let erros = [];
    if(!categoryName || typeof categoryName == undefined || categoryName == null){
        erros.push({texto: 'Nome da categoria invalido'});
    }
    if(categoryName.length < 2){
        erros.push({texto: 'Nome da categoria muito pequeno'});
    }
    if(!categorySlug || typeof categorySlug == undefined || categorySlug == null){
        erros.push({texto: 'Slug da categoria invalido'});
    }
    if(erros.length > 0){
        res.render('admin/editcategoria', {erros: erros});
    }else{
        Categoria.findOne({_id: categoryId}).then(function(categoria){
            categoria.nome = categoryName;
            categoria.slug = categorySlug;

            categoria.save().then(function(){
                req.flash('success_msg', 'Categoria editada com sucesso');
                res.redirect('/admin/categorias');
            }).catch((err)=>{
                req.flash('error_msg', 'Houve um erro ao editar categoria!');
                res.redirect('/admin/categorias');
            })


        }).catch((err)=>{
            req.flash('msg_error', "Categoria inexistente");
            res.redirect('/admin/categorias');
        })
    }
});

//delete category controller
router.post('/categorias/deletar', eAdmin, function(req, res){
    Categoria.deleteOne({_id: req.body.id}).then(function(){
        req.flash('success_msg', 'Categoria deletada com sucesso');
        res.redirect('/admin/categorias');
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao deletar catgoria');
        res.redirect('/admin/categorias');
    });
});

// POSTS SECTION
//showing the posts
router.get('/postagens', eAdmin, function(req, res){
    Postagem.find().populate("categoria").sort({data: 'desc'}).then(function(postagens){
        res.render('admin/postagens', {postagens: postagens.map(postagem => postagem.toJSON())});
    }).catch((err)=>{
        req.flash('error_msg', 'Houve um erro ao listar as postagens');
        res.redirect('admin');
    })
}); 

router.get('/postagens/add', eAdmin, function(req, res){
    Categoria.find().then(function(categorias){
        res.render('admin/addpostagem', {categorias: categorias.map(categoria => categoria.toJSON())});
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao carregar o formulario');
        res.redirect('admin');
    });
});
router.post('/postagens/nova', eAdmin, function(req, res){
    let erros = [];
    if(req.body.categoria == 0){
        erros.push({texto: 'Categoria invalida'});
    }
    if(erros.length > 0){
        res.render('/admin/addpostagem', {erros: erros})
    }else{
        const novaPostagem = {
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria : req.body.categoria,
            slug : req.body.slug
        }
        new Postagem(novaPostagem).save().then(function(){
            req.flash('success_msg', 'Postagem criada com sucesso');
            res.redirect('/admin/postagens');
        }).catch((err)=>{
            req.flash('error_msg', 'Houve um erro ao salvar postagem');
            res.redirect('/admin/postagens');
        });
    }
});
router.get('/postagem/edit/:id', eAdmin, function(req, res){
    const idPost = req.params.id;
    Postagem.findOne({_id: idPost}).then(function(postagem){
        Categoria.find().then(function(categorias){
            res.render('admin/editpostagem', {postagem: postagem.toJSON(), categorias: categorias.map((categoria => categoria.toJSON()))});
        }).catch((err)=>{
            req.flash('error_msg', 'Houve um erro ao listar categorias');
            res.redirect('/admin/postagens');
        })
    }).catch((err)=>{
        req.flash('error_msg', 'Postagem inexistente');
        res.redirect('/admin/postagens');
    })
});

router.post('/postagem/edit', eAdmin, function(req, res){
    const idPost = req.body.id;
    let erros = [];
    let titulo = req.body.titulo;
    let slug = req.body.slug;
    let descricao = req.body.descricao;
    let conteudo = req.body.conteudo;
    let categoria = req.body.categoria;
    if(titulo.length < 4 || !titulo || typeof titulo == undefined || titulo == null){
        erros.push({texto: 'Titulo inválido!'});
    }
    if(slug.length < 4 || !slug || typeof slug == undefined || slug == null){
        erros.push({texto: 'Slug inválido'});
    }
    if(descricao.length < 4 || !descricao || typeof descricao == undefined || descricao == null){
        erros.push({texto: 'Descrição inválida'});
    }
    if(conteudo.length < 4 || !conteudo || typeof conteudo == undefined || conteudo == null){
        erros.push({texto: 'Conteudo inválido'});
    }
    if(categoria == 0){
        erros.push({texto: 'Categoría inexistente...'});
    }
    if(erros.length == 0){
        Postagem.findOne({_id: idPost}).then(function(postagem){
            postagem.titulo = titulo;
            postagem.slug = slug;
            postagem.descricao = descricao;
            postagem.categoria = categoria;
            postagem.conteudo = conteudo;
            postagem.save().then(function(){
                req.flash('success_msg', 'Postagem salva com sucesso');
                res.redirect('/admin/postagens');
            }).catch((err)=>{
                req.flash('error_msg', 'Houve um erro ao editar postagem');
                res.redirect('/admin/postagens');
            })

        }).catch((err)=>{
            req.flash('error_msg', 'Postagem inexistente...');
            res.redirect('/admin/postagens');
        })
    }else{
        res.render('admin/editpostagem', {erros: erros});
    }
    
});
router.get('/postagem/deletar/:id', eAdmin, function(req, res){
    Postagem.deleteOne({_id: req.params.id}).then(()=>{
        req.flash('success_msg', 'Postagem deletada com sucesso');
        res.redirect('/admin/postagens');
    }).catch(function(err){
        req.flash('error_msg', 'Houve um erro ao deletar a postagem');
        res.redirect('/admin/postagens');
    })
});
module.exports = router;