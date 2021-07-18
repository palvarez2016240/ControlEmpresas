'use strict'

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var adminSchema = Schema({
    nombre: String,
    password: String,
    rol: String
});

module.exports = mongoose.model('admin', adminSchema);