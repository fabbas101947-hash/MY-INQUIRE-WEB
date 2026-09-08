CREATE DATABASE IF NOT EXISTS inquire_store CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE inquire_store;

CREATE TABLE users (id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100) NOT NULL, email VARCHAR(190) NOT NULL UNIQUE, password VARCHAR(255) NOT NULL, phone VARCHAR(30) NULL, address TEXT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB;
CREATE TABLE admins (id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, username VARCHAR(100) NOT NULL UNIQUE, password VARCHAR(255) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB;
CREATE TABLE products (id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, name VARCHAR(180) NOT NULL, description TEXT NOT NULL, price DECIMAL(12,2) NOT NULL, image VARCHAR(255) NOT NULL, category VARCHAR(100) NULL, size VARCHAR(120) NULL, color VARCHAR(120) NULL, stock INT UNSIGNED NOT NULL DEFAULT 0, status ENUM('active','inactive') NOT NULL DEFAULT 'active', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, INDEX(status), INDEX(category)) ENGINE=InnoDB;
CREATE TABLE orders (id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, order_number VARCHAR(32) NOT NULL UNIQUE, customer_name VARCHAR(100) NOT NULL, customer_email VARCHAR(190) NOT NULL, customer_phone VARCHAR(30) NOT NULL, shipping_address TEXT NOT NULL, total_amount DECIMAL(12,2) NOT NULL, order_status ENUM('Pending','Confirmed','Processing','Shipped','Delivered','Cancelled') NOT NULL DEFAULT 'Pending', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, INDEX(order_status), INDEX(customer_email)) ENGINE=InnoDB;
CREATE TABLE order_items (id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, order_id INT UNSIGNED NOT NULL, product_id INT UNSIGNED NOT NULL, product_name VARCHAR(180) NOT NULL, size VARCHAR(50) NULL, color VARCHAR(50) NULL, quantity INT UNSIGNED NOT NULL, price DECIMAL(12,2) NOT NULL, subtotal DECIMAL(12,2) NOT NULL, CONSTRAINT fk_item_order FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE, CONSTRAINT fk_item_product FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE RESTRICT) ENGINE=InnoDB;
CREATE TABLE contact_messages (id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100) NOT NULL, email VARCHAR(190) NOT NULL, phone VARCHAR(30) NULL, subject VARCHAR(180) NOT NULL, message TEXT NOT NULL, status ENUM('unread','read') NOT NULL DEFAULT 'unread', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, INDEX(status)) ENGINE=InnoDB;

INSERT INTO products(name,description,price,image,category,size,color,stock) VALUES
('Exclusive Premium Item #1','Newly launched premium product with exceptional features.',129.99,'IMG_0222.jpg','Premium Collection','S,M,L,XL','Black,White',25),
('Limited Edition Item #2','Limited edition exclusive product with premium materials.',199.99,'IMG_0223.jpg','Exclusive Collection','S,M,L,XL','Black,Maroon',18),
('Customer Favorite Item #3','Top-rated product loved by customers.',149.99,'IMG_0217.jpg','Best Sellers','S,M,L,XL','White,Blue',30),
('Premium Selection Item #4','Carefully selected premium product.',179.99,'IMG_0218.jpg','Premium Collection','S,M,L,XL','Black,Beige',20),
('Exclusive Collection Item #5','Limited exclusive product with premium quality.',159.99,'IMG_0219.jpg','Exclusive Collection','S,M,L,XL','White,Green',22),
('Special Offer Item #6','Special promotional product.',159.99,'IMG_0221.jpg','Premium Collection','S,M,L,XL','Black,Red',28),
('New Exclusive Selection #7','Fresh arrival with premium materials.',189.99,'IMG_0214.jpg','Exclusive Collection','S,M,L,XL','Navy,White',16),
('Top Rated Item #8','Customer favorite with high ratings.',139.99,'IMG_0215.jpg','Best Sellers','S,M,L,XL','Grey,Black',35);

-- Create the first admin after import by running this in PHP once:
-- password_hash('change-this-password', PASSWORD_DEFAULT)
-- INSERT INTO admins(username,password) VALUES ('admin','<generated hash>');
