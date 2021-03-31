const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require("../models/Categoria")
const Categoria = mongoose.model("categorias")
require("../models/Postagem")
const Postagem = mongoose.model("postagens")
const {eAdmin} = require("../helpers/eAdmin")

router.get("/", eAdmin, (req, res) => {
    res.render("admin/index")
})

router.get('/posts', eAdmin, (req, res) => {
    res.send("Pagina posts ADM")
})

router.get("/categorias", eAdmin, (req, res) => {
    Categoria.find().sort({date:"desc"}).lean().then((categorias) => {
        res.render("admin/categorias", {categorias: categorias})
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listas as categorias")
        res.redirect("/admin")
    })
})

router.get("/categorias/add", eAdmin, (req, res) => {
    res.render("admin/addcategoria")
})

router.post("/categorias/nova", (req, res) => {
    
    var erros = []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({texto: "nome inválido"})
    }
    
    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
        erros.push({texto: "slug inválido"})
    }

    if(req.body.nome.length < 2) {
        erros.push({texto: "nome da categoria muito pequeno"})
    }

    if(erros.length > 0) {
        res.render("admin/addcategoria", {erros : erros})
    } else {
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }
    
        new Categoria(novaCategoria).save().then(() => {
            req.flash("success_msg", "Categoria criada com sucesso")
            res.redirect('/admin/categorias')
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao salvar a categoria, tente novamente.")
            res.redirect("/admin")
        })
    }

router.get('/categorias/edit/:id', (req, res) =>{
    Categoria.findOne({_id:req.params.id}).lean().then((categorias) => {
        res.render("admin/editcategoria", {categorias: categorias})
    }).catch((err) => {
        req.flash("error_msg", "Essa categoria não existe")
        res.redirect("/admin/categorias")
    })
})    

router.post("/categorias/edit", (req, res) => {

    Categoria.findOne({_id: req.body.id}).then((categorias) => {

        categorias.nome = req.body.nome
        categorias.slug = req.body.slug

        categorias.save().then(() => {
            req.flash("success_msg", "Categoria editada com sucesso!")
            res.redirect("/admin/categorias")
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao salvar a categoria")
            res.redirect("/admin/categorias")
        })

    }).catch((err) => {
        req.flash("error_msg", "Houve um error ao editar a categoria")
        res.redirect("/admin/categorias")
    })

})


})

router.post("/categorias/deletar", (req, res) => {
    Categoria.remove({_id: req.body.id}).then(() => {
        req.flash("success_msg", "Categoria deletada com sucesso!")
        res.redirect("/admin/categorias")
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao deletar a categoria")
        res.redirect("/admin/categorias")
    })
})

router.get("/postagens", eAdmin,(req, res) => {

    Postagem.find().lean().populate("categorias").sort({data:"desc"}).then((postagens) => {
        res.render("admin/postagens", {postagens: postagens})
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar as postagens")
    })

})

router.get("/postagens/add", eAdmin, (req, res) => {
    Categoria.find().lean().then((categorias) => {
        res.render("admin/addpostagem", {categorias: categorias})
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao carregar o formulário.")
        res.redirect("/admin")
    })
})

router.post("/postagens/nova", (req, res) =>{

    var erros = []
     
    if(req.body.categoria == "0") {
        erros.push({texto: "Categoria inválida, registre uma categoria"})
    }

    if(erros.length > 0) {
        res.render("admin/addpostagem", {erros: erros})
    } else {
        const novaPostagem = {
            titulo : req.body.titulo,
            descricao : req.body.descricao,
            conteudo : req.body.conteudo,
            categoria : req.body.categoria,
            slug : req.body.slug
        }

        new Postagem(novaPostagem).save().then(() => {
            req.flash("success_msg", "Postagem criada com sucesso")
            res.redirect("/admin/postagens")
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro durante o salvamento da postagem")
            res.redirect("/admin/postagens")
        })

    }

})

// editar postagem

router.get("/postagens/edit/:id", eAdmin,(req, res) => {
    Postagem.findOne({_id: req.params.id}).lean().then((postagens) => {

        Categoria.find().lean().then((categorias) => {

        res.render("admin/editpostagem", {categorias: categorias,postagens: postagens})

        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao listar as categorias")
            res.redirect("/admin/postagens")
        })

    }).catch((err) => {
        req.flash("error_msg", "Essa postagem não exite")
        res.redirect("/admin/postagens")
    })
})

router.post("/postagens/edit", (req, res) => {

    Postagem.findOne({_id: req.body.id}).then((postagens) => {
        postagens.titulo = req.body.titulo
        postagens.slug = req.body.slug
        postagens.descricao = req.body.descricao
        postagens.conteudo = req.body.conteudo
        postagens.categoria = req.body.categoria

        postagens.save().then(() => {
            req.flash("success_msg", "Postagem editada com sucesso!")
            res.redirect("/admin/postagens")
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao editar a postagem.")
            res.redirect("admin/postagens")
        })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao editar a postagem.")
        res.redirect("admin/postagens")
    })

})


// deletar postagem
router.post("/postagens/deletar", (req, res) => {
    Postagem.remove({_id: req.body.id}).then(() => {
        req.flash("success_msg", "Postagem deletada com sucesso")
        res.redirect("/admin/postagens")
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao deletar a postagem")
        res.redirect("/admin/postagens")
    })
})



module.exports = router