CREATE TABLE IF NOT EXISTS users(
    user_id varchar(50) UNIQUE not null,
    username varchar(255) UNIQUE not null,
    email varchar(255) UNIQUE not null,
    password varchar(255) not null,
    created_on DATETIME DEFAULT(NOW()),
    PRIMARY KEY(user_id)
);

INSERT INTO users (user_id, username, email, password) 
VALUES('c6723243-bc5a-42a4-ae30-df306137a1d1', 'microEcomAdmin', 'admin@microecom.com', 'e86f78a8a3caf0b60d8e74e5942aa6d86dc150cd3c03338aef25b7d2d7e3acc7')
ON DUPLICATE KEY UPDATE 
  username = 'microEcomAdmin', email = 'admin@microecom.com', password = 'e86f78a8a3caf0b60d8e74e5942aa6d86dc150cd3c03338aef25b7d2d7e3acc7';
