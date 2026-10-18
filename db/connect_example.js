// i'm not publishing my private url here
import pg from "pg";

const pool = new pg.Pool({
    connectionString: "URL HERE"
});


export default pool;