export function validateCedula(cedula: string): boolean {
  if (!cedula || cedula.length !== 10) return false;
  
  const provincia = parseInt(cedula.substring(0, 2), 10);
  if (provincia < 1 || (provincia > 24 && provincia !== 30)) return false;
  
  const tercerDigito = parseInt(cedula[2], 10);
  if (tercerDigito > 5) return false;
  
  const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let suma = 0;
  
  for (let i = 0; i < 9; i++) {
    let valor = parseInt(cedula[i], 10) * coeficientes[i];
    if (valor > 9) valor -= 9;
    suma += valor;
  }
  
  const digitoVerificador = (10 - (suma % 10)) % 10;
  return digitoVerificador === parseInt(cedula[9], 10);
}

export function validateRuc(ruc: string): boolean {
  if (!ruc || ruc.length !== 13) return false;
  
  const cedula = ruc.substring(0, 10);
  if (!validateCedula(cedula)) return false;
  
  const establecimiento = ruc.substring(10, 13);
  return establecimiento === '001';
}
