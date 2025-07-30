import React, { useState } from 'react';
import { updateMonastery } from '../lib/supabase';
import { Database } from '../lib/database.types';
import MonasteryFormFields, { FormData } from './MonasteryFormFields';

type Monastery = Database['public']['Tables']['monasteries']['Row'];

interface EditCenterFormProps {
  monastery: Monastery;
  onClose: () => void;
  onSave: (updatedMonastery: Monastery) => void;
  availableVehicles: string[];
  availableTypes: string[];
  availableSettings: string[];
  availablePriceModels: string[];
  availableGenderPolicies: string[];
  availableTraditions: string[];
  availableDiets: string[];
}

export default function EditCenterForm({ 
  monastery,
  onClose,
  onSave,
  availableVehicles, 
  availableTypes, 
  availableSettings, 
  availablePriceModels, 
  availableGenderPolicies,
  availableTraditions,
  availableDiets 
}: EditCenterFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: monastery.name || '',
    center_type: monastery.center_type || '',
    vehicle: monastery.vehicle || '',
    description: monastery.description,
    website: monastery.website,
    address: monastery.address,
    email: monastery.email,
    phone: monastery.phone,
    beginner_friendly: monastery.beginner_friendly,
    community_size: monastery.community_size,
    dietary_info: monastery.dietary_info,
    gender_policy: monastery.gender_policy,
    involvement_method: monastery.involvement_method,
    languages_spoken: monastery.languages_spoken,
    length_of_stay: monastery.length_of_stay,
    practices: monastery.practices,
    price_details: monastery.price_details,
    price_model: monastery.price_model,
    setting: monastery.setting,
    teachers: monastery.teachers,
    traditions: monastery.traditions,
    ordination_possible: monastery.ordination_possible,
    latitude: monastery.latitude,
    longitude: monastery.longitude,
    photos: monastery.photos,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [originalPhotos] = useState<string[]>(monastery.photos || []);

  const validateForm = () => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.center_type) {
      newErrors.center_type = 'Center type is required';
    }
    if (!formData.vehicle) {
      newErrors.vehicle = 'Vehicle is required';
    }
    if (!formData.description?.trim()) {
      newErrors.description = 'Description is required';
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
      // First, clean up deleted photos from storage
      const currentPhotos = formData.photos || [];
      const deletedPhotos = originalPhotos.filter(photo => !currentPhotos.includes(photo));
      
      // Delete removed photos from storage
      for (const photoUrl of deletedPhotos) {
        try {
          // Extract path from URL for deletion
          const urlParts = photoUrl.split('/');
          const path = urlParts.slice(-2).join('/'); // Get 'monastery-photos/filename.ext'
          
          await fetch(`/api/upload-photo?path=${encodeURIComponent(path)}`, {
            method: 'DELETE',
          });
          console.log('Deleted photo from storage:', path);
        } catch (error) {
          console.error('Error deleting photo from storage:', error);
          // Continue even if deletion fails
        }
      }

      // Then update the monastery record
      const updatedMonastery = await updateMonastery(monastery.id, formData);
      
      onSave(updatedMonastery);
      onClose();
    } catch (error) {
      console.error('Error updating center:', error);
      setSubmitError('Failed to update center. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-[#286B88]">Edit Center</h2>
            <button
              onClick={onClose}
              className="px-6 py-3 text-base bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>

          {submitError && (
            <div className="mb-6 p-4 bg-rose-50 text-rose-700 rounded-lg">
              {submitError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-10">
            <MonasteryFormFields
              formData={formData}
              onFormDataChange={setFormData}
              errors={errors}
              onErrorsChange={setErrors}
              availableVehicles={availableVehicles}
              availableTypes={availableTypes}
              availableSettings={availableSettings}
              availablePriceModels={availablePriceModels}
              availableGenderPolicies={availableGenderPolicies}
              availableTraditions={availableTraditions}
              availableDiets={availableDiets}
              showLocationInput={false}
              isSubmitting={isSubmitting}
              showAdvancedFields={true}
            />

            {/* Submit Button */}
            <div className="flex justify-end gap-4 pt-8 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-8 py-4 text-base bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-4 text-base bg-[#286B88] text-white rounded-lg hover:bg-[#286B88]/90 focus:outline-none focus:ring-2 focus:ring-[#286B88] focus:ring-offset-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 