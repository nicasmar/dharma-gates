import { useState, useEffect, useMemo } from 'react';
import type { Database } from '../lib/database.types';

type Monastery = Database['public']['Tables']['monasteries']['Row'];

interface FilterPanelProps {
  monasteries: Monastery[];
  availableVehicles: string[];
  availableTypes: string[];
  onFilter: (filteredMonasteries: Monastery[]) => void;
}

export default function FilterPanel({ 
  monasteries,
  availableVehicles, 
  availableTypes,
  onFilter
}: FilterPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [locationFilter, setLocationFilter] = useState('');
  const [settingFilter, setSettingFilter] = useState<string>('');
  const [priceModelFilter, setPriceModelFilter] = useState<string>('');
  const [beginnerFriendlyFilter, setBeginnerFriendlyFilter] = useState<boolean | null>(null);
  const [genderPolicyFilter, setGenderPolicyFilter] = useState<string>('');
  const [ordinationPossibleFilter, setOrdinationPossibleFilter] = useState<boolean | null>(null);

  const filteredMonasteries = useMemo(() => {
    return monasteries.filter(monastery => {
      const matchesSearch = !searchTerm || 
        (monastery.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         monastery.address?.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesVehicle = !vehicleFilter || 
        monastery.vehicle === vehicleFilter;
      
      const matchesType = !typeFilter || 
        monastery.center_type === typeFilter;

      const matchesLocation = !locationFilter ||
        monastery.address?.toLowerCase().includes(locationFilter.toLowerCase());

      const matchesSetting = !settingFilter ||
        monastery.setting === settingFilter;

      const matchesPriceModel = !priceModelFilter ||
        monastery.price_model === priceModelFilter;

      const matchesBeginnerFriendly = beginnerFriendlyFilter === null ||
        monastery.beginner_friendly === beginnerFriendlyFilter;

      const matchesGenderPolicy = !genderPolicyFilter ||
        monastery.gender_policy === genderPolicyFilter;

      const matchesOrdinationPossible = ordinationPossibleFilter === null ||
        monastery.ordination_possible === ordinationPossibleFilter;

      return matchesSearch && matchesVehicle && matchesType && matchesLocation &&
             matchesSetting && matchesPriceModel && matchesBeginnerFriendly &&
             matchesGenderPolicy && matchesOrdinationPossible;
    });
  }, [
    monasteries, searchTerm, vehicleFilter, typeFilter, locationFilter,
    settingFilter, priceModelFilter, beginnerFriendlyFilter, genderPolicyFilter,
    ordinationPossibleFilter
  ]);

  useEffect(() => {
    onFilter(filteredMonasteries);
  }, [filteredMonasteries, onFilter]);

  const clearFilters = () => {
    setSearchTerm('');
    setVehicleFilter('');
    setTypeFilter('');
    setLocationFilter('');
    setSettingFilter('');
    setPriceModelFilter('');
    setBeginnerFriendlyFilter(null);
    setGenderPolicyFilter('');
    setOrdinationPossibleFilter(null);
  };

  return (
    <div className="w-full h-full bg-white border border-gray-200 rounded-lg p-4 overflow-y-auto">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
      <div className="space-y-4">
        {/* Search */}
        <div className="space-y-1">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700">
            Search monasteries
          </label>
          <input
            id="search"
            type="search"
            className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#286B88] focus:border-transparent"
            placeholder="Search by name or address"
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
            placeholder="Search by location"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          />
        </div>

        {/* Setting */}
        <div className="space-y-1">
          <label htmlFor="setting" className="block text-sm font-medium text-gray-700">
            Setting
          </label>
          <select
            id="setting"
            className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#286B88] focus:border-transparent"
            value={settingFilter}
            onChange={(e) => setSettingFilter(e.target.value)}
          >
            <option value="">All Settings</option>
            <option value="Urban">Urban</option>
            <option value="Forest">Forest</option>
            <option value="Mountain">Mountain</option>
            <option value="Suburban">Suburban</option>
            <option value="Desert">Desert</option>
          </select>
        </div>

        {/* Vehicle */}
        <div className="space-y-1">
          <label htmlFor="vehicle" className="block text-sm font-medium text-gray-700">
            Buddhist Vehicle
          </label>
          <select
            id="vehicle"
            className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#286B88] focus:border-transparent"
            value={vehicleFilter}
            onChange={(e) => setVehicleFilter(e.target.value)}
          >
            <option value="">All Vehicles</option>
            {availableVehicles.map(vehicle => (
              <option key={vehicle} value={vehicle}>{vehicle}</option>
            ))}
          </select>
        </div>

        {/* Center Type */}
        <div className="space-y-1">
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">
            Center Type
          </label>
          <select
            id="type"
            className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#286B88] focus:border-transparent"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">All Types</option>
            {availableTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Price Model */}
        <div className="space-y-1">
          <label htmlFor="price-model" className="block text-sm font-medium text-gray-700">
            Price Model
          </label>
          <select
            id="price-model"
            className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#286B88] focus:border-transparent"
            value={priceModelFilter}
            onChange={(e) => setPriceModelFilter(e.target.value)}
          >
            <option value="">All Price Models</option>
            <option value="Donation-based">Donation-based</option>
            <option value="Fixed Fee">Fixed Fee</option>
            <option value="Flexible / Scholarships">Flexible / Scholarships</option>
          </select>
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
          </div>
        </div>

        {/* Gender Policy */}
        <div className="space-y-1">
          <label htmlFor="gender-policy" className="block text-sm font-medium text-gray-700">
            Gender Policy
          </label>
          <select
            id="gender-policy"
            className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#286B88] focus:border-transparent"
            value={genderPolicyFilter}
            onChange={(e) => setGenderPolicyFilter(e.target.value)}
          >
            <option value="">All Policies</option>
            <option value="Mixed">Mixed</option>
            <option value="Male-only">Male-only</option>
            <option value="Female-only">Female-only</option>
          </select>
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
          </div>
        </div>

        {/* Clear Filters Button */}
        {(searchTerm || vehicleFilter || typeFilter || locationFilter ||
          settingFilter || priceModelFilter || beginnerFriendlyFilter !== null || 
          genderPolicyFilter || ordinationPossibleFilter !== null) && (
          <button
            onClick={clearFilters}
            className="w-full px-4 py-2 bg-[#286B88]/10 text-[#286B88] text-sm font-medium rounded-lg hover:bg-[#286B88]/20 transition-colors mt-4"
          >
            Clear All Filters
          </button>
        )}
      </div>
    </div>
  );
} 