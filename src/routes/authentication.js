const express = require('express');
const router = express.Router();
const { validationResult } = require('express-validator');
const passport = require('passport');
const { isLoggedIn } = require('../lib/auth');
const pool = require('../database');
const multer = require('multer');

// SIGNUP
router.get('/signup', (req, res) => {
  var rol = null;
  res.render('auth/signup', {rol});
});

router.post('/signup', passport.authenticate('local.signup', {
  successRedirect: '/profile',
  failureRedirect: '/signup',
  failureFlash: true
}));

// SINGIN EXPERTOS
router.get('/signinExpertos', (req, res) => {
  res.render('auth/signinexpertos');
});

router.post('/signinExpertos', (req, res, next) => {
  const errors = validationResult(req);
  if (errors.length > 0) {
    req.flash('message', errors[0].msg);
    res.redirect('/signinExpertos');
  }
  passport.authenticate('local.signinExpertos', {
    successRedirect: '/perfilExpertos',
    failureRedirect: '/signinExpertos',
    failureFlash: true
  })(req, res, next);
});

// SINGIN JEFE PROYECTO
router.get('/signinJefeProyecto', (req, res) => {
  res.render('auth/signinjefeproyecto');
});

router.post('/signinJefeProyecto', (req, res, next) => {
  const errors = validationResult(req);
  if (errors.length > 0) {
    req.flash('message', errors[0].msg);
    res.redirect('/signinJefeProyecto');
  }
  passport.authenticate('local.signinJefeProyecto', {
    successRedirect: '/profile',
    failureRedirect: '/signinJefeProyecto',
    failureFlash: true
  })(req, res, next);
});

router.get('/logout', (req, res) => {
  req.logOut();
  res.redirect('/');
});

router.get('/profile', isLoggedIn, async (req, res) => {
  const exp = await pool.query('SELECT * FROM experto WHERE rut = ?', [req.user.rut]);
  if (exp.length > 0) {
    res.redirect('/perfilExpertos');
  }else{
    res.redirect('/perfilJefeProyecto');
  }
});
//PERFIL JEFE DE PROYECTO
router.get('/perfilJefeProyecto', isLoggedIn, async (req, res) => {
  res.render('perfiljefedeproyecto');
});


//PERFIL EXPERTOS
router.get('/perfilExpertos', isLoggedIn, async (req, res) => {
  const proyectos = await pool.query('SELECT proyecto.id_proyecto, proyecto.area_proyecto, proyecto.nombre_proyecto, cuenta.nombres, cuenta.apellidos FROM proyecto INNER JOIN cuenta on proyecto.rut_jp=cuenta.rut WHERE id_proyecto NOT IN (select id_proyecto from proyecto_experto_revisa WHERE rut_experto = ?);', [req.user.rut]);
  const proyectos_experto = await pool.query('SELECT proyecto.id_proyecto, proyecto.area_proyecto, proyecto.nombre_proyecto, cuenta.nombres, cuenta.apellidos FROM proyecto INNER JOIN cuenta on proyecto.rut_jp=cuenta.rut WHERE id_proyecto IN (select id_proyecto from proyecto_experto_revisa WHERE rut_experto = ?);', [req.user.rut]);
  const riesgos = await pool.query('SELECT * FROM riesgos;');
  res.render('perfilexpertos', { proyectos, proyectos_experto, riesgos });
});


router.get('/enlazar/:id_proyecto', isLoggedIn, async (req, res) => {
  const {id_proyecto} = req.params;
  try{
    await pool.query('insert into proyecto_experto_revisa (rut_experto, id_proyecto) values (?,?)', [req.user.rut, id_proyecto]);
    res.redirect('/perfilExpertos');
  }catch(error){
    console.log(error);
  }
});

router.get('/respuesta_riesgo/:id_proyecto/:id_riesgo', isLoggedIn, async (req, res) => {
  const {id_proyecto} = req.params;
  const {id_riesgo} = req.params;
  const vinculado = await pool.query('SELECT * FROM riesgos WHERE id_riesgo = ? AND id_proyecto IN (SELECT id_proyecto FROM proyecto_experto_revisa WHERE rut_experto = ? AND id_proyecto = ?)', [id_riesgo, req.user.rut, id_proyecto]);
  if (vinculado.length == 0){
    req.flash('message', 'Proyecto no vinculado');
    res.redirect('/perfilExpertos');
  }else{
    const proyecto = await pool.query('SELECT proyecto.id_proyecto, proyecto.area_proyecto, proyecto.nombre_proyecto, proyecto.estrategia_proyecto, cuenta.nombres, cuenta.apellidos FROM proyecto INNER JOIN cuenta on proyecto.rut_jp=cuenta.rut WHERE id_proyecto = ?;', [id_proyecto]);
    const riesgo = await pool.query('SELECT * FROM riesgos WHERE id_riesgo = ?;', [id_riesgo]);
    const A_O = await pool.query('SELECT A_O FROM riesgos where id_riesgo = ?;', [id_riesgo]);
    const alcances = await pool.query('SELECT * FROM alcances WHERE id_proyecto = ?;', [id_proyecto]);
    const plan = await pool.query ('SELECT * FROM plan_proyecto WHERE id_proyecto = ?;', [id_proyecto]);
    const cronograma = await pool.query ('SELECT * FROM cronograma_proyecto WHERE id_proyecto = ?;', [id_proyecto]);
    for(var z in cronograma){
      var fecha_ini = cronograma[z].inicio_proyecto.toISOString().substring(0, 10);
      var fecha_ter = cronograma[z].termino_proyecto.toISOString().substring(0, 10);
      if (cronograma[z]) {
				cronograma[z]['inicio_proyecto'] = fecha_ini;
				cronograma[z]['termino_proyecto'] = fecha_ter;
			}
    }
    if(A_O[0].A_O=='amenaza'){
      res.render('riskresponseAmenazas',{proyecto, riesgo, alcances, plan, cronograma});
    }else{
      res.render('riskresponseOportunidades',{proyecto, riesgo, alcances, plan, cronograma});
    }
  }
});

router.post('/respuesta_riesgo/:id_proyecto/:id_riesgo', async (req, res) => {
    const errors = validationResult(req);
    if (errors.length > 0) {
      req.flash('message', errors[0].msg);
      res.redirect('/perfilExpertos');
    }
    const {id_proyecto} = req.params;
      const {id_riesgo} = req.params;
      const { nombre_estrategia, respuesta_cambio, implementacion_riesgo } = req.body;
      const rut_experto = req.user.rut;
      newReply = {
        respuesta_cambio,
        rut_experto,
        nombre_estrategia,
        id_riesgo,
        implementacion_riesgo
      }
      await pool.query('INSERT INTO respuesta_riesgo SET ?', newReply, function(err,rows) {
        if (err){
          req.flash('message', err.sqlMessage);
          res.redirect('/perfilExpertos');
        }else{
          req.flash('success', 'Respuesta enviada satisfactoriamente');
          res.redirect('/perfilExpertos');
        }
      });
});

router.get('/descargar/:id', function(req,res){

  res.download(__dirname+'/plan_proyecto/'+req.params.id,
       req.params.id,function(err){
            if(!err){
                 console.log("se descargo tu archivo exitosamente")
            }else{
                  console.log(err)
                 console.log("hubo un error intentalo de nuevo")
            }
       });

      
});

router.post('/formEvitar/:id_proyecto/:id_riesgo', async function(req,res){
 
  if(req.files==""){
    var nombre_estrategia ="evitar" 
    var array = req.body;
    var respuesta_cambio = req.body.respuesta_cambio;
    const rut_experto = req.user.rut;
    const {id_proyecto} = req.params;
    const {id_riesgo} = req.params;
    array_nuevo = [];
    for(var h in array){
      array_nuevo.push(array[h])
    }
    
    newReply0 = {
      respuesta_cambio,
      rut_experto,
      nombre_estrategia,
      id_riesgo
    }

    await pool.query('INSERT INTO respuesta_riesgo SET ?', newReply0);
  
    array_alcances2 = [];
    const alcances = await pool.query('SELECT alcances FROM alcances WHERE id_proyecto = ?;', [req.params.id_proyecto]);
    array_alcances = [];
    for (var j in alcances){
      array_alcances.push(alcances[j].alcances)
    }
    for (var i in array_nuevo){
      if(array_alcances.includes(array_nuevo[i])){
        array_alcances2.push(array_nuevo[i]);
      }
    }
  
    for (var z in array_alcances2){
      const id_alcances = await pool.query('SELECT id_alcance FROM alcances WHERE alcances = ?;', [array_alcances2[z]]);
      var id_alcance =  id_alcances[0].id_alcance;
      newReply = {
        id_proyecto,
        rut_experto,
        id_alcance,
      }
      
      await pool.query('INSERT INTO alcance_respuesta SET ?', newReply);
    }
    fecha_modificacion = req.body.fecha_modificacion
    newReply3 = {
      id_proyecto,
      rut_experto,
      fecha_modificacion,
    }
  
    await pool.query('INSERT INTO modificacion_cronograma SET ?', newReply3);
    res.redirect('/perfilExpertos')
  
}else{
  
  var nombre_estrategia ="evitar" 
  var array = req.body;
  var respuesta_cambio = req.body.respuesta_cambio;
  const rut_experto = req.user.rut;
  const {id_proyecto} = req.params;
  const {id_riesgo} = req.params;
  array_nuevo = [];
  for(var h in array){
    array_nuevo.push(array[h])
  }
  
  newReply0 = {
    respuesta_cambio,
    rut_experto,
    nombre_estrategia,
    id_riesgo
  }

  await pool.query('INSERT INTO respuesta_riesgo SET ?', newReply0);

  array_alcances2 = [];
  const alcances = await pool.query('SELECT alcances FROM alcances WHERE id_proyecto = ?;', [req.params.id_proyecto]);
  array_alcances = [];
  for (var j in alcances){
    array_alcances.push(alcances[j].alcances)
  }
  for (var i in array_nuevo){
    if(array_alcances.includes(array_nuevo[i])){
      array_alcances2.push(array_nuevo[i]);
    }
  }
 
  for (var z in array_alcances2){
    const id_alcances = await pool.query('SELECT id_alcance FROM alcances WHERE alcances = ?;', [array_alcances2[z]]);
    var id_alcance =  id_alcances[0].id_alcance;
    newReply = {
      id_proyecto,
      rut_experto,
      id_alcance,
    }
    
    await pool.query('INSERT INTO alcance_respuesta SET ?', newReply);
  }

  var plan_proyecto_modificado = req.files[0].filename;

  newReply2 = {
    id_proyecto,
    rut_experto,
    plan_proyecto_modificado,
  }
  
  await pool.query('INSERT INTO plan_proyecto_modificado SET ?', newReply2);
  
  fecha_modificacion = req.body.fecha_modificacion
  newReply3 = {
    id_proyecto,
    rut_experto,
    fecha_modificacion,
  }
 
  await pool.query('INSERT INTO modificacion_cronograma SET ?', newReply3);
  res.redirect('/perfilExpertos')
}
});


module.exports = router;