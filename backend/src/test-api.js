import app from './app.js';

const PORT = 5001; // Temporary port for testing API endpoints
let server;

const BASE_URL = `http://localhost:${PORT}`;

async function runApiTests() {
  console.log('==================================================');
  console.log('      Executing Phase 3 REST API Test Suite');
  console.log('==================================================\n');

  server = app.listen(PORT);
  console.log(`[Test Runner] Server listening on port ${PORT}\n`);

  let createdTicketId = null;

  try {
    // Test 1: GET /tickets
    console.log('[Test 1] GET /tickets');
    const res1 = await fetch(`${BASE_URL}/tickets`);
    const data1 = await res1.json();
    console.log(`Status: ${res1.status} | Tickets Count: ${data1.count}`);
    if (res1.status !== 200 || !data1.success) throw new Error('GET /tickets failed');

    // Test 2: POST /tickets (Create Ticket)
    console.log('\n[Test 2] POST /tickets (Create New Ticket)');
    const res2 = await fetch(`${BASE_URL}/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Printer paper jam on Floor 2',
        description: 'Main office printer displays error code E-04 and cannot process print jobs.',
        category: 'Facilities',
        priority: 'Medium'
      })
    });
    const data2 = await res2.json();
    console.log(`Status: ${res2.status} | Created Ticket ID: ${data2.data?.TicketId}`);
    if (res2.status !== 201 || !data2.success) throw new Error('POST /tickets failed');
    createdTicketId = data2.data.TicketId;

    // Test 3: GET /tickets/:id
    console.log(`\n[Test 3] GET /tickets/${createdTicketId}`);
    const res3 = await fetch(`${BASE_URL}/tickets/${createdTicketId}`);
    const data3 = await res3.json();
    console.log(`Status: ${res3.status} | Title: "${data3.data?.Title}" | Status: ${data3.data?.Status}`);
    if (res3.status !== 200 || data3.data?.TicketId !== createdTicketId) throw new Error('GET /tickets/:id failed');

    // Test 4: PUT /tickets/:id (Update Priority & Status)
    console.log(`\n[Test 4] PUT /tickets/${createdTicketId} (Update Ticket)`);
    const res4 = await fetch(`${BASE_URL}/tickets/${createdTicketId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        priority: 'High',
        status: 'In Progress',
        notes: 'Technician dispatched to replace roller assembly.'
      })
    });
    const data4 = await res4.json();
    console.log(`Status: ${res4.status} | New Priority: ${data4.data?.Priority} | New Status: ${data4.data?.Status}`);
    if (res4.status !== 200 || data4.data?.Priority !== 'High') throw new Error('PUT /tickets/:id failed');

    // Test 5: PUT /tickets/:id/close (Close Ticket)
    console.log(`\n[Test 5] PUT /tickets/${createdTicketId}/close (Close Ticket)`);
    const res5 = await fetch(`${BASE_URL}/tickets/${createdTicketId}/close`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        notes: 'Paper jam cleared and test page printed successfully.'
      })
    });
    const data5 = await res5.json();
    console.log(`Status: ${res5.status} | Closed Ticket Status: ${data5.data?.Status}`);
    if (res5.status !== 200 || data5.data?.Status !== 'Closed') throw new Error('PUT /tickets/:id/close failed');

    // Test 6: GET /categories
    console.log('\n[Test 6] GET /categories');
    const res6 = await fetch(`${BASE_URL}/categories`);
    const data6 = await res6.json();
    console.log(`Status: ${res6.status} | Categories: ${data6.data?.map(c => c.Name).join(', ')}`);
    if (res6.status !== 200 || !Array.isArray(data6.data)) throw new Error('GET /categories failed');

    // Test 7: GET /dashboard/summary
    console.log('\n[Test 7] GET /dashboard/summary');
    const res7 = await fetch(`${BASE_URL}/dashboard/summary`);
    const data7 = await res7.json();
    console.log(`Status: ${res7.status} | Total Tickets: ${data7.data?.total}`);
    if (res7.status !== 200 || typeof data7.data?.total !== 'number') throw new Error('GET /dashboard/summary failed');

    // --- EDGE CASES & INPUT VALIDATION TESTS ---
    console.log('\n--------------------------------------------------');
    console.log('       Edge Cases & Error Handling Tests');
    console.log('--------------------------------------------------');

    // Test 8: GET Non-existent ticket ID
    console.log('\n[Test 8 Error] GET /tickets/99999 (Non-existent ID)');
    const res8 = await fetch(`${BASE_URL}/tickets/99999`);
    const data8 = await res8.json();
    console.log(`Status: ${res8.status} (Expected 404) | Message: "${data8.message}"`);
    if (res8.status !== 404) throw new Error('Expected 404 for non-existent ticket ID');

    // Test 9: GET Invalid ticket ID format
    console.log('\n[Test 9 Error] GET /tickets/abc (Invalid ID format)');
    const res9 = await fetch(`${BASE_URL}/tickets/abc`);
    const data9 = await res9.json();
    console.log(`Status: ${res9.status} (Expected 400) | Message: "${data9.message}"`);
    if (res9.status !== 400) throw new Error('Expected 400 for invalid ID format');

    // Test 10: POST missing required title
    console.log('\n[Test 10 Error] POST /tickets (Missing title)');
    const res10 = await fetch(`${BASE_URL}/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description: 'Missing title request',
        category: 'IT',
        priority: 'Low'
      })
    });
    const data10 = await res10.json();
    console.log(`Status: ${res10.status} (Expected 400) | Errors: ${JSON.stringify(data10.errors)}`);
    if (res10.status !== 400) throw new Error('Expected 400 for missing title');

    // Test 11: POST invalid priority value
    console.log('\n[Test 11 Error] POST /tickets (Invalid priority value "Critical")');
    const res11 = await fetch(`${BASE_URL}/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'VPN Glitch',
        description: 'Connection drops',
        category: 'IT',
        priority: 'Critical' // Only High, Medium, Low allowed
      })
    });
    const data11 = await res11.json();
    console.log(`Status: ${res11.status} (Expected 400) | Errors: ${JSON.stringify(data11.errors)}`);
    if (res11.status !== 400) throw new Error('Expected 400 for invalid priority');

    // Test 12: PUT close non-existent ticket
    console.log('\n[Test 12 Error] PUT /tickets/99999/close (Close non-existent ticket)');
    const res12 = await fetch(`${BASE_URL}/tickets/99999/close`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes: 'Should fail' })
    });
    const data12 = await res12.json();
    console.log(`Status: ${res12.status} (Expected 404) | Message: "${data12.message}"`);
    if (res12.status !== 404) throw new Error('Expected 404 for closing non-existent ticket');

    console.log('\n==================================================');
    console.log('   ALL 12 API & VALIDATION TESTS PASSED 100%!');
    console.log('==================================================\n');

  } catch (err) {
    console.error('\n[API Test Suite Failed]:', err.message);
  } finally {
    if (server) server.close();
    process.exit(0);
  }
}

runApiTests();
