const reportConsult = async (req, res, next) => {
  const parameters = req.params;
  const url = req.url;
  console.log(`
  Hoy ${new Date()}
  Se ha recibido una consulta en la ruta ${url}
  con los parametros:
  `, parameters);
  next();
}

module.exports = { reportConsult }
