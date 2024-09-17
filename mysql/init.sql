CREATE DATABASE IF NOT EXISTS slow_query_db;
USE slow_query_db;

-- Create the large table
CREATE TABLE IF NOT EXISTS large_table (
  id INT AUTO_INCREMENT PRIMARY KEY,
  data VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert random data into large_table
INSERT INTO large_table (data)
SELECT LEFT(MD5(RAND()), 255)
FROM information_schema.tables t1
JOIN information_schema.tables t2
LIMIT 40000000;

-- Create another table for JOIN queries
CREATE TABLE IF NOT EXISTS another_table (
  id INT AUTO_INCREMENT PRIMARY KEY,
  foreign_id INT,
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (foreign_id) REFERENCES large_table(id) ON DELETE CASCADE
);

-- Insert random data into another_table
INSERT INTO another_table (foreign_id, description)
SELECT t1.id, LEFT(MD5(RAND()), 255)
FROM large_table t1
JOIN information_schema.tables t2
LIMIT 1000000;
