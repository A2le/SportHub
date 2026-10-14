CREATE TABLE fixtures (
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
