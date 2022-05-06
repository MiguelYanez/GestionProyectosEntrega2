const bcrypt = require('bcryptjs');

const helpers = {};

helpers.encryptPassword = async (contrasena) => {
  const salt = await bcrypt.genSaltSync(10);
  const hash = await bcrypt.hash(contrasena, salt);
  return hash;
};

helpers.matchPassword = async (password, savedPassword) => {
  try {
    return await bcrypt.compare(password, savedPassword);
  } catch (e) {
    console.log(e)
  }
};

module.exports = helpers;
