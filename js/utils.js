/**
 * ══════════════════════════════════════════════════
 * EL ÚLTIMO ALGORITMO
 * Utils — Funciones auxiliares compartidas
 * ══════════════════════════════════════════════════
 */

/**
 * Envuelve un texto en múltiples líneas respetando estrictamente los límites
 * de palabras para que ninguna palabra quede cortada a la mitad ni separada por guiones.
 * Si una sola palabra excede el ancho máximo disponible, se divide limpiamente.
 *
 * @param {string} texto - Texto a envolver.
 * @param {number} [maxAncho=70] - Máximo de caracteres por línea.
 * @returns {string[]} Array de líneas ajustadas por palabra.
 */
export function envolverTextoPorPalabras(texto, maxAncho = 70) {
  if (texto === null || texto === undefined) return [];
  const str = String(texto);
  if (!str) return [];

  const ancho = Math.max(10, Number(maxAncho) || 70);
  const resultado = [];
  const parrafos = str.split(/\r?\n/);

  for (const parrafo of parrafos) {
    if (!parrafo.trim()) {
      resultado.push('');
      continue;
    }

    const palabras = parrafo.split(/\s+/).filter(Boolean);
    let lineaActual = '';

    for (const palabra of palabras) {
      if (!palabra) continue;

      if (!lineaActual) {
        if (palabra.length > ancho) {
          for (let i = 0; i < palabra.length; i += ancho) {
            const trozo = palabra.slice(i, i + ancho);
            if (i + ancho >= palabra.length) {
              lineaActual = trozo;
            } else {
              resultado.push(trozo);
            }
          }
        } else {
          lineaActual = palabra;
        }
      } else if (lineaActual.length + 1 + palabra.length <= ancho) {
        lineaActual += ' ' + palabra;
      } else {
        resultado.push(lineaActual);
        if (palabra.length > ancho) {
          for (let i = 0; i < palabra.length; i += ancho) {
            const trozo = palabra.slice(i, i + ancho);
            if (i + ancho >= palabra.length) {
              lineaActual = trozo;
            } else {
              resultado.push(trozo);
            }
          }
        } else {
          lineaActual = palabra;
        }
      }
    }

    if (lineaActual) {
      resultado.push(lineaActual);
    }
  }

  return resultado;
}
