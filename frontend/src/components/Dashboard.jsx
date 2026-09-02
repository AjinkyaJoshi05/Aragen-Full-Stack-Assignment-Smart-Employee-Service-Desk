import React, { useState, useEffect } from 'react';
import api from '../services/api';
import LoadingState from './LoadingState';
import ErrorMessage from './ErrorMessage';
import { Ticket, Clock, CheckCircle2, AlertTriangle, Layers, BarChart3, ArrowUpRight } from 'lucide-react';

export const Dashboard = ({ onNavigateToTickets, onSelectCategory }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.getDashboardSummary();
        if (res.success && res.data) {
          setSummary(res.data);
        }
      } catch (err) {
        setError(err.message || 'Failed to load reporting dashboard statistics.');
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) return <LoadingState message="Calculating Service Desk statistics..." />;
  if (error) return <ErrorMessage message={error} onRetry={() => window.location.reload()} />;
  if (!summary) return null;

  // Extract metric counts
  const totalTickets = summary.total || 0;

  const getStatusCount = (statusName) => {
    const item = (summary.byStatus || []).find((s) => s.Status.toLowerCase() === statusName.toLowerCase());
    return item ? item.count : 0;
  };

  const getPriorityCount = (priorityName) => {
    const item = (summary.byPriority || []).find((p) => p.Priority.toLowerCase() === priorityName.toLowerCase());
    return item ? item.count : 0;
  };

  const openCount = getStatusCount('Open');
  const inProgressCount = getStatusCount('In Progress');
  const resolvedCount = getStatusCount('Resolved');
  const closedCount = getStatusCount('Closed');

  const highPriority = getPriorityCount('High');
  const mediumPriority = getPriorityCount('Medium');
  const lowPriority = getPriorityCount('Low');

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-lg border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-900/50 px-3 py-1 rounded-full border border-indigo-700/50 mb-3 inline-block">
            Reporting Analytics
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Service Desk Executive Overview</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Real-time ticket volume, response metrics, category distribution, and priority metrics powered by SQL Server.
          </p>
        </div>

        <button
          onClick={onNavigateToTickets}
          className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all shrink-0"
        >
          <span>View All Tickets</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* Top 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Tickets */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Tickets</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Ticket className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mb-1">{totalTickets}</div>
          <p className="text-xs text-slate-500">Logged support requests</p>
        </div>

        {/* Open Tickets */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Open Tickets</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mb-1">{openCount}</div>
          <p className="text-xs text-blue-600 font-medium">Awaiting response</p>
        </div>

        {/* In Progress */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider">In Progress</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mb-1">{inProgressCount}</div>
          <p className="text-xs text-purple-600 font-medium">Active support investigation</p>
        </div>

        {/* Closed & Resolved */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Resolved / Closed</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mb-1">{resolvedCount + closedCount}</div>
          <p className="text-xs text-emerald-600 font-medium">Successfully completed</p>
        </div>
      </div>

      {/* Grid: Tickets by Priority & Tickets by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Tickets by Priority Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Tickets by Priority
            </h3>
            <span className="text-xs text-slate-400">Spec Color Indicators</span>
          </div>

          <div className="space-y-4">
            {/* High Priority (Red) */}
            <div className="bg-rose-50/60 border border-rose-200 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-3.5 h-3.5 rounded-full bg-rose-600 shadow-sm"></span>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">High Priority</h4>
                  <span className="text-xs text-rose-700 font-medium">Urgent resolution required</span>
                </div>
              </div>
              <span className="text-xl font-extrabold text-rose-900 bg-rose-100 px-3 py-1 rounded-lg border border-rose-200">
                {highPriority}
              </span>
            </div>

            {/* Medium Priority (Yellow/Amber) */}
            <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-3.5 h-3.5 rounded-full bg-amber-500 shadow-sm"></span>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Medium Priority</h4>
                  <span className="text-xs text-amber-700 font-medium">Standard support request</span>
                </div>
              </div>
              <span className="text-xl font-extrabold text-amber-900 bg-amber-100 px-3 py-1 rounded-lg border border-amber-200">
                {mediumPriority}
              </span>
            </div>

            {/* Low Priority (Green) */}
            <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-sm"></span>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Low Priority</h4>
                  <span className="text-xs text-emerald-700 font-medium">General inquiry / low impact</span>
                </div>
              </div>
              <span className="text-xl font-extrabold text-emerald-900 bg-emerald-100 px-3 py-1 rounded-lg border border-emerald-200">
                {lowPriority}
              </span>
            </div>
          </div>
        </div>

        {/* Tickets by Category / Department */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              Tickets by Department / Category
            </h3>
            <span className="text-xs text-slate-400">Department Routing</span>
          </div>

          <div className="space-y-3.5">
            {(summary.byCategory || []).map((cat) => {
              const percentage = totalTickets > 0 ? Math.round((cat.count / totalTickets) * 100) : 0;
              return (
                <div
                  key={cat.Category}
                  onClick={() => onSelectCategory && onSelectCategory(cat.Category)}
                  className="p-3 bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-200 rounded-xl transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                      {cat.Category}
                    </span>
                    <span className="font-semibold text-slate-600">
                      {cat.count} {cat.count === 1 ? 'ticket' : 'tickets'} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
