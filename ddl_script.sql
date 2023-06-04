/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

DROP SCHEMA IF EXISTS libq;
CREATE SCHEMA libq;
USE libq;
# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: users
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `users` (
  `IdUsers` int(11) NOT NULL AUTO_INCREMENT,
  `Username` varchar(50) NOT NULL,
  `Password` varchar(20) NOT NULL,
  `Approved` tinyint(1) NOT NULL,
  PRIMARY KEY (`IdUsers`),
  UNIQUE KEY `Username_UNIQUE` (`Username`),
  CONSTRAINT `chk_Username` CHECK (
    LENGTH(`Username`) >= 7 AND LENGTH(`Username`) <= 50
  ),
  CONSTRAINT `chk_Password` CHECK (
    LENGTH(`Password`) >= 6 AND LENGTH(`Password`) <= 16
  )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: telephoneuser
# ------------------------------------------------------------
#CREATE TABLE IF NOT EXISTS `telephoneuser` (
 # `IdUsers` int(11) NOT NULL,
  #`PhoneNumber` varchar(20) NOT NULL,
  #PRIMARY KEY (`IdUsers`, `PhoneNumber`),
  #CONSTRAINT `fk_telephoneuser_users` FOREIGN KEY (`IdUsers`) REFERENCES `users` (`IdUsers`) ON DELETE CASCADE ON UPDATE CASCADE,
  #CONSTRAINT `chk_PhoneNumber` CHECK (LENGTH(`PhoneNumber`) >= 8)
#) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: schoolunit
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `schoolunit` (
  `IdSchool` INT NOT NULL AUTO_INCREMENT,
  `Name` VARCHAR(45) NOT NULL,
  `Adress_street` VARCHAR(45) NOT NULL,
  `Adress_number` INT(11) NOT NULL,
  `Adress_city` VARCHAR(45) NOT NULL,
  `Email` VARCHAR(45) NOT NULL,
  `SchoolPrinciple` VARCHAR(45) NOT NULL,
  `SchoolAdmin` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`IdSchool`),
  UNIQUE KEY `ID_UNIQUE` (`IdSchool`),
  CONSTRAINT `CK_Email_Format` CHECK (Email LIKE '%_@%._%')
) ENGINE = InnoDB AUTO_INCREMENT = 12 DEFAULT CHARSET = utf8 COLLATE = utf8_general_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: generaladmin
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `generaladmin` (
  `IdGeneralAdmin` int(11) NOT NULL AUTO_INCREMENT,
  `IdUsers` int(11) NOT NULL,
  PRIMARY KEY (`IdGeneralAdmin`),
  UNIQUE KEY `IdGeneralAdmin_UNIQUE` (`IdGeneralAdmin`),
  KEY `FK_generaladmin_users` (`IdUsers`),
  CONSTRAINT `FK_generaladmin_users` FOREIGN KEY (`IdUsers`) REFERENCES `users` (`IdUsers`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_general_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: schooladmin
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `schooladmin` (
  `IdUsers` int(11) NOT NULL,
  `IdSchool` int(11) NOT NULL,
  `Name` varchar(45) NOT NULL,
  PRIMARY KEY (`IdUsers`),
  CONSTRAINT `FK_schooladmin_users` FOREIGN KEY (`IdUsers`) REFERENCES `users` (`IdUsers`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_schooladmin_schoolunit` FOREIGN KEY (`IdSchool`) REFERENCES `schoolunit` (`IdSchool`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_general_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: student
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `student` (
  `StudentName` varchar(45) NOT NULL,
  `Adress_street` varchar(45) NOT NULL,
  `Adress_number` int(11) NOT NULL,
  `Adress_city` varchar(45) NOT NULL,
  `StudentEmail` varchar(100) NOT NULL UNIQUE,
  `BirthDate` date NOT NULL,
  `BooksToReserve` int(11) NOT NULL,
  `BooksToBorrow` int(11) NOT NULL,
  `IdUsers` int(11) NOT NULL,
  `IdSchool` int(11) NOT NULL,
  PRIMARY KEY (`IdUsers`),
  KEY `FK_student_users` (`IdUsers`),
  KEY `FK_student_schoolunit` (`IdSchool`),
  CONSTRAINT `FK_student_users` FOREIGN KEY (`IdUsers`) REFERENCES `users` (`IdUsers`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_student_schoolunit` FOREIGN KEY (`IdSchool`) REFERENCES `schoolunit` (`IdSchool`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `CK_StudentEmail_Format` CHECK (`StudentEmail` REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'),
  CONSTRAINT `CK_BooksToReserve` CHECK (`BooksToReserve` >= 0 AND `BooksToReserve` <= 2),
  CONSTRAINT `CK_BooksToBorrow` CHECK (`BooksToBorrow` >= 0 AND `BooksToBorrow` <= 2)
) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_general_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: teacher
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `teacher` (
  `TeacherName` varchar(45) NOT NULL,
  `Adress_street` varchar(45) NOT NULL,
  `Adress_number` int(11) NOT NULL,
  `Adress_city` varchar(45) NOT NULL,
  `TeacherEmail` varchar(100) NOT NULL UNIQUE,
  `BirthDate` date NOT NULL,
  `BooksToReserve` int(11) NOT NULL,
  `BooksToBorrow` int(11) NOT NULL,
  `IdUsers` int(11) NOT NULL,
  `IdSchool` int(11) NOT NULL,
  PRIMARY KEY (`IdUsers`),
  KEY `FK_teacher_users` (`IdUsers`),
  KEY `FK_teacher_schoolunit` (`IdSchool`),
  CONSTRAINT `FK_teacher_users` FOREIGN KEY (`IdUsers`) REFERENCES `users` (`IdUsers`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_teacher_schoolunit` FOREIGN KEY (`IdSchool`) REFERENCES `schoolunit` (`IdSchool`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `CK_TeacherEmail_Format` CHECK (TeacherEmail REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'),
  CONSTRAINT `CK_BooksToReserve` CHECK (`BooksToReserve` >= 0 AND `BooksToReserve` <= 1),
  CONSTRAINT `CK_BooksToBorrow` CHECK (`BooksToBorrow` >= 0 AND `BooksToBorrow` <= 1)
) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_general_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: telephone
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `telephone` (
  `IdSchool` int(11) NOT NULL,
  `PhoneNumber` varchar(20) NOT NULL,
  PRIMARY KEY (`IdSchool`, `PhoneNumber`),
  CONSTRAINT `fk_telephoneuser_users` FOREIGN KEY (`IdSchool`) REFERENCES `SchoolUnit` (`IdSchool`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chk_PhoneNumber` CHECK (LENGTH(`PhoneNumber`) >= 8)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: book
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `book` (
  `ISBN` varchar(17) NOT NULL,
  `Title` varchar(100) NOT NULL,
  `Publisher` varchar(50) NOT NULL,
  `PageNumber` int(10) UNSIGNED NOT NULL,
  `Summary` text NOT NULL,
  `Picture` varchar(255) DEFAULT NULL,
  `Language` varchar(3) NOT NULL,
  `Rating` decimal(3, 2) NOT NULL,
  PRIMARY KEY (`ISBN`),
  CONSTRAINT `CK_ISBN` CHECK (
    (`ISBN` LIKE '978%' OR `ISBN` LIKE '979%')
    AND (`ISBN` REGEXP '^[0-9X]+$')
    AND LENGTH(`ISBN`) = 13 -- 17 but without the 4 '-'
  ),
  CONSTRAINT `CK_PAGENUMBER` CHECK (
    `PageNumber` >= 0 AND `PageNumber` <= 2500
  ),
  CONSTRAINT `CK_LANGUAGE` CHECK (
    `Language` IN (
      'AFR', 'AMH', 'ARA', 'ASM', 'AYM', 'AZE', 'BEN', 'BIS', 'BHO', 'BUL', 'BUR',
      'CAT', 'CEB', 'CES', 'CHI', 'CMN', 'CRO', 'CZE', 'DAN', 'DEU', 'DUT', 'ENG',
      'EST', 'EWE', 'FIN', 'FRA', 'FUL', 'GLG', 'GLE', 'GRE', 'GUI', 'GUJ', 'HAT',
      'HAU', 'HEB', 'HIN', 'HMO', 'HRV', 'HUN', 'IBO', 'ILO', 'ITA', 'JAV', 'KAL',
      'KAN', 'KAZ', 'KHM', 'KIK', 'KIN', 'KIR', 'KOR', 'KUR', 'LAT', 'LAV', 'LIT',
      'LOZ', 'LUG', 'MAI', 'MAL', 'MAO', 'MAR', 'MAY', 'MSA', 'MON', 'NEP', 'NOB',
      'NYA', 'ORI', 'PAN', 'POL', 'PUS', 'QUE', 'RAR', 'RON', 'RUN', 'RUS', 'SLK',
      'SLV', 'SOM', 'SOT', 'SPA', 'SRP', 'SWE', 'SWA', 'TAI', 'TAM', 'TGL', 'TIR',
      'TON', 'TUM', 'TUR', 'UZB', 'VIE', 'WOL', 'YOR', 'YUE', 'ZUL'
    )
  )
) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_general_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: book_categories
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `book_categories` (
  `IdCategories` INT NOT NULL AUTO_INCREMENT,
  `Category` VARCHAR(100) NOT NULL,
  `ISBN` VARCHAR(17) NOT NULL,
  KEY `ISBN` (`ISBN`),
  CONSTRAINT `FK_book_categories_book` FOREIGN KEY (`ISBN`) REFERENCES `book` (`ISBN`) ON DELETE CASCADE ON UPDATE CASCADE,
  PRIMARY KEY (`IdCategories`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: book_keywords
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `book_keywords` (
  `Keyword` varchar(45) NOT NULL,
  `ISBN` varchar(17) NOT NULL,
  PRIMARY KEY (`Keyword`, `ISBN`),
  KEY `ISBN` (`ISBN`),
  CONSTRAINT `FK_book_keywords_book` FOREIGN KEY (`ISBN`) REFERENCES `book` (`ISBN`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_general_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: book_writers
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `book_writers` (
  `WriterID` INT AUTO_INCREMENT PRIMARY KEY,
  `WriterName` VARCHAR(100) NOT NULL,
  `ISBN` VARCHAR(17) NOT NULL,
  KEY `ISBN` (`ISBN`),
  CONSTRAINT `FK_book_writers_book` FOREIGN KEY (`ISBN`) REFERENCES `book` (`ISBN`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: review
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `review` (
  `ReviewText` text NOT NULL,
  `RatingLikert` int(11) NOT NULL,
  `Approval` binary(1) DEFAULT NULL,
  `IdUsers` int(11) NOT NULL,
  `ISBN` varchar(17) NOT NULL,
  KEY `IdUsers` (`IdUsers`),
  KEY `ISBN` (`ISBN`),
  CONSTRAINT `review_ibfk_1` FOREIGN KEY (`IdUsers`) REFERENCES `users` (`IdUsers`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `review_ibfk_2` FOREIGN KEY (`ISBN`) REFERENCES `book` (`ISBN`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `CK_RATING` CHECK (
  `RatingLikert` >= 1
  and `RatingLikert` <= 5
  )
) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_general_ci;

DELIMITER //

CREATE TRIGGER update_book_rating AFTER INSERT ON review
FOR EACH ROW
BEGIN
    IF NEW.Approval = 1 THEN
        UPDATE book
        SET Rating = (SELECT AVG(RatingLikert) FROM review WHERE ISBN = NEW.ISBN)
        WHERE ISBN = NEW.ISBN;
    END IF;
END//

DELIMITER ;

DELIMITER //

CREATE TRIGGER update_book_rating_after_update AFTER UPDATE ON review
FOR EACH ROW
BEGIN
    IF NEW.Approval = 1 THEN
        UPDATE book
        SET Rating = (SELECT AVG(RatingLikert) FROM review WHERE ISBN = NEW.ISBN)
        WHERE ISBN = NEW.ISBN;
    END IF;
END//

DELIMITER ;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: availability
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `availability` (
  `Copies` INT(11) NOT NULL,
  `AvailableCopies` INT(11) NOT NULL,
  `IdSchool` INT(11) NOT NULL,
  `ISBN` VARCHAR(17) NOT NULL,
  KEY `IdSchool` (`IdSchool`),
  KEY `ISBN` (`ISBN`),
  PRIMARY KEY (`IdSchool`, `ISBN`),
  CONSTRAINT `FK_availability_schoolunit` FOREIGN KEY (`IdSchool`) REFERENCES `schoolunit` (`IdSchool`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_availability_book` FOREIGN KEY (`ISBN`) REFERENCES `book` (`ISBN`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_general_ci;

# Trigger to update the number of available copies, if the total number of copies increases
DROP TRIGGER IF EXISTS increase_available_copies;

DELIMITER //

CREATE TRIGGER increase_available_copies
BEFORE UPDATE ON availability
FOR EACH ROW
BEGIN
    IF NEW.Copies > OLD.Copies THEN
        SET NEW.AvailableCopies = NEW.AvailableCopies + (NEW.Copies - OLD.Copies);
    END IF;
END //

DELIMITER ;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: borrowing
# ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `borrowing` (
  `BorrowingId` INT AUTO_INCREMENT PRIMARY KEY,
  `BorrowDate` DATE NOT NULL,
  `Returned` VARCHAR(10) NOT NULL,
  `IdUsers` INT(11) NOT NULL,
  `ISBN` VARCHAR(17) NOT NULL,
  KEY `IdUsers` (`IdUsers`),
  KEY `ISBN` (`ISBN`),
  CONSTRAINT `borrowing_ibfk_1` FOREIGN KEY (`IdUsers`) REFERENCES `users` (`IdUsers`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `borrowing_ibfk_2` FOREIGN KEY (`ISBN`) REFERENCES `book` (`ISBN`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_general_ci;

# Trigger for inserting borrowing --> User Books-to-borrow --
DROP TRIGGER IF EXISTS after_borrowing_insert;
DELIMITER //

CREATE TRIGGER after_borrowing_insert
BEFORE INSERT ON borrowing
FOR EACH ROW
BEGIN
    DECLARE userType VARCHAR(10);

    -- Determine the user type (Student or Teacher)
    SELECT CASE
        WHEN EXISTS(SELECT * FROM student WHERE IdUsers = NEW.IdUsers) THEN 'student'
        WHEN EXISTS(SELECT * FROM teacher WHERE IdUsers = NEW.IdUsers) THEN 'teacher'
        ELSE NULL
    END INTO userType;

    IF userType IS NOT NULL AND NEW.Returned = False THEN
        IF userType = 'student' THEN
            UPDATE student
            SET BooksToBorrow = BooksToBorrow - 1
            WHERE IdUsers = NEW.IdUsers AND BooksToBorrow > 0;
            
            IF ROW_COUNT() = 0 THEN
                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cannot borrow more books. Please return one of your active rentals first.';
            END IF;
        ELSEIF userType = 'teacher' THEN
            UPDATE teacher
            SET BooksToBorrow = BooksToBorrow - 1
            WHERE IdUsers = NEW.IdUsers AND BooksToBorrow > 0;
            
            IF ROW_COUNT() = 0 THEN
                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cannot borrow more books. Please return one of your active rentals first.';
            END IF;
        END IF;
    END IF;
END //

DELIMITER ;

CREATE TABLE IF NOT EXISTS `LoggedUser` (
  `IdLogged` INT PRIMARY KEY AUTO_INCREMENT
);

# Trigger for completed borrowing --> User Books-to-borrow ++
DROP TRIGGER IF EXISTS after_borrowing_update

DELIMITER //

CREATE TRIGGER after_borrowing_update
AFTER UPDATE ON borrowing
FOR EACH ROW
BEGIN
    DECLARE userType VARCHAR(10);
    DECLARE booksToReserve INT;

    IF OLD.Returned = 'False' AND NEW.Returned = 'True' THEN
        SELECT CASE
            WHEN EXISTS(SELECT * FROM student WHERE IdUsers = NEW.IdUsers) THEN 'student'
            WHEN EXISTS(SELECT * FROM teacher WHERE IdUsers = NEW.IdUsers) THEN 'teacher'
            ELSE NULL
        END INTO userType;

        IF userType IS NOT NULL THEN
            IF userType = 'student' THEN
                UPDATE student SET BooksToBorrow = BooksToBorrow + 1 WHERE IdUsers = NEW.IdUsers;
            ELSEIF userType = 'teacher' THEN
                UPDATE teacher SET BooksToBorrow = BooksToBorrow + 1 WHERE IdUsers = NEW.IdUsers;
            END IF;
        END IF;
    END IF;
END //

DELIMITER ;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: reservation
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `reservation` (
  `ReservationId` INT AUTO_INCREMENT PRIMARY KEY,
  `ReservationDate` DATE NOT NULL,
  `Active` TINYINT(1) NOT NULL,
  `ISBN` VARCHAR(17) NOT NULL,
  `IdUsers` INT(11) NOT NULL,
  KEY `IdUsers` (`IdUsers`),
  KEY `ISBN` (`ISBN`),
  CONSTRAINT `reservation_ibfk_1` FOREIGN KEY (`IdUsers`) REFERENCES `users` (`IdUsers`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `reservation_ibfk_2` FOREIGN KEY (`ISBN`) REFERENCES `book` (`ISBN`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_general_ci;

# Trigger for inserting reservation --> User Books-to-reserve --
# When active reservation is added, lower the availability
DROP TRIGGER IF EXISTS after_reservation_insert;
DELIMITER //

CREATE TRIGGER after_reservation_insert
AFTER INSERT ON reservation
FOR EACH ROW
BEGIN
    DECLARE userType VARCHAR(10);

    -- Determine the user type (Student or Teacher)
    SELECT CASE
        WHEN EXISTS(SELECT * FROM student WHERE IdUsers = NEW.IdUsers) THEN 'student'
        WHEN EXISTS(SELECT * FROM teacher WHERE IdUsers = NEW.IdUsers) THEN 'teacher'
        ELSE NULL
    END INTO userType;

    IF userType IS NOT NULL THEN
        IF userType = 'student' THEN
            UPDATE student
            SET BooksToReserve = BooksToReserve - 1
            WHERE IdUsers = NEW.IdUsers AND BooksToReserve > 0;
            
            IF ROW_COUNT() = 0 THEN
                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cannot reserve more books. Please return one of your active rentals first.';
            END IF;
        ELSEIF userType = 'teacher' THEN
            UPDATE teacher
            SET BooksToReserve = BooksToReserve - 1
            WHERE IdUsers = NEW.IdUsers AND BooksToReserve > 0;
            
            IF ROW_COUNT() = 0 THEN
                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cannot reserve more books. Please return one of your active rentals first.';
            END IF;
        END IF;
    END IF;
      IF NEW.Active = 1 THEN
    UPDATE `availability`
    SET AvailableCopies = CASE
      WHEN AvailableCopies > 0 THEN AvailableCopies - 1
      ELSE 0
    END
    WHERE `availability`.`ISBN` = NEW.ISBN
      AND `availability`.`IdSchool` IN (
        SELECT IdSchool FROM `student` WHERE IdUsers = NEW.IdUsers
        UNION
        SELECT IdSchool FROM `teacher` WHERE IdUsers = NEW.IdUsers
      );
  END IF;
END //

DELIMITER ;

# Trigger for deleted reservation (approved or discarded) --> User Books-to-reserve++
DROP TRIGGER IF EXISTS after_reservation_delete

DELIMITER //

CREATE TRIGGER after_reservation_delete
AFTER DELETE ON reservation
FOR EACH ROW
BEGIN
    DECLARE userType VARCHAR(10);

    -- Determine the user type (Student or Teacher)
    SELECT CASE
        WHEN EXISTS(SELECT * FROM student WHERE IdUsers = OLD.IdUsers) THEN 'student'
        WHEN EXISTS(SELECT * FROM teacher WHERE IdUsers = OLD.IdUsers) THEN 'teacher'
        ELSE NULL
    END INTO userType;

    IF userType IS NOT NULL THEN
        IF userType = 'student' THEN
            UPDATE student
            SET BooksToReserve = BooksToReserve + 1
            WHERE IdUsers = OLD.IdUsers;
        ELSEIF userType = 'teacher' THEN
            UPDATE teacher
            SET BooksToReserve = BooksToReserve + 1
            WHERE IdUsers = OLD.IdUsers;
        END IF;
    END IF;
END //

DELIMITER ;

# Trigger-Constraint to check for delayed returns

DROP TRIGGER IF EXISTS reservation_delayed_return;

DELIMITER //

CREATE TRIGGER reservation_delayed_return
BEFORE INSERT ON reservation
FOR EACH ROW
BEGIN
    IF EXISTS (
        SELECT 1
        FROM borrowing
        WHERE IdUsers = NEW.IdUsers
            AND Returned = 'False'
            AND DATEDIFF(NEW.ReservationDate, BorrowDate) > 14
    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Cannot make a reservation. You have a delayed borrowing.';
    END IF;
END //

DELIMITER ;

# Trigger-Constraint to check for active borrowing of same book
DROP TRIGGER IF EXISTS reservation_active_borrowing;
DELIMITER //
CREATE TRIGGER reservation_active_borrowing
BEFORE INSERT ON reservation
FOR EACH ROW
BEGIN
    DECLARE active_borrowing INT;

    SELECT COUNT(*) INTO active_borrowing
    FROM borrowing
    WHERE IdUsers = NEW.IdUsers AND ISBN = NEW.ISBN AND Returned = 'false';

    IF active_borrowing > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Cannot make a reservation. You already have an active borrowing of the same book.';
    END IF;
END //
DELIMITER ;

# Event scheduled for once a day to delete expired reservation
# SET GLOBAL event_scheduler = ON;

CREATE EVENT delete_expired_reservations
ON SCHEDULE EVERY 1 DAY
DO
    DELETE FROM reservation
    WHERE ReservationDate < DATE_SUB(CURDATE(), INTERVAL 7 DAY);

# Trigger to activate reservations by ascending order of date if availability increases AND do availability--
DROP TRIGGER IF EXISTS activate_reservations;

DELIMITER //

CREATE TRIGGER activate_reservations
AFTER UPDATE ON availability
FOR EACH ROW
BEGIN
    IF NEW.AvailableCopies > OLD.AvailableCopies THEN
        UPDATE reservation AS r
        SET r.Active = 1, NEW.AvailableCopies = OLD.AvailableCopies
        WHERE r.ISBN = NEW.ISBN
          AND r.Active = 0
          AND r.ReservationDate = (
              SELECT MIN(ReservationDate)
              FROM reservation
              WHERE ISBN = NEW.ISBN AND Active = 0
          );
    END IF;
END //

DELIMITER ;