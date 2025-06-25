import { useState, useEffect, useMemo, useRef } from 'react';
import type { Database } from '../lib/database.types';


type Monastery = Database['public']['Tables']['monasteries']['Row'];

// Function to normalize text by removing accents and converting to lowercase
const normalizeText = (text: string): string => {
  return text
    .normalize('NFD')  // Decompose characters with accents
    .replace(/[\u0300-\u036f]/g, '')  // Remove accents
    .toLowerCase()  // Convert to lowercase
    .trim();  // Remove leading/trailing whitespace
};

interface FilterPanelProps {
  monasteries: Monastery[];
  availableVehicles: string[];
  availableTypes: string[];
  availableSettings: string[];
  availablePriceModels: string[];
  availableGenderPolicies: string[];
  onFilter: (filteredMonasteries: Monastery[]) => void;
}

export default function FilterPanel({ 
  monasteries,
  availableVehicles, 
  availableTypes,
  availableSettings,
  availablePriceModels,
  availableGenderPolicies,
  onFilter
}: FilterPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [vehicleFilters, setVehicleFilters] = useState<string[]>([]);
  const [typeFilters, setTypeFilters] = useState<string[]>([]);
  const [locationFilter, setLocationFilter] = useState('');
  const [settingFilters, setSettingFilters] = useState<string[]>([]);
  const [priceModelFilters, setPriceModelFilters] = useState<string[]>([]);
  const [beginnerFriendlyFilter, setBeginnerFriendlyFilter] = useState<boolean | null>(null);
  const [genderPolicyFilters, setGenderPolicyFilters] = useState<string[]>([]);
  const [ordinationPossibleFilter, setOrdinationPossibleFilter] = useState<boolean | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredMonasteries = useMemo(() => {
    return monasteries.filter(monastery => {
      const matchesSearch = !searchTerm || 
        (monastery.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         monastery.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         monastery.teachers?.some(teacher => 
           teacher.toLowerCase().includes(searchTerm.toLowerCase())
         ));
      
      const matchesVehicle = vehicleFilters.length === 0 || 
        vehicleFilters.some(filter => 
          normalizeText(monastery.vehicle || '') === normalizeText(filter)
        );
      
      const matchesType = typeFilters.length === 0 || 
        typeFilters.some(filter => 
          normalizeText(monastery.center_type || '') === normalizeText(filter)
        );

      const matchesLocation = !locationFilter ||
        monastery.address?.toLowerCase().includes(locationFilter.toLowerCase());

      const matchesSetting = settingFilters.length === 0 ||
        settingFilters.some(filter => 
          normalizeText(monastery.setting || '') === normalizeText(filter)
        );

      const matchesPriceModel = priceModelFilters.length === 0 ||
        priceModelFilters.some(filter => 
          normalizeText(monastery.price_model || '') === normalizeText(filter)
        );

      const matchesBeginnerFriendly = beginnerFriendlyFilter === null ||
        monastery.beginner_friendly === beginnerFriendlyFilter;

      const matchesGenderPolicy = genderPolicyFilters.length === 0 ||
        genderPolicyFilters.some(filter => 
          normalizeText(monastery.gender_policy || '') === normalizeText(filter)
        );

      const matchesOrdinationPossible = ordinationPossibleFilter === null ||
        monastery.ordination_possible === ordinationPossibleFilter;

      return matchesSearch && matchesVehicle && matchesType && matchesLocation &&
             matchesSetting && matchesPriceModel && matchesBeginnerFriendly &&
             matchesGenderPolicy && matchesOrdinationPossible;
    });
  }, [
    monasteries, searchTerm, vehicleFilters, typeFilters, locationFilter,
    settingFilters, priceModelFilters, beginnerFriendlyFilter, genderPolicyFilters,
    ordinationPossibleFilter
  ]);

  useEffect(() => {
    onFilter(filteredMonasteries);
  }, [filteredMonasteries, onFilter]);

  const clearFilters = () => {
    setSearchTerm('');
    setVehicleFilters([]);
    setTypeFilters([]);
    setLocationFilter('');
    setSettingFilters([]);
    setPriceModelFilters([]);
    setBeginnerFriendlyFilter(null);
    setGenderPolicyFilters([]);
    setOrdinationPossibleFilter(null);
  };

  const handleMultiSelect = (
    value: string,
    currentFilters: string[],
    setFilters: (filters: string[]) => void
  ) => {
    if (currentFilters.includes(value)) {
      setFilters(currentFilters.filter(filter => filter !== value));
    } else {
      setFilters([...currentFilters, value]);
    }
  };

  return (
    <div className="w-full h-full bg-white border border-gray-200 rounded-lg p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
      </div>
      <div className="space-y-4" ref={dropdownRef}>
        {/* Search */}
        <div className="space-y-1">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700">
            Search monasteries
          </label>
          <input
            id="search"
            type="search"
            className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#286B88] focus:border-transparent"
            placeholder="Search by name, address, or teacher"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Location */}
        <div className="space-y-1">
          <label htmlFor="location" className="block text-sm font-medium text-gray-700">
            Location
          </label>
          <input
            id="location"
            type="text"
            className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#286B88] focus:border-transparent"
            placeholder="Search by location (eg 'New York', 'Thailand','Philbrick Hill Road', etc.)"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          />
        </div>

        {/* Setting */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Setting
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === 'setting' ? null : 'setting')}
              className="w-full p-2 text-sm text-left border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#286B88] focus:border-transparent bg-white text-gray-900"
            >
              {settingFilters.length > 0 
                ? settingFilters.join(', ')
                : 'Select settings'}
            </button>
            {openDropdown === 'setting' && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                <div className="p-2 space-y-2 max-h-60 overflow-y-auto">
                  {availableSettings.map(setting => (
                    <label key={setting} className="flex items-center space-x-2 p-1 hover:bg-gray-50 rounded">
                      <input
                        type="checkbox"
                        checked={settingFilters.includes(setting)}
                        onChange={() => handleMultiSelect(setting, settingFilters, setSettingFilters)}
                        className="h-4 w-4 text-[#286B88] focus:ring-[#286B88] border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-900">{setting}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Vehicle */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Buddhist Vehicle
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === 'vehicle' ? null : 'vehicle')}
              className="w-full p-2 text-sm text-left border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#286B88] focus:border-transparent bg-white text-gray-900"
            >
              {vehicleFilters.length > 0 
                ? vehicleFilters.join(', ')
                : 'Select vehicles'}
            </button>
            {openDropdown === 'vehicle' && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                <div className="p-2 space-y-2 max-h-60 overflow-y-auto">
                  {availableVehicles.map(vehicle => (
                    <label key={vehicle} className="flex items-center space-x-2 p-1 hover:bg-gray-50 rounded">
                      <input
                        type="checkbox"
                        checked={vehicleFilters.includes(vehicle)}
                        onChange={() => handleMultiSelect(vehicle, vehicleFilters, setVehicleFilters)}
                        className="h-4 w-4 text-[#286B88] focus:ring-[#286B88] border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-900">{vehicle}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center Type */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Center Type
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === 'type' ? null : 'type')}
              className="w-full p-2 text-sm text-left border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#286B88] focus:border-transparent bg-white text-gray-900"
            >
              {typeFilters.length > 0 
                ? typeFilters.join(', ')
                : 'Select types'}
            </button>
            {openDropdown === 'type' && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                <div className="p-2 space-y-2 max-h-60 overflow-y-auto">
                  {availableTypes.map(type => (
                    <label key={type} className="flex items-center space-x-2 p-1 hover:bg-gray-50 rounded">
                      <input
                        type="checkbox"
                        checked={typeFilters.includes(type)}
                        onChange={() => handleMultiSelect(type, typeFilters, setTypeFilters)}
                        className="h-4 w-4 text-[#286B88] focus:ring-[#286B88] border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-900">{type}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Price Model */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Price Model
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === 'price' ? null : 'price')}
              className="w-full p-2 text-sm text-left border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#286B88] focus:border-transparent bg-white text-gray-900"
            >
              {priceModelFilters.length > 0 
                ? priceModelFilters.join(', ')
                : 'Select price models'}
            </button>
            {openDropdown === 'price' && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                <div className="p-2 space-y-2 max-h-60 overflow-y-auto">
                  {availablePriceModels.map(model => (
                    <label key={model} className="flex items-center space-x-2 p-1 hover:bg-gray-50 rounded">
                      <input
                        type="checkbox"
                        checked={priceModelFilters.includes(model)}
                        onChange={() => handleMultiSelect(model, priceModelFilters, setPriceModelFilters)}
                        className="h-4 w-4 text-[#286B88] focus:ring-[#286B88] border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-900">{model}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Gender Distribution */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Gender Distribution
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === 'gender' ? null : 'gender')}
              className="w-full p-2 text-sm text-left border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#286B88] focus:border-transparent bg-white text-gray-900"
            >
              {genderPolicyFilters.length > 0 
                ? genderPolicyFilters.join(', ')
                : 'Select gender distributions'}
            </button>
            {openDropdown === 'gender' && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                <div className="p-2 space-y-2 max-h-60 overflow-y-auto">
                  {availableGenderPolicies.map(policy => (
                    <label key={policy} className="flex items-center space-x-2 p-1 hover:bg-gray-50 rounded">
                      <input
                        type="checkbox"
                        checked={genderPolicyFilters.includes(policy)}
                        onChange={() => handleMultiSelect(policy, genderPolicyFilters, setGenderPolicyFilters)}
                        className="h-4 w-4 text-[#286B88] focus:ring-[#286B88] border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-900">{policy}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Beginner Friendly */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Beginner Friendly
          </label>
          <div className="flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="beginner-friendly"
                checked={beginnerFriendlyFilter === null}
                onChange={() => setBeginnerFriendlyFilter(null)}
                className="h-3 w-3 text-[#286B88] focus:ring-[#286B88]"
              />
              <span className="ml-1.5 text-sm text-gray-900">Any</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="beginner-friendly"
                checked={beginnerFriendlyFilter === true}
                onChange={() => setBeginnerFriendlyFilter(true)}
                className="h-3 w-3 text-[#286B88] focus:ring-[#286B88]"
              />
              <span className="ml-1.5 text-sm text-gray-900">Yes</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="beginner-friendly"
                checked={beginnerFriendlyFilter === false}
                onChange={() => setBeginnerFriendlyFilter(false)}
                className="h-3 w-3 text-[#286B88] focus:ring-[#286B88]"
              />
              <span className="ml-1.5 text-sm text-gray-900">No</span>
            </label>
          </div>
        </div>

        {/* Ordination Possible */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Ordination Possible
          </label>
          <div className="flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="ordination-possible"
                checked={ordinationPossibleFilter === null}
                onChange={() => setOrdinationPossibleFilter(null)}
                className="h-3 w-3 text-[#286B88] focus:ring-[#286B88]"
              />
              <span className="ml-1.5 text-sm text-gray-900">Any</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="ordination-possible"
                checked={ordinationPossibleFilter === true}
                onChange={() => setOrdinationPossibleFilter(true)}
                className="h-3 w-3 text-[#286B88] focus:ring-[#286B88]"
              />
              <span className="ml-1.5 text-sm text-gray-900">Yes</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="ordination-possible"
                checked={ordinationPossibleFilter === false}
                onChange={() => setOrdinationPossibleFilter(false)}
                className="h-3 w-3 text-[#286B88] focus:ring-[#286B88]"
              />
              <span className="ml-1.5 text-sm text-gray-900">No</span>
            </label>
          </div>
        </div>

        {/* Clear Filters Button */}
        <div className="pt-4 border-t border-gray-200 mt-6">
          <button
            onClick={clearFilters}
            disabled={!(searchTerm || vehicleFilters.length > 0 || typeFilters.length > 0 || locationFilter ||
              settingFilters.length > 0 || priceModelFilters.length > 0 || beginnerFriendlyFilter !== null || 
              genderPolicyFilters.length > 0 || ordinationPossibleFilter !== null)}
            className="w-full px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-100"
          >
            Clear All Filters
          </button>
        </div>
      </div>
    </div>
  );
} 