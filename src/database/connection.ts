import mysql from 'mysql2/promise';
import config from '../config.js';

const connect = async (database: string, schemaQuery: string) => {
    try {
        const connection = await mysql.createConnection({
            user: 'root',
            host: process.env.DB_HOST || 'localhost',
            port: 3306,
            database: database,
            password: config.database.password
        });

        await connection.execute(schemaQuery);

        return connection;

    } catch (error) {
        console.log('[DATABASE-ERROR]:', error);
        process.exit(1);
    };
};

export default { connect };