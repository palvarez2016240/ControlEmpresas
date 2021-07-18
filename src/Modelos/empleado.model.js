'use strict'

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var empleadoSchema = Schema({
    nombre: String,
    rol: String,
    puesto: String,
    departamento: String,
    empresa: {type: Schema.ObjectId, ref: 'empresa'}
});

module.exports = mongoose.model('empleado', empleadoSchema);