const express = require('express');
const routes = require('./routes');
const path = require('path');
const bodyParser = require('body-parser');
const flash = require('connect-flash')
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('./config/passport');

require('dotenv').config({path: 'variables.env'});

//helpers con algunas func
const helpers = require('./helpers');

//Crear la concexion a la BD
const db = require('./config/db');

//Importar el modelo
require('./models/Proyectos');
require('./models/Tareas');
require('./models/Usuarios');

db.sync()
    .then (() => console.log('Conectado al servidor'))
    .catch(error => console.log(error));

//crear app express
const app = express();

//donde cargar archivos estaticos
app.use(express.static('public'));

//habilitar pug
app.set('view engine', 'pug');

//habilitar bodyparser para leer datos de los formularios
app.use(bodyParser.urlencoded({extended: true}));



//crear carpeta de vistas
app.set('views', path.join(__dirname, './views'));

//agregar flash
app.use(flash());

app.use(cookieParser());

//sesiones
app.use(session({
    secret: 'supersecreto',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

//pasar var dump a la aplicacion
app.use((req, res, next) => {
    res.locals.vardump = helpers.vardump;
    res.locals.mensajes = req.flash();
    res.locals.usuario = {...req.user} || null;
    next();
});


/*const productos = [
    {
        producto: 'Libro',
        precio: 11
    },
    {
        producto: 'Compu',
        precio: 2000
    }
];*/

//rutas para el home
//el .use lo que hace es ejecutar ese bloque ante cualquier request (get, post, delete, etc)
app.use('/', routes());

//estaba antes de ver el deployment
//app.listen(3000); //El puerto por el que va a escuchar la app

const host= process.env.HOST || '0.0.0.0';
const port= process.env.PORT || 3000;

app.listen(port, host, () => {
    console.log('El servidor está funcionando');
})
