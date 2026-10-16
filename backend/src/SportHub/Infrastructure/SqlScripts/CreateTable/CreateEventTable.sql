CREATE TABLE events (
    Id                         INT          NOT NULL AUTO_INCREMENT,
    Name                       VARCHAR(255) NOT NULL,
    EventType                  VARCHAR(100) NOT NULL DEFAULT 'School Football Festival',
    Venue                      VARCHAR(255) NOT NULL,
    StartDate                  VARCHAR(20)  NOT NULL,
    EndDate                    VARCHAR(20)  NOT NULL,
    StartTime                  VARCHAR(10)  NOT NULL,
    EndTime                    VARCHAR(10)  NOT NULL,
    NumberOfTeams              INT          NOT NULL,
    Description                VARCHAR(255) NOT NULL DEFAULT '',
    AgeGroups                  VARCHAR(255) NOT NULL DEFAULT '',
    PitchStartTime             VARCHAR(10)  NOT NULL,
    PitchEndTime               VARCHAR(10)  NOT NULL,
    MatchDurationMinutes       INT          NOT NULL DEFAULT 90,
    BreakBetweenMatchesMinutes INT          NOT NULL DEFAULT 10,
    CreatedAt                  VARCHAR(30)  NOT NULL,
    CONSTRAINT pk_events PRIMARY KEY (Id)
);

ALTER TABLE `Events` 
ADD COLUMN `MaxMatchesPerTeam` INT NOT NULL DEFAULT 3 COMMENT 'Maximum number of matches each team can play',
ADD COLUMN `MinRestTimeBetweenMatches` INT NOT NULL DEFAULT 60 COMMENT 'Minimum rest time in minutes between team matches';


ALTER TABLE `Events` 
ADD COLUMN `SportCategory` VARCHAR(100) NOT NULL DEFAULT 'Football' COMMENT 'Sport type: Football, Rugby, Cricket, etc.';

-- Verify the column was added
DESCRIBE `Events`;
