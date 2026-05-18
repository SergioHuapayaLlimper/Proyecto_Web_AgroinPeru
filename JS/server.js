//1 invocamos express

let express = require('express')    
let app = express();

//2 seteamos urlencoded y json para que el servidor pueda recibir datos desde el cliente
app.use(express.urlencoded({extended: true}));
app.use(express.json());
/*
//3 Invocamos a dotenv para manejar variables de entorno
const dotenv = require('dotenv');
dotenv.config({path: './env/.env'});

//4 directorio public
app.use('/resources', express.static('public'));
app.use('/resources', express.static(__dirname + '/public'));

//5 establecemos el motor de plantillas
app.set('view engine', 'ejs');

//6 Invocamos a bcryptjs para encriptar contraseñas
const bcryptjs = require('bcryptjs');

//7 Variable de sesion
const session = require('express-session');
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

*/
app.get('/', (req, res) => {
    res.send("Hola mundo desde el servidor");
});

app.listen(3000, (req, res) => {
    console.log("Servidor corriendo en el puerto http://localhost:3000");
})