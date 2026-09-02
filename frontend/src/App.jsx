import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import TicketResults from './components/TicketResults';
import TicketForm from './components/TicketForm';
import TicketDetails from './components/TicketDetails';
import api from './services/api';

export function App() {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'tickets', 'create'
  const [tickets, setTickets] = useState([]);
  const [categories, setCategories] = useState([]);
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
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Page Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
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
          />
        )}

        {activeTab === 'create' && (
          <TicketForm onTicketCreated={handleTicketCreated} />
        )}
      </main>

      {/* Ticket Details Modal */}
      {selectedTicketId && (
        <TicketDetails
          ticketId={selectedTicketId}
          onClose={() => setSelectedTicketId(null)}
          onTicketUpdated={handleTicketUpdated}
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
