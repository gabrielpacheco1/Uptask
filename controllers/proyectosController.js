const Proyectos = require('../models/Proyectos');
const Tareas = require('../models/Tareas');

exports.proyectosHome = async (req, res) => {

    //console.log(res.locals.usuario);

    const usuarioId= res.locals.usuario.id;

    const proyectos = await Proyectos.findAll({where: {usuarioId}}); // equivale a SELECT * from proyectos
    res.render('index', {
        nombrePagina: "Proyectos",
        proyectos
    });
};

exports.formularioProyecto = async (req, res) => {
    const usuarioId= res.locals.usuario.id;

    const proyectos = await Proyectos.findAll({where: {usuarioId}});
    res.render('nuevoProyecto', {
        nombrePagina: "Nuevo proyecto",
        proyectos
    });
};

exports.nuevoProyecto = async(req, res) => {
    const usuarioId= res.locals.usuario.id;

    const proyectos = await Proyectos.findAll({where: {usuarioId}});
    //console.log(req.body);
    //res.send("Enviaste el formulario");

    //validar que tengamos algo en el input
    const {nombre} = req.body;
    let errores = [];

    if(!nombre){
        errores.push({'texto': 'Agregar un nombre al proyecto'})
    }

    if (errores.length > 0){
        res.render('nuevoProyecto', {
            nombrePagina: 'Nuevo proyecto',
            errores, 
            proyectos
        })
    }else{
        //insertar en la BD
        const usuarioId= res.locals.usuario.id;
        await Proyectos.create({nombre, usuarioId});
        res.redirect('/');
            
    }

}

exports.proyectoPorUrl = async (req, res, next) => {
    const usuarioId= res.locals.usuario.id;

    const proyectosPromise = Proyectos.findAll({where: {usuarioId}});

    const proyectoPromise = Proyectos.findOne({
        where : {
            url: req.params.url,
            usuarioId
        }
    });

    const [proyectos, proyecto] = await Promise.all([proyectosPromise, proyectoPromise]);

    //Consultar tareas del proyecto actual
    const tareas = await Tareas.findAll({
        where: {
            proyectoId: proyecto.id
        },
        //include: [
        //    {model: Proyectos}
        //]
    });

    if (!proyecto) return next();

    res.render('tareas', {
        nombrePagina: 'Tareas de Proyecto',
        proyecto,
        proyectos,
        tareas
    })
}

exports.formularioEditar = async (req, res) => {
    const usuarioId= res.locals.usuario.id;

    const proyectosPromise = Proyectos.findAll({where: {usuarioId}});

    const proyectoPromise = Proyectos.findOne({
        where: {
            id: req.params.id,
            usuarioId
        }
    });

    const [proyectos, proyecto] = await Promise.all([proyectosPromise, proyectoPromise]);

    //render a la vista
    res.render('nuevoProyecto', {
        nombrePagina : 'Editar proyecto', 
        proyectos,
        proyecto
    })
}

exports.actualizarProyecto = async(req, res) => {
    const usuarioId= res.locals.usuario.id;

    const proyectos = await Proyectos.findAll({where: {usuarioId}});
    //console.log(req.body);
    //res.send("Enviaste el formulario");

    //validar que tengamos algo en el input
    const {nombre} = req.body;
    let errores = [];

    if(!nombre){
        errores.push({'texto': 'Agregar un nombre al proyecto'})
    }

    if (errores.length > 0){
        res.render('nuevoProyecto', {
            nombrePagina: 'Nuevo proyecto',
            errores, 
            proyectos
        })
    }else{
        //insertar en la BD
        
        await Proyectos.update(
            {nombre: nombre},
            {where: {id: req.params.id}}
        );
        res.redirect('/');
            
    }
}

exports.eliminarProyecto = async (req, res, next) => {
    //req, query o params
    const {urlProyecto} = req.query;
    const result = await Proyectos.destroy({where: {url : urlProyecto}});

    if(!result){
        return next();
    }

    res.status(200).send('El proyecto fue eliminado correctamente');
}