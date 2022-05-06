-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 07-05-2022 a las 00:05:47
-- Versión del servidor: 10.4.22-MariaDB
-- Versión de PHP: 8.1.1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `gestionproyectos`
--

DELIMITER $$
--
-- Funciones
--
CREATE DEFINER=`root`@`localhost` FUNCTION `validate_rut` (`RUT` VARCHAR(12)) RETURNS INT(11) BEGIN
DECLARE strlen INT;
DECLARE i INT;
DECLARE j INT;
DECLARE suma NUMERIC;
DECLARE temprut VARCHAR(12);
DECLARE verify_dv CHAR(2);
DECLARE DV CHAR(1);
SET RUT = REPLACE(REPLACE(RUT, '.', ''),'-','');
SET DV = SUBSTR(RUT,-1,1);
SET RUT = SUBSTR(RUT,1,LENGTH(RUT)-1);
SET i = 1;
  SET strlen = LENGTH(RUT);
  SET j = 2;
  SET suma = 0;
IF strlen = 8 OR strlen = 7 THEN
SET temprut = REVERSE(RUT);
moduloonce: LOOP
    IF i <= LENGTH(temprut) THEN
    SET suma = suma + (CONVERT(SUBSTRING(temprut, i, 1),UNSIGNED INTEGER) * j); 
      SET i = i + 1;
      IF j = 7 THEN
    SET j = 2;
    ELSE
    SET j = j + 1;
    END IF;
      ITERATE moduloonce;
    END IF;
    LEAVE moduloonce;
  END LOOP moduloonce;
  SET verify_dv = 11 - (suma % 11);
  IF verify_dv = 11 THEN
  SET verify_dv = 0;
  ELSEIF verify_dv = 10 THEN 
  SET verify_dv = 'K';
  END IF;
  IF DV = verify_dv THEN
  RETURN 1;
  ELSE 
  RETURN 0;
  END IF;
END IF;
RETURN 0;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `aceptar_activo`
--

CREATE TABLE `aceptar_activo` (
  `id_formulario_aceptar` int(11) NOT NULL,
  `cantidad_tiempo` varchar(15) NOT NULL,
  `dinero` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `alcances`
--

CREATE TABLE `alcances` (
  `id_proyecto` int(11) NOT NULL,
  `alcances` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `alcances`
--

INSERT INTO `alcances` (`id_proyecto`, `alcances`) VALUES
(9, 'alcance 1'),
(9, 'alcance 2');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cronograma_proyecto`
--

CREATE TABLE `cronograma_proyecto` (
  `id_proyecto` int(11) NOT NULL,
  `cronograma` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cuenta`
--

CREATE TABLE `cuenta` (
  `rut` varchar(12) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombres` varchar(70) COLLATE utf8mb4_unicode_ci NOT NULL,
  `apellidos` varchar(70) COLLATE utf8mb4_unicode_ci NOT NULL,
  `correo` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contrasena` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_nacimiento` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `cuenta`
--

INSERT INTO `cuenta` (`rut`, `nombres`, `apellidos`, `correo`, `contrasena`, `fecha_nacimiento`) VALUES
('19.181.288-3', 'Sara Romina', 'Gonzalez Mendez', 'sarah13.ro@gmail.com', '$2a$10$JoWh948FaZjpsIhbmNEd5uaFjXiw9X4GY4qPmCJxx36UAyr3aedzC', '1966-09-14'),
('19.830.724.6', 'Damian Jose', 'Sepulveda Reyes', 'damian.sepulveda@gmail.com', '$2a$10$qDP1WIj6.YIlz.nYbKuBkO.3P3LxR9EgnDLS30zFVnIOm4hr5jUS6', '1956-03-14'),
('20.271.137-5', 'Mauricio Eduardo', 'De  Juan Palavecino', 'mauricio.dejuan@alumnos.uv.cl', '$2a$10$HkY2TGbegzwoSE2tM0z0WOK.JV/B35FmdMP7ujXWny3CH6oONK/Ri', '1999-09-14'),
('6.666.666-2', 'Roberto Alfredo', 'Medina Vivar', 'roberto.medina@gmail.com', '$2a$10$K6fn4pRzULqO1mnowJf5t.UTcXz8P/t/70.AcNEy2o0CDnUHM3fKu', '1978-03-03');

--
-- Disparadores `cuenta`
--
DELIMITER $$
CREATE TRIGGER `check_correo` BEFORE INSERT ON `cuenta` FOR EACH ROW begin


if new.correo not like '%@%' then


SIGNAL SQLSTATE '45000' set message_text='No se puede poner un correo sin el @';


end if;


end
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `check_rut` BEFORE INSERT ON `cuenta` FOR EACH ROW begin


declare existe_rut BOOLEAN;


set existe_rut = (select validate_rut(new.rut));


if existe_rut=0 then


SIGNAL SQLSTATE '45000' set message_text='El rut ingresado no es valido favor de introducir de nuevo los datos';


end if;


end
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estrategias`
--

CREATE TABLE `estrategias` (
  `nombre_estrategia` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `estrategias`
--

INSERT INTO `estrategias` (`nombre_estrategia`) VALUES
('aceptar'),
('escalar'),
('evitar'),
('mitigar'),
('transferir');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `experto`
--

CREATE TABLE `experto` (
  `rut` varchar(12) COLLATE utf8mb4_unicode_ci NOT NULL,
  `area` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `experto`
--

INSERT INTO `experto` (`rut`, `area`) VALUES
('20.271.137-5', 'Experto en seguridad informática');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `formulario_aceptar`
--

CREATE TABLE `formulario_aceptar` (
  `id_formulario_aceptar` int(11) NOT NULL,
  `id_solicitud` int(11) NOT NULL,
  `tipo_aceptacion` enum('Pasivo','Activo') NOT NULL,
  `recomendacion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `formulario_compartir`
--

CREATE TABLE `formulario_compartir` (
  `id_formulario_compartir` int(11) NOT NULL,
  `id_solicitud` int(11) NOT NULL,
  `beneficio_obtenido` text NOT NULL,
  `tercero_encargado` varchar(100) NOT NULL,
  `prima` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `formulario_escalar`
--

CREATE TABLE `formulario_escalar` (
  `id_formulario_escalar` int(11) NOT NULL,
  `id_solicitud` int(11) NOT NULL,
  `nuevo_encargado` varchar(100) NOT NULL,
  `entidad_afectada` varchar(200) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `formulario_explotar`
--

CREATE TABLE `formulario_explotar` (
  `id_formulario_explotar` int(11) NOT NULL,
  `id_solicitud` int(11) NOT NULL,
  `tipo_beneficio` varchar(150) NOT NULL,
  `resolucion` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `formulario_mejorar`
--

CREATE TABLE `formulario_mejorar` (
  `id_formulario_mejorar` int(11) NOT NULL,
  `id_solicitud` int(11) NOT NULL,
  `tipo_mejora` enum('Aumentar','Optimizar','Otro') NOT NULL,
  `motivo_mejorar` text NOT NULL,
  `atencion_causa` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `jefe_proyecto`
--

CREATE TABLE `jefe_proyecto` (
  `rut` varchar(12) COLLATE utf8mb4_unicode_ci NOT NULL,
  `titulo` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `jefe_proyecto`
--

INSERT INTO `jefe_proyecto` (`rut`, `titulo`) VALUES
('19.181.288-3', 'Trabajo social'),
('19.830.724.6', 'Ingenieria en Prevencion de riesgos'),
('6.666.666-2', 'Ingenieria Civil');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `plan_proyecto`
--

CREATE TABLE `plan_proyecto` (
  `id_proyecto` int(11) NOT NULL,
  `plan_proyecto` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `proyecto`
--

CREATE TABLE `proyecto` (
  `id_proyecto` int(11) NOT NULL,
  `area_proyecto` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre_proyecto` varchar(300) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rut_jp` varchar(12) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `proyecto`
--

INSERT INTO `proyecto` (`id_proyecto`, `area_proyecto`, `nombre_proyecto`, `rut_jp`) VALUES
(9, 'Social', 'Plan de prevencion social del delito', '19.181.288-3'),
(10, 'Informatica', 'Servidor Cachagua', '6.666.666-2'),
(11, 'Climatico', 'Viviendas sociales y tornados', '19.181.288-3');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `proyecto_experto_revisa`
--

CREATE TABLE `proyecto_experto_revisa` (
  `rut_experto` varchar(12) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_proyecto` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `proyecto_experto_revisa`
--

INSERT INTO `proyecto_experto_revisa` (`rut_experto`, `id_proyecto`) VALUES
('20.271.137-5', 9),
('20.271.137-5', 11);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `respuesta_riesgo`
--

CREATE TABLE `respuesta_riesgo` (
  `id_solicitud` int(11) NOT NULL,
  `respuesta_cambio` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rut_experto` varchar(12) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre_estrategia` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_riesgo` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `respuesta_riesgo`
--

INSERT INTO `respuesta_riesgo` (`id_solicitud`, `respuesta_cambio`, `rut_experto`, `nombre_estrategia`, `id_riesgo`) VALUES
(2, 'No se gestiona bien', '20.271.137-5', 'evitar', 11);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `riesgos`
--

CREATE TABLE `riesgos` (
  `id_riesgo` int(11) NOT NULL,
  `id_proyecto` int(11) NOT NULL,
  `nombre_riesgo` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo_riesgo` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripción_riesgo` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo_estrategia_tomada` enum('evitar','explotar','transferir/compartir','mitigar/mejorar','aceptar','Sin estrategia previa') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Sin estrategia previa',
  `impacto_riesgo` enum('alto','medio','bajo','sin impacto') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'sin impacto',
  `A_O` enum('amenaza','oportunidad','neutral') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'neutral',
  `probabilidad_riesgo` double DEFAULT 0,
  `valoracion_riesgos` enum('aceptable','moderadamente critico','critico') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'aceptable',
  `magnitud_riesgo` int(11) NOT NULL DEFAULT 1,
  `valoracion_consecuencia_riesgo` enum('bajo','medio','alto') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'bajo',
  `solucion_planteada` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `riesgos`
--

INSERT INTO `riesgos` (`id_riesgo`, `id_proyecto`, `nombre_riesgo`, `tipo_riesgo`, `descripción_riesgo`, `tipo_estrategia_tomada`, `impacto_riesgo`, `A_O`, `probabilidad_riesgo`, `valoracion_riesgos`, `magnitud_riesgo`, `valoracion_consecuencia_riesgo`, `solucion_planteada`) VALUES
(11, 9, 'Riesgo en la via publica', 'personal', 'Hay una alta chance de que le puedan robar a la persona que va caminando por la calle.', 'aceptar', 'alto', 'amenaza', 75, 'moderadamente critico', 5, 'alto', 'Solo aceptamos el riesgo por que no hay muchas alternativas que se quieran tomar con este tipo de actos'),
(12, 9, 'Riesgo en la casa de uno', 'Casa', 'Hay una chance de que nos puedan robar en la casa', 'Sin estrategia previa', 'medio', 'amenaza', 30, 'aceptable', 2, 'alto', 'Poner rejas o tener un perrito bastara'),
(13, 10, 'Problemas con el servidor', 'Climatico', 'No hay manutención y es posible que se queme el lugar', 'transferir/compartir', 'alto', 'amenaza', 80, 'critico', 9, 'alto', 'Abrir las ventanas cuanto antes'),
(14, 10, 'Problemas con el servidor 2', 'Manutencion', 'Nos falta dinero para pagar la renta del servidor', 'aceptar', 'medio', 'neutral', 30, 'moderadamente critico', 3, 'medio', 'Pagar la cuota del servidor cuanto antes');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `aceptar_activo`
--
ALTER TABLE `aceptar_activo`
  ADD PRIMARY KEY (`id_formulario_aceptar`);

--
-- Indices de la tabla `alcances`
--
ALTER TABLE `alcances`
  ADD KEY `id_proyecto` (`id_proyecto`);

--
-- Indices de la tabla `cronograma_proyecto`
--
ALTER TABLE `cronograma_proyecto`
  ADD PRIMARY KEY (`id_proyecto`);

--
-- Indices de la tabla `cuenta`
--
ALTER TABLE `cuenta`
  ADD PRIMARY KEY (`rut`);

--
-- Indices de la tabla `estrategias`
--
ALTER TABLE `estrategias`
  ADD PRIMARY KEY (`nombre_estrategia`);

--
-- Indices de la tabla `experto`
--
ALTER TABLE `experto`
  ADD PRIMARY KEY (`rut`),
  ADD KEY `rut` (`rut`);

--
-- Indices de la tabla `formulario_aceptar`
--
ALTER TABLE `formulario_aceptar`
  ADD PRIMARY KEY (`id_formulario_aceptar`),
  ADD KEY `id_solicitud` (`id_solicitud`);

--
-- Indices de la tabla `formulario_compartir`
--
ALTER TABLE `formulario_compartir`
  ADD PRIMARY KEY (`id_formulario_compartir`),
  ADD KEY `id_solicitud` (`id_solicitud`);

--
-- Indices de la tabla `formulario_escalar`
--
ALTER TABLE `formulario_escalar`
  ADD PRIMARY KEY (`id_formulario_escalar`),
  ADD KEY `id_solicitud` (`id_solicitud`);

--
-- Indices de la tabla `formulario_explotar`
--
ALTER TABLE `formulario_explotar`
  ADD PRIMARY KEY (`id_formulario_explotar`),
  ADD KEY `id_solicitud` (`id_solicitud`);

--
-- Indices de la tabla `formulario_mejorar`
--
ALTER TABLE `formulario_mejorar`
  ADD PRIMARY KEY (`id_formulario_mejorar`),
  ADD KEY `id_solicitud` (`id_solicitud`);

--
-- Indices de la tabla `jefe_proyecto`
--
ALTER TABLE `jefe_proyecto`
  ADD PRIMARY KEY (`rut`),
  ADD KEY `rut` (`rut`);

--
-- Indices de la tabla `plan_proyecto`
--
ALTER TABLE `plan_proyecto`
  ADD PRIMARY KEY (`id_proyecto`);

--
-- Indices de la tabla `proyecto`
--
ALTER TABLE `proyecto`
  ADD PRIMARY KEY (`id_proyecto`),
  ADD KEY `rut_encargado` (`rut_jp`);

--
-- Indices de la tabla `proyecto_experto_revisa`
--
ALTER TABLE `proyecto_experto_revisa`
  ADD PRIMARY KEY (`rut_experto`,`id_proyecto`),
  ADD KEY `rut_experto` (`rut_experto`),
  ADD KEY `id_proyecto` (`id_proyecto`);

--
-- Indices de la tabla `respuesta_riesgo`
--
ALTER TABLE `respuesta_riesgo`
  ADD PRIMARY KEY (`id_solicitud`),
  ADD KEY `rut_experto` (`rut_experto`),
  ADD KEY `solucion_estrategia` (`nombre_estrategia`),
  ADD KEY `fk_riesgo` (`id_riesgo`);

--
-- Indices de la tabla `riesgos`
--
ALTER TABLE `riesgos`
  ADD PRIMARY KEY (`id_riesgo`),
  ADD KEY `id_proyecto` (`id_proyecto`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `formulario_aceptar`
--
ALTER TABLE `formulario_aceptar`
  MODIFY `id_formulario_aceptar` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `formulario_compartir`
--
ALTER TABLE `formulario_compartir`
  MODIFY `id_formulario_compartir` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `formulario_escalar`
--
ALTER TABLE `formulario_escalar`
  MODIFY `id_formulario_escalar` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `formulario_explotar`
--
ALTER TABLE `formulario_explotar`
  MODIFY `id_formulario_explotar` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `formulario_mejorar`
--
ALTER TABLE `formulario_mejorar`
  MODIFY `id_formulario_mejorar` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `proyecto`
--
ALTER TABLE `proyecto`
  MODIFY `id_proyecto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `respuesta_riesgo`
--
ALTER TABLE `respuesta_riesgo`
  MODIFY `id_solicitud` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `riesgos`
--
ALTER TABLE `riesgos`
  MODIFY `id_riesgo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `aceptar_activo`
--
ALTER TABLE `aceptar_activo`
  ADD CONSTRAINT `aceptar_activo_ibfk_1` FOREIGN KEY (`id_formulario_aceptar`) REFERENCES `formulario_aceptar` (`id_formulario_aceptar`);

--
-- Filtros para la tabla `alcances`
--
ALTER TABLE `alcances`
  ADD CONSTRAINT `alcances_ibfk_1` FOREIGN KEY (`id_proyecto`) REFERENCES `proyecto` (`id_proyecto`);

--
-- Filtros para la tabla `cronograma_proyecto`
--
ALTER TABLE `cronograma_proyecto`
  ADD CONSTRAINT `cronograma_proyecto_ibfk_1` FOREIGN KEY (`id_proyecto`) REFERENCES `proyecto` (`id_proyecto`);

--
-- Filtros para la tabla `experto`
--
ALTER TABLE `experto`
  ADD CONSTRAINT `experto_ibfk_1` FOREIGN KEY (`rut`) REFERENCES `cuenta` (`rut`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `formulario_aceptar`
--
ALTER TABLE `formulario_aceptar`
  ADD CONSTRAINT `formulario_aceptar_ibfk_1` FOREIGN KEY (`id_solicitud`) REFERENCES `respuesta_riesgo` (`id_solicitud`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `formulario_compartir`
--
ALTER TABLE `formulario_compartir`
  ADD CONSTRAINT `formulario_compartir_ibfk_1` FOREIGN KEY (`id_solicitud`) REFERENCES `respuesta_riesgo` (`id_solicitud`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `formulario_escalar`
--
ALTER TABLE `formulario_escalar`
  ADD CONSTRAINT `formulario_escalar_ibfk_1` FOREIGN KEY (`id_solicitud`) REFERENCES `respuesta_riesgo` (`id_solicitud`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `formulario_explotar`
--
ALTER TABLE `formulario_explotar`
  ADD CONSTRAINT `formulario_explotar_ibfk_1` FOREIGN KEY (`id_solicitud`) REFERENCES `respuesta_riesgo` (`id_solicitud`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `formulario_mejorar`
--
ALTER TABLE `formulario_mejorar`
  ADD CONSTRAINT `formulario_mejorar_ibfk_1` FOREIGN KEY (`id_solicitud`) REFERENCES `respuesta_riesgo` (`id_solicitud`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `jefe_proyecto`
--
ALTER TABLE `jefe_proyecto`
  ADD CONSTRAINT `jefe_proyecto_ibfk_1` FOREIGN KEY (`rut`) REFERENCES `cuenta` (`rut`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `plan_proyecto`
--
ALTER TABLE `plan_proyecto`
  ADD CONSTRAINT `plan_proyecto_ibfk_1` FOREIGN KEY (`id_proyecto`) REFERENCES `proyecto` (`id_proyecto`);

--
-- Filtros para la tabla `proyecto`
--
ALTER TABLE `proyecto`
  ADD CONSTRAINT `proyecto_ibfk_1` FOREIGN KEY (`rut_jp`) REFERENCES `jefe_proyecto` (`rut`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `proyecto_experto_revisa`
--
ALTER TABLE `proyecto_experto_revisa`
  ADD CONSTRAINT `proyecto_experto_revisa_ibfk_1` FOREIGN KEY (`rut_experto`) REFERENCES `experto` (`rut`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `proyecto_experto_revisa_ibfk_2` FOREIGN KEY (`id_proyecto`) REFERENCES `proyecto` (`id_proyecto`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `respuesta_riesgo`
--
ALTER TABLE `respuesta_riesgo`
  ADD CONSTRAINT `fk_riesgo` FOREIGN KEY (`id_riesgo`) REFERENCES `riesgos` (`id_riesgo`),
  ADD CONSTRAINT `respuesta_riesgo_ibfk_1` FOREIGN KEY (`rut_experto`) REFERENCES `experto` (`rut`),
  ADD CONSTRAINT `respuesta_riesgo_ibfk_3` FOREIGN KEY (`nombre_estrategia`) REFERENCES `estrategias` (`nombre_estrategia`);

--
-- Filtros para la tabla `riesgos`
--
ALTER TABLE `riesgos`
  ADD CONSTRAINT `riesgos_ibfk_1` FOREIGN KEY (`id_proyecto`) REFERENCES `proyecto` (`id_proyecto`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
