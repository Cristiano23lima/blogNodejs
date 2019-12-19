const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
require("../models/postagem");
const Postagem = mongoose.model("postagens");
require("../models/Categoria");
const Categoria = mongoose.model("categorias");

router.get("/", (req, res) => {
    Postagem.find().populate("categoria").sort("-data").then((postagens) => {
        res.render("index", {postagens: postagens});
    }).catch((err) =>{
        req.flash("error_msg", "Houve um erro interno");
        req.redirect("/404");
    })
})

router.get("/postagem/:slug", (req, res) => {
    Postagem.findOne({slug: req.params.slug}).then((postagem) => {
        if(postagem){
            res.render("postagem/index", {postagem: postagem});
        }else{
            req.flash("error_msg", "Esta postagem não existe");
            res.redirect("/");
        }
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro interno");
        res.redirect("/");
    })
})

router.get("/categorias", (req, res) => {
    Categoria.find().sort("nome").then((categorias) => {
        res.render("categorias/index", {categorias: categorias});
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro interno ao listar as categorias");
        res.redirect("/");
    })
})

router.get("/categorias/:slug", (req, res) => {
    Categoria.findOne({slug: req.params.slug}).then((categoria) => {
        if(categoria){
            Postagem.find({
                categoria: categoria._id
            }).sort("-data").then((postagens) => {
                res.render("categorias/postagens", {postagens: postagens, categoria: categoria});
            }).catch((err)=> {
                req.flash("error_msg", "Houve interno ao listar os posts!");
                res.redirect('/');
            })
        }else{
            req.flash("error_msg", "Essa categoria não existe");
            res.redirect("/");
        }
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro interno ao buscar postagens da categoria");
        res.redirect("/");
    })
})

router.get("/404", (req, res) => {
    res.send("Error 404");
})

module.exports = router;