import mssql from 'mssql/msnodesqlv8.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupDatabase() {
  console.log('==================================================');
  console.log('  Executing Phase 2 Database Setup & Verification');
  console.log('==================================================\n');

  // Step 1: Connect to master database on local SQL Server
  const masterConnStr = process.env.DB_CONNECTION_STRING || 
    `Driver={ODBC Driver 18 for SQL Server};Server=localhost;Database=master;Trusted_Connection=yes;TrustServerCertificate=yes;`;
  
  console.log('[1/6] Connecting to local SQL Server master database...');
  let masterPool = await mssql.connect({ connectionString: masterConnStr });
  console.log('[1/6] Connected successfully to SQL Server!');

  // Step 2: Create ServiceDeskDB if not exists
  console.log('[2/6] Ensuring ServiceDeskDB exists...');
  await masterPool.request().query(`
    IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'ServiceDeskDB')
    BEGIN
        CREATE DATABASE ServiceDeskDB;
    END
  `);
  console.log('[2/6] Database ServiceDeskDB verified!');
  await masterPool.close();

  // Step 3: Connect to ServiceDeskDB
  const dbConnStr = process.env.DB_CONNECTION_STRING_APP || 
    `Driver={ODBC Driver 18 for SQL Server};Server=localhost;Database=ServiceDeskDB;Trusted_Connection=yes;TrustServerCertificate=yes;`;
  
  console.log('[3/6] Connecting to ServiceDeskDB...');
  const pool = await mssql.connect({ connectionString: dbConnStr });

  // Step 4: Execute Schema SQL
  console.log('[4/6] Executing backend/database/schema.sql...');
  const schemaPath = path.join(__dirname, '../database/schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  // Split batches by GO commands
  const schemaBatches = schemaSql
    .split(/^GO\s*$/im)
    .map(b => b.trim())
    .filter(b => b.length > 0);

  for (const batch of schemaBatches) {
    await pool.request().query(batch);
  }
  console.log('[4/6] Schema executed successfully!');

  // Step 5: Execute Seed SQL
  console.log('[5/6] Executing backend/database/seed.sql...');
  const seedPath = path.join(__dirname, '../database/seed.sql');
  const seedSql = fs.readFileSync(seedPath, 'utf8');

  const seedBatches = seedSql
    .split(/^GO\s*$/im)
    .map(b => b.trim())
    .filter(b => b.length > 0);

  for (const batch of seedBatches) {
    await pool.request().query(batch);
  }
  console.log('[5/6] Seed data inserted successfully!');

  // Step 6: Verify Database Tables & Sample Data
  console.log('\n[6/6] Verifying Database Tables and Sample Data...');
  
  const tablesRes = await pool.request().query(`
    SELECT TABLE_NAME 
    FROM INFORMATION_SCHEMA.TABLES 
    WHERE TABLE_TYPE = 'BASE TABLE'
    ORDER BY TABLE_NAME
  `);
  const tables = tablesRes.recordset.map(r => r.TABLE_NAME);
  console.log('   - Database Tables Found:', tables.join(', '));

  const users = await pool.request().query('SELECT UserId, Name, Email, Role FROM Users');
  console.log(`   - Users (${users.recordset.length} rows):`, users.recordset.map(u => `${u.Name} (${u.Role})`).join(', '));

  const categories = await pool.request().query('SELECT CategoryId, Name FROM Categories ORDER BY CategoryId');
  console.log(`   - Categories (${categories.recordset.length} rows):`, categories.recordset.map(c => c.Name).join(', '));

  const tickets = await pool.request().query('SELECT TicketId, Title, Category, Priority, Status FROM Tickets ORDER BY TicketId');
  console.log(`   - Tickets (${tickets.recordset.length} rows):`);
  tickets.recordset.forEach(t => {
    console.log(`     [#${t.TicketId}] ${t.Title} | Category: ${t.Category} | Priority: ${t.Priority} | Status: ${t.Status}`);
  });

  const comments = await pool.request().query('SELECT CommentId, TicketId, Notes FROM Comments');
  console.log(`   - Comments (${comments.recordset.length} rows):`, comments.recordset.map(c => `[Ticket #${c.TicketId}] ${c.Notes}`).join('; '));

  console.log('\n==================================================');
  console.log('  SUCCESS: Phase 2 Database Setup & Verification Passed');
  console.log('==================================================\n');

  await pool.close();
  process.exit(0);
}

setupDatabase().catch(err => {
  console.error('\n[Database Setup Failed]:', err);
  process.exit(1);
});
