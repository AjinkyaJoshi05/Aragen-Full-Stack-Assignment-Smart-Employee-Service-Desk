import React, { useState } from 'react';
import TicketCard from './TicketCard';
import LoadingState from './LoadingState';
import ErrorMessage from './ErrorMessage';
import { Search, Filter, RefreshCw, TicketX, Plus } from 'lucide-react';

export const TicketResults = ({
  tickets = [],
  categories = [],
  loading = false,
  error = null,
  onSelectTicket,
  onRefresh,
  onCreateTicketClick
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Filter tickets locally for instantaneous UI response
  const filteredTickets = tickets.filter((t) => {
    if (categoryFilter && t.Category !== categoryFilter) return false;
    if (priorityFilter && t.Priority !== priorityFilter) return false;
    if (statusFilter && t.Status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const titleMatch = t.Title && t.Title.toLowerCase().includes(q);
      const descMatch = t.Description && t.Description.toLowerCase().includes(q);
      const idMatch = t.TicketId && t.TicketId.toString().includes(q);
      if (!titleMatch && !descMatch && !idMatch) return false;
    }
    return true;
  });

  const handleClearFilters = () => {
    setSearch('');
    setCategoryFilter('');
    setPriorityFilter('');
    setStatusFilter('');
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              Support Tickets
              <span className="text-xs bg-slate-100 text-slate-700 font-semibold px-2.5 py-0.5 rounded-full border border-slate-200">
                {filteredTickets.length} {filteredTickets.length === 1 ? 'ticket' : 'tickets'}
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Filter, search, and manage support requests</p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onRefresh}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-all"
              title="Refresh Tickets"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>

            <button
              onClick={onCreateTicketClick}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>New Ticket</span>
            </button>
          </div>
        </div>

        {/* Search & Select Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search tickets by ID or title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.CategoryId || c.Name} value={c.Name}>
                  {c.Name}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Priorities</option>
              <option value="High">High Priority (Red)</option>
              <option value="Medium">Medium Priority (Yellow)</option>
              <option value="Low">Low Priority (Green)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>

        {/* Clear Filters Indicator */}
        {(search || categoryFilter || priorityFilter || statusFilter) && (
          <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
            <span className="text-slate-500">Active filters applied</span>
            <button
              onClick={handleClearFilters}
              className="text-indigo-600 hover:text-indigo-800 font-semibold underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Main Content Body */}
      {loading ? (
        <LoadingState message="Fetching support tickets from server..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={onRefresh} />
      ) : filteredTickets.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center my-6">
          <TicketX className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800 mb-1">No Tickets Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            {search || categoryFilter || priorityFilter || statusFilter
              ? 'No tickets match your selected filters. Try resetting the filter controls.'
              : 'There are no support tickets in the database yet.'}
          </p>
          {(search || categoryFilter || priorityFilter || statusFilter) && (
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-xs font-semibold rounded-lg transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTickets.map((t) => (
            <TicketCard key={t.TicketId} ticket={t} onSelectTicket={onSelectTicket} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TicketResults;
