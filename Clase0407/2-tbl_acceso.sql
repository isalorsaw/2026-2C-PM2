
-- Dumping structure for table ilsw_movil.tbl_acceso
CREATE TABLE IF NOT EXISTS `tbl_acceso` (
  `usuario_id` int(11) NOT NULL,
  `modulo_codigo` varchar(50) COLLATE utf8_unicode_ci NOT NULL,
  `acceso_estado` tinyint(4) DEFAULT NULL,
  PRIMARY KEY (`usuario_id`,`modulo_codigo`),
  KEY `FK_tbl_acceso_tbl_modulo` (`modulo_codigo`) USING BTREE,
  CONSTRAINT `FK_tbl_acceso_tbl_modulo` FOREIGN KEY (`modulo_codigo`) REFERENCES `tbl_modulo` (`modulo_codigo`) ON UPDATE CASCADE,
  CONSTRAINT `FK_tbl_acceso_tbl_user` FOREIGN KEY (`usuario_id`) REFERENCES `tbl_usuario` (`usuario_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
