const mysql = require("mysql2");
const conexion = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
});

conexion.connect(function(error){
    if(error){
        throw error;
    } else {
        console.log("Conexion exitosa a la base de datos");
    }
});

module.exports = conexion;

