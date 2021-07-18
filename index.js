const mongoose = require("mongoose")
const app = require("./app")
var controladorAdmin = require("./src/Controladores/admin.controlador");

mongoose.Promise = global.Promise
mongoose.connect('mongodb://localhost:27017/DBEmpresas', { useNewUrlParser: true , useUnifiedTopology: true }).then(()=>{
    console.log('Bienvenido!');

    controladorAdmin.loginAdmin();

    app.listen(3000, function (){
        console.log("Control de empresas corriendo");
    })
}).catch(err => console.log(err))