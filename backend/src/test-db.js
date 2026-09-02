import { getPool } from './config/db.js';

const testDatabaseConnection = async () => {
  console.log('--- Testing SQL Server Database Connection & Data Verification ---');
  try {
    const pool = await getPool();
    
    // Verify Current Database Name & Server Info
    const dbInfo = await pool.request().query('SELECT DB_NAME() AS CurrentDatabase, @@SERVERNAME AS ServerName, @@VERSION AS Version');
    console.log(`[Success] Connected to Server: "${dbInfo.recordset[0].ServerName}" | Database: "${dbInfo.recordset[0].CurrentDatabase}"`);

    // Verify Tables Exist
    const tablesResult = await pool.request().query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE'
      ORDER BY TABLE_NAME
    `);
    const tables = tablesResult.recordset.map(r => r.TABLE_NAME);
    console.log('[Success] Tables found in database:', tables.join(', '));

    // Test Reading Users, Categories, Tickets, Comments
    const users = await pool.request().query('SELECT COUNT(*) AS count FROM Users');
    const categories = await pool.request().query('SELECT COUNT(*) AS count FROM Categories');
    const tickets = await pool.request().query('SELECT COUNT(*) AS count FROM Tickets');
    const comments = await pool.request().query('SELECT COUNT(*) AS count FROM Comments');

    console.log(`[Row Counts] Users: ${users.recordset[0].count} | Categories: ${categories.recordset[0].count} | Tickets: ${tickets.recordset[0].count} | Comments: ${comments.recordset[0].count}`);

    console.log('--- Database Connection & Verification Test Completed Successfully ---');
    process.exit(0);
  } catch (err) {
    console.error('--- Database Connection Test Failed ---');
    console.error(err.message);
    process.exit(1);
  }
};

testDatabaseConnection();
