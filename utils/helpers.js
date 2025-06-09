function calcularDiasDesde(fecha) {
  const ahora = new Date();
  const diferencia = ahora - new Date(fecha);
  return Math.floor(diferencia / (1000 * 60 * 60 * 24));
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
  calcularDiasDesde,
  delay
};
