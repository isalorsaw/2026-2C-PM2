//Llamar a Guardar Evento en Bitacora
await BitacoraService.registrarEvento({
          accion: "CONEXION BD",
          estado_operacion: "EXITOSO",
          mensaje_error: null
        });