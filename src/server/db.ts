import mysql from "mysql2/promise";

export const pool = mysql.createPool({
  host: process.env.DB_HOST!,          // ex: b1nfnwx7i8ltrs4eg1ny-mysql.services.clever-cloud.com
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER!,          // ex: uXXXX
  password: process.env.DB_PASSWORD!,  // ***
  database: process.env.DB_NAME!,      // b1nfnwx7i8ltrs4eg1ny
  waitForConnections: true,
  connectionLimit: 5,
  ssl: { rejectUnauthorized: false },  // Clever Cloud costuma exigir SSL
});
