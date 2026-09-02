import React, { useState, useEffect } from 'react';
import api from '../services/api';
import PriorityBadge from './PriorityBadge';
import StatusBadge from './StatusBadge';
import LoadingState from './LoadingState';
import ErrorMessage from './ErrorMessage';
import { X, CheckCircle, MessageSquare, Clock, User, ShieldAlert, Check, FileText, Send, Lock } from 'lucide-react';

export const TicketDetails = ({ ticketId, onClose, onTicketUpdated }) => {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Update controls state
  const [status, setStatus] = useState('Open');
  const [priority, setPriority] = useState('Medium');
  const [assignedTo, setAssignedTo] = useState(null); // null = Unassigned
  const [users, setUsers] = useState([]);
  const [noteText, setNoteText] = useState('');
  const [updating, setUpdating] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(null);

  // Resolution modal state for Close Ticket
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closeNote, setCloseNote] = useState('');
  const [closing, setClosing] = useState(false);

  // Load ticket details from API
  useEffect(() => {
    if (!ticketId) return;

    async function loadTicket() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.getTicketById(ticketId);
        if (res.success && res.data) {
          setTicket(res.data);
          setStatus(res.data.Status);
          setPriority(res.data.Priority);
          setAssignedTo(res.data.AssignedToUserId ?? null);
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch ticket details');
      } finally {
        setLoading(false);
      }
    }
    loadTicket();
  }, [ticketId]);

  // Load assignable users for dropdown
  useEffect(() => {
    async function loadUsers() {
      try {
        const res = await api.getUsers();
        if (res.success && res.data) {
          setUsers(res.data);
        }
      } catch {
        // Non-critical: dropdown simply stays empty
      }
    }
    loadUsers();
  }, []);

  // Handle status/priority/assignment update
  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setActionSuccess(null);
    setError(null);

    try {
      const res = await api.updateTicket(ticketId, {
        status,
        priority,
        // Send null explicitly to unassign; omit field to keep existing would break null unassign
        assignedToUserId: assignedTo,
        notes: noteText.trim() ? noteText.trim() : undefined
      });

      if (res.success) {
        setTicket(res.data);
        setStatus(res.data.Status);
        setPriority(res.data.Priority);
        setAssignedTo(res.data.AssignedToUserId ?? null);
        setNoteText('');
        setActionSuccess('Ticket updated successfully!');
        if (onTicketUpdated) onTicketUpdated();
      }
    } catch (err) {
      setError(err.message || 'Failed to update ticket.');
    } finally {
      setUpdating(false);
    }
  };

  // Handle direct close with resolution note
  const handleCloseTicket = async (e) => {
    e.preventDefault();
    setClosing(true);
    setError(null);

    try {
      const res = await api.closeTicket(ticketId, closeNote.trim());
      if (res.success) {
        setTicket(res.data);
        setStatus(res.data.Status);
        setShowCloseModal(false);
        setCloseNote('');
        setActionSuccess('Ticket closed with resolution notes!');
        if (onTicketUpdated) onTicketUpdated();
      }
    } catch (err) {
      setError(err.message || 'Failed to close ticket.');
    } finally {
      setClosing(false);
    }
  };

  if (!ticketId) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-fadeIn">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-950/80 px-2.5 py-1 rounded border border-indigo-800">
              #{ticketId}
            </span>
            <h2 className="text-base font-bold text-white truncate max-w-lg">
              {ticket ? ticket.Title : `Ticket Details #${ticketId}`}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {loading ? (
            <LoadingState message="Loading ticket details..." />
          ) : error && !ticket ? (
            <ErrorMessage message={error} onRetry={onClose} />
          ) : ticket ? (
            <>
              {/* Alert Feedback */}
              {actionSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-lg flex items-center gap-2 text-xs font-semibold">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  {actionSuccess}
                </div>
              )}

              {/* Status Header */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <PriorityBadge priority={ticket.Priority} />
                  <StatusBadge status={ticket.Status} />
                  <span className="text-xs font-medium text-slate-500 bg-white px-3 py-1 rounded border border-slate-200">
                    Category: <strong>{ticket.Category}</strong>
                  </span>
                </div>

                {ticket.Status !== 'Closed' && (
                  <button
                    onClick={() => setShowCloseModal(true)}
                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    Close Ticket
                  </button>
                )}
              </div>

              {/* Grid: Description & Metadata */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                      Issue Description
                    </h4>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-800 text-sm leading-relaxed whitespace-pre-line">
                      {ticket.Description}
                    </div>
                  </div>

                  {/* Resolution Notes / Comments History */}
                  <div>
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-indigo-600" />
                      Resolution History & Staff Notes ({ticket.comments?.length || 0})
                    </h4>

                    {ticket.comments && ticket.comments.length > 0 ? (
                      <div className="space-y-3">
                        {ticket.comments.map((comment) => (
                          <div
                            key={comment.CommentId}
                            className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-3.5 text-xs text-slate-800 space-y-1"
                          >
                            <div className="flex items-center justify-between text-slate-500 text-[11px]">
                              <span className="font-semibold text-indigo-900">Support Note</span>
                              <span>
                                {new Date(comment.CreatedDate).toLocaleString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            <p className="text-slate-700 leading-relaxed">{comment.Notes}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-lg border border-slate-200">
                        No resolution notes added yet.
                      </p>
                    )}
                  </div>
                </div>

                {/* Sidebar: Metadata & Support Action Panel */}
                <div className="space-y-5">
                  <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 text-xs">
                    <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-2">Ticket Metadata</h4>
                    
                    <div className="flex justify-between items-center text-slate-600">
                      <span className="text-slate-400">Created Date:</span>
                      <span className="font-medium">
                        {new Date(ticket.CreatedDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-slate-600">
                      <span className="text-slate-400">Submitted By:</span>
                      <span className="font-semibold text-slate-800">{ticket.CreatedByName || 'Employee'}</span>
                    </div>

                    <div className="flex justify-between items-center text-slate-600">
                      <span className="text-slate-400">Assigned To:</span>
                      <span className="font-semibold text-slate-800">{ticket.AssignedToName || 'Unassigned'}</span>
                    </div>
                  </div>

                  {/* Support Controls Form */}
                  {ticket.Status === 'Closed' ? (
                    <div className="bg-slate-100 border border-slate-200 rounded-xl p-5 text-center space-y-2">
                      <div className="flex items-center justify-center gap-2 text-slate-800 font-bold text-xs">
                        <Lock className="w-4 h-4 text-slate-600" />
                        Ticket Closed & Locked
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        This ticket is closed and read-only. No further modifications can be made.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleUpdate} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                      <h4 className="font-bold text-slate-900 text-xs border-b border-slate-200 pb-2">
                        Support Team Actions
                      </h4>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">Status</label>
                        <select
                          value={status}
                          onChange={(e) => setStatus(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-900"
                          disabled={updating}
                        >
                          <option value="Open">Open</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">Priority</label>
                        <select
                          value={priority}
                          onChange={(e) => setPriority(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-900"
                          disabled={updating}
                        >
                          <option value="Low">Low Priority (Green)</option>
                          <option value="Medium">Medium Priority (Yellow)</option>
                          <option value="High">High Priority (Red)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">Assigned To</label>
                        <select
                          value={assignedTo ?? ''}
                          onChange={(e) => setAssignedTo(e.target.value === '' ? null : parseInt(e.target.value, 10))}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-900"
                          disabled={updating}
                        >
                          <option value="">— Unassigned —</option>
                          {users.map((u) => (
                            <option key={u.UserId} value={u.UserId}>{u.Name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">Add Note</label>
                        <textarea
                          rows="2"
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          placeholder="Add resolution details..."
                          className="w-full p-2 bg-white border border-slate-200 rounded text-xs text-slate-900"
                          disabled={updating}
                        ></textarea>
                      </div>

                      <button
                        type="submit"
                        disabled={updating}
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded shadow-sm transition-colors"
                      >
                        {updating ? 'Saving Changes...' : 'Update Ticket'}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>

      {/* Close Ticket Resolution Note Modal */}
      {showCloseModal && (
        <div className="fixed inset-0 z-60 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-fadeIn">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              Close Ticket #{ticketId}
            </h3>
            <p className="text-xs text-slate-600">
              Please enter resolution notes explaining how this issue was resolved before closing.
            </p>

            <form onSubmit={handleCloseTicket} className="space-y-4">
              <textarea
                rows="4"
                required
                value={closeNote}
                onChange={(e) => setCloseNote(e.target.value)}
                placeholder="e.g. Password reset link issued and verified user access successfully."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              ></textarea>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCloseModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={closing}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm"
                >
                  {closing ? 'Closing...' : 'Confirm & Close Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketDetails;
