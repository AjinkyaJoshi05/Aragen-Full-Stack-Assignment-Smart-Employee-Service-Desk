import mssql from 'mssql/msnodesqlv8.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Reusable SQL Server Database Pool Configuration
 * Supports both local Windows Authentication and Cloud SQL Server Authentication
 * driven entirely by Environment Variables.
 */
let dbConfig;

if (process.env.DB_CONNECTION_STRING) {
  // Connection String approach (Local Windows Auth or ODBC)
  dbConfig = {
    connectionString: process.env.DB_CONNECTION_STRING,
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000
    }
  };
} else {
  // Standard Object Configuration (Cloud SQL Server / SQL Authentication)
  dbConfig = {
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || '',
    server: process.env.DB_SERVER || 'localhost',
    database: process.env.DB_NAME || process.env.DB_DATABASE || 'ServiceDeskDB',
    port: parseInt(process.env.DB_PORT || '1433', 10),
    options: {
      encrypt: process.env.DB_ENCRYPT === 'true', // true for Cloud / Azure SQL
      trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true', // true for local dev
      enableArithAbort: true
    },
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000
    }
  };
}

let poolPromise = null;

/**
 * Obtains or initializes the singleton SQL Server connection pool
 */
export const getPool = async () => {
  if (!poolPromise) {
    poolPromise = mssql.connect(dbConfig)
      .then(pool => {
        console.log(`[Database] Connected successfully to SQL Server (${process.env.DB_NAME || 'ServiceDeskDB'})`);
        return pool;
      })
      .catch(err => {
        console.error('[Database Connection Failure]', err.message);
        poolPromise = null;
        throw err;
      });
  }
  return poolPromise;
};

export { mssql };
export default { getPool, mssql };
