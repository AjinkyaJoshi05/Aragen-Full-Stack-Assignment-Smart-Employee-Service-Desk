import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Send, CheckCircle2, AlertCircle, Loader2, ListFilter, Sparkles } from 'lucide-react';

export const TicketForm = ({ onTicketCreated, currentUser }) => {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'Medium'
  });

  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Load categories from API on mount
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await api.getCategories();
        if (res.success && Array.isArray(res.data)) {
          setCategories(res.data);
          if (res.data.length > 0) {
            setFormData(prev => ({ ...prev, category: res.data[0].Name }));
          }
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
        // Fallback categories if API temporarily fails
        const fallback = ['IT', 'HR', 'Facilities', 'Finance', 'Access Management'];
        setCategories(fallback.map((name, id) => ({ CategoryId: id, Name: name })));
        setFormData(prev => ({ ...prev, category: fallback[0] }));
      } finally {
        setCategoriesLoading(false);
      }
    }
    loadCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Form Input Validation
    if (!formData.title.trim()) {
      setError('Please enter a ticket title.');
      return;
    }
    if (!formData.description.trim()) {
      setError('Please provide a detailed description of your issue.');
      return;
    }
    if (!formData.category) {
      setError('Please select a category.');
      return;
    }

    setLoading(true);

    try {
      const response = await api.createTicket({
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        priority: formData.priority,
        createdByUserId: currentUser?.UserId
      });

      if (response.success) {
        setSuccess(true);
        setFormData({
          title: '',
          description: '',
          category: categories.length > 0 ? categories[0].Name : 'IT',
          priority: 'Medium'
        });

        if (onTicketCreated) {
          onTicketCreated(response.data);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to submit support ticket.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Create Support Ticket</h2>
          <p className="text-xs text-slate-500">Submit an issue or service request to the service desk</p>
        </div>
      </div>

      {/* Success Feedback Alert */}
      {success && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <h4 className="font-semibold text-sm">Ticket Created Successfully!</h4>
            <p className="text-xs text-emerald-700">Your ticket has been logged and routed to the support team.</p>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <p className="text-xs font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Ticket Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Ticket Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Unable to access VPN while working remotely"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            disabled={loading}
          />
        </div>

        {/* Category & Priority Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Category Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Category / Department <span className="text-rose-500">*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              disabled={loading || categoriesLoading}
            >
              {categories.map((cat) => (
                <option key={cat.CategoryId || cat.Name} value={cat.Name}>
                  {cat.Name}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Options */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Priority Level <span className="text-rose-500">*</span>
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              disabled={loading}
            >
              <option value="Low">Low Priority (Green)</option>
              <option value="Medium">Medium Priority (Yellow)</option>
              <option value="High">High Priority (Red)</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Detailed Description <span className="text-rose-500">*</span>
          </label>
          <textarea
            name="description"
            rows="5"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the issue, step-by-step impact, error codes, or application details..."
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            disabled={loading}
          ></textarea>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Submitting Ticket...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Submit Support Request
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default TicketForm;
