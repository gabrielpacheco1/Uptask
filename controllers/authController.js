const passport = require('passport')
const Usuarios = require('../models/Usuarios');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const crypto= require('crypto');
const bcrypt = require('bcrypt-nodejs');
const enviarEmail = require('../handlers/email'); 

exports.autenticarUsuario = passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/iniciar-sesion',
    failureFlash: true,
    badRequestMessage: 'Ambos campos son obligatorios'
});

//revisar si esta logueado
exports.usuarioAutenticado = (req, res, next) => {
    //autenticado
    if(req.isAuthenticated()){
        return next();
    }

    //no autenticado
    return res.redirect('/iniciar-sesion');
}

exports.cerrarSesion = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    })
}

//Genera un token si el usuario es valido
exports.enviarToken = async (req, res) => {
    const {email} = req.body;
    const usuario = await Usuarios.findOne({where: {email}});

    if(!usuario){
        req.flash('error', 'La cuenta no existe');
        res.redirect('/reestablecer');
    }

    usuario.token= crypto.randomBytes(20).toString('hex');
    usuario.expiracion = Date.now() + 3600000;
    await usuario.save();

    //url de reset
    const resetUrl = `http://${req.headers.host}/reestablecer/${usuario.token}`;
    
    //enviar correo con el token
    await enviarEmail.enviar({
        usuario,
        subject: 'Password reset',
        resetUrl,
        archivo: 'reestablecer-password'
    });

    req.flash('correcto', 'Se envió un mensaje a tu correo');
    res.redirect('/iniciar-sesion');
}

exports.validarToken = async (req, res) => {
    const usuario = await Usuarios.findOne({
        where: {token: req.params.token}
    });

    if(!usuario){
        req.flash('error', 'No válido');
        res.redirect('/reestablecer');
    }

    res.render('resetPassword', {
        nombrePagina: 'Reestablecer contraseña'
    })

}

exports.actualizarPassword = async (req, res) => {
    const usuario = await Usuarios.findOne({
        where: {
            token: req.params.token,
            expiracion: {
                [Op.gte] : Date.now()
            }
        }
    });

    if(!usuario){
        req.flash('error', 'No válido');
        res.redirect('/reestablecer');
    }

    usuario.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
    usuario.token = null;
    usuario.expiracion = null;

    await usuario.save();

    req.flash('correcto', 'Tu contraseña se ha modificado');
    res.redirect('/iniciar-sesion');
    
}