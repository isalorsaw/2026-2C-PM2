CREATE TABLE `tbl_usuario_img` (
	`usuario_id` INT(11) NOT NULL,
	`usuario_img_ruta` TEXT NOT NULL COLLATE 'utf8mb4_general_ci',
	PRIMARY KEY (`usuario_id`) USING BTREE
)
COLLATE='utf8mb4_general_ci'
ENGINE=InnoDB
;
