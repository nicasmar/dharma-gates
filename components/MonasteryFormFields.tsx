import React, { useState, useEffect, useRef } from 'react';
import PhotoUpload from './PhotoUpload';

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
  photos: string[] | null;
}

interface MonasteryFormFieldsProps {
  formData: FormData;
  onFormDataChange: (data: FormData) => void;
  errors: Partial<Record<keyof FormData, string>>;
  onErrorsChange: (errors: Partial<Record<keyof FormData, string>>) => void;
  availableVehicles: string[];
  availableTypes: string[];
  availableSettings: string[];
  availablePriceModels: string[];
  availableGenderPolicies: string[];
  availableTraditions: string[];
  availableDiets: string[];
  showLocationInput?: boolean;
  isSubmitting?: boolean;
  showAdvancedFields?: boolean;
  onToggleAdvancedFields?: () => void;
  children?: React.ReactNode; // For location input in suggest form
}

export default function MonasteryFormFields({
  formData,
  onFormDataChange,
  errors,
  onErrorsChange,
  availableVehicles,
  availableTypes,
  availableSettings,
  availablePriceModels,
  availableGenderPolicies,
  availableTraditions,
  availableDiets,
  showLocationInput = false,
  isSubmitting = false,
  showAdvancedFields = true,
  onToggleAdvancedFields,
  children
}: MonasteryFormFieldsProps) {
  // State for custom input visibility and values
  const [showCustomCenterType, setShowCustomCenterType] = useState(false);
  const [showCustomVehicle, setShowCustomVehicle] = useState(false);
  const [showCustomSetting, setShowCustomSetting] = useState(false);
  const [showCustomPriceModel, setShowCustomPriceModel] = useState(false);
  const [showCustomGenderPolicy, setShowCustomGenderPolicy] = useState(false);
  const [showCustomTradition, setShowCustomTradition] = useState(false);
  const [showCustomDiet, setShowCustomDiet] = useState(false);
  const [customCenterType, setCustomCenterType] = useState('');
  const [customVehicle, setCustomVehicle] = useState('');
  const [customSetting, setCustomSetting] = useState('');
  const [customPriceModel, setCustomPriceModel] = useState('');
  const [customGenderPolicy, setCustomGenderPolicy] = useState('');
  const [customTradition, setCustomTradition] = useState('');
  const [customDiet, setCustomDiet] = useState('');
  const [showTraditionsDropdown, setShowTraditionsDropdown] = useState(false);
  const traditionsDropdownRef = useRef<HTMLDivElement>(null);
  
  // Store raw input values for array fields to allow proper typing with spaces
  const [rawInputValues, setRawInputValues] = useState({
    languages_spoken: formData.languages_spoken?.join(', ') || '',
    practices: formData.practices?.join(', ') || '',
    teachers: formData.teachers?.join(', ') || ''
  });

  // Update raw input values when formData changes (e.g., when editing existing monastery)
  useEffect(() => {
    setRawInputValues({
      languages_spoken: formData.languages_spoken?.join(', ') || '',
      practices: formData.practices?.join(', ') || '',
      teachers: formData.teachers?.join(', ') || ''
    });
  }, [formData.languages_spoken, formData.practices, formData.teachers]);

  // Close traditions dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (traditionsDropdownRef.current && !traditionsDropdownRef.current.contains(event.target as Node)) {
        setShowTraditionsDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelectChange = (fieldName: string, value: string) => {
    // Handle "Other" option selections
    if (value === 'Other') {
      switch (fieldName) {
        case 'center_type':
          setShowCustomCenterType(true);
          onFormDataChange({ ...formData, center_type: '' });
          break;
        case 'vehicle':
          setShowCustomVehicle(true);
          onFormDataChange({ ...formData, vehicle: '' });
          break;
        case 'setting':
          setShowCustomSetting(true);
          onFormDataChange({ ...formData, setting: '' });
          break;
        case 'price_model':
          setShowCustomPriceModel(true);
          onFormDataChange({ ...formData, price_model: '' });
          break;
        case 'gender_policy':
          setShowCustomGenderPolicy(true);
          onFormDataChange({ ...formData, gender_policy: '' });
          break;

        case 'dietary_info':
          setShowCustomDiet(true);
          onFormDataChange({ ...formData, dietary_info: '' });
          break;
      }
    } else {
      // Handle regular selections
      onFormDataChange({ ...formData, [fieldName]: value || null });
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

        case 'dietary_info':
          setShowCustomDiet(false);
          setCustomDiet('');
          break;
      }
    }
    
    // Clear error when field is modified
    if (errors[fieldName as keyof FormData]) {
      onErrorsChange({ ...errors, [fieldName]: undefined });
    }
  };

  const handleCustomInputChange = (fieldName: string, value: string) => {
    switch (fieldName) {
      case 'center_type':
        setCustomCenterType(value);
        onFormDataChange({ ...formData, center_type: value });
        break;
      case 'vehicle':
        setCustomVehicle(value);
        onFormDataChange({ ...formData, vehicle: value });
        break;
      case 'setting':
        setCustomSetting(value);
        onFormDataChange({ ...formData, setting: value });
        break;
      case 'price_model':
        setCustomPriceModel(value);
        onFormDataChange({ ...formData, price_model: value });
        break;
      case 'gender_policy':
        setCustomGenderPolicy(value);
        onFormDataChange({ ...formData, gender_policy: value });
        break;

      case 'dietary_info':
        setCustomDiet(value);
        onFormDataChange({ ...formData, dietary_info: value });
        break;
    }
    
    // Clear error when field is modified
    if (errors[fieldName as keyof FormData]) {
      onErrorsChange({ ...errors, [fieldName]: undefined });
    }
  };

  const handleCustomTraditionChange = (value: string) => {
    setCustomTradition(value);
    // Parse comma-separated custom traditions and add them to the existing selections
    const customTraditions = value ? value.split(',').map(item => item.trim()).filter(item => item) : [];
    const currentTraditions = formData.traditions || [];
    const existingNonCustom = currentTraditions.filter(t => availableTraditions.includes(t));
    const allTraditions = [...existingNonCustom, ...customTraditions];
    
    onFormDataChange({ ...formData, traditions: allTraditions.length > 0 ? allTraditions : null });
    
    // Clear error when field is modified
    if (errors.traditions) {
      onErrorsChange({ ...errors, traditions: undefined });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      onFormDataChange({ ...formData, [name]: (e.target as HTMLInputElement).checked });
    } else if (name === 'beginner_friendly' || name === 'ordination_possible') {
      // Handle Yes/No/Not specified dropdowns
      let booleanValue: boolean | null = null;
      if (value === 'yes') booleanValue = true;
      else if (value === 'no') booleanValue = false;
      // 'not_specified' remains null
      onFormDataChange({ ...formData, [name]: booleanValue });
    } else if (name === 'languages_spoken' || name === 'practices' || name === 'teachers') {
      handleArrayFieldChange(name as 'languages_spoken' | 'practices' | 'teachers', value);
    } else if (name === 'center_type' || name === 'vehicle' || name === 'setting' || name === 'price_model' || name === 'gender_policy' || name === 'dietary_info') {
      handleSelectChange(name, value);
      return;
    } else {
      onFormDataChange({ ...formData, [name]: value || null });
    }
    
    // Clear error when field is modified
    if (errors[name as keyof FormData]) {
      onErrorsChange({ ...errors, [name]: undefined });
    }
  };

  const handleTraditionSelect = (tradition: string) => {
    const currentTraditions = formData.traditions || [];
    let updatedTraditions;
    
    if (currentTraditions.includes(tradition)) {
      // Remove tradition if already selected
      updatedTraditions = currentTraditions.filter(t => t !== tradition);
    } else {
      // Add tradition if not selected
      updatedTraditions = [...currentTraditions, tradition];
    }
    
    onFormDataChange({ ...formData, traditions: updatedTraditions.length > 0 ? updatedTraditions : null });
    
    // Clear error when field is modified
    if (errors.traditions) {
      onErrorsChange({ ...errors, traditions: undefined });
    }
  };

  const handleArrayFieldChange = (fieldName: 'languages_spoken' | 'practices' | 'teachers', value: string) => {
    setRawInputValues(prev => ({ ...prev, [fieldName]: value }));
    
    // Clear error when field is modified
    if (errors[fieldName]) {
      onErrorsChange({ ...errors, [fieldName]: undefined });
    }
  };

  const handleArrayFieldBlur = (fieldName: 'languages_spoken' | 'practices' | 'teachers') => {
    const rawValue = rawInputValues[fieldName];
    const processedArray = rawValue ? rawValue.split(',').map(item => item.trim()).filter(item => item) : null;
    onFormDataChange({ ...formData, [fieldName]: processedArray });
  };

  const getFieldSize = showLocationInput ? 'text-sm' : 'text-base';
  const getFieldPadding = showLocationInput ? 'px-3 py-2' : 'px-4 py-3';

  return (
    <div className="space-y-10">
      {/* Essential Information */}
      <div className="space-y-8">
        <h3 className="text-xl font-semibold text-[#286B88]">Essential Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className={`block ${getFieldSize} font-medium text-[#286B88]/80 mb-2`}>Center Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full ${getFieldPadding} ${getFieldSize} border ${errors.name ? 'border-rose-500' : 'border-[#286B88]/20'} rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]`}
              placeholder="Enter center name"
            />
            {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name}</p>}
          </div>
          <div>
            <label className={`block ${getFieldSize} font-medium text-[#286B88]/80 mb-2`}>Center Type *</label>
            <select
              name="center_type"
              value={showCustomCenterType ? 'Other' : formData.center_type}
              onChange={handleChange}
              className={`w-full ${getFieldPadding} ${getFieldSize} border ${errors.center_type ? 'border-rose-500' : 'border-[#286B88]/20'} rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]`}
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
                className={`mt-2 w-full ${getFieldPadding} ${getFieldSize} border ${errors.center_type ? 'border-rose-500' : 'border-[#286B88]/20'} rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]`}
                placeholder="Enter custom center type"
              />
            )}
            {errors.center_type && <p className="mt-1 text-xs text-rose-600">{errors.center_type}</p>}
          </div>
          <div>
            <label className={`block ${getFieldSize} font-medium text-[#286B88]/80 mb-2`}>Vehicle *</label>
            <select
              name="vehicle"
              value={showCustomVehicle ? 'Other' : formData.vehicle}
              onChange={handleChange}
              className={`w-full ${getFieldPadding} ${getFieldSize} border ${errors.vehicle ? 'border-rose-500' : 'border-[#286B88]/20'} rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]`}
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
                className={`mt-2 w-full ${getFieldPadding} ${getFieldSize} border ${errors.vehicle ? 'border-rose-500' : 'border-[#286B88]/20'} rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]`}
                placeholder="Enter custom vehicle"
              />
            )}
            {errors.vehicle && <p className="mt-1 text-xs text-rose-600">{errors.vehicle}</p>}
          </div>
          {!showLocationInput && (
            <div>
              <label className={`block ${getFieldSize} font-medium text-[#286B88]/80 mb-2`}>Address</label>
              <input
                type="text"
                name="address"
                value={formData.address || ''}
                onChange={handleChange}
                className={`w-full ${getFieldPadding} ${getFieldSize} border border-[#286B88]/20 rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]`}
                placeholder="Enter address"
              />
            </div>
          )}
        </div>

        {/* Location input for suggest form */}
        {showLocationInput && children}

        <div>
          <label className={`block ${getFieldSize} font-medium text-[#286B88]/80 mb-2`}>Description *</label>
          <textarea
            name="description"
            value={formData.description || ''}
            onChange={handleChange}
            rows={4}
            className={`w-full ${getFieldPadding} ${getFieldSize} border ${errors.description ? 'border-rose-500' : 'border-[#286B88]/20'} rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]`}
            placeholder="Tell everyone about the Dharma Center"
          />
          {errors.description && <p className="mt-1 text-xs text-rose-600">{errors.description}</p>}
        </div>
        
        <div>
          <label className={`block ${getFieldSize} font-medium text-[#286B88]/80 mb-2`}>Photos</label>
          <PhotoUpload
            photos={formData.photos || []}
            onPhotosChange={(photos) => onFormDataChange({ ...formData, photos })}
            maxPhotos={5}
            disabled={isSubmitting}
          />
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-8">
        <h3 className="text-xl font-semibold text-[#286B88]">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className={`block ${getFieldSize} font-medium text-[#286B88]/80 mb-2`}>Website</label>
            <input
              type="text"
              name="website"
              value={formData.website || ''}
              onChange={handleChange}
              className={`w-full ${getFieldPadding} ${getFieldSize} border ${errors.website ? 'border-rose-500' : 'border-[#286B88]/20'} rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]`}
              placeholder="https://example.com"
            />
            {errors.website && <p className="mt-1 text-xs text-rose-600">{errors.website}</p>}
          </div>
          <div>
            <label className={`block ${getFieldSize} font-medium text-[#286B88]/80 mb-2`}>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email || ''}
              onChange={handleChange}
              className={`w-full ${getFieldPadding} ${getFieldSize} border ${errors.email ? 'border-rose-500' : 'border-[#286B88]/20'} rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]`}
              placeholder="contact@example.com"
            />
            {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email}</p>}
          </div>
          <div>
            <label className={`block ${getFieldSize} font-medium text-[#286B88]/80 mb-2`}>Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone || ''}
              onChange={handleChange}
              className={`w-full ${getFieldPadding} ${getFieldSize} border border-[#286B88]/20 rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]`}
              placeholder="+1 (555) 123-4567"
            />
          </div>
        </div>
      </div>

      {/* Toggle for advanced fields in suggest form */}
      {onToggleAdvancedFields && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={onToggleAdvancedFields}
            className="px-6 py-3 text-base bg-[#286B88]/10 text-[#286B88] rounded-lg hover:bg-[#286B88]/20 font-medium"
          >
            {showAdvancedFields ? 'Hide' : 'Show'} Additional Information
          </button>
        </div>
      )}

      {/* Additional Information */}
      {showAdvancedFields && (
        <div className="space-y-8">
          <h3 className="text-xl font-semibold text-[#286B88]">Additional Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className={`block ${getFieldSize} font-medium text-[#286B88]/80 mb-2`}>Community Size</label>
              <input
                type="text"
                name="community_size"
                value={formData.community_size || ''}
                onChange={handleChange}
                className={`w-full ${getFieldPadding} ${getFieldSize} border border-[#286B88]/20 rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]`}
                placeholder="e.g., 10-20 residents"
              />
            </div>
            <div>
              <label className={`block ${getFieldSize} font-medium text-[#286B88]/80 mb-2`}>Length of Stay</label>
              <input
                type="text"
                name="length_of_stay"
                value={formData.length_of_stay || ''}
                onChange={handleChange}
                className={`w-full ${getFieldPadding} ${getFieldSize} border border-[#286B88]/20 rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]`}
                placeholder="e.g., 1 week minimum"
              />
            </div>
            <div>
              <label className={`block ${getFieldSize} font-medium text-[#286B88]/80 mb-2`}>Setting</label>
              <select
                name="setting"
                value={showCustomSetting ? 'Other' : (formData.setting || '')}
                onChange={handleChange}
                className={`w-full ${getFieldPadding} ${getFieldSize} border border-[#286B88]/20 rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]`}
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
                  className={`mt-2 w-full ${getFieldPadding} ${getFieldSize} border border-[#286B88]/20 rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]`}
                  placeholder="Enter custom setting"
                />
              )}
            </div>
            <div>
              <label className={`block ${getFieldSize} font-medium text-[#286B88]/80 mb-2`}>Price Model</label>
              <select
                name="price_model"
                value={showCustomPriceModel ? 'Other' : (formData.price_model || '')}
                onChange={handleChange}
                className={`w-full ${getFieldPadding} ${getFieldSize} border border-[#286B88]/20 rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]`}
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
                  className={`mt-2 w-full ${getFieldPadding} ${getFieldSize} border border-[#286B88]/20 rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]`}
                  placeholder="Enter custom price model"
                />
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className={`block ${getFieldSize} font-medium text-[#286B88]/80 mb-2`}>Languages Spoken</label>
              <input
                type="text"
                name="languages_spoken"
                value={rawInputValues.languages_spoken}
                onChange={handleChange}
                onBlur={() => handleArrayFieldBlur('languages_spoken')}
                className={`w-full ${getFieldPadding} ${getFieldSize} border border-[#286B88]/20 rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]`}
                placeholder="English, Spanish, French"
              />
            </div>

            <div>
              <label className={`block ${getFieldSize} font-medium text-[#286B88]/80 mb-2`}>Practices</label>
              <input
                type="text"
                name="practices"
                value={rawInputValues.practices}
                onChange={handleChange}
                onBlur={() => handleArrayFieldBlur('practices')}
                className={`w-full ${getFieldPadding} ${getFieldSize} border border-[#286B88]/20 rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]`}
                placeholder="Meditation, Yoga, Dharma talks"
              />
            </div>
            <div>
              <label className={`block ${getFieldSize} font-medium text-[#286B88]/80 mb-2`}>Teachers</label>
              <input
                type="text"
                name="teachers"
                value={rawInputValues.teachers}
                onChange={handleChange}
                onBlur={() => handleArrayFieldBlur('teachers')}
                className={`w-full ${getFieldPadding} ${getFieldSize} border border-[#286B88]/20 rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]`}
                placeholder="Teacher names"
              />
            </div>
            <div>
              <label className={`block ${getFieldSize} font-medium text-[#286B88]/80 mb-2`}>Traditions</label>
              <div className="relative" ref={traditionsDropdownRef}>
                <button
                  type="button"
                  onClick={() => setShowTraditionsDropdown(!showTraditionsDropdown)}
                  className={`w-full ${getFieldPadding} ${getFieldSize} text-left border border-[#286B88]/20 rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88] bg-white text-gray-900`}
                >
                  {formData.traditions && formData.traditions.length > 0 
                    ? formData.traditions.join(', ')
                    : 'Select traditions'}
                </button>
                {showTraditionsDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                    <div className="p-2 space-y-2 max-h-60 overflow-y-auto">
                      {availableTraditions.map(tradition => (
                        <label key={tradition} className="flex items-center space-x-2 p-1 hover:bg-gray-50 rounded">
                          <input
                            type="checkbox"
                            checked={formData.traditions?.includes(tradition) || false}
                            onChange={() => handleTraditionSelect(tradition)}
                            className="h-4 w-4 text-[#286B88] focus:ring-[#286B88] border-gray-300 rounded"
                          />
                          <span className={`${getFieldSize} text-gray-900`}>{tradition}</span>
                        </label>
                      ))}
                      <div className="border-t border-gray-200 pt-2">
                        <label className="flex items-center space-x-2 p-1 hover:bg-gray-50 rounded">
                          <input
                            type="checkbox"
                            checked={showCustomTradition}
                            onChange={() => setShowCustomTradition(!showCustomTradition)}
                            className="h-4 w-4 text-[#286B88] focus:ring-[#286B88] border-gray-300 rounded"
                          />
                          <span className={`${getFieldSize} text-gray-900`}>Other (specify below)</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {showCustomTradition && (
                <input
                  type="text"
                  value={customTradition}
                  onChange={(e) => handleCustomTraditionChange(e.target.value)}
                  className={`mt-2 w-full ${getFieldPadding} ${getFieldSize} border border-[#286B88]/20 rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]`}
                  placeholder="Enter custom traditions (comma-separated)"
                />
              )}
            </div>
            <div>
              <label className={`block ${getFieldSize} font-medium text-[#286B88]/80 mb-2`}>Price Details</label>
              <input
                type="text"
                name="price_details"
                value={formData.price_details || ''}
                onChange={handleChange}
                className={`w-full ${getFieldPadding} ${getFieldSize} border border-[#286B88]/20 rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]`}
                placeholder="e.g., $100 per week, donations accepted"
              />
            </div>
            <div>
              <label className={`block ${getFieldSize} font-medium text-[#286B88]/80 mb-2`}>Dietary Information</label>
              <select
                name="dietary_info"
                value={showCustomDiet ? 'Other' : (formData.dietary_info || '')}
                onChange={handleChange}
                className={`w-full ${getFieldPadding} ${getFieldSize} border border-[#286B88]/20 rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]`}
              >
                <option value="">Select dietary information</option>
                {availableDiets.map(diet => (
                  <option key={diet} value={diet}>{diet}</option>
                ))}
                <option value="Other">Other (specify below)</option>
              </select>
              {showCustomDiet && (
                <input
                  type="text"
                  value={customDiet}
                  onChange={(e) => handleCustomInputChange('dietary_info', e.target.value)}
                  className={`mt-2 w-full ${getFieldPadding} ${getFieldSize} border border-[#286B88]/20 rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]`}
                  placeholder="Enter custom dietary information"
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className={`block ${getFieldSize} font-medium text-[#286B88]/80 mb-2`}>Gender Distribution</label>
              <select
                name="gender_policy"
                value={showCustomGenderPolicy ? 'Other' : (formData.gender_policy || '')}
                onChange={handleChange}
                className={`w-full ${getFieldPadding} ${getFieldSize} border border-[#286B88]/20 rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]`}
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
                  className={`mt-2 w-full ${getFieldPadding} ${getFieldSize} border border-[#286B88]/20 rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]`}
                  placeholder="Enter custom gender policy"
                />
              )}
            </div>
            <div>
              <label className={`block ${getFieldSize} font-medium text-[#286B88]/80 mb-2`}>How to get involved</label>
              <input
                type="text"
                name="involvement_method"
                value={formData.involvement_method || ''}
                onChange={handleChange}
                className={`w-full ${getFieldPadding} ${getFieldSize} border border-[#286B88]/20 rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]`}
                placeholder="e.g., Application required"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block ${getFieldSize} font-medium text-[#286B88]/80 mb-2`}>Beginner Friendly</label>
              <select
                name="beginner_friendly"
                value={formData.beginner_friendly === true ? 'yes' : formData.beginner_friendly === false ? 'no' : 'not_specified'}
                onChange={handleChange}
                className={`w-full ${getFieldPadding} ${getFieldSize} border border-[#286B88]/20 rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88] bg-white text-gray-900`}
              >
                <option value="not_specified">Not specified</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
            <div>
              <label className={`block ${getFieldSize} font-medium text-[#286B88]/80 mb-2`}>Ordination Possible</label>
              <select
                name="ordination_possible"
                value={formData.ordination_possible === true ? 'yes' : formData.ordination_possible === false ? 'no' : 'not_specified'}
                onChange={handleChange}
                className={`w-full ${getFieldPadding} ${getFieldSize} border border-[#286B88]/20 rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88] bg-white text-gray-900`}
              >
                <option value="not_specified">Not specified</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export type { FormData }; 