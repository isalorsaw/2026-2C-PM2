
-- Dumping structure for table ilsw_movil.tbl_modulo
CREATE TABLE IF NOT EXISTS `tbl_modulo` (
  `modulo_codigo` varchar(50) COLLATE utf8_unicode_ci NOT NULL,
  `modulo_nombre` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL,
  `modulo_tipo` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL,
  `modulo_activity` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL,
  `modulo_estado` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`modulo_codigo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci ROW_FORMAT=DYNAMIC;

-- Dumping data for table ilsw_movil.tbl_modulo: ~29 rows (approximately)
INSERT INTO `tbl_modulo` (`modulo_codigo`, `modulo_nombre`, `modulo_tipo`, `modulo_activity`, `modulo_estado`) VALUES
	('0', 'Acceso al Sistema', 'ACCION', 'MainActivity', 'ACTIVO'),
	('0.1', 'Restringuir Intentos', 'ACCION', 'N/A', 'INACTIVO'),
	('1', 'Modulo Usuario', 'MODULO', 'UserActivity', 'ACTIVO'),
	('1.1', 'Crear Usuario', 'ACCION', 'N/A', 'ACTIVO'),
	('1.2', 'Modificar Usuario', 'ACCION', 'N/A', 'ACTIVO'),
	('1.3', 'Activar Usuario', 'ACCION', 'N/A', 'INACTIVO'),
	('1.4', 'Desactivar Usuario', 'ACCION', 'N/A', 'INACTIVO'),
	('1.5', 'Acceso QR para Usuario', 'ACCION', 'N/A', 'ACTIVO'),
	('10', 'Modulo Info. Dispositivo', 'MODULO', 'InfodisActivity', 'ACTIVO'),
	('2', 'Modulo Producto', 'MODULO', 'ProductActivity', 'ACTIVO'),
	('2.1', 'Crear Producto', 'ACCION', 'N/A', 'ACTIVO'),
	('2.2', 'Modificar Producto', 'ACCION', 'N/A', 'ACTIVO'),
	('2.3', 'Activar Producto', 'ACCION', 'N/A', 'INACTIVO'),
	('2.4', 'Desactivar Producto', 'ACCION', 'N/A', 'INACTIVO'),
	('3', 'Modulo Accesos', 'MODULO', 'AccesoActivity', 'ACTIVO'),
	('4', 'Modulo Cliente', 'MODULO', 'ClienteActivity', 'ACTIVO'),
	('4.1', 'Crear Cliente', 'ACCION', 'N/A', 'ACTIVO'),
	('4.2', 'Modificar Cliente', 'ACCION', 'N/A', 'ACTIVO'),
	('4.3', 'Activar Cliente', 'ACCION', 'N/A', 'INACTIVO'),
	('4.4', 'Desactivar Cliente', 'ACCION', 'N/A', 'INACTIVO'),
	('5', 'Modulo Pedido', 'MODULO', 'PedidoActivity', 'INACTIVO'),
	('5.1', 'Crear Pedido', 'ACCION', 'N/A', 'INACTIVO'),
	('5.2', 'Modificar Pedido', 'ACCION', 'N/A', 'INACTIVO'),
	('5.3', 'Activar Pedido', 'ACCION', 'N/A', 'INACTIVO'),
	('5.4', 'Desactivar Pedido', 'ACCION', 'N/A', 'INACTIVO'),
	('6', 'Modulo Bitacora', 'MODULO', 'Bitacora_Activity', 'ACTIVO'),
	('7', 'Modulo Ubicacion', 'MODULO', 'UbicacionActivity', 'ACTIVO'),
	('8', 'Modulo Cargar Ubicaciones', 'MODULO', 'UbicacionesActivity', 'ACTIVO'),
	('9', 'Modulo Marcar Ubicaciones', 'MODULO', 'UbicacionselActivity', 'ACTIVO');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
