import React from 'react';
import PriorityBadge from './PriorityBadge';
import StatusBadge from './StatusBadge';
import { Calendar, User, ChevronRight } from 'lucide-react';

export const TicketCard = ({ ticket, onSelectTicket }) => {
  const formattedDate = ticket.CreatedDate
    ? new Date(ticket.CreatedDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'N/A';

  return (
    <div
      onClick={() => onSelectTicket(ticket.TicketId)}
      className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group flex flex-col justify-between"
    >
      <div>
        {/* Top Header: ID + Priority & Status Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
            #{ticket.TicketId}
          </span>
          <div className="flex items-center gap-2">
            <PriorityBadge priority={ticket.Priority} />
            <StatusBadge status={ticket.Status} />
          </div>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-slate-900 text-base mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
          {ticket.Title}
        </h3>

        {/* Description Snippet */}
        <p className="text-slate-600 text-xs line-clamp-2 mb-4 leading-relaxed">
          {ticket.Description}
        </p>
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1 text-slate-600 font-medium bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
            {ticket.Category}
          </span>
          {ticket.CreatedByName && (
            <span className="flex items-center gap-1 text-slate-500">
              <User className="w-3.5 h-3.5 text-slate-400" />
              {ticket.CreatedByName}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-indigo-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
          <span>Details</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};

export default TicketCard;
