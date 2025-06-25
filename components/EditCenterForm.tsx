import React, { useState } from 'react';
import { updateMonastery } from '../lib/supabase';
import type { Database } from '../lib/database.types';

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
}

interface FormData {
  name: string;
  center_type: string;
  vehicle: string;
  description: string | null;
  website: string | null;
  address: string | null;
  email: string | null;
  phone: string | null;
  beginner_friendly: boolean | null;
  community_size: string | null;
  dietary_info: string | null;
  gender_policy: string | null;
  involvement_method: string | null;
  languages_spoken: string[] | null;
  length_of_stay: string | null;
  lineages: string[] | null;
  practices: string[] | null;
  price_details: string | null;
  price_model: string | null;
  setting: string | null;
  teachers: string[] | null;
  traditions: string[] | null;
  ordination_possible: boolean | null;
  latitude: number | null;
  longitude: number | null;
}

export default function EditCenterForm({ 
  monastery,
  onClose,
  onSave,
  availableVehicles, 
  availableTypes, 
  availableSettings, 
  availablePriceModels, 
  availableGenderPolicies 
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
    lineages: monastery.lineages,
    practices: monastery.practices,
    price_details: monastery.price_details,
    price_model: monastery.price_model,
    setting: monastery.setting,
    teachers: monastery.teachers,
    traditions: monastery.traditions,
    ordination_possible: monastery.ordination_possible,
    latitude: monastery.latitude,
    longitude: monastery.longitude,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else if (name === 'languages_spoken' || name === 'lineages' || name === 'practices' || name === 'teachers' || name === 'traditions') {
      setFormData(prev => ({ ...prev, [name]: value ? value.split(',').map(item => item.trim()) : null }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value || null }));
    }
    
    // Clear error when field is modified
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

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
            {/* Essential Information */}
            <div className="space-y-8">
              <h3 className="text-xl font-semibold text-[#286B88]">Essential Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-base font-medium text-[#286B88]/80 mb-2">Center Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 text-base border ${errors.name ? 'border-rose-500' : 'border-[#286B88]/20'} rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]`}
                    placeholder="Enter center name"
                  />
                  {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-base font-medium text-[#286B88]/80 mb-2">Center Type *</label>
                  <select
                    name="center_type"
                    value={formData.center_type}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 text-base border ${errors.center_type ? 'border-rose-500' : 'border-[#286B88]/20'} rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]`}
                  >
                    <option value="">Select a type</option>
                    {availableTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {errors.center_type && <p className="mt-1 text-xs text-rose-600">{errors.center_type}</p>}
                </div>
                <div>
                  <label className="block text-base font-medium text-[#286B88]/80 mb-2">Vehicle *</label>
                  <select
                    name="vehicle"
                    value={formData.vehicle}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 text-base border ${errors.vehicle ? 'border-rose-500' : 'border-[#286B88]/20'} rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]`}
                  >
                    <option value="">Select a vehicle</option>
                    {availableVehicles.map(vehicle => (
                      <option key={vehicle} value={vehicle}>{vehicle}</option>
                    ))}
                  </select>
                  {errors.vehicle && <p className="mt-1 text-xs text-rose-600">{errors.vehicle}</p>}
                </div>
                <div>
                  <label className="block text-base font-medium text-[#286B88]/80 mb-2">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-base border border-[#286B88]/20 rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]"
                    placeholder="Enter address"
                  />
                </div>
              </div>

              <div>
                <label className="block text-base font-medium text-[#286B88]/80 mb-2">Description *</label>
                <textarea
                  name="description"
                  value={formData.description || ''}
                  onChange={handleChange}
                  rows={4}
                  className={`w-full px-4 py-3 text-base border ${errors.description ? 'border-rose-500' : 'border-[#286B88]/20'} rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]`}
                  placeholder="Tell everyone about the Dharma Center"
                />
                {errors.description && <p className="mt-1 text-xs text-rose-600">{errors.description}</p>}
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <h3 className="text-xl font-semibold text-[#286B88]">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-base font-medium text-[#286B88]/80 mb-2">Website</label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-base border border-[#286B88]/20 rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]"
                    placeholder="https://example.com"
                  />
                </div>
                <div>
                  <label className="block text-base font-medium text-[#286B88]/80 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-base border border-[#286B88]/20 rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]"
                    placeholder="contact@example.com"
                  />
                </div>
                <div>
                  <label className="block text-base font-medium text-[#286B88]/80 mb-2">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-base border border-[#286B88]/20 rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-8">
              <h3 className="text-xl font-semibold text-[#286B88]">Additional Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-base font-medium text-[#286B88]/80 mb-2">Community Size</label>
                  <input
                    type="text"
                    name="community_size"
                    value={formData.community_size || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-base border border-[#286B88]/20 rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]"
                    placeholder="e.g., 10-20 residents"
                  />
                </div>
                <div>
                  <label className="block text-base font-medium text-[#286B88]/80 mb-2">Length of Stay</label>
                  <input
                    type="text"
                    name="length_of_stay"
                    value={formData.length_of_stay || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-base border border-[#286B88]/20 rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]"
                    placeholder="e.g., 1 week minimum"
                  />
                </div>
                <div>
                  <label className="block text-base font-medium text-[#286B88]/80 mb-2">Setting</label>
                  <select
                    name="setting"
                    value={formData.setting || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-base border border-[#286B88]/20 rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]"
                  >
                    <option value="">Select a setting</option>
                    {availableSettings.map(setting => (
                      <option key={setting} value={setting}>{setting}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-base font-medium text-[#286B88]/80 mb-2">Price Model</label>
                  <select
                    name="price_model"
                    value={formData.price_model || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-base border border-[#286B88]/20 rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]"
                  >
                    <option value="">Select a price model</option>
                    {availablePriceModels.map(model => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-base font-medium text-[#286B88]/80 mb-2">Languages Spoken</label>
                  <input
                    type="text"
                    name="languages_spoken"
                    value={formData.languages_spoken?.join(', ') || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-base border border-[#286B88]/20 rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]"
                    placeholder="English, Spanish, French"
                  />
                </div>
                <div>
                  <label className="block text-base font-medium text-[#286B88]/80 mb-2">Lineages</label>
                  <input
                    type="text"
                    name="lineages"
                    value={formData.lineages?.join(', ') || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-base border border-[#286B88]/20 rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]"
                    placeholder="Zen, Theravada, Tibetan"
                  />
                </div>
                <div>
                  <label className="block text-base font-medium text-[#286B88]/80 mb-2">Practices</label>
                  <input
                    type="text"
                    name="practices"
                    value={formData.practices?.join(', ') || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-base border border-[#286B88]/20 rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]"
                    placeholder="Meditation, Yoga, Dharma talks"
                  />
                </div>
                <div>
                  <label className="block text-base font-medium text-[#286B88]/80 mb-2">Teachers</label>
                  <input
                    type="text"
                    name="teachers"
                    value={formData.teachers?.join(', ') || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-base border border-[#286B88]/20 rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]"
                    placeholder="Teacher names"
                  />
                </div>
                <div>
                  <label className="block text-base font-medium text-[#286B88]/80 mb-2">Traditions</label>
                  <input
                    type="text"
                    name="traditions"
                    value={formData.traditions?.join(', ') || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-base border border-[#286B88]/20 rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]"
                    placeholder="Buddhist traditions"
                  />
                </div>
                <div>
                  <label className="block text-base font-medium text-[#286B88]/80 mb-2">Price Details</label>
                  <input
                    type="text"
                    name="price_details"
                    value={formData.price_details || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-base border border-[#286B88]/20 rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]"
                    placeholder="e.g., $100 per week, donations accepted"
                  />
                </div>
                <div>
                  <label className="block text-base font-medium text-[#286B88]/80 mb-2">Dietary Information</label>
                  <input
                    type="text"
                    name="dietary_info"
                    value={formData.dietary_info || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-base border border-[#286B88]/20 rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]"
                    placeholder="e.g., Vegetarian meals provided"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-base font-medium text-[#286B88]/80 mb-2">Gender Distribution</label>
                  <select
                    name="gender_policy"
                    value={formData.gender_policy || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-base border border-[#286B88]/20 rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]"
                  >
                    <option value="">Select a gender policy</option>
                    {availableGenderPolicies.map(policy => (
                      <option key={policy} value={policy}>{policy}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-base font-medium text-[#286B88]/80 mb-2">How to get involved</label>
                  <input
                    type="text"
                    name="involvement_method"
                    value={formData.involvement_method || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-base border border-[#286B88]/20 rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]"
                    placeholder="e.g., Application required"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="beginner_friendly"
                    checked={formData.beginner_friendly || false}
                    onChange={handleChange}
                    className="h-4 w-4 text-[#286B88] focus:ring-[#286B88] border-[#286B88]/20 rounded"
                  />
                  <label className="ml-2 block text-base text-[#286B88]/80">Beginner Friendly</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="ordination_possible"
                    checked={formData.ordination_possible || false}
                    onChange={handleChange}
                    className="h-4 w-4 text-[#286B88] focus:ring-[#286B88] border-[#286B88]/20 rounded"
                  />
                  <label className="ml-2 block text-base text-[#286B88]/80">Ordination Possible</label>
                </div>
              </div>
            </div>

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