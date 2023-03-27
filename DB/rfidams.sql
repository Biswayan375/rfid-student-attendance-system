-- phpMyAdmin SQL Dump
-- version 5.1.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 26, 2022 at 07:09 AM
-- Server version: 10.4.18-MariaDB
-- PHP Version: 8.0.3

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `rfidams`
--

-- --------------------------------------------------------

--
-- Table structure for table `attendance`
--

CREATE TABLE `attendance` (
  `sid` varchar(50) DEFAULT NULL,
  `bid` int(3) DEFAULT NULL,
  `date_time` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `attendance`
--

INSERT INTO `attendance` (`sid`, `bid`, `date_time`) VALUES
('7B6E5636', 12, '2022-05-19 19:26:20'),
('523E6C39', 12, '2022-05-19 19:26:34'),
('4B92094F', 12, '2022-05-21 11:32:23'),
('7B6E5636', 12, '2022-05-21 11:32:54'),
('523E6C39', 12, '2022-05-30 22:19:54'),
('DC8B6E32', 13, '2022-06-01 11:49:58'),
('8221DE1E', 13, '2022-06-01 11:50:06'),
('4B92094F', 14, '2022-07-25 20:09:33');

-- --------------------------------------------------------

--
-- Table structure for table `batch`
--

CREATE TABLE `batch` (
  `id` int(3) NOT NULL,
  `name` varchar(50) NOT NULL,
  `teacher_id` int(3) NOT NULL,
  `active` int(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `batch`
--

INSERT INTO `batch` (`id`, `name`, `teacher_id`, `active`) VALUES
(12, 'Computer Organization', 2, 0),
(13, 'Set Theory', 1, 0),
(14, 'Python', 4, 1);

-- --------------------------------------------------------

--
-- Table structure for table `batch_dates`
--

CREATE TABLE `batch_dates` (
  `bid` int(3) DEFAULT NULL,
  `date_time` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `batch_dates`
--

INSERT INTO `batch_dates` (`bid`, `date_time`) VALUES
(12, '2022-05-19 19:26:14'),
(12, '2022-05-21 11:26:13'),
(12, '2022-05-30 22:19:24'),
(13, '2022-06-01 11:49:49'),
(14, '2022-07-25 20:09:09');

-- --------------------------------------------------------

--
-- Table structure for table `new_card`
--

CREATE TABLE `new_card` (
  `uid` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `new_card`
--

INSERT INTO `new_card` (`uid`) VALUES
('9235C21E');

-- --------------------------------------------------------

--
-- Table structure for table `student`
--

CREATE TABLE `student` (
  `uid` varchar(50) NOT NULL,
  `name` varchar(50) DEFAULT NULL,
  `sem` int(2) DEFAULT NULL,
  `roll` varchar(10) NOT NULL,
  `mobile` int(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `student`
--

INSERT INTO `student` (`uid`, `name`, `sem`, `roll`, `mobile`) VALUES
('13F19B21', 'Priti Ghatak', 2, 'C/003', 2147483647),
('4B92094F', 'Sujay Das', 3, 'C/003', 2147483647),
('523E6C39', 'Saurav Biswas', 3, 'C/002', 2147483647),
('7B6E5636', 'Supriyo Sarkar', 3, 'C/001', 2147483647),
('8221DE1E', 'Susmita Biswas', 2, 'C/001', 2147483647),
('DC8B6E32', 'Sourav Bairagya', 2, 'C/002', 2147483647);

-- --------------------------------------------------------

--
-- Table structure for table `student_to_batch`
--

CREATE TABLE `student_to_batch` (
  `sid` varchar(50) DEFAULT NULL,
  `bid` int(3) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `student_to_batch`
--

INSERT INTO `student_to_batch` (`sid`, `bid`) VALUES
('4B92094F', 12),
('523E6C39', 12),
('7B6E5636', 12),
('13F19B21', 13),
('8221DE1E', 13),
('DC8B6E32', 13),
('7B6E5636', 14),
('523E6C39', 14),
('4B92094F', 14);

-- --------------------------------------------------------

--
-- Table structure for table `teacher`
--

CREATE TABLE `teacher` (
  `id` int(3) NOT NULL,
  `name` varchar(50) NOT NULL,
  `contact` int(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `teacher`
--

INSERT INTO `teacher` (`id`, `name`, `contact`) VALUES
(1, 'Paramita Sikder', 123456787),
(2, 'Soumita Chakraborty', 984315861),
(3, 'Enakshi Ghosh', 93423432),
(4, 'Arunava Saha', 37324748);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `attendance`
--
ALTER TABLE `attendance`
  ADD KEY `attendance_ibfk_1` (`sid`),
  ADD KEY `attendance_ibfk_2` (`bid`);

--
-- Indexes for table `batch`
--
ALTER TABLE `batch`
  ADD PRIMARY KEY (`id`),
  ADD KEY `teacher_id` (`teacher_id`);

--
-- Indexes for table `batch_dates`
--
ALTER TABLE `batch_dates`
  ADD KEY `bid` (`bid`);

--
-- Indexes for table `student`
--
ALTER TABLE `student`
  ADD PRIMARY KEY (`uid`);

--
-- Indexes for table `student_to_batch`
--
ALTER TABLE `student_to_batch`
  ADD KEY `student_to_batch_ibfk_1` (`sid`),
  ADD KEY `student_to_batch_ibfk_2` (`bid`);

--
-- Indexes for table `teacher`
--
ALTER TABLE `teacher`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `batch`
--
ALTER TABLE `batch`
  MODIFY `id` int(3) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `teacher`
--
ALTER TABLE `teacher`
  MODIFY `id` int(3) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `attendance`
--
ALTER TABLE `attendance`
  ADD CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`sid`) REFERENCES `student` (`uid`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `attendance_ibfk_2` FOREIGN KEY (`bid`) REFERENCES `batch` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `batch`
--
ALTER TABLE `batch`
  ADD CONSTRAINT `batch_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `teacher` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `batch_dates`
--
ALTER TABLE `batch_dates`
  ADD CONSTRAINT `batch_dates_ibfk_1` FOREIGN KEY (`bid`) REFERENCES `batch` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `student_to_batch`
--
ALTER TABLE `student_to_batch`
  ADD CONSTRAINT `student_to_batch_ibfk_1` FOREIGN KEY (`sid`) REFERENCES `student` (`uid`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `student_to_batch_ibfk_2` FOREIGN KEY (`bid`) REFERENCES `batch` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
