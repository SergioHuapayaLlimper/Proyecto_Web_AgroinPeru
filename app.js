// 1 invocación a express
const express = require('express');
const app = express();

//2 Seteamos urlencoded y json para que el servidor pueda interpretar los datos que le llegan
app.use(express.urlencoded({extended: false}));
app.use(express.json());

//3 Invocamos a dotenv
const dotenv = require('dotenv');
dotenv.config({path: './env/.env'});

//4 el directorio public es el que se va a encargar de mostrar los archivos estaticos (html, css, js)
app.use('/css', express.static(__dirname + '/CSS'));
// Servir la carpeta img
app.use('/img', express.static(__dirname + '/img'));


//5 Invocamos a bcryptjs para encriptar las contraseñas
const bcryptjs = require('bcryptjs');

//6 Var de sesión
const session = require('express-session');
app.use(session({
    secret:'secret',
    resave: true,
    saveUninitialized: true
}));

//7 Invocamos a la conexión de la base de datos
const conexion = require('./database/db');

//8 establecemos las rutas

const path = require('path');

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});



// 9 Autenticación de usuarios

app.post('/auth', async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    let passwordHash = await bcryptjs.hash(password, 8);
    if (email && password) {
        conexion.query('SELECT * FROM sistema_login.usuario WHERE email = ?', [email], async (error, resultado) => {
            if(resultado.length == 0 || !(await bcryptjs.compare(password, resultado[0].password))) {
               res.send('El correo o la contraseña son incorrectos');
            } else {
                res.send('Bienvenido ');
            } 
        });
    }
});

app.listen(3000, (req, res) => {
    console.log("Servidor corriendo en http://localhost:3000");
});