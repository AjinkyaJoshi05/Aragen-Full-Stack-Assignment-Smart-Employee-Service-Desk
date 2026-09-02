import React from 'react';

/**
 * StatusBadge Component
 * Status Styles:
 * - Open = Blue
 * - In Progress = Purple
 * - Resolved = Teal/Emerald
 * - Closed = Slate Gray
 */
export const StatusBadge = ({ status }) => {
  const norm = (status || 'Open').toLowerCase();

  let badgeStyle = 'bg-blue-100 text-blue-800 border-blue-300';

  if (norm === 'in progress') {
    badgeStyle = 'bg-purple-100 text-purple-800 border-purple-300';
  } else if (norm === 'resolved') {
    badgeStyle = 'bg-teal-100 text-teal-800 border-teal-300';
  } else if (norm === 'closed') {
    badgeStyle = 'bg-slate-200 text-slate-700 border-slate-300';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${badgeStyle}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
