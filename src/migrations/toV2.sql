create table email_tokens
(
    id        CHAR(40) not null
        primary key
        unique,
    createdAt DATETIME not null,
    userId    INTEGER  not null
        references users
            on update cascade on delete cascade
);

alter table users
	add emailConfirmationTokenAt datetime default null;