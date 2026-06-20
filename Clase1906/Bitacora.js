import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Application from 'expo-application';
import { API_URLS } from '../config/config';

/**
 * Servicio para manejar todo lo relacionado con bitácora y dispositivo
 */
class BitacoraService 
{
  constructor() 
  {
    this.deviceInfo = null; // Cache de información del dispositivo
  }

  //===================================================================================================
  // 📱 OBTENER ID ÚNICO DEL DISPOSITIVO
  //===================================================================================================
  async obtenerIdDispositivo() 
  {
    try 
    {
      if (Platform.OS === 'web') 
      {
        // Web: Generar UUID y guardarlo en localStorage
        let deviceId = localStorage.getItem('app_device_id');
        
        if (!deviceId) 
        {
          deviceId = 'web_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
          localStorage.setItem('app_device_id', deviceId);
          console.log("🌐 Nuevo ID web generado:", deviceId);
        }
        
        return deviceId;
      } 
      else 
      {
        // Android/iOS: Usar ID nativo del dispositivo
        const deviceId = Device.osBuildId || Application.applicationId + '_' + Device.deviceName || 'expo_' + Date.now();
        console.log("📱 ID del dispositivo:", deviceId);
        return deviceId;
      }
    } 
    catch (error) 
    {
      console.error("❌ Error obteniendo ID del dispositivo:", error);
      return 'desconocido_' + Date.now();
    }
  }

  //===================================================================================================
  // 📊 OBTENER INFORMACIÓN COMPLETA DEL DISPOSITIVO
  //===================================================================================================
  async obtenerInfoDispositivo() 
  {
    try 
    {
      // Si ya tenemos la info cacheada, devolverla
      if (this.deviceInfo) 
      {
        return this.deviceInfo;
      }

      const uniqueId = await this.obtenerIdDispositivo();

      let info = {
        unique_id: uniqueId,
        nombre_equipo: '',
        marca: '',
        modelo: '',
        sistema_operativo: '',
        version_so: '',
        direccion_mac: null,
        modulo_codigo: 'App_Inventario_v1'
      };

      if (Platform.OS === 'web') 
      {
        // Información para Web
        info.nombre_equipo = navigator.userAgent.substring(0, 100);
        info.marca = 'Web';
        info.modelo = navigator.platform || 'Navegador';
        info.sistema_operativo = 'Web';
        info.version_so = navigator.userAgent.match(/Chrome\/([0-9.]+)/)?.[1] || 
                          navigator.userAgent.match(/Firefox\/([0-9.]+)/)?.[1] || 
                          'desconocido';
      } 
      else 
      {
        // Información para Android/iOS
        info.nombre_equipo = Device.deviceName || 'Desconocido';
        info.marca = Device.brand || 'Desconocida';
        info.modelo = Device.modelName || 'Desconocido';
        info.sistema_operativo = Device.osName || 'Desconocido';
        info.version_so = Device.osVersion || 'Desconocida';
        info.direccion_mac = null; // Expo no permite acceder a la MAC por seguridad
      }

      // Cachear la información
      this.deviceInfo = info;
      
      console.log("📊 Info del dispositivo:", info);
      return info;
    } 
    catch (error) 
    {
      console.error("❌ Error obteniendo info del dispositivo:", error);
      return null;
    }
  }
  //===================================================================================================
  // 📱 REGISTRAR/ACTUALIZAR DISPOSITIVO
  //===================================================================================================
  async registrarDispositivo(infoDispositivo = null) 
  {
    try 
    {
      // Si no se pasa info, obtenerla automáticamente
      if (!infoDispositivo) 
      {
        infoDispositivo = await this.obtenerInfoDispositivo();
      }

      if (!infoDispositivo || !infoDispositivo.unique_id) 
      {
        console.error("❌ No se pudo obtener información del dispositivo");
        return {
          exito: false,
          error: 'SIN_INFO',
          mensaje: 'No se pudo obtener información del dispositivo'
        };
      }

      console.log("📱 Registrando dispositivo:", infoDispositivo.unique_id);
      console.log("🌐 Ruta PHP:", API_URLS.REGISTRAR_DISPOSITIVO);

      // Preparar datos a enviar
      const datosEnviar = {
        dispo_unique_id: infoDispositivo.unique_id,
        dispo_nombre_equipo: infoDispositivo.nombre_equipo,
        dispo_marca: infoDispositivo.marca,
        dispo_modelo: infoDispositivo.modelo,
        dispo_so: infoDispositivo.sistema_operativo,
        dispo_so_version: infoDispositivo.version_so,
        dispo_dir_mac: infoDispositivo.direccion_mac,
        modulo_codigo: infoDispositivo.modulo_codigo
      };

      console.log("📦 Datos a enviar:", datosEnviar);

      const response = await fetch(API_URLS.REGISTRAR_DISPOSITIVO, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(datosEnviar),
      });

      const textoRespuesta = await response.text();
      console.log("📄 Respuesta cruda del servidor:", textoRespuesta);
      console.log("📄 Código de estado HTTP:", response.status);

      // Verificar si la respuesta es HTML
      if (textoRespuesta.trim().startsWith('<!DOCTYPE') || 
          textoRespuesta.trim().startsWith('<html')) 
      {
        console.error("❌ El servidor devolvió HTML en lugar de JSON");
        return {
          exito: false,
          error: 'HTML_RESPONSE',
          mensaje: 'El servidor devolvió una página de error',
          detalles: { contenido: textoRespuesta.substring(0, 500) }
        };
      }

      // Parsear JSON
      let data;
      try 
      {
        data = JSON.parse(textoRespuesta);
      } 
      catch (parseError) 
      {
        console.error("❌ No se pudo parsear como JSON:", textoRespuesta);
        return {
          exito: false,
          error: 'PARSE_ERROR',
          mensaje: 'La respuesta del servidor no es un JSON válido',
          detalles: { respuesta_cruda: textoRespuesta }
        };
      }

      if (data.exito) 
      {
        console.log(`✅ Dispositivo registrado (${data.operacion}):`, data.mensaje_operacion);
        return {
          exito: true,
          operacion: data.operacion,
          mensaje: data.mensaje_operacion,
          dispo_unique_id: data.dispo_unique_id
        };
      } 
      else 
      {
        console.error("❌ Error al registrar dispositivo:", data.mensaje);
        console.error("📋 Detalles:", data.detalles);
        return {
          exito: false,
          error: 'API_ERROR',
          mensaje: data.mensaje || 'Error al registrar dispositivo',
          detalles: data.detalles || null
        };
      }
    } 
    catch (error) 
    {
      console.error("❌ Error de conexión al registrar dispositivo:", error);
      
      let tipoError = 'DESCONOCIDO';
      let mensajeError = error.message;

      if (error.message?.includes('Network request failed')) 
      {
        tipoError = 'NETWORK_ERROR';
        mensajeError = 'No se pudo conectar al servidor';
      } 
      else if (error.message?.includes('timeout')) 
      {
        tipoError = 'TIMEOUT_ERROR';
        mensajeError = 'La conexión tardó demasiado';
      }

      return {
        exito: false,
        error: tipoError,
        mensaje: mensajeError
      };
    }
  }
  //===================================================================================================
  // 📝 REGISTRAR EVENTO EN BITÁCORA
  //===================================================================================================
  async registrarEvento({
    usuario_id = 0,
    dispo_unique_id = null,
    ip_origen = null,
    accion,
    tabla_afectada = null,
    registro_id = null,
    datos_anteriores = null,
    datos_nuevos = null,
    estado_operacion = 'EXITOSO',
    mensaje_error = null
  }) 
  {
    try 
    {
      // Si no tenemos el ID del dispositivo, obtenerlo
      if (!dispo_unique_id) 
      {
        dispo_unique_id = await this.obtenerIdDispositivo();
      }

      console.log("📝 Registrando evento en bitácora:", accion);

      console.log("La Ruta PHP es ",API_URLS.REGISTRAR_BITACORA);

      const response = await fetch(API_URLS.REGISTRAR_BITACORA, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          usuario_id,
          dispo_unique_id,
          ip_origen,
          accion,
          tabla_afectada,
          registro_id,
          datos_anteriores,
          datos_nuevos,
          estado_operacion,
          mensaje_error
        }),
      });

      //const textoRespuesta = await response.text();
      //console.log("📄 Respuesta cruda del servidor:", textoRespuesta);
      //console.log("📄 Código de estado HTTP:", response.status);

      const data = await response.json();

      if (data.exito) 
      {
        console.log("✅ Evento registrado en bitácora");
        return true;
      } 
      else 
      {
        console.error("❌ Error al registrar en bitAcora:", data.mensaje+" "+data);
        return false;
      }
    } 
    catch (error) 
    {
      console.error("❌ Error de conexión al registrar bitácora:", error);
      
      // Opcional: Guardar en cola para sincronizar después
      await this.guardarEnColaOffline({
        usuario_id,
        dispo_unique_id,
        accion,
        tabla_afectada,
        registro_id,
        datos_anteriores,
        datos_nuevos,
        estado_operacion,
        mensaje_error,
        timestamp: new Date().toISOString()
      });
      
      return false;
    }
  }

  //===================================================================================================
  // 💾 GUARDAR EN COLA OFFLINE (Para sincronizar después)
  //===================================================================================================
  async guardarEnColaOffline(evento) 
  {
    try 
    {
      // En una implementación real, usarías AsyncStorage
      // Por ahora solo mostramos un log
      console.log("💾 Evento guardado en cola offline:", evento);
      
      // TODO: Implementar con AsyncStorage
      // const cola = await AsyncStorage.getItem('bitacora_cola');
      // const colaArray = cola ? JSON.parse(cola) : [];
      // colaArray.push(evento);
      // await AsyncStorage.setItem('bitacora_cola', JSON.stringify(colaArray));
      
      return true;
    } 
    catch (error) 
    {
      console.error("❌ Error guardando en cola offline:", error);
      return false;
    }
  }

  //===================================================================================================
  // 🔄 SINCRONIZAR EVENTOS PENDIENTES
  //===================================================================================================
  async sincronizarPendientes() 
  {
    try 
    {
      // TODO: Implementar con AsyncStorage
      // const cola = await AsyncStorage.getItem('bitacora_cola');
      // if (!cola) return 0;
      
      // const colaArray = JSON.parse(cola);
      // let sincronizados = 0;
      
      // for (const evento of colaArray) {
      //   const exito = await this.registrarEvento(evento);
      //   if (exito) sincronizados++;
      // }
      
      // await AsyncStorage.removeItem('bitacora_cola');
      
      console.log("🔄 Sincronización de eventos pendientes completada");
      return 0;
    } 
    catch (error) 
    {
      console.error("❌ Error sincronizando pendientes:", error);
      return 0;
    }
  }
}

// Exportar una instancia única (Singleton)
export default new BitacoraService();