-- SportHub RDS Database Initialization Script
-- Run this on: sporthub-db.cr422g0k08ae.eu-west-1.rds.amazonaws.com

USE sporthub;

-- 1. Create Events Table
CREATE TABLE IF NOT EXISTS events (
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
    MaxMatchesPerTeam          INT          NOT NULL DEFAULT 3,
    MinRestTimeBetweenMatches  INT          NOT NULL DEFAULT 60,
    SportCategory              VARCHAR(100) NOT NULL DEFAULT 'Football',
    CreatedAt                  VARCHAR(30)  NOT NULL,
    CONSTRAINT pk_events PRIMARY KEY (Id)
);

-- 2. Create Teams Table
CREATE TABLE IF NOT EXISTS teams (
    Id          INT          NOT NULL AUTO_INCREMENT,
    Name        VARCHAR(255) NOT NULL,
    SchoolName  VARCHAR(255) NOT NULL,
    CoachName   VARCHAR(255) NOT NULL,
    CoachPhone  VARCHAR(20)  NOT NULL,
    CoachEmail  VARCHAR(255) NOT NULL DEFAULT '',
    AgeGroup    VARCHAR(50)  NOT NULL,
    CreatedAt   DATETIME     NOT NULL,
    CONSTRAINT pk_teams PRIMARY KEY (Id)
);

-- 3. Create Registrations Table
CREATE TABLE IF NOT EXISTS registrations (
    Id           INT          NOT NULL AUTO_INCREMENT,
    EventId      INT          NOT NULL,
    TeamId       INT          NOT NULL,
    AgeGroup     VARCHAR(50)  NOT NULL,
    Division     VARCHAR(50)  DEFAULT '',
    Status       VARCHAR(20)  NOT NULL DEFAULT 'Pending',
    RegisteredAt DATETIME     NOT NULL,
    CONSTRAINT pk_registrations            PRIMARY KEY (Id),
    CONSTRAINT fk_registrations_event      FOREIGN KEY (EventId) REFERENCES events(Id),
    CONSTRAINT fk_registrations_team       FOREIGN KEY (TeamId)  REFERENCES teams(Id),
    CONSTRAINT uq_registrations_event_team UNIQUE (EventId, TeamId)
);

-- 4. Create Fixtures Table
CREATE TABLE IF NOT EXISTS fixtures (
    Id          INT          NOT NULL AUTO_INCREMENT,
    EventId     INT          NOT NULL,
    HomeTeamId  INT          NOT NULL,
    AwayTeamId  INT          NOT NULL,
    PitchId     INT          NOT NULL,
    KickOffTime VARCHAR(5)   NOT NULL,
    Status      VARCHAR(20)  NOT NULL DEFAULT 'Scheduled',
    CONSTRAINT pk_fixtures           PRIMARY KEY (Id),
    CONSTRAINT fk_fixtures_event     FOREIGN KEY (EventId)    REFERENCES events(Id),
    CONSTRAINT fk_fixtures_home_team FOREIGN KEY (HomeTeamId) REFERENCES teams(Id),
    CONSTRAINT fk_fixtures_away_team FOREIGN KEY (AwayTeamId) REFERENCES teams(Id)
);

-- 5. Create Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    Id          INT           NOT NULL AUTO_INCREMENT,
    RecipientId INT           NOT NULL,
    Message     VARCHAR(1000) NOT NULL,
    Type        VARCHAR(20)   NOT NULL,
    IsRead      TINYINT(1)    NOT NULL DEFAULT 0,
    CreatedAt   DATETIME      NOT NULL,
    CONSTRAINT pk_notifications PRIMARY KEY (Id)
);

-- Show all tables
SHOW TABLES;
