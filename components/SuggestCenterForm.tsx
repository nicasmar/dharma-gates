import React, { useState } from 'react';
import { submitNewCenter } from '../lib/supabase';
import MonasteryFormFields, { FormData } from './MonasteryFormFields';


interface SuggestCenterFormProps {
  showSuggestForm: boolean;
  setShowSuggestForm: (show: boolean) => void;
  availableVehicles: string[];
  availableTypes: string[];
  availableSettings: string[];
  availablePriceModels: string[];
  availableGenderPolicies: string[];
  availableTraditions: string[];
  availableDiets: string[];
}

// FormData is now imported from MonasteryFormFields

export default function SuggestCenterForm({ 
  setShowSuggestForm, 
  availableVehicles, 
  availableTypes, 
  availableSettings, 
  availablePriceModels, 
  availableGenderPolicies,
  availableTraditions,
  availableDiets
}: SuggestCenterFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    center_type: '',
    vehicle: '',
    description: '',
    website: '',
    address: '',
    email: '',
    phone: '',
    beginner_friendly: null,
    community_size: '',
    dietary_info: '',
    gender_policy: '',
    involvement_method: '',
    languages_spoken: [],
    length_of_stay: '',
    practices: [],
    price_details: '',
    price_model: '',
    setting: '',
    teachers: [],
    traditions: [],
    ordination_possible: null,
    latitude: null,
    longitude: null,
    photos: []
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showAdvancedFields, setShowAdvancedFields] = useState(false);
  const [geocodingError, setGeocodingError] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState('');
  const [addressInput, setAddressInput] = useState('');
  const [inputMode, setInputMode] = useState<'address' | 'coordinates'>('address');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Custom dropdown logic is now handled in MonasteryFormFields

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
    
    // Validate location input based on mode - location is required
    if (inputMode === 'address') {
      if (!addressInput.trim()) {
        newErrors.latitude = 'Address is required for location';
      }
    } else {
      if (!coordinates.trim()) {
        newErrors.latitude = 'Coordinates are required for location';
      } else {
        const [lat, lon] = coordinates.split(',').map(coord => coord.trim());
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lon);
        
        if (isNaN(latitude) || isNaN(longitude)) {
          newErrors.latitude = 'Invalid coordinate format (use: latitude, longitude)';
        } else if (latitude < -90 || latitude > 90) {
          newErrors.latitude = 'Latitude must be between -90 and 90';
        } else if (longitude < -180 || longitude > 180) {
          newErrors.longitude = 'Longitude must be between -180 and 180';
        }
      }
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (formData.website) {
      const websiteValue = formData.website.trim();
      // Very simple domain validation - just check for basic structure
      const urlPattern = /^(https?:\/\/)?(www\.)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/.*)?$/;
      if (!urlPattern.test(websiteValue)) {
        newErrors.website = 'Please enter a valid website (e.g., example.com or www.example.com)';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form field handling is now done by MonasteryFormFields

  const geocodeAddress = async (address: string) => {
    try {
      const url = `/api/geocode?address=${encodeURIComponent(address)}`;
      console.log('Making geocode request to:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Geocoding service unavailable');
      }
      
      const data = await response.json();
      console.log('Geocoding response:', data);
      
      return {
        latitude: data.latitude,
        longitude: data.longitude,
        display_name: data.display_name,
        country: data.country,
        state: data.state
      };
    } catch (error) {
      console.error('Geocoding error:', error);
      throw error;
    }
  };

  const reverseGeocode = async (lat: number, lon: number) => {
    try {
      const url = `/api/geocode?lat=${lat}&lon=${lon}`;
      console.log('Making reverse geocode request to:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Reverse geocoding service unavailable');
      }
      
      const data = await response.json();
      console.log('Reverse geocoding response:', data);
      
      return {
        display_name: data.display_name,
        country: data.country,
        state: data.state
      };
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
      let finalLatitude = formData.latitude;
      let finalLongitude = formData.longitude;
      let finalAddress = formData.address;

      if (inputMode === 'address') {
        // Geocode the address to get coordinates
        try {
          const geocodeResult = await geocodeAddress(addressInput);
          if (!geocodeResult) {
            setGeocodingError('Could not find coordinates for this address. Please check the address or try using coordinates instead.');
            return;
          }
          finalLatitude = geocodeResult.latitude;
          finalLongitude = geocodeResult.longitude;
          // Store structured address: display_name|||country|||state
          finalAddress = `${geocodeResult.display_name}|||${geocodeResult.country}|||${geocodeResult.state}`;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          setGeocodingError(`Could not geocode address: ${errorMessage}. Please check the address or try using coordinates instead.`);
          return;
        }
      } else {
        // We have coordinates, get address from them
        if (formData.latitude === null || formData.longitude === null) {
          setGeocodingError('Please enter valid coordinates');
          return;
        }
        
        const address = await reverseGeocode(formData.latitude, formData.longitude);
        if (!address) {
          setGeocodingError('Could not find address for these coordinates');
          return;
        }
        // Store structured address: display_name|||country|||state
        finalAddress = `${address.display_name}|||${address.country}|||${address.state}`;
      }

      // Normalize website URL - add https:// if no protocol specified
      let normalizedWebsite = formData.website;
      if (normalizedWebsite && !normalizedWebsite.match(/^https?:\/\//)) {
        normalizedWebsite = `https://${normalizedWebsite}`;
      }

      // Update form data with final coordinates and address
      const updatedFormData = {
        ...formData,
        website: normalizedWebsite,
        latitude: finalLatitude,
        longitude: finalLongitude,
        address: finalAddress
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
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-[#286B88]">Suggest a Center</h2>
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

      {geocodingError && (
        <div className="mb-4 p-4 bg-amber-50 text-amber-700 rounded-lg">
          {geocodingError}
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
                showLocationInput={true}
                isSubmitting={isSubmitting}
                showAdvancedFields={showAdvancedFields}
                onToggleAdvancedFields={() => setShowAdvancedFields(!showAdvancedFields)}
              >
                {/* Location input section */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-[#286B88]/80">Location *</label>
                    <button
                      type="button"
                      onClick={handleModeToggle}
                      className="text-xs text-[#286B88] hover:text-[#286B88]/80 font-medium"
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
                        className={`w-full px-3 py-2 text-sm border ${errors.latitude ? 'border-rose-500' : 'border-[#286B88]/20'} rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]`}
                        placeholder="e.g., 1234 Main St, City, State, Country"
                      />
                      <div className="mt-1 text-xs text-gray-500">
                        <p>Enter the address of the center. This is required to help visitors find the location.</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <input
                        type="text"
                        value={coordinates}
                        onChange={handleCoordinatesChange}
                        className={`w-full px-3 py-2 text-sm border ${errors.latitude ? 'border-rose-500' : 'border-[#286B88]/20'} rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]`}
                        placeholder="e.g., 15.1234, 104.5678"
                      />
                      <div className="mt-1 text-xs text-gray-500">
                        <p>Enter the exact coordinates of the center (latitude, longitude). This is required to help visitors find the location. You can find coordinates on Google Maps by right-clicking the location.</p>
                      </div>
                    </>
                  )}
                  
                  {errors.latitude && <p className="mt-1 text-xs text-rose-600">{errors.latitude}</p>}
                  {errors.longitude && <p className="mt-1 text-xs text-rose-600">{errors.longitude}</p>}
                </div>
              </MonasteryFormFields>



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