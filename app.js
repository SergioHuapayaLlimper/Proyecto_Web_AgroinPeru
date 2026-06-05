// 1 Invocación a express
const express = require('express');
const app = express();

// 2 Seteamos urlencoded y json
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// 3 Invocamos a dotenv
const dotenv = require('dotenv');
dotenv.config({ path: './env/.env' });

// 4 Archivos estáticos
app.use('/css', express.static(__dirname + '/CSS'));
app.use('/img', express.static(__dirname + '/img'));
app.use('/CSS', express.static(__dirname + '/CSS'));
app.use('/pages', express.static(__dirname + '/pages'));

// 5 Var de sesión
const session = require('express-session');
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

// 6 Conexión a la base de datos
const conexion = require('./database/db');
const path = require('path');
const ROOT = __dirname;

// ─── RUTAS PÚBLICAS ───────────────────────────────────────────────

app.get('/', (req, res) => {
    res.sendFile(path.join(ROOT, 'index.html'));
});

app.get('/login.html', (req, res) => {
    res.sendFile(path.join(ROOT, 'login.html'));
});

// ─── RUTAS PROTEGIDAS ADMIN ───────────────────────────────────────

app.get('/admin/dashboard', (req, res) => {
    if (req.session.loggedin && req.session.rol === 'admin') {
        const filePath = path.join(ROOT, 'pages/admin/dashboard.html');
        console.log('Buscando archivo en:', filePath);
        res.sendFile(filePath);
    } else {
        res.redirect('/login.html');
    }
});

app.get('/admin/inventario', (req, res) => {
    if (req.session.loggedin && req.session.rol === 'admin') {
        res.sendFile(path.join(ROOT, 'pages/admin/inventario.html'));
    } else {
        res.redirect('/login.html');
    }
});

app.get('/admin/reportes', (req, res) => {
    if (req.session.loggedin && req.session.rol === 'admin') {
        res.sendFile(path.join(ROOT, 'pages/admin/reportes.html'));
    } else {
        res.redirect('/login.html');
    }
});

app.get('/admin/usuarios', (req, res) => {
    if (req.session.loggedin && req.session.rol === 'admin') {
        res.sendFile(path.join(ROOT, 'pages/admin/usuarios.html'));
    } else {
        res.redirect('/login.html');
    }
});

// ─── RUTAS PROTEGIDAS CAJERO ──────────────────────────────────────

app.get('/empleado/ventas', (req, res) => {
    if (req.session.loggedin && req.session.rol === 'cajero') {
        res.sendFile(path.join(ROOT, 'pages/empleado/ventas.html'));
    } else {
        res.redirect('/login.html');
    }
});

app.get('/empleado/cierre', (req, res) => {
    if (req.session.loggedin && req.session.rol === 'cajero') {
        res.sendFile(path.join(ROOT, 'pages/empleado/cierre.html'));
    } else {
        res.redirect('/login.html');
    }
});

app.get('/empleado/devoluciones', (req, res) => {
    if (req.session.loggedin && req.session.rol === 'cajero') {
        res.sendFile(path.join(ROOT, 'pages/empleado/devoluciones.html'));
    } else {
        res.redirect('/login.html');
    }
});

app.get('/empleado/historial', (req, res) => {
    if (req.session.loggedin && req.session.rol === 'cajero') {
        res.sendFile(path.join(ROOT, 'pages/empleado/historial.html'));
    } else {
        res.redirect('/login.html');
    }
});

// ─── AUTENTICACIÓN ────────────────────────────────────────────────

app.post('/auth', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    if (email && password) {
        conexion.query('SELECT * FROM usuario WHERE email = ?', [email], (error, resultado) => {
            if (error) {
                console.error('Error en la consulta:', error);
                return res.send('Error en el servidor');
            }

            if (resultado.length === 0 || password !== resultado[0].password) {
                res.send('El correo o la contraseña son incorrectos');
            } else {
                // Guardamos sesión con rol
                req.session.loggedin = true;
                req.session.email = email;
                req.session.nombre = resultado[0].nombre;
                req.session.rol = resultado[0].rol;

                // Redirigimos según el rol
                if (resultado[0].rol === 'admin') {
                    res.redirect('/admin/dashboard');
                } else if (resultado[0].rol === 'cajero') {
                    res.redirect('/empleado/ventas');
                } else {
                    res.send('Rol no reconocido');
                }
            }
        });
    } else {
        res.send('Por favor ingresa correo y contraseña');
    }
});

// ─── CERRAR SESIÓN ────────────────────────────────────────────────

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login.html');
});

app.listen(3000, () => {
    console.log("Servidor corriendo en http://localhost:3000");
});
