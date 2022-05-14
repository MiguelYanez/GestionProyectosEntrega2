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

router.post('/formMitigar/:id_proyecto/:id_riesgo', async function(req,res){

var nombre_estrategia = "mitigar"
const rut_experto = req.user.rut;
const {id_proyecto} = req.params;
const {id_riesgo} = req.params;
var vinculos_provocante=false;
var respuesta_cambio = "";
var vinculos_prov = "";
if(req.body.vinculos_provocante===undefined){
  vinculos_prov="No";
}

if(vinculos_prov=="Si"){
  vinculos_provocante=true;
}
newReply0 = {
  respuesta_cambio,
  rut_experto,
  nombre_estrategia,
  id_riesgo
}

await pool.query('INSERT INTO respuesta_riesgo SET ?', newReply0);

var id = await pool.query('select MAX(id_solicitud) as id from respuesta_riesgo');
var id_solicitud = id[0].id;
var rrhh = req.body.rrhh;
var area_dedica = req.body.area_dedica;
var tiempo_provisorio = req.body.tiempo_provisorio;
var herramientas = req.body.herramientas;
var proveedor = req.body.proveedor;
var rut = rut_experto;
newReply1 = {
  id_solicitud,
  rut,
  rrhh,
  area_dedica,
  tiempo_provisorio,
  herramientas,
  vinculos_provocante,
  proveedor
}

await pool.query('INSERT INTO formulario_mitigar SET ?', newReply1);


var id_form = await pool.query ('SELECT MAX(id_formulario_mitigar) AS id FROM formulario_mitigar');
var id_formulario_mitigar = id_form[0].id
var factor = "";

if(req.body.factor1!==undefined){
  factor = req.body.factor1;
  newReply2 = {
    id_formulario_mitigar,
    rut,
    factor
  }
  await pool.query('INSERT INTO respuesta_factores SET ?', newReply2);
}

if(req.body.factor2!==undefined){
  factor = req.body.factor2;
  newReply3 = {
    id_formulario_mitigar,
    rut,
    factor
  }
  await pool.query('INSERT INTO respuesta_factores SET ?', newReply3);
}

if(req.body.factor3!==undefined){
  factor = req.body.factor3;
  newReply4 = {
    id_formulario_mitigar,
    rut,
    factor
  }
  await pool.query('INSERT INTO respuesta_factores SET ?', newReply4);
}

if(req.body.factor4!==undefined){
  factor = req.body.factor4;
  newReply5 = {
    id_formulario_mitigar,
    rut,
    factor
  }
  await pool.query('INSERT INTO respuesta_factores SET ?', newReply5);
}

res.redirect('/perfilExpertos')
});

router.post('/formTransferir/:id_proyecto/:id_riesgo', async function(req,res){

  var nombre_estrategia = "transferir"
  const rut_experto = req.user.rut;
  const {id_proyecto} = req.params;
  const {id_riesgo} = req.params;
 
  var respuesta_cambio = "";
 
 
  newReply0 = {
    respuesta_cambio,
    rut_experto,
    nombre_estrategia,
    id_riesgo
  }
  
  await pool.query('INSERT INTO respuesta_riesgo SET ?', newReply0);
  
  var id = await pool.query('select MAX(id_solicitud) as id from respuesta_riesgo');
  var id_solicitud = id[0].id;
  var orgaexterna = req.body.orgaexterna;
  var orgainterna = req.body.orgainterna;
  var transferenciaDinero = 0;
 
  var persointerna = req.body.persointerna;
  var persoexterna = req.body.persoexterna;
  var transferenciaTiempo = "";
  console.log(transferenciaTiempo)
  if(req.body.orgaexterna!==undefined){
   transferenciaDinero = parseInt(req.body.transferenciaDinero1)
   transferenciaTiempo = req.body.transferenciaTiempo1;
    newReply1 = {
      id_solicitud,
      rut_experto,
      orgaexterna,
      transferenciaTiempo,
      orgainterna,
      transferenciaDinero,
      persointerna,
      persoexterna
    }
    await pool.query('INSERT INTO formulario_transferir SET ?', newReply1);
  } 
  if(req.body.orgainterna!==undefined){
  transferenciaDinero = 0
   transferenciaTiempo = req.body.transferenciaTiempo1;
    orgaexterna="";
    transferenciaDinero=0;
    persoexterna= "";
    persointerna="";
    newReply2 = {
      id_solicitud,
      rut_experto,
      orgaexterna,
      transferenciaTiempo,
      orgainterna,
      transferenciaDinero,
      persointerna,
      persoexterna
    }
    await pool.query('INSERT INTO formulario_transferir SET ?', newReply2);
  } 
  if(req.body.persoexterna!==undefined){
    transferenciaDinero = parseInt(req.body.transferenciaDinero2)
    transferenciaTiempo = req.body.transferenciaTiempo2;
    newReply3 = {
      id_solicitud,
      rut_experto,
      orgaexterna,
      transferenciaTiempo,
      orgainterna,
      transferenciaDinero,
      persointerna,
      persoexterna
    }
    await pool.query('INSERT INTO formulario_transferir SET ?', newReply3);
  } 
  if(req.body.persointerna!==undefined){
    transferenciaDinero = 0
    transferenciaTiempo = req.body.transferenciaTiempo2;
    newReply4 = {
      id_solicitud,
      rut_experto,
      orgaexterna,
      transferenciaTiempo,
      orgainterna,
      transferenciaDinero,
      persointerna,
      persoexterna
    }
    await pool.query('INSERT INTO formulario_transferir SET ?', newReply4);
  }
 
  res.redirect('/perfilExpertos')
  });
module.exports = router;