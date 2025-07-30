'use client';

import { useState, useEffect } from 'react';
import { getFeedback, starFeedback, deleteFeedback } from '@/lib/supabase';
import type { Database } from '../lib/database.types';

type FeedbackRow = Database['public']['Tables']['feedback']['Row'];

export default function FeedbackPanel() {
  const [feedback, setFeedback] = useState<FeedbackRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name?: string } | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFeedback() {
      try {
        setLoading(true);
        const data = await getFeedback();
        setFeedback(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching feedback');
      } finally {
        setLoading(false);
      }
    }
    fetchFeedback();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleStarToggle = async (id: string, currentStarred: boolean) => {
    try {
      setActionLoading(id);
      await starFeedback(id, !currentStarred);
      
      // Update local state
      setFeedback(prev => prev.map(item => 
        item.id === id ? { ...item, starred: !currentStarred } : item
      ));
    } catch (err) {
      console.error('Error toggling star:', err);
      if (err instanceof Error && err.message.includes('migration')) {
        setError('Star feature is not yet available. Database migration needed.');
      } else {
        setError('Failed to update star status. Please try again.');
      }
      
      // Auto-clear error after 5 seconds
      setTimeout(() => setError(null), 5000);
    } finally {
      setActionLoading(null);
    }
  };

  const handleClearFeedback = async (id: string) => {
    try {
      setActionLoading(id);
      await deleteFeedback(id);
      
      // Update local state
      setFeedback(prev => prev.filter(item => item.id !== id));
      setConfirmDelete(null);
    } catch (err) {
      console.error('Error clearing feedback:', err);
      setError('Failed to clear feedback. Please try again.');
      
      // Auto-clear error after 5 seconds
      setTimeout(() => setError(null), 5000);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-[#286B88] mb-4">User Feedback</h2>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#286B88] mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading feedback...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-[#286B88] mb-4">User Feedback</h2>
        <div className="text-center py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-4 text-red-400 hover:text-red-600"
              title="Dismiss"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-[#286B88] mb-4">
        User Feedback ({feedback.length})
      </h2>
      
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => setError(null)}
            className="ml-4 text-red-400 hover:text-red-600"
            title="Dismiss"
          >
            ✕
          </button>
        </div>
      )}
      
      {feedback.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No feedback submissions yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {feedback.map((item) => {
            const isStarred = item.starred || false;
            return (
              <div key={item.id} className={`border rounded-lg p-4 hover:bg-gray-50 transition-all duration-200 ${isStarred ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200'}`}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      {isStarred && (
                        <span className="inline-block w-4 text-center" style={{ color: '#FFD700' }}>★</span>
                      )}
                      {item.name && (
                        <span className="font-medium text-gray-900">{item.name}</span>
                      )}
                      {item.email && (
                        <span className="text-[#286B88]">{item.email}</span>
                      )}
                      {!item.name && !item.email && (
                        <span className="text-gray-500 italic">Anonymous</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDate(item.created_at)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleStarToggle(item.id, isStarred)}
                      disabled={actionLoading === item.id}
                      className={`p-2 rounded-lg transition-colors hover:bg-gray-100 group w-10 h-10 flex items-center justify-center ${
                        actionLoading === item.id ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      title={isStarred ? 'Remove star' : 'Add star'}
                    >
                      {actionLoading === item.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                      ) : (
                        <span 
                          className="text-lg transition-colors inline-block w-5 text-center"
                          style={{ 
                            color: isStarred ? '#FFD700' : '#9CA3AF'
                          }}
                        >
                          {isStarred ? '★' : '☆'}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => setConfirmDelete({ id: item.id, name: item.name || undefined })}
                      disabled={actionLoading === item.id}
                      className={`px-3 py-1 text-sm font-medium text-white bg-rose-600 rounded-lg hover:bg-rose-700 transition-colors ${
                        actionLoading === item.id ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      title="Clear feedback"
                    >
                      Clear
                    </button>
                  </div>
                </div>
                <div className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
                  {item.feedback}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Clear Feedback</h3>
              <p className="text-gray-600">
                Are you sure you want to clear this feedback
                {confirmDelete.name && (
                  <span> from <strong>{confirmDelete.name}</strong></span>
                )}
                ? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDelete(null)}
                disabled={actionLoading === confirmDelete.id}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleClearFeedback(confirmDelete.id)}
                disabled={actionLoading === confirmDelete.id}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                {actionLoading === confirmDelete.id ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Clearing...
                  </>
                ) : (
                  'Clear Forever'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 