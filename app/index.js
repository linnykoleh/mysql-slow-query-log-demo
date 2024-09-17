const express = require('express');
const mysql = require('mysql2');

const app = express();
const port = 8080;

function connectToDatabase() {
    const connection = mysql.createConnection({
        host: 'mysql',
        user: 'user',
        password: 'password',
        database: 'slow_query_db',
        port: 3306
    });

    connection.connect((err) => {
        if (err) {
            console.error('Error connecting to MySQL, try again in 5 seconds:', err);
            setTimeout(connectToDatabase, 5000);
        } else {
            console.log('Connected to MySQL!');
            startServer(connection);
        }
    });

    connection.on('error', (err) => {
        console.error('Error in the connection:', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            connectToDatabase();
        }
    });
}

function startServer(connection) {
    app.get('/heavy-query', (req, res) => {
        const start = Date.now();

        const sqlQuery = `
            SELECT t1.id, t1.data, COUNT(t2.id) AS join_count, AVG(t2.id) AS avg_id
            FROM large_table t1
            LEFT JOIN another_table t2 ON t1.id = t2.foreign_id
            WHERE t1.id > 56
            GROUP BY t1.id
            HAVING join_count > 10
            ORDER BY t1.created_at DESC
            LIMIT 1000;
        `;

        connection.query(sqlQuery, (error, results) => {
            if (error) {
                console.error('Error during query:', error);
                res.status(500).send('Database error');
                return;
            }

            const duration = Date.now() - start;
            res.send({
                message: `Query completed in ${duration} ms`,
                results: results
            });
        });
    });

    app.listen(port, () => {
        console.log(`API server running on port ${port}`);
    });
}

connectToDatabase();
