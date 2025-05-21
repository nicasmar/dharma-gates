import React, { useState } from 'react';
import type { Database } from '../lib/database.types';
import { supabase, submitNewCenter } from '../lib/supabase';

type Monastery = Database['public']['Tables']['monasteries']['Row'];

interface SuggestCenterFormProps {
  showSuggestForm: boolean;
  setShowSuggestForm: (show: boolean) => void;
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

export default function SuggestCenterForm({ showSuggestForm, setShowSuggestForm }: SuggestCenterFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    center_type: '',
    vehicle: '',
    description: '',
    website: '',
    address: '',
    email: '',
    phone: '',
    beginner_friendly: false,
    community_size: '',
    dietary_info: '',
    gender_policy: '',
    involvement_method: '',
    languages_spoken: [],
    length_of_stay: '',
    lineages: [],
    practices: [],
    price_details: '',
    price_model: '',
    setting: '',
    teachers: [],
    traditions: [],
    ordination_possible: false,
    latitude: null,
    longitude: null
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showAdvancedFields, setShowAdvancedFields] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodingError, setGeocodingError] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCoordinatesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCoordinates(value);
    
    // Parse coordinates
    const [lat, lon] = value.split(',').map(coord => coord.trim());
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    
    if (!isNaN(latitude) && !isNaN(longitude)) {
      setFormData(prev => ({
        ...prev,
        latitude,
        longitude
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        latitude: null,
        longitude: null
      }));
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
    if (!coordinates.trim()) {
      newErrors.latitude = 'Coordinates are required';
    } else {
      const [lat, lon] = coordinates.split(',').map(coord => coord.trim());
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lon);
      
      if (isNaN(latitude) || isNaN(longitude)) {
        newErrors.latitude = 'Invalid coordinate format';
      } else if (latitude < -90 || latitude > 90) {
        newErrors.latitude = 'Latitude must be between -90 and 90';
      } else if (longitude < -180 || longitude > 180) {
        newErrors.longitude = 'Longitude must be between -180 and 180';
      }
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = 'Invalid website URL';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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

  const reverseGeocode = async (lat: number, lon: number) => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`;
      console.log('Making reverse geocode request to:', url);
      
      const response = await fetch(url, {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'DharmaGates/1.0'
        }
      });
      
      if (!response.ok) {
        throw new Error('Geocoding service unavailable');
      }
      
      const data = await response.json();
      console.log('Reverse geocoding response:', data);
      
      if (data && data.display_name) {
        return data.display_name;
      }
      return null;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setGeocodingError(null);

    try {
      if (formData.latitude === null || formData.longitude === null) {
        setGeocodingError('Please enter valid coordinates');
        return;
      }

      // Get address from coordinates
      const address = await reverseGeocode(formData.latitude, formData.longitude);
      if (!address) {
        setGeocodingError('Could not find address for these coordinates');
        return;
      }

      // Update form data with address
      const updatedFormData = {
        ...formData,
        address
      };

      // Submit the form
      await submitNewCenter(updatedFormData);
      setShowSuggestForm(false);
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitError('Failed to submit form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#286B88]">Suggest a Center</h2>
        <button
          onClick={() => setShowSuggestForm(false)}
          className="px-4 py-2 text-sm bg-[#286B88] text-white rounded-lg hover:bg-[#286B88]/90"
        >
          Return to Directory
        </button>
      </div>

      {submitError && (
        <div className="mb-4 p-4 bg-rose-50 text-rose-700 rounded-lg">
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Essential Information */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-[#286B88]">Essential Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#286B88]/80 mb-1">Center Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 text-sm border ${errors.name ? 'border-rose-500' : 'border-[#286B88]/20'} rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]`}
                placeholder="Enter center name"
              />
              {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-[#286B88]/80 mb-1">Center Type *</label>
              <select
                name="center_type"
                value={formData.center_type}
                onChange={handleChange}
                className={`w-full px-3 py-2 text-sm border ${errors.center_type ? 'border-rose-500' : 'border-[#286B88]/20'} rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]`}
              >
                <option value="">Select a type</option>
                <option value="Monastery">Monastery</option>
                <option value="Retreat Center">Retreat Center</option>
                <option value="Temple">Temple</option>
                <option value="Meditation Center">Meditation Center</option>
              </select>
              {errors.center_type && <p className="mt-1 text-xs text-rose-600">{errors.center_type}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-[#286B88]/80 mb-1">Vehicle *</label>
              <select
                name="vehicle"
                value={formData.vehicle}
                onChange={handleChange}
                className={`w-full px-3 py-2 text-sm border ${errors.vehicle ? 'border-rose-500' : 'border-[#286B88]/20'} rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]`}
              >
                <option value="">Select a vehicle</option>
                <option value="Theravada">Theravada</option>
                <option value="Mahayana">Mahayana</option>
                <option value="Vajrayana">Vajrayana</option>
              </select>
              {errors.vehicle && <p className="mt-1 text-xs text-rose-600">{errors.vehicle}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-[#286B88]/80 mb-1">Coordinates *</label>
              <input
                type="text"
                value={coordinates}
                onChange={handleCoordinatesChange}
                className={`w-full px-3 py-2 text-sm border ${errors.latitude ? 'border-rose-500' : 'border-[#286B88]/20'} rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]`}
                placeholder="e.g., 15.1234, 104.5678"
              />
              <div className="mt-1 text-xs text-gray-500">
                <p>Enter the exact coordinates of the center (latitude, longitude). You can find these on Google Maps by right-clicking the location.</p>
              </div>
              {errors.latitude && <p className="mt-1 text-xs text-rose-600">{errors.latitude}</p>}
              {errors.longitude && <p className="mt-1 text-xs text-rose-600">{errors.longitude}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#286B88]/80 mb-1">Description *</label>
            <textarea
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              rows={3}
              className={`w-full px-3 py-2 text-sm border ${errors.description ? 'border-rose-500' : 'border-[#286B88]/20'} rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]`}
              placeholder="Enter center description"
            />
            {errors.description && <p className="mt-1 text-xs text-rose-600">{errors.description}</p>}
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-[#286B88]">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#286B88]/80 mb-1">Website</label>
              <input
                type="url"
                name="website"
                value={formData.website || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-[#286B88]/20 rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]"
                placeholder="https://example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#286B88]/80 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-[#286B88]/20 rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]"
                placeholder="contact@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#286B88]/80 mb-1">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-[#286B88]/20 rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]"
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>
        </div>

        {/* Advanced Fields Toggle */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setShowAdvancedFields(!showAdvancedFields)}
            className="text-sm text-[#286B88] hover:text-[#286B88]/80 font-medium flex items-center gap-2"
          >
            {showAdvancedFields ? (
              <>
                <span>Hide Advanced Fields</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </>
            ) : (
              <>
                <span>Show Advanced Fields</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </>
            )}
          </button>
        </div>

        {/* Advanced Fields */}
        {showAdvancedFields && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-[#286B88]">Additional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#286B88]/80 mb-1">Community Size</label>
                <input
                  type="text"
                  name="community_size"
                  value={formData.community_size || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-[#286B88]/20 rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]"
                  placeholder="e.g., 10-20 residents"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#286B88]/80 mb-1">Length of Stay</label>
                <input
                  type="text"
                  name="length_of_stay"
                  value={formData.length_of_stay || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-[#286B88]/20 rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]"
                  placeholder="e.g., 1 week minimum"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#286B88]/80 mb-1">Setting</label>
                <input
                  type="text"
                  name="setting"
                  value={formData.setting || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-[#286B88]/20 rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]"
                  placeholder="e.g., Mountain retreat"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#286B88]/80 mb-1">Price Model</label>
                <input
                  type="text"
                  name="price_model"
                  value={formData.price_model || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-[#286B88]/20 rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]"
                  placeholder="e.g., Donation-based"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#286B88]/80 mb-1">Languages Spoken</label>
                <input
                  type="text"
                  name="languages_spoken"
                  value={formData.languages_spoken?.join(', ') || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-[#286B88]/20 rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]"
                  placeholder="English, Spanish, French"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#286B88]/80 mb-1">Lineages</label>
                <input
                  type="text"
                  name="lineages"
                  value={formData.lineages?.join(', ') || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-[#286B88]/20 rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]"
                  placeholder="Zen, Theravada, Tibetan"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#286B88]/80 mb-1">Practices</label>
                <input
                  type="text"
                  name="practices"
                  value={formData.practices?.join(', ') || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-[#286B88]/20 rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]"
                  placeholder="Meditation, Yoga, Dharma talks"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#286B88]/80 mb-1">Teachers</label>
                <input
                  type="text"
                  name="teachers"
                  value={formData.teachers?.join(', ') || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-[#286B88]/20 rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]"
                  placeholder="Teacher names"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#286B88]/80 mb-1">Traditions</label>
                <input
                  type="text"
                  name="traditions"
                  value={formData.traditions?.join(', ') || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-[#286B88]/20 rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]"
                  placeholder="Buddhist traditions"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#286B88]/80 mb-1">Gender Policy</label>
                <input
                  type="text"
                  name="gender_policy"
                  value={formData.gender_policy || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-[#286B88]/20 rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]"
                  placeholder="e.g., Mixed gender"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#286B88]/80 mb-1">Involvement Method</label>
                <input
                  type="text"
                  name="involvement_method"
                  value={formData.involvement_method || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-[#286B88]/20 rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]"
                  placeholder="e.g., Application required"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="beginner_friendly"
                checked={formData.beginner_friendly || false}
                onChange={handleChange}
                className="h-4 w-4 text-[#286B88] focus:ring-[#286B88] border-[#286B88]/20 rounded"
              />
              <label className="ml-2 block text-sm text-[#286B88]/80">Beginner Friendly</label>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 text-sm bg-[#286B88] text-white rounded-lg hover:bg-[#286B88]/90 focus:outline-none focus:ring-2 focus:ring-[#286B88] focus:ring-offset-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </>
            ) : (
              'Submit Center'
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 