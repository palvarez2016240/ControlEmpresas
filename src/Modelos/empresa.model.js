'use strict'

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var empresaSchema = Schema({
    nombre: String,
    rol: String
});

module.exports = mongoose.model('empresa', empresaSchema);