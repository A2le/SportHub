CREATE TABLE notifications (
    Id          INT           NOT NULL AUTO_INCREMENT,
    RecipientId INT           NOT NULL,
    Message     VARCHAR(1000) NOT NULL,
    Type        VARCHAR(20)   NOT NULL,
    IsRead      TINYINT(1)    NOT NULL DEFAULT 0,
    CreatedAt   DATETIME      NOT NULL,
    CONSTRAINT pk_notifications PRIMARY KEY (Id)
);
