CREATE TABLE teams (
    Id          INT          NOT NULL AUTO_INCREMENT,
    Name        VARCHAR(255) NOT NULL,
    SchoolName  VARCHAR(255) NOT NULL,
    CoachName   VARCHAR(255) NOT NULL,
    CoachPhone  VARCHAR(20)  NOT NULL,
    AgeGroup    VARCHAR(50)  NOT NULL,
    CreatedAt   DATETIME     NOT NULL,
    CONSTRAINT pk_teams PRIMARY KEY (Id)
);

-- Add CoachEmail column to Teams table
ALTER TABLE `Teams` 
ADD COLUMN `CoachEmail` VARCHAR(255) NOT NULL DEFAULT '' COMMENT 'Coach email address for notifications';

-- Verify the column was added
DESCRIBE `Teams`;
