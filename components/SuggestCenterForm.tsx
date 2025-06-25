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
  availableTraditions: string[];
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

export default function SuggestCenterForm({ 
  setShowSuggestForm, 
  availableVehicles, 
  availableTypes, 
  availableSettings, 
  availablePriceModels, 
  availableGenderPolicies,
  availableTraditions 
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
    beginner_friendly: false,
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
    ordination_possible: false,
    latitude: null,
    longitude: null
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
  const [showCustomTradition, setShowCustomTradition] = useState(false);
  const [customCenterType, setCustomCenterType] = useState('');
  const [customVehicle, setCustomVehicle] = useState('');
  const [customSetting, setCustomSetting] = useState('');
  const [customPriceModel, setCustomPriceModel] = useState('');
  const [customGenderPolicy, setCustomGenderPolicy] = useState('');
  const [customTradition, setCustomTradition] = useState('');

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
    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = 'Invalid website URL';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSelectChange = (fieldName: string, value: string) => {
    // Handle "Other" option selections
    if (value === 'Other') {
      switch (fieldName) {
        case 'center_type':
          setShowCustomCenterType(true);
          setFormData(prev => ({ ...prev, center_type: '' }));
          break;
        case 'vehicle':
          setShowCustomVehicle(true);
          setFormData(prev => ({ ...prev, vehicle: '' }));
          break;
        case 'setting':
          setShowCustomSetting(true);
          setFormData(prev => ({ ...prev, setting: '' }));
          break;
        case 'price_model':
          setShowCustomPriceModel(true);
          setFormData(prev => ({ ...prev, price_model: '' }));
          break;
        case 'gender_policy':
          setShowCustomGenderPolicy(true);
          setFormData(prev => ({ ...prev, gender_policy: '' }));
          break;
        case 'traditions':
          setShowCustomTradition(true);
          setFormData(prev => ({ ...prev, traditions: [] }));
          break;
      }
    } else {
      // Handle regular selections
      if (fieldName === 'traditions') {
        // Traditions is an array field, so we need to convert the single selection to an array
        setFormData(prev => ({ ...prev, [fieldName]: value ? [value] : null }));
      } else {
        setFormData(prev => ({ ...prev, [fieldName]: value || null }));
      }
      // Hide custom input if switching away from "Other"
      switch (fieldName) {
        case 'center_type':
          setShowCustomCenterType(false);
          setCustomCenterType('');
          break;
        case 'vehicle':
          setShowCustomVehicle(false);
          setCustomVehicle('');
          break;
        case 'setting':
          setShowCustomSetting(false);
          setCustomSetting('');
          break;
        case 'price_model':
          setShowCustomPriceModel(false);
          setCustomPriceModel('');
          break;
        case 'gender_policy':
          setShowCustomGenderPolicy(false);
          setCustomGenderPolicy('');
          break;
        case 'traditions':
          setShowCustomTradition(false);
          setCustomTradition('');
          break;
      }
    }
    
    // Clear error when field is modified
    if (errors[fieldName as keyof FormData]) {
      setErrors(prev => ({ ...prev, [fieldName]: undefined }));
    }
  };

  const handleCustomInputChange = (fieldName: string, value: string) => {
    switch (fieldName) {
      case 'center_type':
        setCustomCenterType(value);
        setFormData(prev => ({ ...prev, center_type: value }));
        break;
      case 'vehicle':
        setCustomVehicle(value);
        setFormData(prev => ({ ...prev, vehicle: value }));
        break;
      case 'setting':
        setCustomSetting(value);
        setFormData(prev => ({ ...prev, setting: value }));
        break;
      case 'price_model':
        setCustomPriceModel(value);
        setFormData(prev => ({ ...prev, price_model: value }));
        break;
      case 'gender_policy':
        setCustomGenderPolicy(value);
        setFormData(prev => ({ ...prev, gender_policy: value }));
        break;
      case 'traditions':
        setCustomTradition(value);
        setFormData(prev => ({ ...prev, traditions: value ? value.split(',').map(item => item.trim()) : null }));
        break;
    }
    
    // Clear error when field is modified
    if (errors[fieldName as keyof FormData]) {
      setErrors(prev => ({ ...prev, [fieldName]: undefined }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else if (name === 'languages_spoken' || name === 'practices' || name === 'teachers') {
      setFormData(prev => ({ ...prev, [name]: value ? value.split(',').map(item => item.trim()) : null }));
    } else if (name === 'center_type' || name === 'vehicle' || name === 'setting' || name === 'price_model' || name === 'gender_policy' || name === 'traditions') {
      handleSelectChange(name, value);
      return;
    } else {
      setFormData(prev => ({ ...prev, [name]: value || null }));
    }
    
    // Clear error when field is modified
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const geocodeAddress = async (address: string) => {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&addressdetails=1`;
      console.log('Making geocode request to:', url);
      
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
      console.log('Geocoding response:', data);
      
      if (data && data.length > 0) {
        const result = data[0];
        const addressDetails = result.address || {};
        
        // Extract country and state/province from structured address data
        const country = addressDetails.country || '';
        const state = addressDetails.state || 
                     addressDetails.province || 
                     addressDetails.region || 
                     addressDetails['ISO3166-2-lvl4'] || '';
        
        return {
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon),
          display_name: result.display_name,
          country,
          state
        };
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
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
        const addressDetails = data.address || {};
        
        // Extract country and state/province from structured address data
        const country = addressDetails.country || '';
        const state = addressDetails.state || 
                     addressDetails.province || 
                     addressDetails.region || 
                     addressDetails['ISO3166-2-lvl4'] || '';
        
        return {
          display_name: data.display_name,
          country,
          state
        };
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
      let finalLatitude = formData.latitude;
      let finalLongitude = formData.longitude;
      let finalAddress = formData.address;

      if (inputMode === 'address') {
        // Geocode the address to get coordinates
        const geocodeResult = await geocodeAddress(addressInput);
        if (!geocodeResult) {
          setGeocodingError('Could not find coordinates for this address. Please check the address or try using coordinates instead.');
          return;
        }
        finalLatitude = geocodeResult.latitude;
        finalLongitude = geocodeResult.longitude;
        // Store structured address: display_name|||country|||state
        finalAddress = `${geocodeResult.display_name}|||${geocodeResult.country}|||${geocodeResult.state}`;
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

      // Update form data with final coordinates and address
      const updatedFormData = {
        ...formData,
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
              <label className="block text-sm font-medium text-[#286B88]/80 mb-1">Center Type *</label>
              <select
                name="center_type"
                value={showCustomCenterType ? 'Other' : formData.center_type}
                onChange={handleChange}
                className={`w-full px-3 py-2 text-sm border ${errors.center_type ? 'border-rose-500' : 'border-[#286B88]/20'} rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]`}
              >
                <option value="">Select a type</option>
                {availableTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
                <option value="Other">Other (specify below)</option>
              </select>
              {showCustomCenterType && (
                <input
                  type="text"
                  value={customCenterType}
                  onChange={(e) => handleCustomInputChange('center_type', e.target.value)}
                  className={`w-full px-3 py-2 text-sm border ${errors.center_type ? 'border-rose-500' : 'border-[#286B88]/20'} rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88] mt-2`}
                  placeholder="Enter custom center type"
                />
              )}
              {errors.center_type && <p className="mt-1 text-xs text-rose-600">{errors.center_type}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-[#286B88]/80 mb-1">Vehicle *</label>
              <select
                name="vehicle"
                value={showCustomVehicle ? 'Other' : formData.vehicle}
                onChange={handleChange}
                className={`w-full px-3 py-2 text-sm border ${errors.vehicle ? 'border-rose-500' : 'border-[#286B88]/20'} rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]`}
              >
                <option value="">Select a vehicle</option>
                {availableVehicles.map(vehicle => (
                  <option key={vehicle} value={vehicle}>{vehicle}</option>
                ))}
                <option value="Other">Other (specify below)</option>
              </select>
              {showCustomVehicle && (
                <input
                  type="text"
                  value={customVehicle}
                  onChange={(e) => handleCustomInputChange('vehicle', e.target.value)}
                  className={`w-full px-3 py-2 text-sm border ${errors.vehicle ? 'border-rose-500' : 'border-[#286B88]/20'} rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88] mt-2`}
                  placeholder="Enter custom vehicle"
                />
              )}
              {errors.vehicle && <p className="mt-1 text-xs text-rose-600">{errors.vehicle}</p>}
            </div>
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
          </div>

          <div>
            <label className="block text-sm font-medium text-[#286B88]/80 mb-1">Description *</label>
            <textarea
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              rows={3}
              className={`w-full px-3 py-2 text-sm border ${errors.description ? 'border-rose-500' : 'border-[#286B88]/20'} rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]`}
              placeholder="Tell everyone about the Dharma Center (e.g. 'This is a Zen Center for long-term practice based in the tradition of...')"
            />
            {errors.description && <p className="mt-1 text-xs text-rose-600">{errors.description}</p>}
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-8">
          <h3 className="text-xl font-semibold text-[#286B88]">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                <select
                  name="setting"
                  value={showCustomSetting ? 'Other' : (formData.setting || '')}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-[#286B88]/20 rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]"
                >
                  <option value="">Select a setting</option>
                  {availableSettings.map(setting => (
                    <option key={setting} value={setting}>{setting}</option>
                  ))}
                  <option value="Other">Other (specify below)</option>
                </select>
                {showCustomSetting && (
                  <input
                    type="text"
                    value={customSetting}
                    onChange={(e) => handleCustomInputChange('setting', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[#286B88]/20 rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88] mt-2"
                    placeholder="Enter custom setting"
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-[#286B88]/80 mb-1">Price Model</label>
                <select
                  name="price_model"
                  value={showCustomPriceModel ? 'Other' : (formData.price_model || '')}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-[#286B88]/20 rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]"
                >
                  <option value="">Select a price model</option>
                  {availablePriceModels.map(model => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                  <option value="Other">Other (specify below)</option>
                </select>
                {showCustomPriceModel && (
                  <input
                    type="text"
                    value={customPriceModel}
                    onChange={(e) => handleCustomInputChange('price_model', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[#286B88]/20 rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88] mt-2"
                    placeholder="Enter custom price model"
                  />
                )}
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
                <select
                  name="traditions"
                  value={showCustomTradition ? 'Other' : (formData.traditions?.join(', ') || '')}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-[#286B88]/20 rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]"
                >
                  <option value="">Select traditions</option>
                  {availableTraditions.map(tradition => (
                    <option key={tradition} value={tradition}>{tradition}</option>
                  ))}
                  <option value="Other">Other (specify below)</option>
                </select>
                {showCustomTradition && (
                  <input
                    type="text"
                    value={customTradition}
                    onChange={(e) => handleCustomInputChange('traditions', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[#286B88]/20 rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88] mt-2"
                    placeholder="Enter custom traditions"
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-medium text-[#286B88]/80 mb-1">Gender Policy</label>
                <select
                  name="gender_policy"
                  value={showCustomGenderPolicy ? 'Other' : (formData.gender_policy || '')}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-[#286B88]/20 rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]"
                >
                  <option value="">Select a gender policy</option>
                  {availableGenderPolicies.map(policy => (
                    <option key={policy} value={policy}>{policy}</option>
                  ))}
                  <option value="Other">Other (specify below)</option>
                </select>
                {showCustomGenderPolicy && (
                  <input
                    type="text"
                    value={customGenderPolicy}
                    onChange={(e) => handleCustomInputChange('gender_policy', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[#286B88]/20 rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88] mt-2"
                    placeholder="Enter custom gender policy"
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-[#286B88]/80 mb-1">How to get involved</label>
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

            <div className="space-y-4">
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
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="ordination_possible"
                  checked={formData.ordination_possible || false}
                  onChange={handleChange}
                  className="h-4 w-4 text-[#286B88] focus:ring-[#286B88] border-[#286B88]/20 rounded"
                />
                <label className="ml-2 block text-sm text-[#286B88]/80">Ordination Possible</label>
              </div>
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