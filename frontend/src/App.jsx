import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import TicketResults from './components/TicketResults';
import TicketForm from './components/TicketForm';
import TicketDetails from './components/TicketDetails';
import api from './services/api';

export function App() {
  const [activeTab, setActiveTab] = useState('tickets'); // 'dashboard', 'tickets', 'create'
  const [tickets, setTickets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all tickets and categories from API
  const fetchPortalData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ticketsRes, categoriesRes] = await Promise.all([
        api.getTickets(),
        api.getCategories()
      ]);

      if (ticketsRes.success && Array.isArray(ticketsRes.data)) {
        setTickets(ticketsRes.data);
      }

      if (categoriesRes.success && Array.isArray(categoriesRes.data)) {
        setCategories(categoriesRes.data);
      }
    } catch (err) {
      console.error('Failed to load portal data:', err);
      setError(err.message || 'Unable to connect to Smart Employee Service Desk API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortalData();
  }, []);

  // This is a demo profile selector, not authentication. Keep the selected
  // database user between refreshes while still validating it against /users.
  useEffect(() => {
    async function loadUsers() {
      try {
        const res = await api.getUsers();
        if (!res.success || !Array.isArray(res.data)) return;

        setUsers(res.data);
        let savedUser = null;
        try {
          savedUser = JSON.parse(localStorage.getItem('serviceDeskCurrentUser'));
        } catch {
          localStorage.removeItem('serviceDeskCurrentUser');
        }
        const restoredUser = res.data.find((user) => user.UserId === savedUser?.UserId);
        setCurrentUser(restoredUser || res.data[0] || null);
      } catch (err) {
        // Ticket functionality remains available if the non-critical selector cannot load.
        console.error('Failed to load demo users:', err);
      }
    }
    loadUsers();
  }, []);

  const handleUserChange = (userId) => {
    const selectedUser = users.find((user) => user.UserId === Number(userId)) || null;
    setCurrentUser(selectedUser);

    if (selectedUser) {
      localStorage.setItem('serviceDeskCurrentUser', JSON.stringify(selectedUser));
      if (selectedUser.Role === 'Employee' && activeTab === 'dashboard') {
        setActiveTab('tickets');
      }
    }
  };

  const canAccessDashboard = currentUser?.Role === 'Support Staff' || currentUser?.Role === 'Manager';
  const canCreateTickets = true;

  const handleTicketCreated = () => {
    fetchPortalData();
    setActiveTab('tickets');
  };

  const handleTicketUpdated = () => {
    fetchPortalData();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Header Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        users={users}
        currentUser={currentUser}
        onUserChange={handleUserChange}
        canAccessDashboard={canAccessDashboard}
        canCreateTickets={canCreateTickets}
      />

      {/* Main Page Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && canAccessDashboard && (
          <Dashboard
            onNavigateToTickets={() => setActiveTab('tickets')}
            onSelectCategory={(cat) => {
              setActiveTab('tickets');
            }}
          />
        )}

        {activeTab === 'tickets' && (
          <TicketResults
            tickets={tickets}
            categories={categories}
            loading={loading}
            error={error}
            onSelectTicket={(id) => setSelectedTicketId(id)}
            onRefresh={fetchPortalData}
            onCreateTicketClick={() => setActiveTab('create')}
            canCreateTickets={canCreateTickets}
          />
        )}

        {activeTab === 'create' && canCreateTickets && (
          <TicketForm onTicketCreated={handleTicketCreated} currentUser={currentUser} />
        )}
      </main>

      {/* Ticket Details Modal */}
      {selectedTicketId && (
        <TicketDetails
          ticketId={selectedTicketId}
          onClose={() => setSelectedTicketId(null)}
          onTicketUpdated={handleTicketUpdated}
          currentUser={currentUser}
        />
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Smart Employee Service Desk & Ticket Management Portal</span>
          <span className="font-mono text-slate-400">Node.js + Express + SQL Server + React</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
