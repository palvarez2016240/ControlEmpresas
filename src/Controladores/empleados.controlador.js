'use strict'

var empleado = require("../Modelos/empleado.model")
var datos;
const PDF = require('pdfkit');
const fs = require('fs');
var Excel = require('excel4node');

function registrarEmpleado(req, res) {
    var empleadoModel = new empleado();
    var params = req.body;

    if(req.user.rol != "ROL_EMPRESA"){
        return res.status(500).send({mensaje: 'Solo empresas pueden registrar empleados'});
    }

    if(params.nombre && params.puesto && params.departamento){
        empleadoModel.nombre = params.nombre;
        empleadoModel.rol = 'ROL_EMPLEADO'
        empleadoModel.puesto = params.puesto;
        empleadoModel.departamento = params.departamento;
        empleadoModel.empresa = req.user.sub;

        empleado.find({
            $or: [
                {nombre: empleadoModel.nombre},
            ]
        }).exec((err, empleadoGuardado)=>{
            if(err) return res.status(500).send({mensaje: 'Error en la peticion de empleado'});

            if(empleadoGuardado && empleadoGuardado.length >= 1){
                return res.status(500).send({mensaje: 'El empleado ya existe'});
            }else{
                empleadoModel.save((err, empleadoGuardado) => {
                    if(err) return res.status(500).send({mensaje: 'Error en la peticion de guardar empleado'});

                    if(empleadoGuardado){ 
                        res.status(200).send({empleadoGuardado})
                    }else{
                            res.status(404).send({mensaje: 'No se ha podido registrar el empleado'})
                        }
                    })
            }
        })
    }else{
        return res.status(500).send({mensaje: 'Error en la peticion, posiblemte datos incorrectos'});
    }
}

function editarEmpleado(req, res) {
    var idEmpresa = req.params.id;
    var params = req.body;

    if(!params.nombre && !params.puesto && !params.departamento){
        return res.status(500).send({mensaje: 'No hay ningun parametro correcto para editar'});
    }

    if(req.user.rol != "ROL_EMPRESA"){
        return res.status(500).send({mensaje: 'Solo las empresas tienen permisos para editar empleados'});
    }

    empleado.find({nombre: params.nombre}).exec((err, empleadoGuardado)=>{
        if(err) return res.status(500).send({mensaje: 'Error en la peticion de empleado'});
            if(empleadoGuardado && empleadoGuardado.length >= 1){
                return res.status(500).send({mensaje: 'El empleado ya existe'});
            }else{
                empleado.findOne({ _id:idEmpresa}).exec((err, empleadosEncontrados)=>{
                    if(err) return res.status(500).send({mensaje:"Error en la peticion obtener el empleado, datos incorrectos"});
                    if(!empleadosEncontrados) return res.status(500).send({mensaje:"Error en la consulta de empleados o No tienes datos "}); 
                                
                    if(empleadosEncontrados.empresa != req.user.sub ) return res.status(500).send({mensaje:"El empleado no es de tu empresa"});
                    empleado.findByIdAndUpdate(idEmpresa, params, {new: true}, (err, empleadoEditado)=>{
                        if(err) return res.status(500).send({mensaje: 'Error en la poticion'});
                        if(!empleadoEditado) return res.status(500).send({mensaje: 'No se a podido editar al empleado'});
                
                        return res.status(200).send({empleadoEditado});
                    }) 
                })
            }
    }) 
}

function eliminarEmpleado(req, res) {
    var idEmpresa = req.params.id;

    if (req.user.rol != "ROL_EMPRESA")
         return res.status(500).send({ mensaje: "Solo las empresas pueden eliminar empleados" })

    empleado.findOne({ _id: idEmpresa}).exec((err, empleadosEncontrados) => {
         if (err)
              return res.status(500).send({ mensaje: "Error en la peticion de eliminar empleados, posiblemete datos incorrectos" });

         if (!empleadosEncontrados)
              return res.status(500).send({ mensaje: "Error de eliminar empleados, el empleado no existe " });

         if (empleadosEncontrados.empresa != req.user.sub)
              return res.status(500).send({ mensaje: "El empleado es ajeno a tu empresa" });

               empleado.findByIdAndDelete(idEmpresa, (err, empleadoEliminado) => {
                if (err) return res.status(500).send({ mensaje: "Error en la peticion de eliminar" })
                if (!empleadoEliminado) return res.status(500).send({ mensaje: "No se ha podido eliminar el empleado" });

                if (empleadoEliminado) {
                     return res.status(200).send({ empleadoEliminado });
                }
            }) 
    })
}

function cantidadEmpleados(req, res) {
    var params = req.body;

    if (req.user.rol != "ROL_EMPRESA")
         return res.status(500).send({ mensaje: "Solo las empresas pueden buscar empleados" })

    if(!params.nombre){
        return res.status(500).send({ mensaje: "Parametros incorrectos" });
    }else{
        if(params.nombre === req.user.nombre){
            empleado.find({empresa: req.user.sub}).count().exec((err, empleadosEncontrados) => {
                if(err) return res.status(500).send({mensaje: 'Error en la peticion de los empleados'});
                if(!empleadosEncontrados) return res.status(500).send({mensaje: 'Error al obtener los empleados, no tienes empleados'});
                res.status(200).send({ mensaje: `${req.user.nombre} tiene ${empleadosEncontrados} empleado(s)`})
            })
        }else{
            return res.status(500).send({ mensaje: "Eres una empresa ajena a los empleados" });
        }
    }
}

function buscarEmpleadoId(req, res) {
    var idEmpleado = req.params.id;
    
    if(req.user.rol != "ROL_EMPRESA"){
        return res.status(500).send({mensaje: 'Solo las empresas pueden ver esto'});
    }

    empleado.findOne({ _id: idEmpleado}).exec((err, encontrados) => {
        if (err) return res.status(500).send({ mensaje: "Error en la peticion obtener la empresa, talvez no existe el empleado" });
        if(!encontrados) return res.status(500).send({mensaje: 'Error, no existe el empleado, deberia reiniciar el control'});
       /**/ empleado.findById(idEmpleado, (err, empleadosEncontrados) =>{
            if(empleadosEncontrados.empresa != req.user.sub ) return res.status(500).send({mensaje:"El empleado no es de tu empresa"})
            if(err) return res.status(500).send({mensaje: 'Error en la peticion de los empleados'});
            if(!empleadosEncontrados) return res.status(500).send({mensaje: 'Error al obtener los empleados'});
            return res.status(200).send(empleadosEncontrados) 
        })
    })
}

function buscarEmpleadoNombre(req, res) {
    var params = req.body;
    
    if(req.user.rol != "ROL_EMPRESA"){
        return res.status(500).send({mensaje: 'Solo las empresas pueden ver esto'});
    }
    
    if(!params.nombre){
        return res.status(500).send({mensaje: 'Parametros incorrectoa'});
    }

    empleado.findOne({ nombre: params.nombre}).exec((err, encontrados) => {
        if (err) return res.status(500).send({ mensaje: "Error en la peticion obtener el emplado, talvez no existe el empleado" });
        if(!encontrados) return res.status(500).send({mensaje: 'Error, no existe el empleado'});
        empleado.findOne({ nombre: params.nombre}).exec((err, empleadosEncontrados) =>{
            if(empleadosEncontrados.empresa != req.user.sub ) return res.status(500).send({mensaje:"El empleado no es de tu empresa"})
            if(err) return res.status(500).send({mensaje: 'Error en la peticion de los empleados'});
            if(!empleadosEncontrados) return res.status(500).send({mensaje: 'Error al obtener los empleados'});
            return res.status(200).send(empleadosEncontrados) 
        })
    })        
}

function buscarEmpleadoPuesto(req, res) {
    var params = req.body;
    
    if(req.user.rol != "ROL_EMPRESA"){
        return res.status(500).send({mensaje: 'Solo las empresas pueden ver esto'});
    }
    
    if(!params.puesto){
        return res.status(500).send({mensaje: 'Parametros incorrectoa'});
    }

    empleado.findOne({puesto: params.puesto}).exec((err, encontrados)=>{
        if(err) return res.status(500).send({mensaje: 'Error en la peticion de los empleados'});
        if(!encontrados) return res.status(500).send({mensaje: 'El puesto no existe'});
        empleado.find({
            $or: [
                {puesto: params.puesto, empresa: req.user.sub}
            ]
        }).exec((err, empleadosEncontrados) =>{
                if(err) return res.status(500).send({mensaje: 'Error en la peticion de los empleados'});
                if(!empleadosEncontrados) return res.status(500).send({mensaje: 'Error al obtener los empleados, no tiene empleados'});
                return res.status(200).send(empleadosEncontrados) 
            })
    })
}

function buscarEmpleadoDepartamento(req, res) {
    var params = req.body;
    
    if(req.user.rol != "ROL_EMPRESA"){
        return res.status(500).send({mensaje: 'Solo las empresas pueden ver esto'});
    }
    
    if(!params.departamento){
        return res.status(500).send({mensaje: 'Parametros incorrectos'});
    }

    empleado.findOne({departamento: params.departamento}).exec((err, encontrados)=>{
        if(err) return res.status(500).send({mensaje: 'Error en la peticion de los empleados'});
        if(!encontrados) return res.status(500).send({mensaje: 'El departamento no existe'});
        empleado.find({
            $or: [
                {departamento: params.departamento, empresa: req.user.sub}
            ]
        }).exec((err, empleadosEncontrados) =>{
                if(err) return res.status(500).send({mensaje: 'Error en la peticion de los empleados'});
                if(!empleadosEncontrados) return res.status(500).send({mensaje: 'Error al obtener los empleados'});
                return res.status(200).send(empleadosEncontrados) 
            })
    })
}

function buscarEmpleado(req, res) {
    var params = req.body;

    if (req.user.rol != "ROL_EMPRESA")
         return res.status(500).send({ mensaje: "Solo las empresas pueden buscar empleados" })

    if(!params.nombre){
        return res.status(500).send({ mensaje: "Parametros incorrectos" });
    }else{
        if(params.nombre === req.user.nombre){
            empleado.find({empresa: req.user.sub}).exec((err, empleadosEncontrados) => {
                if(err) return res.status(500).send({mensaje: 'Error en la peticion de los empleados'});
                if(!empleadosEncontrados) return res.status(500).send({mensaje: 'Error al obtener los empleados, no tienes empleados'});
                res.status(200).send({empleadosEncontrados})
            })
        }else{
            return res.status(500).send({ mensaje: "Eres una empresa ajena a los empleados" });
        }
    }
}

function empleadoPDF(req, res) {
    var params = req.body;

    if (req.user.rol != "ROL_EMPRESA")
         return res.status(500).send({ mensaje: "Solo las empresas pueden generar PDF" })

    if(!params.nombre){
        return res.status(500).send({ mensaje: "Parametros incorrectos" });
    }else{
        if(params.nombre === req.user.nombre){
            empleado.find({empresa: req.user.sub}).exec((err, empleadosEncontrados) => {
                if(err) return res.status(500).send({mensaje: 'Error en la peticion de los PDF'});
                if(!empleadosEncontrados) return res.status(500).send({mensaje: 'Error al obtener los PDF, no tienes PDF'});
                datos = empleadosEncontrados;
                var doc = new PDF();
                    doc.pipe(fs.createWriteStream(`./src/PDF/Empleados de ${req.user.nombre}.pdf`));
                
                    doc.text(`Nuestros empleados son:`,{
                        align: 'center',
                    })
                
                    doc.text(datos,{
                        align: 'left'
                    });

                doc.end();
                return res.status(200).send({ mensaje: "PDF generado"});
            })
        }else{
            return res.status(500).send({ mensaje: "Eres una empresa ajena a los empleados" });
        }
    }
}

function empleadoExcel(req, res) {
    var workbook = new Excel.Workbook();
    var worksheet = workbook.addWorksheet('Sheet 1');
    var params = req.body;

    if (req.user.rol != "ROL_EMPRESA")
         return res.status(500).send({ mensaje: "Solo las empresas pueden buscar empleados" })

    if(!params.nombre){
        return res.status(500).send({ mensaje: "Parametros incorrectos" });
    }else{
        if(params.nombre === req.user.nombre){
            empleado.find({empresa: req.user.sub}).exec((err, empleadosEncontrados) => {
                if(err) return res.status(500).send({mensaje: 'Error en la peticion de los empleados'});
                if(!empleadosEncontrados) return res.status(500).send({mensaje: 'Error al obtener los empleados, no tienes empleados'});
                var style = workbook.createStyle({
                    font: {
                      size: 20,
                      align: 'center'
                    },
                    numberFormat: '$#,##0.00; ($#,##0.00); -'
                  });
                
                  worksheet.cell(2,7).string('Nuestros Empleados:').style(style);
                  worksheet.cell(4,2).string(`${empleadosEncontrados}`);
                
                workbook.write(`./src/Excel/Empleados de ${req.user.nombre}.xlsx`);
                return res.status(200).send({ mensaje: `Excel generado de la empresa ${req.user.nombre}`});
            })
        }else{
            return res.status(500).send({ mensaje: "Eres una empresa ajena a los empleados" });
        }
    }
}

module.exports = {
    registrarEmpleado,
    editarEmpleado,
    eliminarEmpleado,
    cantidadEmpleados,
    buscarEmpleadoId,
    buscarEmpleadoNombre,
    buscarEmpleadoPuesto,
    buscarEmpleadoDepartamento,
    buscarEmpleado,
    empleadoPDF,
    empleadoExcel
}