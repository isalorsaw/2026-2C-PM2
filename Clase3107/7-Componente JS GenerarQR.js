// src/utils/generarQR.js
import QRCode from 'qrcode';

/**
 * Genera un QR y lo devuelve como:
 *  - base64 string
 *  - objeto Blob/File listo para subir con FormData
 */
export async function generarQRBase64(contenido) {
  // Devuelve "data:image/png;base64,iVBORw0KGgo..."
  const dataUrl = await QRCode.toDataURL(contenido, {
    width: 400,
    margin: 2,
    color: { dark: '#000000', light: '#ffffff' }
  });
  return dataUrl;
}

/**
 * Convierte el dataURL a un objeto File para subir con FormData
 */
export function dataURLToFile(dataUrl, filename = 'qr.png') {
  const [meta, base64] = dataUrl.split(',');
  const mime = meta.match(/:(.*?);/)[1];
  const byteString = atob(base64);
  const arrayBuffer = new ArrayBuffer(byteString.length);
  const uint8 = new Uint8Array(arrayBuffer);
  for (let i = 0; i < byteString.length; i++) {
    uint8[i] = byteString.charCodeAt(i);
  }
  return new File([arrayBuffer], filename, { type: mime });
}