const { Pool } = require('pg');

console.log("DB_PASSWORD:", process.env.DB_PASSWORD);
console.log("Tipo de DB_PASSWORD:", typeof process.env.DB_PASSWORD);


const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false,
  },
});

console.log("DB_PASSWORD:", process.env.DB_PASSWORD); // <-- para verificar
module.exports = pool;
