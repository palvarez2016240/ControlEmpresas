'use strict'

var admin = require("../modelos/admin.model");
var bcrypt = require('bcrypt-nodejs');
var jwt = require("../Servicios/jwt");
var vueltas = 'uno';

function loginAdmin(req, res) {
    var adminModel = new admin();
    var params = req.body;

    if(params.nombre === 'Admin' && params.password === '123456'){
        if(vueltas === 'uno'){
        adminModel.nombre = 'Admin';
        adminModel.password = '123456';
        adminModel.rol = 'ROL_ADMIN'
        vueltas = 'dos';

        admin.find({
            $or: [
                {nombre: adminModel.nombre},
            ]
        }).exec((err, adminGuardados)=>{
            if(err) return res.status(500).send({mensaje: 'Error en la peticion del admin'});

            if(adminGuardados && adminGuardados.length >= 1){
                return res.status(500).send({mensaje: 'El admin ya existe'});
            }else{
                bcrypt.hash('123456', null, null, (err, passwordEncriptada) => {
                adminModel.password = passwordEncriptada;

                adminModel.save((err, adminGuardado) => {
                    if(err) return res.status(500).send({mensaje: 'Error en la peticion de guardar admin'});

                    if(adminGuardado){ 
                        admin.findOne({ username: params.username }, (err, adminEncontrado) => {
                            if (err) return res.status(500).send({ mensaje: 'error en la peticion' });
                            if (adminEncontrado) {
                                bcrypt.compare(params.password, adminEncontrado.password, (err, passVerificada) => {
                                    if (passVerificada) {
                                    if (params.getToken === 'true') {
                                        return res.status(200).send({
                                            token: jwt.createToken(adminEncontrado)
                                        })
                                    } else {
                                        adminEncontrado.password = undefined;
                                        return res.status(200).send({ adminEncontrado });
                                    }
                                    } else {
                                        return res.status(500).send({ mensaje: 'El admin no se ha podido identificar' });
                                    }
                                });
                            }else {
                                return res.status(500).send({ mensaje: 'Error al buscar el maestro' });
                            }
                        })
                    }else{
                        res.status(404).send({mensaje: 'No se ha podido registrar el Maestro'})
                    }
                })
            })
        }
    })
}else{
    admin.findOne({ username: params.username }, (err, adminEncontrado) => {
        if (err) return res.status(500).send({ mensaje: 'error en la peticion' });
        if (adminEncontrado) {
            bcrypt.compare(params.password, adminEncontrado.password, (err, passVerificada) => {
                if (passVerificada) {
                if (params.getToken === 'true') {
                    return res.status(200).send({
                        token: jwt.createToken(adminEncontrado)
                    })
                } else {
                    adminEncontrado.password = undefined;
                    return res.status(200).send({ adminEncontrado });
                }
                } else {
                    return res.status(500).send({ mensaje: 'El admin no se ha podido identificar' });
                }
            });
        }else {
            return res.status(500).send({ mensaje: 'Error al buscar el maestro' });
        }
    })
}
    }else{
        res.status(404).send({mensaje: 'Datos incorrectos o incomplentos al ingresar al admin'})
    }
}

module.exports = {
    loginAdmin
}