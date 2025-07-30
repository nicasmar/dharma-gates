'use client';

import React, { useState } from 'react';
import { submitFeedback } from '@/lib/supabase';

interface FeedbackFormProps {
  showFeedbackForm: boolean;
  setShowFeedbackForm: (show: boolean) => void;
}

interface FeedbackData {
  name: string;
  email: string;
  feedback: string;
}

export default function FeedbackForm({ showFeedbackForm, setShowFeedbackForm }: FeedbackFormProps) {
  const [formData, setFormData] = useState<FeedbackData>({
    name: '',
    email: '',
    feedback: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.feedback.trim()) {
      newErrors.feedback = 'Feedback is required';
    }

    // Basic email validation if provided
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
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
      await submitFeedback({
        name: formData.name.trim() || null,
        email: formData.email.trim() || null,
        feedback: formData.feedback.trim()
      });
      
      setIsSuccess(true);
      // Reset form after a delay
      setTimeout(() => {
        setFormData({ name: '', email: '', feedback: '' });
        setIsSuccess(false);
        setShowFeedbackForm(false);
      }, 3000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setSubmitError(`Failed to submit feedback: ${errorMessage}. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (!showFeedbackForm) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-[#286B88]">Give Feedback</h2>
          <button
            onClick={() => setShowFeedbackForm(false)}
            className="px-6 py-3 text-base bg-[#286B88] text-white rounded-lg hover:bg-[#286B88]/90"
          >
            Return to Directory
          </button>
        </div>

        {submitError && (
          <div className="mb-4 p-4 bg-rose-50 text-rose-700 rounded-lg">
            {submitError}
          </div>
        )}

        {isSuccess && (
          <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-lg">
            Thank you for your feedback! It has been submitted successfully.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-[#286B88]/80 mb-2">
              Name (optional)
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 text-sm border ${errors.name ? 'border-rose-500' : 'border-[#286B88]/20'} rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]`}
              placeholder="Your name"
            />
            {errors.name && <p className="mt-1 text-sm text-rose-600">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#286B88]/80 mb-2">
              Email (optional)
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 text-sm border ${errors.email ? 'border-rose-500' : 'border-[#286B88]/20'} rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]`}
              placeholder="your.email@example.com"
            />
            {errors.email && <p className="mt-1 text-sm text-rose-600">{errors.email}</p>}
            <p className="mt-1 text-xs text-gray-500">
              Optional - if you&apos;d like us to follow up with you
            </p>
          </div>

          <div>
            <label htmlFor="feedback" className="block text-sm font-medium text-[#286B88]/80 mb-2">
              Feedback *
            </label>
            <textarea
              id="feedback"
              name="feedback"
              value={formData.feedback}
              onChange={handleInputChange}
              rows={6}
              className={`w-full px-3 py-2 text-sm border ${errors.feedback ? 'border-rose-500' : 'border-[#286B88]/20'} rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]`}
              placeholder="Please share your thoughts, suggestions, or report any issues with the monastery directory..."
            />
            {errors.feedback && <p className="mt-1 text-sm text-rose-600">{errors.feedback}</p>}
            <p className="mt-1 text-xs text-gray-500">
              Tell us about your experience with the directory, suggest improvements, or report any issues
            </p>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-[#286B88] text-white rounded-lg hover:bg-[#286B88]/90 focus:outline-none focus:ring-2 focus:ring-[#286B88] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 