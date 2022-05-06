const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const pool = require('../database');
const helpers = require('./helpers');

//SINGIN EXPERTOS
passport.use('local.signinExpertos', new LocalStrategy({
  usernameField: 'rut',
  passwordField: 'contrasena',
  passReqToCallback: true
}, async (req, rut, contrasena, done) => {
  const rows = await pool.query('SELECT * FROM cuenta INNER JOIN experto ON cuenta.rut = experto.rut WHERE experto.rut = ?', [rut]);
  if (rows.length > 0) {
    const user = rows[0];
    const validPassword = await helpers.matchPassword(contrasena, user.contrasena)
    prueba = await helpers.encryptPassword(contrasena);
    if (validPassword) {
      done(null, user, req.flash('success', 'Bienvenido ' + user.nombres));
    } else {
      done(null, false, req.flash('message', 'Contraseña incorrecta'));
    }
  } else {
    return done(null, false, req.flash('message', 'Experto no encontrado.'));
  }
}));

//SINGIN JEFE PROYECTO
passport.use('local.signinJefeProyecto', new LocalStrategy({
  usernameField: 'rut',
  passwordField: 'contrasena',
  passReqToCallback: true
}, async (req, rut, contrasena, done) => {
  const rows = await pool.query('SELECT * FROM cuenta INNER JOIN jefe_proyecto ON cuenta.rut = jefe_proyecto.rut WHERE jefe_proyecto.rut = ?', [rut]);
  if (rows.length > 0) {
    const user = rows[0];
    const validPassword = await helpers.matchPassword(contrasena, user.contrasena)
    prueba = await helpers.encryptPassword(contrasena);
    if (validPassword) {
      done(null, user, req.flash('success', 'Bienvenido ' + user.nombres));
    } else {
      done(null, false, req.flash('message', 'Contraseña incorrecta'));
    }
  } else {
    return done(null, false, req.flash('message', 'Jefe proyecto no registrado.'));
  }
}));

//SING UP
passport.use('local.signup', new LocalStrategy({
  usernameField: 'rut',
  passwordField: 'contrasena',
  passReqToCallback: true
}, async (req, rut, contrasena, done) => {

  const { nombres, apellidos, correo, fecha_nacimiento, area, titulo } = req.body;
  let newUser = {
    rut,
    nombres,
    apellidos,
    correo,
    contrasena,
    fecha_nacimiento
  };
  newUser.contrasena = await helpers.encryptPassword(contrasena);
  const result = await pool.query('INSERT INTO cuenta SET ?', newUser, function(err,rows) {
    if (err){done(null, false, req.flash('message', err.sqlMessage));
    }else{
      if(area){registrarExperto(rut,area);
      }else{registrarJefeProyecto(rut,titulo);}
      done(null, false, req.flash('success', 'Usuario registrado satisfactoriamente'));
    }
  });
  return done(null, newUser);
}));

async function registrarExperto(rut, area){
  let experto = {rut, area};
  const result = await pool.query('INSERT INTO experto SET ?', experto, function(err,rows) {
    if (err){done(null, false, req.flash('message', err.sqlMessage));}
  });
}

async function registrarJefeProyecto(rut, titulo){
  let jefe_proyecto = {rut, titulo};
  const result = await pool.query('INSERT INTO jefe_proyecto SET ?', jefe_proyecto, function(err,rows) {
    if (err){done(null, false, req.flash('message', err.sqlMessage));}
  });
}

//Serializadores
passport.serializeUser((user, done) => {
  done(null, user.rut);
});

passport.deserializeUser(async (rut, done) => {
  const rows = await pool.query('SELECT * FROM cuenta WHERE rut = ?', [rut]);
  done(null, rows[0]);
});

