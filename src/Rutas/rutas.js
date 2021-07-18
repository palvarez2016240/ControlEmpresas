'use strict'

var express = require("express");
var adminControlador = require("../Controladores/admin.controlador");
var empresaControlador = require("../Controladores/empresa.controlador")
var empleadoControlador = require("../Controladores/empleados.controlador");
var md_autorizacion = require("../middlewares/authenticated");

//RUTAS
var api = express.Router();
api.post('/loginAdmin', adminControlador.loginAdmin);
api.post('/registrarEmpresa',md_autorizacion.ensureAuth, empresaControlador.registrarEmpresa);
api.post('/loginEmpresa', empresaControlador.loginEmpresa);
api.put('/editarEmpresa/:id', md_autorizacion.ensureAuth, empresaControlador.editarEmpresa);
api.put('/eliminarEmpresa/:id', md_autorizacion.ensureAuth, empresaControlador.eliminarEmpresa);
api.post('/registrarEmpleado', md_autorizacion.ensureAuth , empleadoControlador.registrarEmpleado);
api.put('/editarEmpleado/:id', md_autorizacion.ensureAuth, empleadoControlador.editarEmpleado);
api.put('/eliminarEmpleado/:id', md_autorizacion.ensureAuth, empleadoControlador.eliminarEmpleado);
api.get('/cantidadEmpleados/', md_autorizacion.ensureAuth, empleadoControlador.cantidadEmpleados);
api.get('/buscarEmpleadoId/:id', md_autorizacion.ensureAuth, empleadoControlador.buscarEmpleadoId);
api.get('/buscarEmpleadoNombre/', md_autorizacion.ensureAuth, empleadoControlador.buscarEmpleadoNombre);
api.get('/buscarEmpleadoPuesto/', md_autorizacion.ensureAuth, empleadoControlador.buscarEmpleadoPuesto);
api.get('/buscarEmpleadoDepartamento/', md_autorizacion.ensureAuth, empleadoControlador.buscarEmpleadoDepartamento);
api.get('/buscarEmpleado/', md_autorizacion.ensureAuth, empleadoControlador.buscarEmpleado);
api.get('/empleadoPDF/', md_autorizacion.ensureAuth, empleadoControlador.empleadoPDF);
api.get('/empleadoExcel/', md_autorizacion.ensureAuth, empleadoControlador.empleadoExcel);

module.exports = api;