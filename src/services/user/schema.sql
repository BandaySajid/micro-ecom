CREATE TABLE IF NOT EXISTS users(
    user_id varchar(50) not null,
    username varchar(255) not null,
    email varchar(255) not null,
    password varchar(255) not null,
    created_on DATETIME DEFAULT(NOW())
);