'use client';

import { useState, useEffect } from 'react';
import { getFeedback } from '@/lib/supabase';
import type { Database } from '../lib/database.types';

type FeedbackRow = Database['public']['Tables']['feedback']['Row'];

export default function FeedbackPanel() {
  const [feedback, setFeedback] = useState<FeedbackRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          <p className="text-red-600">Error loading feedback: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-[#286B88] mb-4">
        User Feedback ({feedback.length})
      </h2>
      
      {feedback.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No feedback submissions yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {feedback.map((item) => (
            <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
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
              </div>
              <div className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
                {item.feedback}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 