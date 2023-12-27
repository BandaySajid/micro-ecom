CREATE TABLE IF NOT EXISTS products(
    product_id INT AUTO_INCREMENT UNIQUE NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    product_description LONGTEXT NOT NULL,
    price FLOAT NOT NULL,
    category VARCHAR(15) NOT NULL,
    size VARCHAR(10),
    quantity INT NOT NULL,
    created_on DATETIME DEFAULT(NOW()),
    PRIMARY KEY(product_id)
);