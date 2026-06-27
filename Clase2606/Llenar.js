 // 🔥 FUNCIÓN PRINCIPAL: Consulta al PHP
  const filtrarDispositivos = async () => {
    setLoading(true);
    setMensaje('');

    try 
    {
      // Preparar los datos que espera el PHP
      const data = {
        fecha_inicial: formatDateToYYYYMMDD(fechaInicio),
        fecha_final: formatDateToYYYYMMDD(fechaFin),
      };

      console.log('📤 Enviando al PHP:', data);

      // Hacer la petición POST
      const response = await fetch(API_URLS.FILTRAR_DISPOSITIVO, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(data),
      });

      // Verificar respuesta HTTP
      if (!response.ok) 
      {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      // Parsear JSON
      const resultado = await response.json();
      console.log('📥 Respuesta del PHP:', resultado);

      // Procesar según el status
      if (resultado.status === 'success') 
      {
        setDispositivosFiltrados(resultado.data);
        setMensaje(`${resultado.total} dispositivo(s) encontrado(s)`);
      } 
      else if (resultado.status === 'warning') 
      {
        setDispositivosFiltrados([]);
        setMensaje('No se encontraron dispositivos en el rango');
      } 
      else 
      {
        setDispositivosFiltrados([]);
        setMensaje(resultado.message || 'Error desconocido');
        Alert.alert('Error', resultado.message);
      }
    } 
    catch (error) 
    {
      console.error('❌ Error:', error);
      setMensaje('Error al conectar con el servidor');
      Alert.alert(
        'Error de Conexión',
        `No se pudo conectar con el servidor.\n\n${error.message}`
      );
    } 
    finally 
    {
      setLoading(false);
    }
  };