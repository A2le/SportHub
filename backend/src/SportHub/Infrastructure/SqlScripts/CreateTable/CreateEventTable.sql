CREATE TABLE  events (
    id                        int not null AUTO_INCREMENT,     
    Name                      VARCHAR(255) NOT NULL,
    EventType                 VARCHAR(100) NOT NULL DEFAULT 'School Football Festival',
    Venue                     VARCHAR(255) NOT NULL,
    StartDate                 VARCHAR(20)  NOT NULL,
    EndDate                   VARCHAR(20)  NOT NULL,
    StartTime                 VARCHAR(10)  NOT NULL,
    EndTime                   VARCHAR(10)  NOT NULL,
    NumberOfTeams             INT          NOT NULL,
    Description                VARCHAR(255) NOT NULL DEFAULT '',
    AgeGroups                 VARCHAR(255) NOT NULL DEFAULT '',
    NumberOfPitches           INT          NOT NULL,
    PitchStartTime            VARCHAR(10)  NOT NULL,
    PitchEndTime              VARCHAR(10)  NOT NULL,
    MatchDurationMinutes      INT          NOT NULL DEFAULT 30,
    BreakBetweenMatchesMinutes INT         NOT NULL DEFAULT 10,
    CreatedAt                 VARCHAR(30)  NOT NULL,
    constraint pk_events primary key (id)

);
