import { useState, useEffect, useCallback } from 'react';
import MonasteryTable from "./MonasteryTable";
import MonasteryCard from "./MonasteryCard";
import MapWrapper from './MapWrapper';
import FilterPanel from "./FilterPanel";
import { getMonasteries } from '../lib/supabase';
import type { Database } from '../lib/database.types';
import ButtonsContainer from './ButtonsContainer';
import SuggestCenterForm from './SuggestCenterForm';

type Monastery = Database['public']['Tables']['monasteries']['Row'];

// Function to normalize text by removing accents and converting to lowercase
const normalizeText = (text: string): string => {
  return text
    .normalize('NFD')  // Decompose characters with accents
    .replace(/[\u0300-\u036f]/g, '')  // Remove accents
    .toLowerCase()  // Convert to lowercase
    .trim();  // Remove leading/trailing whitespace
};

// Function to group similar values
const groupSimilarValues = (values: string[]): Map<string, string[]> => {
  const groups = new Map<string, string[]>();
  
  values.forEach(value => {
    if (!value) return;
    const normalized = normalizeText(value);
    const existing = groups.get(normalized);
    if (existing) {
      if (!existing.includes(value)) {
        existing.push(value);
      }
    } else {
      groups.set(normalized, [value]);
    }
  });
  
  return groups;
};

export default function DirectoryContainer() {
  const [activeTab, setActiveTab] = useState<'map' | 'table'>('map');
  const [showSuggestForm, setShowSuggestForm] = useState(false);
  const [availableVehicles, setAvailableVehicles] = useState<string[]>([]);
  const [availableTypes, setAvailableTypes] = useState<string[]>([]);
  const [availableSettings, setAvailableSettings] = useState<string[]>([]);
  const [availablePriceModels, setAvailablePriceModels] = useState<string[]>([]);
  const [availableGenderPolicies, setAvailableGenderPolicies] = useState<string[]>([]);
  const [monasteries, setMonasteries] = useState<Monastery[]>([]);
  const [filteredMonasteries, setFilteredMonasteries] = useState<Monastery[]>([]);
  const [selectedMonastery, setSelectedMonastery] = useState<Monastery | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const data = await getMonasteries().then(data => data.filter(m => !m.pending));
        
        if (data) {
          setMonasteries(data);
          setFilteredMonasteries(data);
          
          // Group similar values for all filterable fields
          const vehicleGroups = groupSimilarValues(
            data.map(m => m.vehicle).filter(Boolean) as string[]
          );
          const vehicles = Array.from(vehicleGroups.values())
            .map(group => group[0])
            .sort();
          setAvailableVehicles(vehicles);

          const typeGroups = groupSimilarValues(
            data.map(m => m.center_type).filter(Boolean) as string[]
          );
          const types = Array.from(typeGroups.values())
            .map(group => group[0])
            .sort();
          setAvailableTypes(types);

          const settingGroups = groupSimilarValues(
            data.map(m => m.setting).filter(Boolean) as string[]
          );
          const settings = Array.from(settingGroups.values())
            .map(group => group[0])
            .sort();
          setAvailableSettings(settings);

          const priceModelGroups = groupSimilarValues(
            data.map(m => m.price_model).filter(Boolean) as string[]
          );
          const priceModels = Array.from(priceModelGroups.values())
            .map(group => group[0])
            .sort();
          setAvailablePriceModels(priceModels);

          const genderPolicyGroups = groupSimilarValues(
            data.map(m => m.gender_policy).filter(Boolean) as string[]
          );
          const genderPolicies = Array.from(genderPolicyGroups.values())
            .map(group => group[0])
            .sort();
          setAvailableGenderPolicies(genderPolicies);
        }
      } catch (err) {
        console.error('Error fetching monasteries:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while fetching monasteries');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleFilter = useCallback((filtered: Monastery[]) => {
    setFilteredMonasteries(filtered);
  }, []);

  const handleViewOnMap = useCallback((monastery: Monastery) => {
    setSelectedMonastery(monastery);
    setActiveTab('map');
  }, []);

  const handleSelectMonastery = useCallback((monastery: Monastery) => {
    setSelectedMonastery(monastery);
  }, []);

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex-1">
        <div className="w-full border border-gray-200 rounded-xl p-6 bg-white shadow-lg">
          {showSuggestForm ? (
            <SuggestCenterForm 
              showSuggestForm={showSuggestForm} 
              setShowSuggestForm={setShowSuggestForm}
              availableVehicles={availableVehicles}
              availableTypes={availableTypes}
              availableSettings={availableSettings}
              availablePriceModels={availablePriceModels}
              availableGenderPolicies={availableGenderPolicies}
            />
          ) : (
            <div className="flex gap-8">
              <div className="w-1/4" id="filter-panel">
                <FilterPanel
                  monasteries={monasteries}
                  availableVehicles={availableVehicles}
                  availableTypes={availableTypes}
                  availableSettings={availableSettings}
                  availablePriceModels={availablePriceModels}
                  availableGenderPolicies={availableGenderPolicies}
                  onFilter={handleFilter}
                />
              </div>
              
              <div className="flex-1">
                <div className="border-b border-gray-200 mb-6" id="data-view">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setActiveTab('map')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg ${
                          activeTab === 'map'
                            ? 'bg-[#286B88] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Map View
                      </button>
                      <button
                        onClick={() => setActiveTab('table')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg ${
                          activeTab === 'table'
                            ? 'bg-[#286B88] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Table View
                      </button>
                    </div>
                  </div>
                </div>

                {loading ? (
                  <div className="h-[600px] rounded-lg overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 border-4 border-t-[#286B88] border-[#286B88]/20 rounded-full animate-spin mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading monasteries...</p>
                      </div>
                    </div>
                  </div>
                ) : error ? (
                  <div className="h-[600px] rounded-lg overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-rose-700 text-lg font-medium mb-4">Error loading monasteries</p>
                        <p className="text-rose-600">{error}</p>
                      </div>
                    </div>
                  </div>
                ) : activeTab === 'map' ? (
                  <div className="space-y-6">
                    {/* Map Section */}
                    <div className="h-[600px] rounded-lg overflow-hidden">
                      <MapWrapper
                        selectedMonastery={selectedMonastery}
                        monasteries={filteredMonasteries}
                        onSelectMonastery={handleSelectMonastery}
                      />
                    </div>
                    
                    {/* Selected Monastery Card */}
                    {selectedMonastery && (
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-[#286B88]">Selected Center</h3>
                          <button
                            onClick={() => setSelectedMonastery(null)}
                            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                          >
                            <span>✕</span> Clear Selection
                          </button>
                        </div>
                        <MonasteryCard
                          monastery={selectedMonastery}
                          onViewOnMap={handleViewOnMap}
                          admin={false}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-[600px] rounded-lg overflow-hidden">
                    <div className="w-full h-full overflow-auto pr-2">
                      <MonasteryTable 
                        monasteries={filteredMonasteries} 
                        onViewOnMap={handleViewOnMap}
                      />
                    </div>
                  </div>
                )}
                <ButtonsContainer onSuggestCenter={() => setShowSuggestForm(true)} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 