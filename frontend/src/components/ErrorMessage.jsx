import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const ErrorMessage = ({ message = 'Unable to load data. Please try again.', onRetry }) => {
  return (
    <div className="bg-rose-50 border border-rose-200 text-rose-800 p-6 rounded-xl flex flex-col items-center justify-center text-center my-6">
      <AlertCircle className="w-10 h-10 text-rose-500 mb-2" />
      <h4 className="font-semibold text-base mb-1">Service Desk Alert</h4>
      <p className="text-sm text-rose-700 mb-4 max-w-md">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Retry Request
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
