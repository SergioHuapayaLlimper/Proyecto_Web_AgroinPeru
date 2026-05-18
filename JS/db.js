let mysql = require("mysql2");
let conexion = mysql.createConnection({
    host: "127.0.0.1",
    port: 3306,
    database:"sistema_login",
    user: "root",
    password: "AdriSC123@"
});

conexion.connect(function(error){
    if(error){
        throw error;
    } else {
        console.log("Conexion exitosa a la base de datos");
    }
});
conexion.end();