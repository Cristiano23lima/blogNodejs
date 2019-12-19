const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Usuario = new Schema({
    nome: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    senha: {
        type: String,
        required: true
    },
    eAdmin: {
        type: Number,
        default: 0
    }
})

//ta criando minha collection usuarios
mongoose.model("usuarios", Usuario);