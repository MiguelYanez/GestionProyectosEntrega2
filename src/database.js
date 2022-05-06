const mysql = require('mysql');
const {promisify} = require('util'); //codigo de callbacks a codigo de promesas

const { database } = require('./keys'); //solo sacamos la parte del objeto db

const pool = mysql.createPool(database); //conexion a la base de datos

pool.getConnection((err, connection)=>{
    if(err){
        if(err.code === 'PROTOCOL_CONNECTION_LOST'){ //la conexion con la bd fue perdida
            console.error('DATABASE CONNECTION WAS CLOSED');
        }else{
            if(err.code === 'ER_CON_COUNT_ERROR'){
                console.error('DATEBASE HAS TO MANY CONNECTIONS');
            }else{
                if(err.code === 'ECONNREFUSED'){ //conexion rechazada
                    console.error('DATABASE CONNECTION WAS REFUSED');
                }
            }
        }
        
    }else{
        if(connection) connection.release(); //si no tengo errores, empieza la conexion
        console.log('DB is connected');
    }
    return;
}); //metodo para tener la conexion prehecha

//Promisify Pool Querys --> convierto en promesas lo que antes era callbacks
pool.query = promisify(pool.query); //cada vez que haga un consulta a bd podre usar promesas (async y await )

module.exports = pool;
