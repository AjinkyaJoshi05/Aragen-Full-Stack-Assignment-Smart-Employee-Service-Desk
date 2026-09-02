import React from 'react';
import { LayoutDashboard, Ticket, PlusCircle, ShieldCheck } from 'lucide-react';

export const Navbar = ({
  activeTab,
  setActiveTab,
  users,
  currentUser,
  onUserChange,
  canAccessDashboard,
  canCreateTickets
}) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Portal Branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-white block leading-tight">
                Smart Employee Service Desk
              </span>
              <span className="text-xs text-indigo-400 font-medium tracking-wide">
                SQL Server Powered Ticket Portal
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex items-center gap-2">
            {canAccessDashboard && <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>}

            <button
              onClick={() => setActiveTab('tickets')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'tickets'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Ticket className="w-4 h-4" />
              <span>All Tickets</span>
            </button>

            {canCreateTickets && <button
              onClick={() => setActiveTab('create')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'create'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-emerald-600/90 text-white hover:bg-emerald-600 shadow-sm'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Ticket</span>
            </button>}

            <label className="sr-only" htmlFor="demo-user-selector">Current demo user</label>
            <select
              id="demo-user-selector"
              value={currentUser?.UserId || ''}
              onChange={(event) => onUserChange(event.target.value)}
              className="max-w-44 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Current demo user"
            >
              {users.length === 0 ? (
                <option value="">Loading users...</option>
              ) : (
                users.map((user) => (
                  <option key={user.UserId} value={user.UserId}>
                    {user.Name} ({user.Role})
                  </option>
                ))
              )}
            </select>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
