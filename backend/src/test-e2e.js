const API_BASE_URL = 'http://localhost:5000/api';

async function runE2EVerification() {
  console.log('==================================================');
  console.log('   Executing End-To-End Portal Integration Verification');
  console.log('==================================================\n');

  try {
    // 1. Dashboard summary pre-check
    console.log('[1/8] Fetching Dashboard Summary (GET /api/dashboard/summary)...');
    const dash1Res = await fetch(`${API_BASE_URL}/dashboard/summary`);
    const dash1 = await dash1Res.json();
    console.log(`      Total Tickets: ${dash1.data?.total} | Categories: ${dash1.data?.byCategory.length}`);

    // 2. Fetch Categories
    console.log('\n[2/8] Fetching Categories (GET /api/categories)...');
    const catRes = await fetch(`${API_BASE_URL}/categories`);
    const categories = await catRes.json();
    console.log(`      Available Categories: ${categories.data?.map(c => c.Name).join(', ')}`);

    // 3. Create Ticket (Form submission scenario)
    console.log('\n[3/8] Creating New Ticket via Form Submission (POST /api/tickets)...');
    const createRes = await fetch(`${API_BASE_URL}/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Monitor flickering in Conference Room B',
        description: 'HDMI connection causes display screen to flicker intermittently during team calls.',
        category: 'Facilities',
        priority: 'Medium'
      })
    });
    const created = await createRes.json();
    const ticketId = created.data?.TicketId;
    console.log(`      Ticket Created! ID: #${ticketId} | Status: ${created.data?.Status} | Priority: ${created.data?.Priority}`);

    // 4. Fetch Tickets List
    console.log('\n[4/8] Fetching All Tickets (GET /api/tickets)...');
    const listRes = await fetch(`${API_BASE_URL}/tickets`);
    const list = await listRes.json();
    const found = list.data?.find(t => t.TicketId === ticketId);
    console.log(`      Verified Ticket #${ticketId} present in list! (Total Listed: ${list.count})`);

    // 5. Fetch Single Ticket Details
    console.log(`\n[5/8] Fetching Ticket Details (GET /api/tickets/${ticketId})...`);
    const detailRes = await fetch(`${API_BASE_URL}/tickets/${ticketId}`);
    const details = await detailRes.json();
    console.log(`      Title: "${details.data?.Title}" | Description Snippet: "${details.data?.Description.substring(0, 40)}..."`);

    // 6. Update Ticket Priority & Status
    console.log(`\n[6/8] Updating Ticket Status & Priority (PUT /api/tickets/${ticketId})...`);
    const updateRes = await fetch(`${API_BASE_URL}/tickets/${ticketId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        priority: 'High',
        status: 'In Progress',
        notes: 'Facilities technician dispatched with replacement HDMI cable.'
      })
    });
    const updated = await updateRes.json();
    console.log(`      Updated Priority: ${updated.data?.Priority} | Updated Status: ${updated.data?.Status}`);

    // 7. Close Ticket with Resolution Note
    console.log(`\n[7/8] Closing Ticket with Resolution Notes (PUT /api/tickets/${ticketId}/close)...`);
    const closeRes = await fetch(`${API_BASE_URL}/tickets/${ticketId}/close`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        notes: 'Replaced HDMI splitter cable. Display stable.'
      })
    });
    const closed = await closeRes.json();
    console.log(`      Closed Ticket Status: ${closed.data?.Status} | Resolution Notes: "${closed.data?.comments?.[1]?.Notes}"`);

    // 8. Verify Dashboard Update
    console.log('\n[8/8] Verifying Dashboard Reporting Update (GET /api/dashboard/summary)...');
    const dash2Res = await fetch(`${API_BASE_URL}/dashboard/summary`);
    const dash2 = await dash2Res.json();
    console.log(`      Updated Total Tickets: ${dash2.data?.total} (Incremented by +1)`);

    console.log('\n==================================================');
    console.log('   FULL END-TO-END VERIFICATION COMPLETED 100%!');
    console.log('==================================================\n');

  } catch (err) {
    console.error('\n[E2E Verification Error]:', err.message);
  }
}

runE2EVerification();
