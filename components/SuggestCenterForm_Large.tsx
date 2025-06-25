import React, { useState } from 'react';
import { submitNewCenter } from '../lib/supabase';

interface SuggestCenterFormProps {
  showSuggestForm: boolean;
  setShowSuggestForm: (show: boolean) => void;
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

export default function SuggestCenterFormLarge({ 
  setShowSuggestForm, 
  availableVehicles, 
  availableTypes, 
  availableSettings, 
  availablePriceModels, 
  availableGenderPolicies 
}: SuggestCenterFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    center_type: '',
    vehicle: '',
    description: null,
    website: null,
    address: null,
    email: null,
    phone: null,
    beginner_friendly: null,
    community_size: null,
    dietary_info: null,
    gender_policy: null,
    involvement_method: null,
    languages_spoken: null,
    length_of_stay: null,
    lineages: null,
    practices: null,
    price_details: null,
    price_model: null,
    setting: null,
    teachers: null,
    traditions: null,
    ordination_possible: null,
    latitude: null,
    longitude: null,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showAdvancedFields, setShowAdvancedFields] = useState(false);
  const [, setGeocodingError] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState('');
  const [addressInput, setAddressInput] = useState('');
  const [inputMode, setInputMode] = useState<'address' | 'coordinates'>('address');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State for custom input visibility and values
  const [showCustomCenterType, setShowCustomCenterType] = useState(false);
  const [showCustomVehicle, setShowCustomVehicle] = useState(false);
  const [showCustomSetting, setShowCustomSetting] = useState(false);
  const [showCustomPriceModel, setShowCustomPriceModel] = useState(false);
  const [showCustomGenderPolicy, setShowCustomGenderPolicy] = useState(false);
  const [customCenterType, setCustomCenterType] = useState('');
  const [customVehicle, setCustomVehicle] = useState('');
  const [customSetting, setCustomSetting] = useState('');
  const [customPriceModel, setCustomPriceModel] = useState('');
  const [customGenderPolicy, setCustomGenderPolicy] = useState('');

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

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddressInput(e.target.value);
  };

  const handleModeToggle = () => {
    setInputMode(inputMode === 'address' ? 'coordinates' : 'address');
    // Clear errors when switching modes
    setErrors(prev => ({ ...prev, latitude: undefined, longitude: undefined }));
  };

  return (
    <div className="min-h-screen bg-red-100 p-4 border-8 border-red-500">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-8 border-4 border-blue-500">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-red-600">🔴 LARGE VERSION - Suggest a Center</h2>
          <button
            onClick={() => setShowSuggestForm(false)}
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

        <form className="space-y-10">
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
                  className="w-full px-4 py-3 text-base border border-[#286B88]/20 rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]"
                  placeholder="Enter center name"
                />
              </div>
              <div>
                <label className="block text-base font-medium text-[#286B88]/80 mb-2">Center Type *</label>
                <select
                  name="center_type"
                  className="w-full px-4 py-3 text-base border border-[#286B88]/20 rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]"
                >
                  <option value="">Select a type</option>
                  {availableTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                  <option value="Other">Other (specify below)</option>
                </select>
              </div>
              <div>
                <label className="block text-base font-medium text-[#286B88]/80 mb-2">Vehicle *</label>
                <select
                  name="vehicle"
                  className="w-full px-4 py-3 text-base border border-[#286B88]/20 rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]"
                >
                  <option value="">Select a vehicle</option>
                  {availableVehicles.map(vehicle => (
                    <option key={vehicle} value={vehicle}>{vehicle}</option>
                  ))}
                  <option value="Other">Other (specify below)</option>
                </select>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-base font-medium text-[#286B88]/80">Location *</label>
                  <button
                    type="button"
                    onClick={handleModeToggle}
                    className="text-sm text-[#286B88] hover:text-[#286B88]/80 font-medium"
                  >
                    {inputMode === 'address' ? 'Use coordinates instead' : 'Use address instead'}
                  </button>
                </div>
                
                {inputMode === 'address' ? (
                  <>
                    <input
                      type="text"
                      value={addressInput}
                      onChange={handleAddressChange}
                      className="w-full px-4 py-3 text-base border border-[#286B88]/20 rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]"
                      placeholder="e.g., 1234 Main St, City, State, Country"
                    />
                    <div className="mt-1 text-xs text-gray-500">
                      <p>Enter the address of the center.</p>
                    </div>
                  </>
                ) : (
                  <>
                    <input
                      type="text"
                      value={coordinates}
                      onChange={handleCoordinatesChange}
                      className="w-full px-4 py-3 text-base border border-[#286B88]/20 rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]"
                      placeholder="e.g., 15.1234, 104.5678"
                    />
                    <div className="mt-1 text-xs text-gray-500">
                      <p>Enter the exact coordinates of the center (latitude, longitude). You can find these on Google Maps by right-clicking the location.</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div>
              <label className="block text-base font-medium text-[#286B88]/80 mb-2">Description *</label>
              <textarea
                name="description"
                rows={4}
                className="w-full px-4 py-3 text-base border border-[#286B88]/20 rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]"
                placeholder="Tell everyone about the Dharma Center (e.g. 'This is a Zen Center for long-term practice based in the tradition of...')"
              />
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
                  className="w-full px-4 py-3 text-base border border-[#286B88]/20 rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]"
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <label className="block text-base font-medium text-[#286B88]/80 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  className="w-full px-4 py-3 text-base border border-[#286B88]/20 rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]"
                  placeholder="contact@example.com"
                />
              </div>
              <div>
                <label className="block text-base font-medium text-[#286B88]/80 mb-2">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  className="w-full px-4 py-3 text-base border border-[#286B88]/20 rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
          </div>

          {/* Advanced Fields Toggle */}
          <div className="flex justify-center py-4">
            <button
              type="button"
              onClick={() => setShowAdvancedFields(!showAdvancedFields)}
              className="text-base text-[#286B88] hover:text-[#286B88]/80 font-medium flex items-center gap-3 py-2 px-4 rounded-lg hover:bg-[#286B88]/5"
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
            <div className="space-y-8">
              <h3 className="text-xl font-semibold text-[#286B88]">Additional Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-base font-medium text-[#286B88]/80 mb-2">Community Size</label>
                  <input
                    type="text"
                    name="community_size"
                    className="w-full px-4 py-3 text-base border border-[#286B88]/20 rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]"
                    placeholder="e.g., 10-20 residents"
                  />
                </div>
                <div>
                  <label className="block text-base font-medium text-[#286B88]/80 mb-2">Length of Stay</label>
                  <input
                    type="text"
                    name="length_of_stay"
                    className="w-full px-4 py-3 text-base border border-[#286B88]/20 rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]"
                    placeholder="e.g., 1 week minimum"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-base font-medium text-[#286B88]/80 mb-2">Languages Spoken</label>
                  <input
                    type="text"
                    name="languages_spoken"
                    className="w-full px-4 py-3 text-base border border-[#286B88]/20 rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]"
                    placeholder="English, Spanish, French"
                  />
                </div>
                <div>
                  <label className="block text-base font-medium text-[#286B88]/80 mb-2">Lineages</label>
                  <input
                    type="text"
                    name="lineages"
                    className="w-full px-4 py-3 text-base border border-[#286B88]/20 rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]"
                    placeholder="Zen, Theravada, Tibetan"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="beginner_friendly"
                  className="h-4 w-4 text-[#286B88] focus:ring-[#286B88] border-[#286B88]/20 rounded"
                />
                <label className="ml-2 block text-base text-[#286B88]/80">Beginner Friendly</label>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end pt-8 border-t border-gray-200">
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
                  Submitting...
                </>
              ) : (
                'Submit Center'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 