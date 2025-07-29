'use client';

import React, { useState } from 'react';
import { submitMonasteryFeedback } from '@/lib/supabase';
import type { Database } from '../lib/database.types';

type Monastery = Database['public']['Tables']['monasteries']['Row'];

interface MonasteryFeedbackFormProps {
  monastery: Monastery;
  showForm: boolean;
  setShowForm: (show: boolean) => void;
}

interface FeedbackFormData {
  user_name: string;
  user_email: string;
  feedback_type: string;
  subject: string;
  feedback_content: string;
}

export default function MonasteryFeedbackForm({ monastery, showForm, setShowForm }: MonasteryFeedbackFormProps) {
  const [formData, setFormData] = useState<FeedbackFormData>({
    user_name: '',
    user_email: '',
    feedback_type: 'general',
    subject: '',
    feedback_content: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    if (!formData.feedback_content.trim()) {
      newErrors.feedback_content = 'Feedback content is required';
    }

    // Basic email validation if provided
    if (formData.user_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.user_email)) {
      newErrors.user_email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await submitMonasteryFeedback({
        monastery_id: monastery.id,
        user_name: formData.user_name.trim() || null,
        user_email: formData.user_email.trim() || null,
        feedback_type: formData.feedback_type,
        subject: formData.subject.trim(),
        feedback_content: formData.feedback_content.trim()
      });
      
      setIsSuccess(true);
      // Reset form after a delay
      setTimeout(() => {
        setFormData({
          user_name: '',
          user_email: '',
          feedback_type: 'general',
          subject: '',
          feedback_content: ''
        });
        setIsSuccess(false);
        setShowForm(false);
      }, 3000);
    } catch (error) {
      console.error('Error submitting monastery feedback:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setSubmitError(`Failed to submit feedback: ${errorMessage}. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (!showForm) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-[#286B88] mb-2">Give Feedback on This Center</h2>
              <p className="text-gray-600">{monastery.name}</p>
              {monastery.address && <p className="text-sm text-gray-500">{monastery.address}</p>}
            </div>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-400 hover:text-gray-600 text-xl font-bold"
            >
              ×
            </button>
          </div>

          {submitError && (
            <div className="mb-4 p-4 bg-rose-50 text-rose-700 rounded-lg">
              {submitError}
            </div>
          )}

          {isSuccess && (
            <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-lg">
              Thank you for your feedback! It has been submitted for review.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="user_name" className="block text-sm font-medium text-[#286B88]/80 mb-1">
                  Name (optional)
                </label>
                <input
                  type="text"
                  id="user_name"
                  name="user_name"
                  value={formData.user_name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 text-sm border ${errors.user_name ? 'border-rose-500' : 'border-[#286B88]/20'} rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]`}
                  placeholder="Your name"
                />
                {errors.user_name && <p className="mt-1 text-sm text-rose-600">{errors.user_name}</p>}
              </div>

              <div>
                <label htmlFor="user_email" className="block text-sm font-medium text-[#286B88]/80 mb-1">
                  Email (optional)
                </label>
                <input
                  type="email"
                  id="user_email"
                  name="user_email"
                  value={formData.user_email}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 text-sm border ${errors.user_email ? 'border-rose-500' : 'border-[#286B88]/20'} rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]`}
                  placeholder="your.email@example.com"
                />
                {errors.user_email && <p className="mt-1 text-sm text-rose-600">{errors.user_email}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="feedback_type" className="block text-sm font-medium text-[#286B88]/80 mb-1">
                Feedback Type *
              </label>
              <select
                id="feedback_type"
                name="feedback_type"
                value={formData.feedback_type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm border border-[#286B88]/20 rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]"
              >
                <option value="general">General Feedback</option>
                <option value="correction">Correction/Update</option>
                <option value="addition">Additional Information</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Choose the type that best describes your feedback
              </p>
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-[#286B88]/80 mb-1">
                Subject *
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 text-sm border ${errors.subject ? 'border-rose-500' : 'border-[#286B88]/20'} rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]`}
                placeholder="Brief description of your feedback"
              />
              {errors.subject && <p className="mt-1 text-sm text-rose-600">{errors.subject}</p>}
            </div>

            <div>
              <label htmlFor="feedback_content" className="block text-sm font-medium text-[#286B88]/80 mb-1">
                Feedback Details *
              </label>
              <textarea
                id="feedback_content"
                name="feedback_content"
                value={formData.feedback_content}
                onChange={handleInputChange}
                rows={5}
                className={`w-full px-3 py-2 text-sm border ${errors.feedback_content ? 'border-rose-500' : 'border-[#286B88]/20'} rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]`}
                placeholder="Please provide detailed feedback, corrections, or additional information about this center..."
              />
              {errors.feedback_content && <p className="mt-1 text-sm text-rose-600">{errors.feedback_content}</p>}
              <p className="mt-1 text-xs text-gray-500">
                Be specific about what you'd like to correct, add, or share about this center
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-[#286B88] text-white rounded-lg hover:bg-[#286B88]/90 focus:outline-none focus:ring-2 focus:ring-[#286B88] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 