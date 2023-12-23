import config from "../../config.js";
import db_connector from "../../database/connection.js";

const db = await db_connector.connect(config.database.services.user, import.meta.url);

export default db;