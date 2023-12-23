import mysql from 'mysql2/promise';
import config from '../config.js';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const connect = async (database: string, schemaPathMetaUrl: string) => {
    try {
        const connection = await mysql.createConnection({
            user: 'root',
            host: process.env.DB_HOST || 'localhost',
            port: 3306,
            database: database,
            password: config.database.password
        });

        const schemaPath =  path.join(path.dirname(fileURLToPath(schemaPathMetaUrl)), 'schema.sql');

        const schemaQuery: string = await fs.readFile(schemaPath, 'utf-8');

        await connection.execute(schemaQuery);

        return connection;

    } catch (error) {
        console.log('[DATABASE-ERROR]:', error);
        process.exit(1);
    };
};

export default { connect };