CREATE TABLE registrations (
    Id           INT NOT NULL AUTO_INCREMENT,
    EventId      INT NOT NULL,
    TeamId       INT NOT NULL,
    Status       VARCHAR(20) NOT NULL DEFAULT 'Pending',
    RegisteredAt DATETIME    NOT NULL,
    CONSTRAINT pk_registrations PRIMARY KEY (Id),
    CONSTRAINT fk_registrations_event FOREIGN KEY (EventId) REFERENCES events(Id),
    CONSTRAINT fk_registrations_team  FOREIGN KEY (TeamId)  REFERENCES teams(Id),
    CONSTRAINT uq_registrations_event_team UNIQUE (EventId, TeamId)
);
