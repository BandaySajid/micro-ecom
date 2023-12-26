CREATE TABLE IF NOT EXISTS orders(
    order_id VARCHAR(50) UNIQUE NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    total_price FLOAT NOT NULL, 
    status TINYTEXT DEFAULT('PENDING'),
    created_on DATETIME DEFAULT(NOW()),
    PRIMARY KEY(order_id)
);

CREATE TABLE IF NOT EXISTS items(
    item_id VARCHAR(50) UNIQUE NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    item_price FLOAT NOT NULL,
    item_quantity FLOAT NOT NULL,
    order_id VARCHAR(50) NOT NULL,
    PRIMARY KEY(item_id),
    FOREIGN KEY(order_id) REFERENCES orders(order_id)
);

CREATE TRIGGER IF NOT EXISTS order_delete
BEFORE DELETE ON orders
FOR EACH ROW
BEGIN
    DELETE FROM items where order_id = OLD.order_id;
END