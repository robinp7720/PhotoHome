# PhotoHome
Photo home is designed to give a home to you photo library while preserving the directory structure on you NAS. The photo files are not edited, modified or changed. Thumbnails are generated for the library view and photo information indexed into a mysql database.

# Contributing
Please help! If you have an idea which should be implemented or a fix to a bug, fork the repo and send a pull request

## Setup the database:
```sql
--
-- Database: `Photos`
--
CREATE DATABASE IF NOT EXISTS `Photos` DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci;
USE `Photos`;

-- --------------------------------------------------------

--
-- Table structure for table `exif`
--

CREATE TABLE `exif` (
  `row_id` int(11) NOT NULL,
  `photo_id` int(11) NOT NULL,
  `entry` varchar(255) NOT NULL,
  `value` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `location`
--

CREATE TABLE `location` (
  `row_id` int(11) NOT NULL,
  `photo_id` int(11) NOT NULL,
  `countryName` varchar(255) NOT NULL,
  `countryCode` varchar(255) NOT NULL,
  `adminCode` varchar(255) NOT NULL,
  `adminName` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `photos`
--

CREATE TABLE `photos` (
  `id` int(11) NOT NULL,
  `path` varchar(255) NOT NULL,
  `time` datetime DEFAULT NULL,
  `width` int(11) NOT NULL,
  `height` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `tags`
--

CREATE TABLE `tags` (
  `row_id` int(11) NOT NULL,
  `photo_id` int(11) NOT NULL,
  `value` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `exif`
--
ALTER TABLE `exif`
  ADD PRIMARY KEY (`row_id`),
  ADD KEY `photo_id` (`photo_id`);

--
-- Indexes for table `location`
--
ALTER TABLE `location`
  ADD PRIMARY KEY (`row_id`),
  ADD UNIQUE KEY `photo_id_2` (`photo_id`),
  ADD KEY `photo_id` (`photo_id`);

--
-- Indexes for table `photos`
--
ALTER TABLE `photos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `path` (`path`);

--
-- Indexes for table `tags`
--
ALTER TABLE `tags`
  ADD PRIMARY KEY (`row_id`),
  ADD KEY `photo_id` (`photo_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `exif`
--
ALTER TABLE `exif`
  MODIFY `row_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=518606;
--
-- AUTO_INCREMENT for table `location`
--
ALTER TABLE `location`
  MODIFY `row_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2286;
--
-- AUTO_INCREMENT for table `photos`
--
ALTER TABLE `photos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12032;
--
-- AUTO_INCREMENT for table `tags`
--
ALTER TABLE `tags`
  MODIFY `row_id` int(11) NOT NULL AUTO_INCREMENT;
--
-- Constraints for dumped tables
--

--
-- Constraints for table `exif`
--
ALTER TABLE `exif`
  ADD CONSTRAINT `exif_ibfk_1` FOREIGN KEY (`photo_id`) REFERENCES `photos` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `location`
--
ALTER TABLE `location`
  ADD CONSTRAINT `location_ibfk_1` FOREIGN KEY (`photo_id`) REFERENCES `photos` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

```
