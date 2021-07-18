'use strict'

var empresa = require("../modelos/empresa.model");
var empleado = require("../Modelos/empleado.model")
var bcrypt = require('bcrypt-nodejs');
var jwt = require("../Servicios/jwt");
const { deleteMany } = require("../modelos/empresa.model");

function registrarEmpresa(req, res) {
    var empresaModel = empresa();
    var params = req.body;

    if (req.user.rol != "ROL_ADMIN") {
        return res.status(500).send({ mensaje: "Solo el admin pueden crear la empresa" })
    } else {
        if (params.nombre) {
            empresaModel.nombre = params.nombre;
            empresaModel.rol = 'ROL_EMPRESA'

            empresa.find({ nombre: empresaModel.nombre })
                .exec((err, empresaEncontrada) => {
                    if (err) return res.status(500).send({ mensaje: "error en la peticion de empresa" });
                    if (empresaEncontrada && empresaEncontrada.length >= 1) {
                        return res.status(500).send({ mensaje: "El empresa ya existe " });
                    } else {
                        empresaModel.save((err, empresaGuardadada) => {
                            if (err) return res.status(500).send({ mensaje: "Error en la peticion de la empresa" });
                            if (empresaGuardadada) {
                                res.status(200).send({ empresaGuardadada })
                            } else {
                                res.status(404).send({ mensaje: "No se a podido guardar la empresa" })
                            }
                        }
                     )
                    }
                }
            )
        }else{
            return res.status(500).send({mensaje: 'Error en la peticion, posiblemte datos incorrectos'});
        }
    }
}

function loginEmpresa(req, res) {
    var params = req.body;

    if(!params.nombre){
        return res.status(500).send({mensaje: 'Parametro incorrectos'})
    }

    empresa.findOne({ nombre: params.nombre }, (err, empresaEncontrada) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
        if (empresaEncontrada) {
                    if (params.getToken === 'true') {
                        return res.status(200).send({
                            token: jwt.createToken(empresaEncontrada)
                        })
                    } else {
                        empresaEncontrada.password = undefined;
                        return res.status(200).send({ empresaEncontrada });
                    }
        } else {
            return res.status(500).send({ mensaje: 'La empresa no existe' })
        }
     }
    )
}

function editarEmpresa(req, res) {
    var idEmpresa = req.params.id;
    var params = req.body;
    var empresaModel = empresa();

    if(!params.nombre){
        return res.status(500).send({mensaje: 'No hay ningun parametro correcto para editar'});
    }

    if(req.user.sub != idEmpresa){
        if (req.user.rol != "ROL_ADMIN")
            return res.status(500).send({ mensaje: "Solo el admin o la misma emprera puedem modificar" })
    }

    empresa.find({ nombre: params.nombre })
        .exec((err, empresaEncontrada) => {
            if (err) return res.status(500).send({ mensaje: "error en la peticion de empresa" });
            if (empresaEncontrada && empresaEncontrada.length >= 1) {
                return res.status(500).send({ mensaje: "El empresa ya existe " });
            }else{
                empresa.findOne({ _id: idEmpresa}).exec((err, empresaEncontrada) => {
                    if (err) return res.status(500).send({ mensaje: "Error en la peticion obtener la empresa, talvez no existe la empresa" });
                    if (!empresaEncontrada) return res.status(500).send({ mensaje: "Error en la peticion editar o No tienes datos " });
                        empresa.findByIdAndUpdate(idEmpresa, params, { new: true }, (err, empresaactualizada) => {
                            if (err) return res.status(500).send({ mensaje: "Error en la peticion" })
                            if (!empresaactualizada) return res.status(500).send({ mensaje: "No se ha podido editar  la empresa" });
                            if (empresaactualizada) {
                                return res.status(200).send({ empresaactualizada });
                            }
                         }
                    )}
                )
            }
    })
}

function eliminarEmpresa(req, res) {    
    var idEmpresa = req.params.id;
    var params = req.body;

    if(req.user.sub != idEmpresa){
        if (req.user.rol != "ROL_ADMIN")
            return res.status(500).send({ mensaje: "Solo el admin o la misma se puede elimnar" })
    }

    empresa.findOne({ _id: idEmpresa}).exec((err, empresaEncontrada) => {
         if (err)
              return res.status(500).send({ mensaje: "Error en la peticion de elimnar la empresa, posiblemte datos incorrectos" });

         if (!empresaEncontrada)
              return res.status(500).send({ mensaje: "Error en la perticion, datos incorrectos o no tienes datos " });
        
        empleado.find({ empresa: idEmpresa }).exec((err, empleadoEncontrado) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion de eliminar empleado' })
        if (!empleadoEncontrado) return res.status(500).send({ mensaje: 'No se han encontrado los datos' });
                        
        empleado.deleteMany({empresa: idEmpresa},{multi:true}, (err, empleadoEliminado) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
        if (!empleadoEliminado) return res.status(500).send({ mensaje: 'no se ha podido eliminar el empleado' });
            
            
            empresa.findByIdAndDelete(idEmpresa, (err, empresaEliminado) => {
            if (err) return res.status(500).send({ mensaje: "Error en la peticion" })
            if (!empresaEliminado) return res.status(500).send({ mensaje: "No se ha podido eliminar el empresa" });
            if (empresaEliminado) {
                return res.status(200).send({mensaje: `Fue eliminada la empresa y sus empleados${empresaEliminado}`});
            }
           }
        )})})
     })
}

module.exports = {
    registrarEmpresa,
    loginEmpresa,
    editarEmpresa,
    eliminarEmpresa
}