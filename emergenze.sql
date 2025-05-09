-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Creato il: Mag 09, 2025 alle 07:11
-- Versione del server: 10.4.32-MariaDB
-- Versione PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `emergenze`
--

-- --------------------------------------------------------

--
-- Struttura della tabella `chiamate`
--

CREATE TABLE `chiamate` (
  `id` int(11) NOT NULL,
  `unita` varchar(50) NOT NULL,
  `descrizione` text NOT NULL,
  `via` varchar(255) NOT NULL,
  `lat` double NOT NULL,
  `lng` double NOT NULL,
  `urgenza` varchar(20) NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `codice` varchar(20) DEFAULT NULL,
  `data_ora` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `chiamate`
--

INSERT INTO `chiamate` (`id`, `unita`, `descrizione`, `via`, `lat`, `lng`, `urgenza`, `timestamp`, `codice`, `data_ora`) VALUES
(18, 'vigili del fuoco', 'C\'è un\'auto in fiamme vicino alla mia abitazione.', 'Via Giovanni Falcone 12, Roma', 41.7000505, 12.6862044, 'Rosso', '2025-05-08 18:55:31', 'Q43', '2025-05-08 20:54:59'),
(19, 'ambulanza', 'Soggetto caduto, non si muove.', 'Piazza della Libertà 3, Firenze', 43.7839266, 11.2604222, 'Rosso', '2025-05-08 18:55:40', 'B99', '2025-05-08 20:55:10'),
(20, 'polizia', 'Casa mia è in corso di derubazione. Richiesta immediata di aiuto.', ' Via Don Minzoni 45, Napoli', 40.8977858, 14.285928, 'Rosso', '2025-05-08 18:55:54', 'L48', '2025-05-08 20:55:20'),
(21, 'vigili del fuoco', '\"Emissione di fumo dal palazzo accanto, possibile incendio.\"', 'Via Verdi 22, Milano', 45.5262617, 9.3376054, 'Giallo', '2025-05-08 18:56:08', 'P16', '2025-05-08 20:55:35'),
(22, 'polizia', 'Violenza fisica: uomo che aggressiona donna in strada.', 'Corso Umberto I 87, Bari', 41.1299139, 16.5421422, 'Rosso', '2025-05-08 18:56:12', 'N66', '2025-05-08 20:55:47'),
(23, 'ambulanza', 'Incidente tra due veicoli con un ferito.', 'Via Trieste 10, Torino', 45.0990183, 7.3609884, 'Giallo', '2025-05-08 18:56:28', 'Y01', '2025-05-08 20:55:59'),
(24, 'polizia', '\"Adolescenti che generano disturbo e proiettili pyrotecnici contro veicoli.\"', 'Via Mazzini 19, Palermo', 37.9847372, 13.3288506, 'Giallo', '2025-05-08 18:56:54', 'J14', '2025-05-08 20:56:23'),
(25, 'ambulanza', 'Un motociclista è volato via e ora è a terra.', 'Via Marconi 5, Genova', 44.379985, 9.0694035, 'Rosso', '2025-05-08 18:57:04', 'I81', '2025-05-08 20:56:11'),
(26, 'ambulanza', 'Donna anziana sdraiata a terra da circa mezz\'ora, nessuno la assiste.', 'Via Cavour 6, Cagliari', 39.213219, 9.1154598, 'Rosso', '2025-05-08 18:57:17', 'F79', '2025-05-08 20:56:45'),
(27, 'vigili del fuoco', 'Fuga di gas con odore intenso da diverse ore.', 'Via Galileo Galilei 33, Bologna', 44.4815749, 11.2770492, 'Rosso', '2025-05-08 18:57:19', 'H30', '2025-05-08 20:56:35');

--
-- Indici per le tabelle scaricate
--

--
-- Indici per le tabelle `chiamate`
--
ALTER TABLE `chiamate`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT per le tabelle scaricate
--

--
-- AUTO_INCREMENT per la tabella `chiamate`
--
ALTER TABLE `chiamate`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
