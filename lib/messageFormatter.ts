// Formatea mensajes para el chat con encabezados, viñetas y saltos de línea, estilo Make.com

export function formatCotizacionMensaje({formData, medidas, transcripcionVoz, transcripcionImagen, imagenes}) {
  let msg = `📝 *Nueva cotización enviada*\n\n`;
  msg += `*Lista de artículos solicitados:*\n`;
  msg += `• Tipo de plancha: ${formData.tipoPlancha}\n`;
  msg += `• Color: ${formData.color}\n`;
  if (medidas.length > 0) {
    msg += `• Medidas:`;
    medidas.forEach(m => {
      msg += `\n   • ${m.descripcion} (${m.cantidad} piezas)`;
    });
    msg += `\n`;
  }
  if (transcripcionVoz && transcripcionVoz.length > 0) {
    msg += `\n*Medidas dictadas por voz:*\n`;
    transcripcionVoz.forEach((t, i) => {
      msg += `   • ${t}\n`;
    });
  }
  if (transcripcionImagen && transcripcionImagen.length > 0) {
    msg += `\n*Medidas detectadas por imagen:*\n`;
    transcripcionImagen.forEach((t, i) => {
      msg += `   • ${t}\n`;
    });
  }
  if (imagenes && imagenes.length > 0) {
    msg += `\n*Imágenes adjuntas:*\n`;
    imagenes.forEach((img, i) => {
      msg += `   • ${img.nombre} - ${img.transcripcion || ''}\n`;
    });
  }
  msg += `\n*Datos adicionales que necesito:*\n`;
  msg += `• Nombre\n• Cédula/RUC\n• Entrega: Para la entrega a domicilio, ¿podrías indicarme la dirección exacta?\n`;
  msg += `• Vendedora asignada: ${formData.vendedora}\n`;
  msg += `\nCuando todo esté correcto, responde "confirmado". ¡Quedo atenta! 📝`;
  return msg.trim();
}

export function formatResumenPedido(cart) {
  let msg = `🛒 *Resumen de tu pedido*\n\n`;
  cart.forEach(item => {
    msg += `• ${item.product.name}\n  ${item.product.description || ''}\n  Precio: $${item.product.price.toFixed(2)}\n  Cantidad: ${item.quantity}\n  Subtotal: $${(item.product.price * item.quantity).toFixed(2)}\n\n`;
  });
  const total = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  msg += `*TOTAL: $${total.toFixed(2)}*`;
  msg += `\n\nPor favor revisa tu pedido y responde "confirmado" para continuar.`;
  return msg.trim();
}
