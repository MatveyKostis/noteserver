import pg from "pg";
import 'dotenv/config'

const pool = new pg.Pool({
    connectionString: process.env.POSTGRESURL
});


export default pool;