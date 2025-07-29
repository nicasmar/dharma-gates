'use client';

import { useState } from 'react';
import { updateMonasteryFeedbackNotes, clearMonasteryFeedback } from '@/lib/supabase';
import type { Database } from '../lib/database.types';

type MonasteryFeedbackRow = Database['public']['Tables']['monastery_feedback']['Row'] & {
  monasteries?: {
    name: string;
    address: string | null;
  };
};

interface MonasteryFeedbackCardProps {
  feedback: MonasteryFeedbackRow;
  onStatusUpdate: () => void;
}

export default function MonasteryFeedbackCard({ feedback, onStatusUpdate }: MonasteryFeedbackCardProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAdminNotes, setShowAdminNotes] = useState(false);
  const [adminNotes, setAdminNotes] = useState(feedback.admin_notes || '');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFeedbackTypeColor = (type: string) => {
    switch (type) {
      case 'correction':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'addition':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'general':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getFeedbackTypeLabel = (type: string) => {
    switch (type) {
      case 'correction':
        return 'Correction/Update';
      case 'addition':
        return 'Additional Info';
      case 'general':
        return 'General Feedback';
      default:
        return type;
    }
  };

  const handleSaveNotes = async () => {
    if (!adminNotes.trim()) return;
    
    setIsProcessing(true);
    try {
      await updateMonasteryFeedbackNotes(feedback.id, adminNotes.trim());
      // Update the feedback state to show the saved notes
      feedback.admin_notes = adminNotes.trim();
      setShowAdminNotes(false);
      setAdminNotes('');
    } catch (error) {
      console.error('Error saving notes:', error);
      alert('Failed to save notes. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearFeedback = async () => {
    setIsProcessing(true);
    try {
      await clearMonasteryFeedback(feedback.id);
      onStatusUpdate(); // This will refresh the list and remove cleared feedback
    } catch (error) {
      console.error('Error clearing feedback:', error);
      alert('Failed to clear feedback. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white border-2 border-orange-200 rounded-lg p-4 relative">
      {/* User Suggestion Badge */}
      <div className="absolute -top-2 -right-2">
        <span className="inline-flex items-center px-2 py-1 text-xs font-bold text-orange-800 bg-orange-100 border border-orange-300 rounded-full">
          👤 User Suggestion
        </span>
      </div>

      {/* Header */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-lg font-semibold text-gray-900">{feedback.subject}</h4>
          <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getFeedbackTypeColor(feedback.feedback_type)}`}>
            {getFeedbackTypeLabel(feedback.feedback_type)}
          </span>
        </div>
        
        <div className="text-sm text-gray-600">
          <p className="font-medium">Center: {feedback.monasteries?.name || 'Unknown Center'}</p>
          {feedback.monasteries?.address && (
            <p className="text-gray-500">{feedback.monasteries.address}</p>
          )}
        </div>
      </div>

      {/* User Info */}
      <div className="mb-3 text-sm text-gray-600">
        <div className="flex items-center gap-4">
          {feedback.user_name && (
            <span className="font-medium">👤 {feedback.user_name}</span>
          )}
          {feedback.user_email && (
            <span>📧 {feedback.user_email}</span>
          )}
          {!feedback.user_name && !feedback.user_email && (
            <span className="text-gray-500 italic">Anonymous</span>
          )}
          <span className="text-gray-400">•</span>
          <span>{formatDate(feedback.created_at)}</span>
        </div>
      </div>

      {/* Feedback Content */}
      <div className="mb-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
            {feedback.feedback_content}
          </p>
        </div>
      </div>

      {/* Admin Notes Section */}
      {(feedback.admin_notes || showAdminNotes) && (
        <div className="mb-4">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <h5 className="text-sm font-medium text-blue-900">Admin Notes</h5>
              {!showAdminNotes && (
                <button
                  onClick={() => setShowAdminNotes(true)}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Edit
                </button>
              )}
            </div>
            {showAdminNotes ? (
              <div>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-blue-300 rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]"
                  placeholder="Add any notes about this feedback..."
                />
              </div>
            ) : feedback.admin_notes ? (
              <p className="text-sm text-blue-800 whitespace-pre-wrap">{feedback.admin_notes}</p>
            ) : (
              <p className="text-sm text-blue-600 italic">No notes yet</p>
            )}
          </div>
        </div>
      )}

      {/* Admin Actions */}
      {feedback.admin_status === 'pending' && (
        <div className="flex items-center gap-2">
          {showAdminNotes && (
            <button
              onClick={handleSaveNotes}
              disabled={isProcessing || !adminNotes.trim()}
              className="px-3 py-1.5 text-sm font-medium text-white bg-[#286B88] rounded-lg hover:bg-[#286B88]/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Saving...' : 'Save Notes'}
            </button>
          )}
          {showAdminNotes && (
            <button
              onClick={() => {
                setShowAdminNotes(false);
                setAdminNotes(feedback.admin_notes || '');
              }}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
          )}
          {!showAdminNotes && (
            <button
              onClick={() => setShowAdminNotes(true)}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              {feedback.admin_notes ? 'Edit Notes' : 'Add Notes'}
            </button>
          )}
          <button
            onClick={handleClearFeedback}
            disabled={isProcessing}
            className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Clearing...' : 'Clear Feedback'}
          </button>
        </div>
      )}


    </div>
  );
} 