const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt-nodejs');

//referencia al modelo dende vamos a autenticar
const Usuarios = require('../models/Usuarios');

//local strategy - login
passport.use(
    new LocalStrategy(
        //por default espera usuario y contraseña
        {
            usernameField: 'email',
            passwordField: 'password'
        },
        async (email, password, done) => {
            console.log(email, password);
            try{
                const usuario = await Usuarios.findOne({
                    where: {
                        email: email,
                        activo: 1
                    }
                });
                
                //el usuario existe pero la contraseña es incorrecta
                //if(!usuario.verficarPassword(password)){
                if(!bcrypt.compareSync(password, usuario.password)){
                    return done(null, false, {
                        message: 'La contraseña es incorrecta',
                        email
                    });
                }

                return done(null, usuario);
            }catch (error) {
                //usuario no existe
                return done(null, false, {
                    message: 'La cuenta no existe'
                });
            }
        }
    )
);

//serializar el usuario
passport.serializeUser((usuario, callback) => {
    callback(null, usuario);
})

//deserializar el usuario
passport.deserializeUser((usuario, callback) => {
    callback(null, usuario);
})

module.exports = passport;