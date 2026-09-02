import React from 'react';

/**
 * PriorityBadge Component
 * Priority Colors per Assignment Spec:
 * - High = Red
 * - Medium = Yellow / Amber
 * - Low = Green
 */
export const PriorityBadge = ({ priority }) => {
  const normalized = (priority || 'Low').toLowerCase();

  let badgeStyle = 'bg-emerald-100 text-emerald-800 border-emerald-300';
  let dotStyle = 'bg-emerald-500';

  if (normalized === 'high') {
    badgeStyle = 'bg-rose-100 text-rose-800 border-rose-300';
    dotStyle = 'bg-rose-600';
  } else if (normalized === 'medium') {
    badgeStyle = 'bg-amber-100 text-amber-800 border-amber-300';
    dotStyle = 'bg-amber-500';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeStyle}`}>
      <span className={`w-2 h-2 rounded-full ${dotStyle}`}></span>
      {priority} Priority
    </span>
  );
};

export default PriorityBadge;
