const timeago = require('timeago.js');

const helpers = {};

helpers.sinDatosRiesgos = (largoDatos, options)=>{
    if(largoDatos == 0 ){
        return options.fn("No hay información de momento");
    }else{
        return options.fn();
    }
}

helpers.ifEquals = (arg1, arg2, options) => {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
};

module.exports = helpers;