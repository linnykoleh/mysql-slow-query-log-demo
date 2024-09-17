# HSA_Logging

## Mysql Slow Query Log
- Set up MySQL with slow query log.
- Configure ELK to work with mysql slow query log.
- Configure GrayLog2 to work with mysql slow query log.
- Set different thresholds for long_query_time (0, 1 , 10) and compare performance.

## Start the Docker containers
````bash
docker-compose up -d
````
This will start the following services:
- MySQL (with slow query log enabled)
- Elasticsearch
- Logstash
- Kibana
- Graylog
- Telegraf
- Grafana
- Node.js app (API server running on port 8080)

## Database Setup
The project should automatically generate two large tables (large_table and another_table) for testing when MySQL starts. However, if the tables were not created correctly, follow the steps below to create them manually.
### Manual Database Setup
- Connect to MySQL Dashboard using MySQL Workbench:
````bash
Host: localhost
Port: 3306
Username: user
Password: password
````
Create the necessary tables manually: Open the following SQL script in MySQL Workbench and execute it:
````sql
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
LIMIT 10000000;

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
LIMIT 5000000;
````

## Run the API or SQL Query
````bash
curl http://localhost:8080/heavy-query
````

````bash
SELECT t1.id, t1.data, COUNT(t2.id) AS join_count, AVG(t2.id) AS avg_id
FROM large_table t1
LEFT JOIN another_table t2 ON t1.id = t2.foreign_id
WHERE t1.id > 56
GROUP BY t1.id
HAVING join_count > 10
ORDER BY t1.created_at DESC
LIMIT 100000;
````

## Monitoring and Logging
Kibana: Access the Kibana dashboard at http://localhost:5601 to view Elasticsearch logs and visualize slow query logs.
Graylog: Access the Graylog dashboard at http://localhost:9000 to analyze logs sent via GELF.
Grafana: Access Grafana at http://localhost:3000 for database performance monitoring metrics (default login: admin / password: adminpassword).

## Results

- long_query_time = 0
![system](screenshots/long_query_time_0.png)
![system](screenshots/long_query_time_0_mysql.png)
![system](screenshots/long_query_time_0_mysql_2.png)

- long_query_time = 1
![system](screenshots/long_query_time_1.png)
![system](screenshots/long_query_time_1_mysql.png)
![system](screenshots/long_query_time_1_mysql_2.png)

- long_query_time = 5
![system](screenshots/long_query_time_5.png)
![system](screenshots/long_query_time_5_mysql.png)
![system](screenshots/long_query_time_5_mysql_2.png)

- long_query_time = 10
![system](screenshots/long_query_time_10.png)
![system](screenshots/long_query_time_10_mysql.png)
![system](screenshots/long_query_time_10_mysql_2.png)