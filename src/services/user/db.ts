import db_connection from '../../database/connection.js';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import config from '../../config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const init = async () => {
    const schema = await fs.readFile(path.join(__dirname, 'schema.sql'), 'utf-8');
    const db = await db_connection.connect(config.database.services.user, schema);
    return db;
};

const db = await init();

export default db;