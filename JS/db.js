const mysql = require("mysql2");
const conexion = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "AdriSC123@",
    database: "sistema_login",
});

conexion.connect(function(error){
    if(error){
        throw error;
    } else {
        console.log("Conexion exitosa a la base de datos");
    }
});

conexion.end();