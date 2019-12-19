//carregando modulos
const express = require('express');
const handlebars = require('express-handlebars');
const bodyParser = require('body-parser');
const app = express();
const admin = require('./routes/admin');
const client = require('./routes/client');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
require("./models/postagem");
const Postagem = mongoose.model("postagens");
const usuarios = require("./routes/usuario");
const passport = require("passport");
require("./config/auth")(passport);//passando passport como parametro para a função do auth
const db = require("./config/db");
const moment = require("moment");

//configurações
    //sessão
    //app.use() serve para criar middleware
    //devi-se seguir essa ordem de configuração da sessão
    app.use(session({
        secret: "cursodenode",
        resave: true,
        saveUninitialized: true
    }));

    app.use(passport.initialize());
    app.use(passport.session());

    app.use(flash());
    //Middleware
    app.use((req, res, next) => {
        res.locals.success_msg = req.flash("success_msg");
        res.locals.error_msg = req.flash("error_msg");
        res.locals.error = req.flash("error");
        res.locals.user = req.user || null;
        next();
    })
    //Body Parser
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json());
    //Handlebars
    app.engine('handlebars', handlebars({
        defaultLayout: 'main',
        helpers: {
            formatDate: (date) => {
                return moment(date).format("DD-MM-YYYY hh:mm:ss")
            }
        }
    }));
    app.set('view engine', 'handlebars');
    //Mongoose
    mongoose.Promise = global.Promise;
    mongoose.connect(db.mongoURI, {
        useNewUrlParser: true
    }).then(() => {
        console.log("Conectado ao mongo");
    }).catch((err) => {
        console.log(`Erro ${err}`);
    });
    //Public
    app.use(express.static(path.join(__dirname, 'public')));

//rotas
app.use('/', client);
app.use("/usuarios", usuarios);
app.use('/admin', admin);//definir o grupo de rotas com o prefixo /admin/nome_da pagina que deseja acessar

//outros
const port = process.env.PORT || 8089;
app.listen(port, () => {
    console.log("Servidor rodando");
})