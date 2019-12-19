const express = require('express');
const router = express.Router();//para possibilar a criação de rotas em arquivos separados
const mongoose = require('mongoose');
require("../models/Categoria");//importou o model categorias
require("../models/postagem");
const Categoria = mongoose.model("categorias");
const Postagem = mongoose.model("postagens");
const {eAdmin} = require('../helpers/eAdmin');//estou dizendo que quero pegar apenas a função eAdmin do arquivo eAdmin

router.get('/', eAdmin, (req, res) => {
    res.render("admin/index");
})


router.get('/posts', eAdmin, (req, res) => {
    res.send("Pagina de Posts");
})


router.get('/categorias', eAdmin, (req, res) => {
    Categoria.find().sort('-date').then((categorias) => {
        res.render("admin/categorias", {categorias: categorias})
    }).catch((err)=>{
        req.flash("error_msg", "Houve um erro ao listar as categorias");
        res.redirect("/admin");
    })
})

router.get('/categorias/add', eAdmin, (req, res) => {
    res.render('admin/addCategorias');
})

router.post('/categorias/nova', eAdmin, (req, res) => {
    
    var erros = [];

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({//serve para adicionar dados ao array
            texto: "Nome inválido"
        })
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({
            texto: "Slug inválido"
        });
    }
    
    if(req.body.nome.length < 2){
        erros.push({texto: "Nome da categoria é muito pequeno"});
    }

    if(erros.length > 0){
        res.render("admin/addCategorias", {erros: erros});
    }else{
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug.toLowerCase()
        }
    
        new Categoria(novaCategoria).save().then(() => {
            req.flash("success_msg", "Categoria criada com sucesso");
            res.redirect("/admin/categorias");
        }).catch((err)=>{
            req.flash("error_msg", "Erro ao salvar categoria, tente novamente!");
            res.redirect("/admin");
        })
    }

})

router.get('/categorias/edit/:id', eAdmin, (req, res) => {
    Categoria.findOne({
        _id: req.params.id
    }).then((categoria) => {
        res.render("admin/editCategorias", {categoria: categoria});
    }).catch((err) => {
        req.flash("error_msg", "Essa categoria não existe");
        res.redirect("/admin/categorias");
    })
})

router.post("/categorias/edit", eAdmin, (req, res) => {

    var erros = [];

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({
            texto: "Nome inválido"
        })
    }
    
    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({
            texto: "Slug inválido"
        })
    }

    if(req.body.nome.length < 2){
        erros.push({
            texto: "Campo nome muito pequeno"
        })
    }

    if(erros.length > 0){
        Categoria.findOne({
            _id: req.body.id
        }).then((categoria) => {
            res.render("admin/editCategorias", {categoria: categoria, erros: erros});
        }).catch((err) => {
            req.flash("error_msg", "Essa categoria não existe");
            res.redirect("/admin/categorias");
        })
    }else{
        Categoria.findOne({_id: req.body.id}).then((categoria) => {
            
            categoria.nome = req.body.nome;
            categoria.slug = req.body.slug.toLowerCase();
    
            categoria.save().then(() => {
                req.flash("success_msg", "Categoria editada com sucesso.");
                res.redirect("/admin/categorias");
            }).catch((err) => {
                req.flash("error_msg", "Houve um erro interno ao salvar a edição da categoria.");
                res.redirect("/admin/categorias");
            })
    
        }).catch((err) => {
            req.flash("error_msg", "Houve erro ao editar a categoria.");
            res.redirect("/admin/categorias");
        });
    }
})

router.post("/categorias/deletar", eAdmin, (req, res) => {
    Categoria.remove({_id: req.body.id}).then(() => {
        req.flash("success_msg", "Categoria deletado com sucesso");
        res.redirect("/admin/categorias");
    }).catch((err)=>{
        req.flash("error_msg", "Erro ao excluir categoria");
        res.redirect("/admin/categorias");
    });
})

router.get("/postagens", eAdmin, (req, res) => {
    Postagem.find().populate("categoria").sort("-data").then((postagens)=>{
        res.render("admin/postagens", {postagens: postagens});
    }).catch((err) =>{
        req.flash("error_msg", "Houve um erro ao listar as postagens");
        req.redirect("/admin");
    })
})

router.get("/postagens/add", eAdmin, (req, res) => {
    Categoria.find().then((categorias) => {
        res.render("admin/addPostagens", {categorias: categorias});
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao carregar o formulario");
        res.redirect("/admin");
    })
})

router.post("/postagens/nova", eAdmin, (req, res) => {

    var erros = [];
    if(req.body.categoria == "0"){
        erros.push({
            texto: "Categoria inválida, registre uma categoria"
        })
        res.render("admin/addPostagens", {erros: erros});
    }else{
        const novaPostagem = {
            titulo: req.body.titulo,
            slug: req.body.slug.toLowerCase(),
            conteudo: req.body.conteudo,
            categoria: req.body.categoria,
            descricao: req.body.descricao
        }

        new Postagem(novaPostagem).save().then(() => {
            req.flash("success_msg", "Postagem criada com sucesso!");
            res.redirect("/admin/postagens");
        }).catch((err) => {
            req.flash("error_msg", "Erro ao criar postagem!");
            res.redirect("/admin/postagens");
        })
    }
})

router.get("/postagens/edit/:id", eAdmin, (req, res) => {
    Postagem.findOne({_id: req.params.id}).then((postagem) => {
        Categoria.find().then((categorias) => {
            res.render("admin/editPostagens", {postagem: postagem, categorias: categorias});
        }).catch((err) => {
            req.flash("error_msg", 'Houve um erro ao mostrar categorias');
        })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao carregar formulario de edição");
        req.redirect("/admin/postagens");
    })
})

router.post("/postagens/edit", eAdmin, (req, res) => {
    Postagem.findOne({_id: req.body.id}).then((postagem) => {
        //dados da collection postagens sendo substituido por novos dados
        postagem.titulo = req.body.titulo;
        postagem.slug = req.body.slug.toLowerCase();
        postagem.conteudo = req.body.conteudo;
        postagem.descricao = req.body.descricao;
        postagem.categoria = req.body.categoria;

        postagem.save().then(()=>{
            req.flash("success_msg", "Postagem editado com sucesso");
            res.redirect("/admin/postagens");
        }).catch((err) => {
            req.flash("error_msg", "Houve ao editar postagem");
            res.redirect("/admin/postagens");
        })

    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao salvar edição");
        res.redirect("/admin/postagens");
    })
})

router.get("/postagens/deletar/:id", eAdmin, (req, res) => {
    Postagem.remove({_id: req.params.id}).then(() => {
        req.flash("success_msg", "Postagem deletada com sucesso");
        res.redirect("/admin/postagens");
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro interno");
        res.redirect("/admin/postagens");
    })
})


module.exports = router;